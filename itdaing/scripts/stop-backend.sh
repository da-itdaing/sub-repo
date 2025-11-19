#!/usr/bin/env bash
set -euo pipefail

PID_FILE="/tmp/itdaing-boot.pid"

if lsof -ti:8080 >/dev/null 2>&1; then
  echo "[INFO] Stopping process on :8080 ..."
  kill "$(lsof -ti:8080)" || true
  sleep 1
  if lsof -ti:8080 >/dev/null 2>&1; then
    echo "[INFO] Force killing ..."
    kill -9 "$(lsof -ti:8080)" || true
  fi
  echo "[DONE] Stopped."
else
  echo "[INFO] No backend process found on :8080"
fi

if [[ -f "$PID_FILE" ]]; then
  rm -f "$PID_FILE"
fi


