#!/usr/bin/env bash
set -euo pipefail

DEPLOY_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVICE_SRC="$DEPLOY_DIR/ysim-gpay-reconciliation-sweep.service"
TIMER_SRC="$DEPLOY_DIR/ysim-gpay-reconciliation-sweep.timer"

if [[ $EUID -ne 0 ]]; then
  echo "Run with sudo: sudo bash deploy/install-sandbox-timer.sh" >&2
  exit 1
fi

install -m 0644 "$SERVICE_SRC" /etc/systemd/system/ysim-gpay-reconciliation-sweep.service
install -m 0644 "$TIMER_SRC" /etc/systemd/system/ysim-gpay-reconciliation-sweep.timer
systemctl daemon-reload
systemctl enable --now ysim-gpay-reconciliation-sweep.timer
systemctl status --no-pager ysim-gpay-reconciliation-sweep.timer
