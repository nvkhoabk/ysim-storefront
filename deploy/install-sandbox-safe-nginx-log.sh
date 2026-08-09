#!/usr/bin/env bash
# F06.1B-1_R5_DEPLOYMENT_RUNTIME_V1
set -Eeuo pipefail
if [[ $EUID -ne 0 ]]; then echo "Run with sudo" >&2; exit 1; fi
SERVER_NAME="${YSIM_SANDBOX_SERVER_NAME:-sandbox.ysim.vn}"
ACCESS_LOG="${YSIM_SANDBOX_ACCESS_LOG:-/var/log/nginx/sandbox.ysim.vn.access.log}"
FORMAT_PATH="/etc/nginx/conf.d/ysim-safe-access-log.conf"
SITE_PATH="$(readlink -f "/etc/nginx/sites-enabled/$SERVER_NAME")"
STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_DIR="/var/backups/ysim/nginx-safe-log/$STAMP"
[[ -f "$SITE_PATH" ]] || { echo "Cannot resolve Nginx site" >&2; exit 1; }
mkdir -p "$BACKUP_DIR"
cp -a "$SITE_PATH" "$BACKUP_DIR/site.conf"
[[ -e "$FORMAT_PATH" ]] && cp -a "$FORMAT_PATH" "$BACKUP_DIR/log-format.conf"
rollback() {
  local exit_code=$?
  cp -a "$BACKUP_DIR/site.conf" "$SITE_PATH"
  if [[ -e "$BACKUP_DIR/log-format.conf" ]]; then cp -a "$BACKUP_DIR/log-format.conf" "$FORMAT_PATH"; else rm -f "$FORMAT_PATH"; fi
  nginx -t >/dev/null 2>&1 && systemctl reload nginx || true
  exit "$exit_code"
}
trap rollback ERR
cat >"$FORMAT_PATH" <<'EOF'
# F06.1B-1_R5_DEPLOYMENT_RUNTIME_V1
log_format ysim_safe
  '$remote_addr - $remote_user [$time_local] '
  '"$request_method $uri $server_protocol" '
  '$status $body_bytes_sent '
  '"$http_referer" "$http_user_agent"';
EOF
python3 - "$SITE_PATH" "$ACCESS_LOG" <<'PYSAFE'
from pathlib import Path
import re, sys
site = Path(sys.argv[1]); access_log = sys.argv[2]
text = site.read_text(encoding='utf-8')
correct = f'access_log {access_log} ysim_safe;'
if correct not in text:
    pattern = re.compile(rf'access_log\s+{re.escape(access_log)}(?:\s+\w+)?;')
    text, count = pattern.subn(correct, text, count=1)
    if count != 1: raise SystemExit(f'Expected one access_log directive, found {count}')
    site.write_text(text, encoding='utf-8')
PYSAFE
nginx -t
systemctl reload nginx
trap - ERR
printf 'BACKUP=%s\n' "$BACKUP_DIR"
printf 'INSTALL PASS: safe Nginx access log enabled.\n'
