#!/bin/bash
# S3 정적 웹사이트 호스팅 설정 스크립트

set -e

echo "🔧 S3 정적 웹사이트 호스팅 설정..."

# 색상 코드
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 환경변수 로드
ENV_FILE="/home/ubuntu/itdaing/prod.env"
if [ -f "$ENV_FILE" ]; then
    source "$ENV_FILE"
else
    echo -e "${RED}❌ prod.env 파일을 찾을 수 없습니다${NC}"
    exit 1
fi

S3_BUCKET="${S3_BUCKET_NAME:-daitdaing-static-files}"
AWS_REGION="${AWS_REGION:-ap-northeast-2}"

echo "S3 버킷: $S3_BUCKET"
echo "AWS Region: $AWS_REGION"
echo ""

# 1. S3 정적 웹사이트 호스팅 활성화
echo -e "${YELLOW}[1/3]${NC} S3 정적 웹사이트 호스팅 활성화..."

aws s3 website "s3://$S3_BUCKET" \
    --index-document index.html \
    --error-document index.html \
    --region "$AWS_REGION"

echo -e "${GREEN}✅ S3 웹사이트 호스팅 활성화됨${NC}"

# 2. 버킷 정책 설정 (Public Read)
echo -e "${YELLOW}[2/3]${NC} S3 버킷 정책 설정..."

cat > /tmp/s3-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::$S3_BUCKET/prod/*"
    }
  ]
}
EOF

aws s3api put-bucket-policy \
    --bucket "$S3_BUCKET" \
    --policy file:///tmp/s3-policy.json \
    --region "$AWS_REGION"

echo -e "${GREEN}✅ 버킷 정책 설정 완료${NC}"

# 3. Public Access Block 해제
echo -e "${YELLOW}[3/3]${NC} Public Access Block 설정..."

aws s3api put-public-access-block \
    --bucket "$S3_BUCKET" \
    --public-access-block-configuration \
        "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false" \
    --region "$AWS_REGION"

echo -e "${GREEN}✅ Public Access 허용됨${NC}"

# 완료
echo ""
echo -e "${GREEN}🎉 S3 설정 완료!${NC}"
echo ""
echo "🌐 S3 웹사이트 엔드포인트:"
echo "  http://$S3_BUCKET.s3-website-$AWS_REGION.amazonaws.com"
echo ""
echo "📝 다음 단계:"
echo "  1. ./deploy-s3.sh 실행하여 빌드 파일 업로드"
echo "  2. CloudFront Distribution 생성 (선택)"
echo "  3. Route 53 A 레코드 설정"
echo ""

