#!/bin/bash

# 데이터베이스 백업 스크립트
# 사용법: ./backup-database.sh [백업파일명]

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

# 백업 파일명 설정
if [ -z "$1" ]; then
    BACKUP_FILE="$BACKUP_DIR/db_backup_$(date +%Y%m%d_%H%M%S).sql"
else
    BACKUP_FILE="$BACKUP_DIR/$1"
fi

echo "========================================"
echo "데이터베이스 백업 시작"
echo "========================================"
echo "호스트: $DB_HOST"
echo "포트: $DB_PORT"
echo "데이터베이스: $DB_NAME"
echo "사용자: $DB_USER"
echo "백업 파일: $BACKUP_FILE"
echo "========================================"
echo ""

# pg_dump를 사용하여 백업 수행
export PGPASSWORD=$DB_PASSWORD

echo "📦 백업 중..."
pg_dump -h $DB_HOST \
        -p $DB_PORT \
        -U $DB_USER \
        -d $DB_NAME \
        --verbose \
        --no-owner \
        --no-acl \
        --clean \
        --if-exists \
        -f $BACKUP_FILE

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 백업이 성공적으로 완료되었습니다!"
    echo "백업 파일: $BACKUP_FILE"
    
    # 파일 크기 표시
    FILE_SIZE=$(du -h $BACKUP_FILE | cut -f1)
    echo "파일 크기: $FILE_SIZE"
    
    # 압축 옵션 제공
    echo ""
    read -p "백업 파일을 압축하시겠습니까? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        gzip $BACKUP_FILE
        echo "✅ 압축 완료: ${BACKUP_FILE}.gz"
        COMPRESSED_SIZE=$(du -h ${BACKUP_FILE}.gz | cut -f1)
        echo "압축 파일 크기: $COMPRESSED_SIZE"
    fi
else
    echo ""
    echo "❌ 백업 중 오류가 발생했습니다."
    exit 1
fi

unset PGPASSWORD

echo ""
echo "========================================"
echo "백업 완료"
echo "========================================"


