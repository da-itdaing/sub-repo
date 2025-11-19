#!/usr/bin/env bash
set -euo pipefail

LOG_FILE="/tmp/itdaing-boot.log"

if [[ ! -f "$LOG_FILE" ]]; then
  echo "[INFO] Log file not found yet: $LOG_FILE"
  echo "[HINT] Start backend first: ./scripts/start-backend.sh"
  exit 0
fi

exec tail -f "$LOG_FILE"


