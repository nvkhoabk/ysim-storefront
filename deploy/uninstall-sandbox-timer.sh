#!/usr/bin/env bash
# F06.1B-1_R5_DEPLOYMENT_RUNTIME_V1
set -euo pipefail
if [[ $EUID -ne 0 ]]; then echo "Run with sudo" >&2; exit 1; fi
SERVICE_NAME="ysim-gpay-reconciliation-sweep.service"
TIMER_NAME="ysim-gpay-reconciliation-sweep.timer"
UNIT_DIR="/etc/systemd/system"
systemctl disable --now "$TIMER_NAME" >/dev/null 2>&1 || true
rm -f "$UNIT_DIR/$SERVICE_NAME" "$UNIT_DIR/$TIMER_NAME"
rm -rf "$UNIT_DIR/${SERVICE_NAME}.d" "$UNIT_DIR/${TIMER_NAME}.d"
systemctl daemon-reload
systemctl reset-failed "$SERVICE_NAME" >/dev/null 2>&1 || true
echo "UNINSTALL PASS: reconciliation units removed."
