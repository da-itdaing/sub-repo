#!/bin/bash
# Private EC2 환경 설정 스크립트

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# SSH 접속 정보
PRIVATE_EC2_HOST=${PRIVATE_EC2_HOST:-private-ec2}
PRIVATE_EC2_USER=${PRIVATE_EC2_USER:-ubuntu}

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Private EC2 환경 설정${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# 1. prod.env 파일 권한 수정
echo -e "${YELLOW}1. prod.env 파일 권한 수정${NC}"
ssh ${PRIVATE_EC2_USER}@${PRIVATE_EC2_HOST} << 'ENDSSH'
    cd ~/itdaing
    if [ -f "prod.env" ]; then
        chmod 600 prod.env
        echo "✅ prod.env 파일 권한을 600으로 변경했습니다"
        ls -l prod.env
    else
        echo "❌ prod.env 파일이 없습니다"
        exit 1
    fi
ENDSSH
echo ""

# 2. AWS CLI 설치
echo -e "${YELLOW}2. AWS CLI 설치${NC}"
ssh ${PRIVATE_EC2_USER}@${PRIVATE_EC2_HOST} << 'ENDSSH'
    if ! command -v aws &> /dev/null; then
        echo "AWS CLI 설치 중..."
        sudo apt-get update -qq
        sudo apt-get install -y awscli > /dev/null 2>&1
        echo "✅ AWS CLI 설치 완료: $(aws --version 2>&1)"
    else
        echo "✅ AWS CLI 이미 설치됨: $(aws --version 2>&1)"
    fi
ENDSSH
echo ""

# 3. PostgreSQL 데이터베이스 연결 테스트 및 확인
echo -e "${YELLOW}3. PostgreSQL RDS 연결 확인${NC}"
ssh ${PRIVATE_EC2_USER}@${PRIVATE_EC2_HOST} << 'ENDSSH'
    cd ~/itdaing
    source prod.env
    
    # 데이터베이스 이름 추출
    DB_URL=$SPRING_DATASOURCE_URL
    DB_NAME=$(echo $DB_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
    DB_HOST=$(echo $DB_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
    DB_USER=$SPRING_DATASOURCE_USERNAME
    DB_PASS=$SPRING_DATASOURCE_PASSWORD
    
    echo "연결 정보:"
    echo "  호스트: $DB_HOST"
    echo "  데이터베이스: $DB_NAME"
    echo "  사용자: $DB_USER"
    echo ""
    
    # 데이터베이스 존재 여부 확인
    echo "데이터베이스 목록 확인:"
    PGPASSWORD=$DB_PASS psql -h "$DB_HOST" -U "$DB_USER" -d postgres -c "\l" 2>&1 | grep -E "(itdaing|Name)" | head -10 || echo "  연결 실패"
    echo ""
    
    # 실제 데이터베이스 연결 테스트
    echo "데이터베이스 연결 테스트:"
    PGPASSWORD=$DB_PASS psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "SELECT version();" 2>&1 | head -3 || echo "  ❌ 데이터베이스 '$DB_NAME' 연결 실패"
ENDSSH
echo ""

# 4. AWS S3 연결 테스트
echo -e "${YELLOW}4. AWS S3 연결 테스트${NC}"
ssh ${PRIVATE_EC2_USER}@${PRIVATE_EC2_HOST} << 'ENDSSH'
    cd ~/itdaing
    source prod.env
    
    if [ -n "$AWS_ACCESS_KEY_ID" ] && [ -n "$AWS_SECRET_ACCESS_KEY" ] && [ -n "$STORAGE_S3_BUCKET" ]; then
        echo "S3 버킷 접근 테스트:"
        AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID \
        AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY \
        AWS_DEFAULT_REGION=${AWS_REGION:-ap-northeast-2} \
        aws s3 ls s3://$STORAGE_S3_BUCKET 2>&1 | head -10 || echo "  ❌ 버킷 접근 실패 또는 버킷이 비어있음"
    else
        echo "⚠️  AWS 자격 증명 또는 버킷 이름이 설정되지 않았습니다"
    fi
ENDSSH
echo ""

# 5. nginx 설정 확인
echo -e "${YELLOW}5. nginx 설정 확인${NC}"
ssh ${PRIVATE_EC2_USER}@${PRIVATE_EC2_HOST} << 'ENDSSH'
    echo "nginx 설정 파일 내용:"
    sudo cat /etc/nginx/sites-available/itdaing.conf
    echo ""
    echo "활성화된 사이트:"
    sudo ls -la /etc/nginx/sites-enabled/
ENDSSH
echo ""

# 6. 포트 확인
echo -e "${YELLOW}6. 포트 사용 현황${NC}"
ssh ${PRIVATE_EC2_USER}@${PRIVATE_EC2_HOST} << 'ENDSSH'
    echo "주요 포트 확인:"
    sudo ss -tlnp | grep -E ':(80|443|8080)' || echo "  해당 포트 사용 안 함"
ENDSSH
echo ""

echo -e "${GREEN}✅ 환경 설정 완료${NC}"
echo ""

