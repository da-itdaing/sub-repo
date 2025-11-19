#!/bin/bash

# 백업 파일 목록 조회 스크립트

# 프로젝트 루트로 이동
cd "$(dirname "$0")/.."

BACKUP_DIR="./backups"

if [ ! -d "$BACKUP_DIR" ]; then
    echo "❌ 백업 디렉토리가 존재하지 않습니다: $BACKUP_DIR"
    echo "백업을 먼저 생성하세요: ./scripts/backup-database.sh"
    exit 1
fi

echo "========================================"
echo "데이터베이스 백업 파일 목록"
echo "========================================"
echo ""

# 백업 파일이 있는지 확인
if [ -z "$(ls -A $BACKUP_DIR)" ]; then
    echo "백업 파일이 없습니다."
    echo ""
    echo "백업을 생성하려면 다음 명령어를 실행하세요:"
    echo "./scripts/backup-database.sh"
else
    # 파일 목록 표시 (크기와 날짜 포함)
    ls -lh $BACKUP_DIR/*.sql $BACKUP_DIR/*.sql.gz 2>/dev/null | awk '{print $9 " - " $5 " - " $6 " " $7 " " $8}' | sed 's|./backups/||'
    
    echo ""
    echo "========================================"
    
    # 총 백업 개수와 전체 크기 표시
    TOTAL_FILES=$(ls $BACKUP_DIR/*.sql $BACKUP_DIR/*.sql.gz 2>/dev/null | wc -l)
    TOTAL_SIZE=$(du -sh $BACKUP_DIR 2>/dev/null | cut -f1)
    
    echo "총 백업 파일: $TOTAL_FILES 개"
    echo "전체 크기: $TOTAL_SIZE"
fi

echo ""
echo "복원하려면 다음 명령어를 실행하세요:"
echo "./scripts/restore-database.sh backups/<백업파일명>"
echo "========================================"


