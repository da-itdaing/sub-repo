#!/usr/bin/env bash
set -euo pipefail

# systemd 환경에서도 lsof, aws 등을 확실히 찾을 수 있도록 PATH 보정
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/bin:/sbin:$PATH
export PATH

# 필수 커맨드 확인
ensure_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "❌ Required command '$1' not found. Install it first." >&2
    exit 1
  fi
}

ensure_command aws
ensure_command lsof

# 기본 경로 설정
APP_HOME="${APP_HOME:-/home/ubuntu/itdaing}"
ENV_FILE="${ENV_FILE:-$APP_HOME/prod.env}"
LOG_FILE="${LOG_FILE:-/tmp/itdaing-boot.log}"
SERVER_PORT="${SERVER_PORT:-8080}"
JAR_PATH="${JAR_PATH:-$APP_HOME/app.jar}"

# RDS CA 관련 설정
REGION="${REGION:-ap-northeast-2}"
RDS_CA_PATH="${RDS_CA_PATH:-/home/ubuntu/rds-combined-ca-bundle.pem}"
RDS_CA_PARAM_NAME="${RDS_CA_PARAM_NAME:-/itdaing/prod/rds/ca-bundle}"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"
}

ensure_rds_ca() {
  if [[ -f "$RDS_CA_PATH" ]]; then
    log "RDS CA bundle already exists at $RDS_CA_PATH"
    return 0
  fi

  log "RDS CA bundle not found. Fetching from SSM Parameter Store: $RDS_CA_PARAM_NAME"

  # aws cli가 없거나 권한이 없으면 여기서 실패
  aws ssm get-parameter \
    --region "$REGION" \
    --name "$RDS_CA_PARAM_NAME" \
    --with-decryption \
    --query "Parameter.Value" \
    --output text > "$RDS_CA_PATH"

  chmod 644 "$RDS_CA_PATH"
  log "✅ RDS CA bundle written to $RDS_CA_PATH"
}

log "Ensuring RDS CA bundle exists"
ensure_rds_ca

# prod.env 갱신 로직
# - 파일이 없거나
# - --refresh 플래그가 있거나
# - 24시간 이상 지난 경우에만 재생성
REFRESH_ENV=false
if [[ "${1:-}" == "--refresh" ]]; then
  REFRESH_ENV=true
  log "Force refresh requested via --refresh flag"
elif [[ ! -f "$ENV_FILE" ]]; then
  REFRESH_ENV=true
  log "prod.env not found, will generate"
else
  # 파일이 24시간 이상 지났는지 확인
  FILE_AGE_SECONDS=$(( $(date +%s) - $(stat -c %Y "$ENV_FILE" 2>/dev/null || echo 0) ))
  if [[ $FILE_AGE_SECONDS -gt 86400 ]]; then
    REFRESH_ENV=true
    log "prod.env is older than 24 hours, will regenerate"
  else
    log "prod.env exists and is fresh (age: ${FILE_AGE_SECONDS}s), reusing"
  fi
fi

if [[ "$REFRESH_ENV" == "true" ]]; then
  log "Generating prod.env from AWS Parameter Store / Secrets Manager"
  "$APP_HOME/generate-prod-env.sh"
else
  log "Skipping env generation, using existing $ENV_FILE"
fi

export ENV_FILE
set -a
source "$ENV_FILE"
set +a

# 이미 떠있는 서버 있으면 종료 (Systemd 외 수동 실행 시 충돌 방지)
if lsof -ti:"$SERVER_PORT" >/dev/null 2>&1; then
  log "Stopping process listening on port $SERVER_PORT"
  lsof -ti:"$SERVER_PORT" | xargs kill -9
fi

cd "$APP_HOME"

log "Starting backend..."
log "Logs will be written to: $LOG_FILE"
log "Run 'tail -f $LOG_FILE' to monitor logs."

# nohup과 &를 제거하고 exec를 사용하여 쉘 프로세스를 Java 프로세스로 대체합니다.
# 이렇게 해야 Systemd가 Java 프로세스를 서비스의 메인 프로세스로 인식하여 관리할 수 있습니다.
if [[ -f "$JAR_PATH" ]]; then
  exec java -jar "$JAR_PATH" > "$LOG_FILE" 2>&1
else
  log "app.jar not found, falling back to './gradlew bootRun'"
  exec ./gradlew bootRun > "$LOG_FILE" 2>&1
fi
