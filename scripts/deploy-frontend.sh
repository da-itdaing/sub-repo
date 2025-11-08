#!/usr/bin/env bash
set -euo pipefail

# Configurable vars
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WEB_DIR="$PROJECT_ROOT/itdaing-web"
TARGET_DIR="${TARGET_DIR:-/var/www/itdaing}"
SKIP_INSTALL="${SKIP_INSTALL:-0}"

if [[ ! -d "$WEB_DIR" ]]; then
  echo "[ERROR] Frontend directory not found: $WEB_DIR" >&2
  exit 1
fi

cd "$WEB_DIR"

if [[ "$SKIP_INSTALL" != "1" ]]; then
  echo "[INFO] npm ci ..."
  npm ci --no-audit --no-fund
fi

echo "[INFO] npm run build ..."
npm run build

if [[ ! -d "$TARGET_DIR" ]]; then
  echo "[INFO] Creating target dir: $TARGET_DIR"
  sudo mkdir -p "$TARGET_DIR"
  sudo chown -R "$USER":"$USER" "$TARGET_DIR" || true
fi

echo "[INFO] rsync dist -> $TARGET_DIR ..."
sudo rsync -av --delete "$WEB_DIR/dist/" "$TARGET_DIR/"

if command -v nginx >/dev/null 2>&1; then
  echo "[INFO] Reloading nginx ..."
  sudo nginx -t && sudo systemctl reload nginx || true
fi

echo "[DONE] Deployed to $TARGET_DIR"
