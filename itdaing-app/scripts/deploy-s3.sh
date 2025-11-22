#!/bin/bash
# Itdaing App S3 + CloudFront 배포 스크립트

set -e

echo "🚀 Itdaing App S3 배포 시작..."

# 색상 코드
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 환경변수 로드
ENV_FILE="/home/ubuntu/itdaing/prod.env"
if [ -f "$ENV_FILE" ]; then
    source "$ENV_FILE"
    echo -e "${GREEN}✅ 환경변수 로드 완료${NC}"
else
    echo -e "${RED}❌ prod.env 파일을 찾을 수 없습니다: $ENV_FILE${NC}"
    exit 1
fi

# 설정
APP_DIR="/home/ubuntu/itdaing-app"
S3_BUCKET="${S3_BUCKET_NAME:-daitdaing-static-files}"
S3_PREFIX="prod"
AWS_REGION="${AWS_REGION:-ap-northeast-2}"

echo ""
echo "📋 배포 설정:"
echo "  - 앱 디렉토리: $APP_DIR"
echo "  - S3 버킷: s3://$S3_BUCKET"
echo "  - S3 경로: s3://$S3_BUCKET/$S3_PREFIX/"
echo "  - AWS Region: $AWS_REGION"
echo ""

# 1. Node.js 버전 확인
echo -e "${YELLOW}[1/5]${NC} Node.js 버전 확인..."
export NVM_DIR="$HOME/.nvm"
if [ -s "$NVM_DIR/nvm.sh" ]; then
    source "$NVM_DIR/nvm.sh"
    cd "$APP_DIR"
    nvm use
    echo "Node $(node -v) 사용 중"
else
    echo -e "${RED}❌ NVM을 찾을 수 없습니다${NC}"
    exit 1
fi

# 2. 의존성 확인
echo -e "${YELLOW}[2/5]${NC} npm 의존성 확인..."
if [ ! -d "node_modules" ]; then
    echo "의존성 설치 중..."
    npm install
else
    echo "의존성이 이미 설치되어 있습니다."
fi

# 3. 프로덕션 빌드
echo -e "${YELLOW}[3/5]${NC} 프로덕션 빌드..."
npm run build

if [ ! -d "dist" ]; then
    echo -e "${RED}❌ 빌드 실패: dist 폴더가 없습니다${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 빌드 완료${NC}"
echo "빌드 결과:"
ls -lh dist/ | head -10

# 4. S3 업로드
echo -e "${YELLOW}[4/5]${NC} S3에 업로드..."

# S3 버킷 존재 확인
if aws s3 ls "s3://$S3_BUCKET" --region "$AWS_REGION" >/dev/null 2>&1; then
    echo "S3 버킷 확인됨: $S3_BUCKET"
else
    echo -e "${RED}❌ S3 버킷을 찾을 수 없습니다: $S3_BUCKET${NC}"
    exit 1
fi

# 기존 prod 폴더 백업 (선택적)
BACKUP_SUFFIX=$(date +%Y%m%d_%H%M%S)
echo "기존 배포 백업 중... (backup-$BACKUP_SUFFIX)"
aws s3 sync "s3://$S3_BUCKET/$S3_PREFIX/" "s3://$S3_BUCKET/backup-$BACKUP_SUFFIX/" \
    --region "$AWS_REGION" \
    --quiet || echo "이전 배포가 없습니다"

# 새 파일 업로드
echo "S3에 업로드 중..."
aws s3 sync "$APP_DIR/dist/" "s3://$S3_BUCKET/$S3_PREFIX/" \
    --region "$AWS_REGION" \
    --delete \
    --cache-control "public,max-age=31536000,immutable" \
    --exclude "index.html" \
    --exclude "sw.js" \
    --exclude "site.webmanifest"

# index.html, sw.js는 캐시 안함
aws s3 cp "$APP_DIR/dist/index.html" "s3://$S3_BUCKET/$S3_PREFIX/index.html" \
    --region "$AWS_REGION" \
    --cache-control "no-cache,no-store,must-revalidate" \
    --content-type "text/html"

aws s3 cp "$APP_DIR/dist/sw.js" "s3://$S3_BUCKET/$S3_PREFIX/sw.js" \
    --region "$AWS_REGION" \
    --cache-control "no-cache,no-store,must-revalidate" \
    --content-type "application/javascript"

aws s3 cp "$APP_DIR/dist/site.webmanifest" "s3://$S3_BUCKET/$S3_PREFIX/site.webmanifest" \
    --region "$AWS_REGION" \
    --cache-control "no-cache" \
    --content-type "application/manifest+json"

echo -e "${GREEN}✅ S3 업로드 완료${NC}"

# 5. CloudFront 캐시 무효화 (CloudFront가 있는 경우)
echo -e "${YELLOW}[5/5]${NC} CloudFront 캐시 무효화..."

# CloudFront Distribution ID 확인 (환경변수 또는 자동 검색)
CLOUDFRONT_ID="${CLOUDFRONT_DISTRIBUTION_ID:-}"

if [ -z "$CLOUDFRONT_ID" ]; then
    echo "CloudFront Distribution ID를 찾는 중..."
    # S3 origin으로 CloudFront 찾기
    CLOUDFRONT_ID=$(aws cloudfront list-distributions \
        --region us-east-1 \
        --query "DistributionList.Items[?Origins.Items[?DomainName=='$S3_BUCKET.s3.$AWS_REGION.amazonaws.com']].Id" \
        --output text 2>/dev/null | head -1)
fi

if [ -n "$CLOUDFRONT_ID" ]; then
    echo "CloudFront Distribution ID: $CLOUDFRONT_ID"
    echo "캐시 무효화 중..."
    
    aws cloudfront create-invalidation \
        --distribution-id "$CLOUDFRONT_ID" \
        --paths "/$S3_PREFIX/*" "/$S3_PREFIX/index.html" \
        --region us-east-1 \
        > /dev/null 2>&1
    
    echo -e "${GREEN}✅ CloudFront 캐시 무효화 완료${NC}"
else
    echo -e "${YELLOW}⚠️  CloudFront Distribution을 찾을 수 없습니다${NC}"
    echo "   수동으로 캐시 무효화하거나 CloudFront 설정을 확인하세요"
fi

# 완료 메시지
echo ""
echo -e "${GREEN}🎉 배포 완료!${NC}"
echo ""
echo "📊 배포 정보:"
echo "  - S3 버킷: s3://$S3_BUCKET/$S3_PREFIX/"
echo "  - AWS Region: $AWS_REGION"
echo "  - 빌드 크기: $(du -sh dist/ | cut -f1)"
echo ""
echo "🌐 접속 URL:"
echo "  - S3 정적 웹사이트: http://$S3_BUCKET.s3-website-$AWS_REGION.amazonaws.com/$S3_PREFIX/"
echo "  - CloudFront (설정된 경우): https://[cloudfront-domain]"
echo "  - 커스텀 도메인 (설정된 경우): https://aischool.daitdaing.link"
echo ""
echo "📝 다음 단계:"
echo "  1. S3 정적 웹사이트 호스팅 활성화"
echo "  2. CloudFront Distribution 생성 (Origin: S3 bucket)"
echo "  3. Route 53 A 레코드 설정 (Alias to CloudFront)"
echo "  4. ACM SSL 인증서 발급 (*.daitdaing.link)"
echo ""

