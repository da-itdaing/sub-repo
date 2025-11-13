#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   ./scripts/generate-openapi.sh
# Output:
#   build/openapi/openapi.yaml

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

echo "[openapi] Generating OpenAPI spec via Gradle (profile=openapi)..."
chmod +x ./gradlew
./gradlew --no-daemon clean generateOpenApiDocs

OUT="$PROJECT_ROOT/build/openapi/openapi.yaml"
if [[ -f "$OUT" ]]; then
  echo "[openapi] Generated: $OUT"
else
  echo "[openapi] ERROR: openapi.yaml not found. Check build logs." >&2
  exit 1
fi


