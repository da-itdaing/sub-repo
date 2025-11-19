#!/usr/bin/env bash
set -euo pipefail

REGION="${AWS_DEFAULT_REGION:-ap-northeast-2}"
APP_HOME="${APP_HOME:-/home/ubuntu/itdaing}"
ENV_FILE_PATH="${ENV_FILE:-$APP_HOME/prod.env}"
SECRET_ID="${SECRET_ID:-itdaing/prod/app-secrets}"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"
}

ensure_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "❌ Required command '$1' not found. Install it first." >&2
    exit 1
  fi
}

ensure_command aws
ensure_command python3

log "Fetching parameters from AWS SSM (region: $REGION)"

get_param() {
  aws ssm get-parameter \
    --region "$REGION" \
    --name "$1" \
    --with-decryption \
    --query "Parameter.Value" \
    --output text
}

log "Fetching secrets from AWS Secrets Manager"
SECRET_JSON=$(aws secretsmanager get-secret-value \
    --region "$REGION" \
    --secret-id "$SECRET_ID" \
    --query "SecretString" \
    --output text)

get_secret_field() {
  local key="$1"
  python3 - <<PY
import json
data = json.loads("""$SECRET_JSON""")
value = data.get("$key")
if value is None:
    raise SystemExit("Secret key '$key' not found in $SECRET_ID")
print(value)
PY
}

DB_URL=$(get_param "/itdaing/prod/db/url")
DB_USERNAME=$(get_param "/itdaing/prod/db/username")
DB_PASSWORD=$(get_param "/itdaing/prod/db/password")
JWT_ISSUER=$(get_param "/itdaing/prod/jwt/issuer")
JWT_ACCESS_EXP=$(get_param "/itdaing/prod/jwt/access-expiration")
JWT_REFRESH_EXP=$(get_param "/itdaing/prod/jwt/refresh-expiration")
AWS_REGION=$(get_param "/itdaing/prod/aws/region")
S3_BUCKET=$(get_param "/itdaing/prod/storage/s3/bucket")
S3_REGION=$(get_param "/itdaing/prod/storage/s3/region")
S3_BASE_DIR=$(get_param "/itdaing/prod/storage/s3/base-dir")

JWT_SECRET=$(get_secret_field "jwt_secret")
KAKAO_MAP_APP_KEY=$(get_secret_field "kakao_map_app_key")

log "Writing environment file to $ENV_FILE_PATH"
cat > "$ENV_FILE_PATH" <<EOF2
SPRING_PROFILES_ACTIVE=prod

SPRING_DATASOURCE_URL=${DB_URL}
SPRING_DATASOURCE_USERNAME=${DB_USERNAME}
SPRING_DATASOURCE_PASSWORD=${DB_PASSWORD}

JWT_SECRET=${JWT_SECRET}
JWT_ISSUER=${JWT_ISSUER}
JWT_ACCESS_TOKEN_EXPIRATION=${JWT_ACCESS_EXP}
JWT_REFRESH_TOKEN_EXPIRATION=${JWT_REFRESH_EXP}

AWS_REGION=${AWS_REGION}

S3_BUCKET_NAME=${S3_BUCKET}
STORAGE_PROVIDER=s3
STORAGE_S3_BUCKET=${S3_BUCKET}
STORAGE_S3_REGION=${S3_REGION}
STORAGE_S3_BASE_DIR=${S3_BASE_DIR}

KAKAO_MAP_APP_KEY=${KAKAO_MAP_APP_KEY}
EOF2

chmod 600 "$ENV_FILE_PATH"
log "✅ Generated $ENV_FILE_PATH"
