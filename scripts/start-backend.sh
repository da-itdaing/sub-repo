#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="/home/ubuntu/itdaing"
LOG_FILE="/tmp/itdaing-boot.log"
PID_FILE="/tmp/itdaing-boot.pid"

cd "$PROJECT_ROOT"

if [[ ! -f "prod.env" ]]; then
  echo "[ERROR] prod.env not found in $PROJECT_ROOT" >&2
  exit 1
fi

if lsof -ti:8080 >/dev/null 2>&1; then
  echo "[INFO] Backend already running on :8080"
  exit 0
fi

echo "[INFO] Loading environment ..."
set -a
source prod.env
set +a

echo "[INFO] Starting Spring Boot on :8080 ..."
nohup ./gradlew bootRun > "$LOG_FILE" 2>&1 &
echo $! > "$PID_FILE"
sleep 2

if lsof -ti:8080 >/dev/null 2>&1; then
  echo "[DONE] Started. Logs: $LOG_FILE"
else
  echo "[WARN] Process started but :8080 not open yet. Check logs: $LOG_FILE"
fi


