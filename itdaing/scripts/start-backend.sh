#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="/home/ubuntu/itdaing"
LOG_FILE="/tmp/itdaing-boot.log"
PID_FILE="/tmp/itdaing-boot.pid"

# SERVER_PORT, ENV_FILE 환경변수를 사용해 포트/환경파일을 결정한다.
PORT="${SERVER_PORT:-8080}"
ENV_FILE_PATH="${ENV_FILE:-prod.env}"

cd "$PROJECT_ROOT"

if [[ ! -f "$ENV_FILE_PATH" ]]; then
  echo "[ERROR] $ENV_FILE_PATH not found in $PROJECT_ROOT" >&2
  exit 1
fi

if lsof -ti:"$PORT" >/dev/null 2>&1; then
  echo "[INFO] Backend already running on :$PORT"
  exit 0
fi

echo "[INFO] Loading environment from $ENV_FILE_PATH ..."
set -a
source "$ENV_FILE_PATH"
set +a

echo "[INFO] Starting Spring Boot on :$PORT ..."
nohup ./gradlew bootRun > "$LOG_FILE" 2>&1 &
BOOT_PID=$!
echo $BOOT_PID > "$PID_FILE"

# Wait up to 60 seconds for the application to start and port to be available
MAX_ATTEMPTS=60
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
  ATTEMPT=$((ATTEMPT + 1))
  
  # Check if target port is listening
  if lsof -ti:"$PORT" >/dev/null 2>&1; then
    echo "[DONE] Started successfully on :$PORT. Logs: $LOG_FILE"
    exit 0
  fi
  
  # Check if gradlew process still running (it spawns the actual Java process)
  if ! kill -0 $BOOT_PID 2>/dev/null; then
    # Check one more time if port is open (app might have just started)
    sleep 1
    if lsof -ti:"$PORT" >/dev/null 2>&1; then
      echo "[DONE] Started successfully on :$PORT. Logs: $LOG_FILE"
      exit 0
    fi
    echo "[ERROR] Spring Boot process died. Check logs: $LOG_FILE" >&2
    tail -20 "$LOG_FILE" >&2
    exit 1
  fi
  
  sleep 1
done

echo "[ERROR] Failed to start Spring Boot on :$PORT after ${MAX_ATTEMPTS}s. Check logs: $LOG_FILE" >&2
exit 1


