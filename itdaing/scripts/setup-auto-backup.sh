#!/bin/bash

# 자동 백업 Cron 설정 스크립트
# 사용법: ./setup-auto-backup.sh

echo "========================================"
echo "자동 백업 Cron 설정"
echo "========================================"
echo ""

# 프로젝트 루트 절대 경로
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BACKUP_SCRIPT="$PROJECT_ROOT/scripts/auto-backup-database.sh"

# 스크립트 실행 권한 확인
if [ ! -x "$BACKUP_SCRIPT" ]; then
    echo "백업 스크립트에 실행 권한을 부여합니다..."
    chmod +x "$BACKUP_SCRIPT"
fi

echo "프로젝트 경로: $PROJECT_ROOT"
echo "백업 스크립트: $BACKUP_SCRIPT"
echo ""
echo "다음 중 하나를 선택하세요:"
echo "1) 매일 새벽 2시에 자동 백업 (권장)"
echo "2) 매주 일요일 새벽 3시에 자동 백업"
echo "3) 매일 오전 6시에 자동 백업"
echo "4) 6시간마다 자동 백업"
echo "5) 수동으로 crontab 편집"
echo "6) 현재 설정된 cron 작업 보기"
echo "7) 자동 백업 비활성화"
echo "0) 취소"
echo ""
read -p "선택 (0-7): " choice

case $choice in
    1)
        CRON_SCHEDULE="0 2 * * *"
        DESCRIPTION="매일 새벽 2시"
        ;;
    2)
        CRON_SCHEDULE="0 3 * * 0"
        DESCRIPTION="매주 일요일 새벽 3시"
        ;;
    3)
        CRON_SCHEDULE="0 6 * * *"
        DESCRIPTION="매일 오전 6시"
        ;;
    4)
        CRON_SCHEDULE="0 */6 * * *"
        DESCRIPTION="6시간마다"
        ;;
    5)
        echo ""
        echo "crontab 편집기를 엽니다..."
        echo "다음 라인을 추가하세요:"
        echo "0 2 * * * $BACKUP_SCRIPT >> $PROJECT_ROOT/backups/backup.log 2>&1"
        echo ""
        read -p "계속하려면 Enter를 누르세요..."
        crontab -e
        exit 0
        ;;
    6)
        echo ""
        echo "현재 설정된 cron 작업:"
        echo "========================================"
        crontab -l 2>/dev/null || echo "설정된 cron 작업이 없습니다."
        echo "========================================"
        exit 0
        ;;
    7)
        echo ""
        echo "자동 백업 비활성화 중..."
        # 백업 스크립트 관련 cron 작업 제거
        crontab -l 2>/dev/null | grep -v "auto-backup-database.sh" | crontab - 2>/dev/null || true
        echo "✅ 자동 백업이 비활성화되었습니다."
        exit 0
        ;;
    0)
        echo "취소되었습니다."
        exit 0
        ;;
    *)
        echo "❌ 잘못된 선택입니다."
        exit 1
        ;;
esac

echo ""
echo "========================================"
echo "Cron 작업 추가"
echo "========================================"
echo "일정: $DESCRIPTION"
echo "명령어: $BACKUP_SCRIPT"
echo "========================================"
echo ""
read -p "계속하시겠습니까? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "취소되었습니다."
    exit 0
fi

# 기존 crontab 가져오기 (있다면)
TEMP_CRON=$(mktemp)
crontab -l 2>/dev/null > $TEMP_CRON || true

# 중복 제거 (이미 같은 스크립트가 등록되어 있다면)
grep -v "auto-backup-database.sh" $TEMP_CRON > ${TEMP_CRON}.new || true
mv ${TEMP_CRON}.new $TEMP_CRON

# 새 cron 작업 추가
echo "$CRON_SCHEDULE $BACKUP_SCRIPT >> $PROJECT_ROOT/backups/backup.log 2>&1" >> $TEMP_CRON

# crontab 업데이트
crontab $TEMP_CRON
rm $TEMP_CRON

echo ""
echo "✅ Cron 작업이 추가되었습니다!"
echo ""
echo "설정된 일정: $DESCRIPTION"
echo "백업 파일 위치: $PROJECT_ROOT/backups/"
echo "로그 파일: $PROJECT_ROOT/backups/backup.log"
echo ""
echo "현재 설정된 cron 작업:"
echo "========================================"
crontab -l
echo "========================================"
echo ""
echo "참고:"
echo "- 자동 백업은 압축되어 저장됩니다 (.sql.gz)"
echo "- 7일 이상 된 자동 백업은 자동으로 삭제됩니다"
echo "- 수동 백업 파일은 자동으로 삭제되지 않습니다"
echo ""
echo "로그 확인: tail -f $PROJECT_ROOT/backups/backup.log"


