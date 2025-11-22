#!/bin/bash
# Itdaing App 배포 스크립트

set -e

echo "🚀 Itdaing App 배포 시작..."

# 색상 코드
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 설정
APP_DIR="/home/ubuntu/itdaing-app"
WEB_ROOT="/var/www/itdaing"
NGINX_CONF="/etc/nginx/sites-available/itdaing.conf"

# 1. Node.js 버전 확인
echo -e "${YELLOW}[1/6]${NC} Node.js 버전 확인..."
export NVM_DIR="$HOME/.nvm"
if [ -s "$NVM_DIR/nvm.sh" ]; then
    source "$NVM_DIR/nvm.sh"
    cd "$APP_DIR"
    nvm use
else
    echo -e "${RED}❌ NVM을 찾을 수 없습니다${NC}"
    exit 1
fi

# 2. 의존성 설치
echo -e "${YELLOW}[2/6]${NC} npm 의존성 확인..."
if [ ! -d "node_modules" ]; then
    echo "의존성 설치 중..."
    npm install
else
    echo "의존성이 이미 설치되어 있습니다."
fi

# 3. 빌드
echo -e "${YELLOW}[3/6]${NC} 프로덕션 빌드..."
npm run build

# 4. 기존 파일 백업
echo -e "${YELLOW}[4/6]${NC} 기존 배포 백업..."
if [ -d "$WEB_ROOT" ]; then
    BACKUP_DIR="/home/ubuntu/backup/itdaing-$(date +%Y%m%d_%H%M%S)"
    sudo mkdir -p "$(dirname $BACKUP_DIR)"
    sudo cp -r "$WEB_ROOT" "$BACKUP_DIR"
    echo "백업 완료: $BACKUP_DIR"
fi

# 5. 배포
echo -e "${YELLOW}[5/6]${NC} 파일 배포..."
sudo rm -rf "$WEB_ROOT"/*
sudo cp -r "$APP_DIR/dist/"* "$WEB_ROOT/"
sudo chown -R www-data:www-data "$WEB_ROOT"
echo "파일 배포 완료: $WEB_ROOT"

# 6. Nginx 재로드
echo -e "${YELLOW}[6/6]${NC} Nginx 재로드..."
sudo nginx -t
if [ $? -eq 0 ]; then
    sudo systemctl reload nginx
    echo -e "${GREEN}✅ Nginx 재로드 완료${NC}"
else
    echo -e "${RED}❌ Nginx 설정 오류${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 배포 완료!${NC}"
echo ""
echo "📊 배포 정보:"
echo "  - 빌드 디렉토리: $APP_DIR/dist"
echo "  - 배포 경로: $WEB_ROOT"
echo "  - Nginx 설정: $NGINX_CONF"
echo ""
echo "🌐 접속 방법:"
echo "  - Private IP: http://10.0.145.136"
echo "  - 도메인: http://aischool.daitdaing.link (DNS 설정 필요)"
echo ""
echo "⚠️  다음 단계:"
echo "  1. Route 53에서 aischool.daitdaing.link A 레코드 생성"
echo "  2. ALB 또는 Elastic IP 설정"
echo "  3. SSL/TLS 인증서 발급 (HTTPS)"
echo ""

