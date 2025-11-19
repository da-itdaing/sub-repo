#!/bin/bash

# 데이터베이스 복원 스크립트
# 사용법: ./restore-database.sh <백업파일명>

set -e

# 인수 확인
if [ -z "$1" ]; then
    echo "사용법: $0 <백업파일명>"
    echo "예시: $0 backups/db_backup_20251118_120000.sql"
    echo "또는: $0 backups/db_backup_20251118_120000.sql.gz"
    exit 1
fi

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

BACKUP_FILE="$1"

# 백업 파일 존재 확인
if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ 백업 파일을 찾을 수 없습니다: $BACKUP_FILE"
    exit 1
fi

echo "========================================"
echo "⚠️  데이터베이스 복원 경고"
echo "========================================"
echo "이 작업은 현재 데이터베이스의 모든 데이터를"
echo "백업 파일의 데이터로 덮어씁니다."
echo ""
echo "호스트: $DB_HOST"
echo "포트: $DB_PORT"
echo "데이터베이스: $DB_NAME"
echo "사용자: $DB_USER"
echo "백업 파일: $BACKUP_FILE"
echo "========================================"
echo ""

read -p "계속하시겠습니까? (yes/no): " -r
echo ""
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "복원이 취소되었습니다."
    exit 0
fi

export PGPASSWORD=$DB_PASSWORD

# 압축된 파일인지 확인
if [[ $BACKUP_FILE == *.gz ]]; then
    echo "📦 압축 파일 감지. 압축 해제 중..."
    TEMP_FILE="${BACKUP_FILE%.gz}.tmp"
    gunzip -c $BACKUP_FILE > $TEMP_FILE
    RESTORE_FILE=$TEMP_FILE
else
    RESTORE_FILE=$BACKUP_FILE
fi

echo "🔄 데이터베이스 복원 중..."
echo ""

# psql을 사용하여 복원 수행
psql -h $DB_HOST \
     -p $DB_PORT \
     -U $DB_USER \
     -d $DB_NAME \
     -f $RESTORE_FILE

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 복원이 성공적으로 완료되었습니다!"
else
    echo ""
    echo "❌ 복원 중 오류가 발생했습니다."
    
    # 임시 파일 정리
    if [ -n "$TEMP_FILE" ] && [ -f "$TEMP_FILE" ]; then
        rm -f $TEMP_FILE
    fi
    
    unset PGPASSWORD
    exit 1
fi

# 임시 파일 정리
if [ -n "$TEMP_FILE" ] && [ -f "$TEMP_FILE" ]; then
    rm -f $TEMP_FILE
    echo "🧹 임시 파일 정리 완료"
fi

unset PGPASSWORD

echo ""
echo "========================================"
echo "복원 완료"
echo "========================================"
echo ""
echo "⚠️  애플리케이션을 재시작하는 것을 권장합니다."


