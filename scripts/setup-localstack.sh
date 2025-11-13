#!/bin/bash
# LocalStack 초기 설정 스크립트

set -e

ENDPOINT_URL="http://localhost:4566"
BUCKET_NAME="itdaing-local"
REGION="ap-northeast-2"

echo "🚀 LocalStack 초기 설정 시작..."

# LocalStack 상태 확인
echo "📡 LocalStack 상태 확인 중..."
if ! curl -s "${ENDPOINT_URL}/_localstack/health" > /dev/null; then
    echo "❌ LocalStack이 실행 중이 아닙니다. docker-compose up -d localstack 실행 후 다시 시도하세요."
    exit 1
fi

echo "✅ LocalStack 연결 확인됨"

# S3 버킷 생성
echo "📦 S3 버킷 생성 중: ${BUCKET_NAME}"
aws --endpoint-url="${ENDPOINT_URL}" s3 mb "s3://${BUCKET_NAME}" --region "${REGION}" 2>/dev/null || {
    echo "⚠️  버킷이 이미 존재하거나 생성 실패 (무시 가능)"
}

# 버킷 목록 확인
echo "📋 생성된 버킷 목록:"
aws --endpoint-url="${ENDPOINT_URL}" s3 ls --region "${REGION}"

# 버킷 정책 설정 (Public Read - 개발용)
echo "🔓 버킷 정책 설정 중..."
cat > /tmp/bucket-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::${BUCKET_NAME}/*"
    }
  ]
}
EOF

aws --endpoint-url="${ENDPOINT_URL}" s3api put-bucket-policy \
    --bucket "${BUCKET_NAME}" \
    --policy file:///tmp/bucket-policy.json \
    --region "${REGION}" 2>/dev/null || echo "⚠️  정책 설정 실패 (무시 가능)"

rm -f /tmp/bucket-policy.json

echo "✅ LocalStack 초기 설정 완료!"
echo ""
echo "📝 다음 단계:"
echo "   1. 환경 변수 설정: cp env.example .env"
echo "   2. .env 파일에서 STORAGE_PROVIDER=s3 설정"
echo "   3. 백엔드 서버 시작: STORAGE_PROVIDER=s3 ./gradlew bootRun"

