#!/bin/bash
# 개발 브랜치 확인 스크립트

cd /home/ubuntu

echo "================================================"
echo "  DA-ITDAING 개발 브랜치 상태 확인"
echo "================================================"
echo ""

# 최신 상태 가져오기
echo "📡 Fetching latest changes..."
git fetch origin --quiet

# Main 브랜치 상태
echo ""
echo "=== 📌 Main Branch ==="
git log --oneline -1 origin/main

# dev/be 새 커밋
echo ""
echo "=== 🔧 Backend (dev/be) - New Commits ==="
NEW_BE=$(git log --oneline main..origin/dev/be)
if [ -z "$NEW_BE" ]; then
    echo "  ✅ No new commits"
else
    git log --oneline --pretty=format:"  %h %an: %s" main..origin/dev/be
fi

# dev/fe 새 커밋
echo ""
echo "=== 🎨 Frontend (dev/fe) - New Commits ==="
NEW_FE=$(git log --oneline main..origin/dev/fe)
if [ -z "$NEW_FE" ]; then
    echo "  ✅ No new commits"
else
    git log --oneline --pretty=format:"  %h %an: %s" main..origin/dev/fe
fi

echo ""
echo "================================================"
echo ""
echo "💡 통합이 필요한 경우:"
echo "   MAIN_BRANCH_MANAGER_GUIDE.md 참조"
echo ""