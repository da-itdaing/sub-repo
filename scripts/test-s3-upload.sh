#!/bin/bash
# 실제 AWS S3 버킷에 이미지 업로드 테스트 스크립트

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PRIVATE_EC2_HOST=${PRIVATE_EC2_HOST:-private-ec2}
PRIVATE_EC2_USER=${PRIVATE_EC2_USER:-ubuntu}
TEST_IMAGE="/tmp/test-s3-image.png"

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  실제 AWS S3 버킷 이미지 업로드 테스트${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# 1. Private EC2에 테스트 이미지 확인
echo -e "${YELLOW}1. 테스트 이미지 확인${NC}"
ssh ${PRIVATE_EC2_USER}@${PRIVATE_EC2_HOST} << ENDSSH
    if [ -f "$TEST_IMAGE" ]; then
        echo "✅ 테스트 이미지 존재: $TEST_IMAGE"
        ls -lh "$TEST_IMAGE"
    else
        echo "❌ 테스트 이미지가 없습니다"
        exit 1
    fi
ENDSSH
echo ""

# 2. 환경 변수 확인
echo -e "${YELLOW}2. 환경 변수 확인${NC}"
ssh ${PRIVATE_EC2_USER}@${PRIVATE_EC2_HOST} << 'ENDSSH'
    cd ~/itdaing
    source prod.env
    
    echo "AWS Region: $AWS_REGION"
    echo "S3 Bucket: $STORAGE_S3_BUCKET"
    echo "Storage Provider: $STORAGE_PROVIDER"
    echo ""
    
    if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
        echo "❌ AWS 자격 증명이 설정되지 않았습니다"
        exit 1
    fi
    
    if [ -z "$STORAGE_S3_BUCKET" ]; then
        echo "❌ S3 버킷 이름이 설정되지 않았습니다"
        exit 1
    fi
    
    echo "✅ 환경 변수 확인 완료"
ENDSSH
echo ""

# 3. S3 버킷 접근 테스트
echo -e "${YELLOW}3. S3 버킷 접근 테스트${NC}"
ssh ${PRIVATE_EC2_USER}@${PRIVATE_EC2_HOST} << 'ENDSSH'
    cd ~/itdaing
    source prod.env
    
    echo "버킷 목록 확인:"
    AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID \
    AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY \
    AWS_DEFAULT_REGION=$AWS_REGION \
    aws s3 ls s3://$STORAGE_S3_BUCKET 2>&1 | head -10 || echo "  버킷 접근 실패"
ENDSSH
echo ""

# 4. 로그인하여 토큰 획득
echo -e "${YELLOW}4. 로그인하여 토큰 획득${NC}"
TOKEN=$(ssh ${PRIVATE_EC2_USER}@${PRIVATE_EC2_HOST} << 'ENDSSH'
    cd ~/itdaing
    source prod.env
    
    LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8080/api/auth/login \
      -H "Content-Type: application/json" \
      -d '{"loginId":"consumer1","password":"pass!1234"}')
    
    echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('data', {}).get('accessToken', ''))" 2>/dev/null || echo ""
ENDSSH
)

if [ -z "$TOKEN" ] || [ "$TOKEN" == "None" ]; then
    echo -e "${RED}❌ 로그인 실패${NC}"
    echo "백엔드 서버가 실행 중인지 확인하세요"
    exit 1
fi

echo -e "${GREEN}✅ 토큰 획득 성공 (길이: ${#TOKEN})${NC}"
echo ""

# 5. 이미지 업로드 (실제 S3)
echo -e "${YELLOW}5. 이미지 업로드 (실제 S3)${NC}"
UPLOAD_RESPONSE=$(ssh ${PRIVATE_EC2_USER}@${PRIVATE_EC2_HOST} << ENDSSH
    cd ~/itdaing
    source prod.env
    
    curl -s -X POST http://localhost:8080/api/uploads/images \
      -H "Authorization: Bearer $TOKEN" \
      -F "images=@$TEST_IMAGE"
ENDSSH
)

echo "$UPLOAD_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$UPLOAD_RESPONSE"
echo ""

# 6. 업로드 결과 확인
echo -e "${YELLOW}6. 업로드 결과 확인${NC}"
SUCCESS=$(echo "$UPLOAD_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('success', False))" 2>/dev/null)

if [ "$SUCCESS" == "True" ]; then
    echo -e "${GREEN}✅ 업로드 성공!${NC}"
    echo ""
    
    # 업로드된 파일 정보 추출
    FILES=$(echo "$UPLOAD_RESPONSE" | python3 -c "
import sys, json
data = json.load(sys.stdin)
files = data.get('data', {}).get('files', [])
for f in files:
    print(f\"URL: {f.get('url', '')}\")
    print(f\"Key: {f.get('key', '')}\")
    print(f\"Original Name: {f.get('originalName', '')}\")
    print(f\"Size: {f.get('size', 0)} bytes\")
    print(f\"Content Type: {f.get('contentType', '')}\")
    print('---')
" 2>/dev/null)
    
    echo "$FILES"
    
    # S3에서 실제 파일 확인
    echo ""
    echo -e "${YELLOW}7. S3에서 파일 확인${NC}"
    ssh ${PRIVATE_EC2_USER}@${PRIVATE_EC2_HOST} << 'ENDSSH'
        cd ~/itdaing
        source prod.env
        
        # 업로드된 키 추출
        KEY=$(echo '$UPLOAD_RESPONSE' | python3 -c "import sys, json; files=json.load(sys.stdin).get('data', {}).get('files', []); print(files[0].get('key', '') if files else '')" 2>/dev/null)
        
        if [ -n "$KEY" ]; then
            echo "S3에서 파일 확인:"
            AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID \
            AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY \
            AWS_DEFAULT_REGION=$AWS_REGION \
            aws s3 ls s3://$STORAGE_S3_BUCKET/$KEY 2>&1
            
            echo ""
            echo "이미지 URL:"
            echo "https://$STORAGE_S3_BUCKET.s3.$AWS_REGION.amazonaws.com/$KEY"
        fi
ENDSSH
    
    # 이미지 URL 추출
    IMAGE_URL=$(echo "$UPLOAD_RESPONSE" | python3 -c "import sys, json; files=json.load(sys.stdin).get('data', {}).get('files', []); print(files[0].get('url', '') if files else '')" 2>/dev/null)
    
    if [ -n "$IMAGE_URL" ]; then
        echo ""
        echo -e "${YELLOW}8. 업로드된 이미지 접근 테스트${NC}"
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$IMAGE_URL")
        if [ "$HTTP_CODE" == "200" ]; then
            echo -e "${GREEN}✅ 이미지 접근 성공 (HTTP $HTTP_CODE)${NC}"
            echo "이미지 URL: $IMAGE_URL"
            echo ""
            echo "브라우저에서 확인:"
            echo "  $IMAGE_URL"
        else
            echo -e "${YELLOW}⚠️  이미지 접근 실패 (HTTP $HTTP_CODE)${NC}"
            echo "이미지 URL: $IMAGE_URL"
            echo "S3 버킷 정책에서 공개 읽기가 허용되어 있는지 확인하세요"
        fi
    fi
else
    echo -e "${RED}❌ 업로드 실패${NC}"
    ERROR=$(echo "$UPLOAD_RESPONSE" | python3 -c "import sys, json; e=json.load(sys.stdin).get('error', {}); print(e.get('message', 'Unknown error'))" 2>/dev/null)
    echo "에러: $ERROR"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ S3 업로드 테스트 완료!${NC}"

