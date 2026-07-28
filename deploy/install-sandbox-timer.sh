#!/usr/bin/env bash
# F06.1B-1_R5_DEPLOYMENT_RUNTIME_V1
set -Eeuo pipefail
SERVICE_NAME="ysim-gpay-reconciliation-sweep.service"
TIMER_NAME="ysim-gpay-reconciliation-sweep.timer"
DEPLOY_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="${YSIM_STOREFRONT_ROOT:-$(cd "$DEPLOY_DIR/.." && pwd)}"
SERVICE_USER="${YSIM_SERVICE_USER:-ysim}"
SERVICE_GROUP="${YSIM_SERVICE_GROUP:-ysim}"
BASE_URL="${GPAY_RECONCILIATION_BASE_URL:-http://127.0.0.1:3001}"
ENV_FILE="$APP_DIR/.env.production"
SWEEP_SCRIPT="$APP_DIR/scripts/run-gpay-reconciliation-sweep-f06-1b-1.mjs"
UNIT_DIR="/etc/systemd/system"
SERVICE_PATH="$UNIT_DIR/$SERVICE_NAME"
TIMER_PATH="$UNIT_DIR/$TIMER_NAME"
SERVICE_DROPIN="$UNIT_DIR/${SERVICE_NAME}.d"
TIMER_DROPIN="$UNIT_DIR/${TIMER_NAME}.d"
STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_DIR="/var/backups/ysim/gpay-reconciliation-systemd/$STAMP"
ROLLED_BACK=0

if [[ $EUID -ne 0 ]]; then
  echo "Run with sudo: sudo bash deploy/install-sandbox-timer.sh" >&2
  exit 1
fi
for required in getent runuser systemctl install mktemp; do
  command -v "$required" >/dev/null 2>&1 || { echo "Missing required command: $required" >&2; exit 1; }
done
[[ -f "$ENV_FILE" ]] || { echo "Missing environment file: $ENV_FILE" >&2; exit 1; }
[[ -f "$SWEEP_SCRIPT" ]] || { echo "Missing sweep script: $SWEEP_SCRIPT" >&2; exit 1; }
getent passwd "$SERVICE_USER" >/dev/null || { echo "Unknown service user: $SERVICE_USER" >&2; exit 1; }
getent group "$SERVICE_GROUP" >/dev/null || { echo "Unknown service group: $SERVICE_GROUP" >&2; exit 1; }

USER_HOME="$(getent passwd "$SERVICE_USER" | cut -d: -f6)"
NODE_BIN="$(runuser -u "$SERVICE_USER" -- env HOME="$USER_HOME" bash -lc '
  if [[ -s "$HOME/.nvm/nvm.sh" ]]; then . "$HOME/.nvm/nvm.sh"; fi
  node -p "process.execPath"
')"
[[ -n "$NODE_BIN" && -x "$NODE_BIN" ]] || { echo "Unable to locate Node for $SERVICE_USER" >&2; exit 1; }
runuser -u "$SERVICE_USER" -- test -r "$ENV_FILE"
runuser -u "$SERVICE_USER" -- test -r "$SWEEP_SCRIPT"

mkdir -p "$BACKUP_DIR"
[[ -e "$SERVICE_PATH" ]] && cp -a "$SERVICE_PATH" "$BACKUP_DIR/service"
[[ -e "$TIMER_PATH" ]] && cp -a "$TIMER_PATH" "$BACKUP_DIR/timer"
[[ -d "$SERVICE_DROPIN" ]] && cp -a "$SERVICE_DROPIN" "$BACKUP_DIR/service.d"
[[ -d "$TIMER_DROPIN" ]] && cp -a "$TIMER_DROPIN" "$BACKUP_DIR/timer.d"

rollback() {
  local exit_code=$?
  [[ $ROLLED_BACK -eq 1 ]] && exit "$exit_code"
  ROLLED_BACK=1
  echo "INSTALL FAILED: restoring $BACKUP_DIR" >&2
  systemctl disable --now "$TIMER_NAME" >/dev/null 2>&1 || true
  rm -f "$SERVICE_PATH" "$TIMER_PATH"
  rm -rf "$SERVICE_DROPIN" "$TIMER_DROPIN"
  [[ -e "$BACKUP_DIR/service" ]] && cp -a "$BACKUP_DIR/service" "$SERVICE_PATH"
  [[ -e "$BACKUP_DIR/timer" ]] && cp -a "$BACKUP_DIR/timer" "$TIMER_PATH"
  [[ -d "$BACKUP_DIR/service.d" ]] && cp -a "$BACKUP_DIR/service.d" "$SERVICE_DROPIN"
  [[ -d "$BACKUP_DIR/timer.d" ]] && cp -a "$BACKUP_DIR/timer.d" "$TIMER_DROPIN"
  systemctl daemon-reload || true
  exit "$exit_code"
}
trap rollback ERR

systemctl disable --now "$TIMER_NAME" >/dev/null 2>&1 || true
rm -rf "$SERVICE_DROPIN" "$TIMER_DROPIN"
SERVICE_TMP="$(mktemp)"
cat >"$SERVICE_TMP" <<EOF
# F06.1B-1_R5_DEPLOYMENT_RUNTIME_V1
[Unit]
Description=YSim GPay durable reconciliation sweep
After=network-online.target
Wants=network-online.target

[Service]
Type=oneshot
User=$SERVICE_USER
Group=$SERVICE_GROUP
WorkingDirectory=$APP_DIR
ExecStart=$NODE_BIN --env-file=$ENV_FILE $SWEEP_SCRIPT --base-url=$BASE_URL
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=read-only
ReadWritePaths=$APP_DIR /tmp

[Install]
WantedBy=multi-user.target
EOF
install -m 0644 "$SERVICE_TMP" "$SERVICE_PATH"
rm -f "$SERVICE_TMP"
install -m 0644 "$DEPLOY_DIR/ysim-gpay-reconciliation-sweep.timer" "$TIMER_PATH"
systemctl daemon-reload

mkdir -p "$SERVICE_DROPIN"
cat >"$SERVICE_DROPIN/validation.conf" <<EOF
[Service]
ExecStart=
ExecStart=$NODE_BIN --env-file=$ENV_FILE $SWEEP_SCRIPT --base-url=$BASE_URL --dry-run
EOF
systemctl daemon-reload
systemctl reset-failed "$SERVICE_NAME" >/dev/null 2>&1 || true
systemctl start "$SERVICE_NAME"
rm -f "$SERVICE_DROPIN/validation.conf"
rmdir "$SERVICE_DROPIN" 2>/dev/null || true
systemctl daemon-reload
systemctl enable --now "$TIMER_NAME"
trap - ERR
printf 'BACKUP=%s\n' "$BACKUP_DIR"
printf 'NODE_BIN=%s\n' "$NODE_BIN"
systemctl status --no-pager -l "$TIMER_NAME"
systemctl list-timers --all "$TIMER_NAME" --no-pager
printf 'INSTALL PASS: F06.1B-1 R5 source-managed systemd runtime.\n'
