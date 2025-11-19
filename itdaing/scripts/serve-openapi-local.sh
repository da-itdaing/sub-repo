#!/usr/bin/env bash
set -euo pipefail

# Build a static Swagger UI site from build/openapi/openapi.yaml and serve it locally.
# Requires: ./scripts/generate-openapi.sh run beforehand.
#
# Usage:
#   ./scripts/serve-openapi-local.sh [PORT]
# Default PORT: 8081

PORT="${1:-8081}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

SPEC="$PROJECT_ROOT/build/openapi/openapi.yaml"
SITE_DIR="$PROJECT_ROOT/build/swagger-site"

if [[ ! -f "$SPEC" ]]; then
  echo "[swagger] Spec not found: $SPEC"
  echo "[swagger] Run ./scripts/generate-openapi.sh first."
  exit 1
fi

mkdir -p "$SITE_DIR"
cp "$SPEC" "$SITE_DIR/openapi.yaml"

cat > "$SITE_DIR/index.html" <<'EOF'
<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>ItDaIng API Docs (Local)</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  <style> body { margin: 0; } </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    window.onload = () => {
      window.ui = SwaggerUIBundle({
        url: 'openapi.yaml',
        dom_id: '#swagger-ui',
        presets: [SwaggerUIBundle.presets.apis],
        layout: 'BaseLayout'
      });
    };
  </script>
</body>
</html>
EOF

echo "[swagger] Serving $SITE_DIR on http://localhost:$PORT"
cd "$SITE_DIR"
python3 -m http.server "$PORT"


