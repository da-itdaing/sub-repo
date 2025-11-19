#!/bin/bash

# 자동 데이터베이스 백업 스크립트 (cron용)
# 사용법: crontab에 등록하여 자동 백업 설정

set -e

# 프로젝트 루트로 이동
cd "$(dirname "$0")/.."

# 환경 변수 로드
if [ ! -f prod.env ]; then
    echo "❌ prod.env 파일을 찾을 수 없습니다."
    exit 1
fi

source prod.env

# DB 연결 정보 파싱
DB_HOST=$(echo $SPRING_DATASOURCE_URL | sed -n 's|.*://\([^:]*\):.*|\1|p')
DB_PORT=$(echo $SPRING_DATASOURCE_URL | sed -n 's|.*:\([0-9]*\)/.*|\1|p')
DB_NAME=$(echo $SPRING_DATASOURCE_URL | sed -n 's|.*/\([^?]*\).*|\1|p')
DB_USER=$SPRING_DATASOURCE_USERNAME
DB_PASSWORD=$SPRING_DATASOURCE_PASSWORD

# 백업 디렉토리 생성
BACKUP_DIR="./backups"
mkdir -p $BACKUP_DIR

# 백업 파일명 (타임스탬프 포함)
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/auto_backup_${TIMESTAMP}.sql"
LOG_FILE="$BACKUP_DIR/backup.log"

# 로그 기록 함수
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

log "========================================="
log "자동 백업 시작"
log "========================================="
log "데이터베이스: $DB_NAME"
log "백업 파일: $BACKUP_FILE"

# pg_dump를 사용하여 백업 수행
export PGPASSWORD=$DB_PASSWORD

pg_dump -h $DB_HOST \
        -p $DB_PORT \
        -U $DB_USER \
        -d $DB_NAME \
        --no-owner \
        --no-acl \
        --clean \
        --if-exists \
        -f $BACKUP_FILE 2>&1 | tee -a $LOG_FILE

if [ $? -eq 0 ]; then
    log "✅ 백업 완료"
    
    # 파일 크기 표시
    FILE_SIZE=$(du -h $BACKUP_FILE | cut -f1)
    log "백업 파일 크기: $FILE_SIZE"
    
    # 자동 압축
    gzip $BACKUP_FILE
    COMPRESSED_SIZE=$(du -h ${BACKUP_FILE}.gz | cut -f1)
    log "압축 완료: ${BACKUP_FILE}.gz"
    log "압축 파일 크기: $COMPRESSED_SIZE"
    
    # 7일 이상 된 백업 파일 자동 삭제
    log "오래된 백업 파일 정리 중..."
    find $BACKUP_DIR -name "auto_backup_*.sql.gz" -mtime +7 -delete
    REMAINING=$(ls $BACKUP_DIR/auto_backup_*.sql.gz 2>/dev/null | wc -l)
    log "남은 자동 백업 파일: $REMAINING 개"
else
    log "❌ 백업 실패"
    unset PGPASSWORD
    exit 1
fi

unset PGPASSWORD

log "========================================="
log "자동 백업 완료"
log "========================================="

exit 0


