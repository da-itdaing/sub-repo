#!/bin/bash
# Private EC2 환경 점검 스크립트

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

# 실행 모드 결정: 기본적으로 Private EC2에서 로컬 실행
RUN_LOCAL=${RUN_LOCAL:-}
if [ -z "$RUN_LOCAL" ]; then
    if [ "$(whoami)" = "ubuntu" ] && [ -d "/home/ubuntu/itdaing" ]; then
        RUN_LOCAL=1
    else
        RUN_LOCAL=0
    fi
fi

if [ "$RUN_LOCAL" = "1" ]; then
    EXEC_PREFIX="bash -s"
    echo -e "${YELLOW}실행 모드: 로컬 (현재 인스턴스에서 직접 점검)${NC}"
else
    EXEC_PREFIX="ssh ${PRIVATE_EC2_USER}@${PRIVATE_EC2_HOST} bash -s"
    echo -e "${YELLOW}실행 모드: SSH (${PRIVATE_EC2_USER}@${PRIVATE_EC2_HOST})${NC}"
fi

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Private EC2 환경 점검${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# 1. 시스템 정보
echo -e "${YELLOW}1. 시스템 정보${NC}"
${EXEC_PREFIX} << 'ENDSSH'
    echo "호스트명: $(hostname)"
    echo "OS: $(uname -a)"
    echo "디스크 사용량:"
    df -h / | tail -1
    echo "메모리 사용량:"
    free -h | grep Mem
ENDSSH
echo ""

# 2. 프로젝트 디렉토리 확인
echo -e "${YELLOW}2. 프로젝트 디렉토리${NC}"
${EXEC_PREFIX} << 'ENDSSH'
    cd ~/itdaing 2>/dev/null || { echo "❌ ~/itdaing 디렉토리가 없습니다"; exit 1; }
    echo "✅ 프로젝트 디렉토리: $(pwd)"
    echo "디렉토리 크기: $(du -sh . | cut -f1)"
    echo ""
    echo "주요 파일:"
    ls -lh gradlew prod.env 2>/dev/null | awk '{print "  " $9, "(" $5 ")"}'
ENDSSH
echo ""

# 3. 환경 변수 확인
echo -e "${YELLOW}3. 환경 변수 파일 (prod.env)${NC}"
${EXEC_PREFIX} << 'ENDSSH'
    cd ~/itdaing
    if [ -f "prod.env" ]; then
        echo "✅ prod.env 파일 존재"
        echo "파일 권한: $(ls -l prod.env | awk '{print $1}')"
        echo ""
        echo "환경 변수 확인 (비밀번호 마스킹):"
        cat prod.env | grep -E "^[A-Z_]+=" | sed 's/PASSWORD=.*/PASSWORD=***/' | sed 's/SECRET=.*/SECRET=***/' | sed 's/KEY=.*/KEY=***/' | head -10
    else
        echo "❌ prod.env 파일이 없습니다"
    fi
ENDSSH
echo ""

# 4. PostgreSQL RDS 연결 확인
echo -e "${YELLOW}4. PostgreSQL RDS 연결${NC}"
${EXEC_PREFIX} << 'ENDSSH'
    cd ~/itdaing
    source prod.env 2>/dev/null || true
    
    # PostgreSQL 클라이언트 확인
    if command -v psql &> /dev/null; then
        echo "✅ PostgreSQL 클라이언트 설치됨"
        
        # RDS 연결 테스트
        DB_HOST=$(echo $SPRING_DATASOURCE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
        DB_NAME=$(echo $SPRING_DATASOURCE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
        DB_USER=$SPRING_DATASOURCE_USERNAME
        
        if [ -n "$DB_HOST" ] && [ -n "$DB_NAME" ] && [ -n "$DB_USER" ]; then
            echo "연결 정보:"
            echo "  호스트: $DB_HOST"
            echo "  데이터베이스: $DB_NAME"
            echo "  사용자: $DB_USER"
            echo ""
            echo "연결 테스트:"
            PGPASSWORD=$SPRING_DATASOURCE_PASSWORD psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "SELECT version();" 2>&1 | head -3 || echo "  ❌ 연결 실패"
        else
            echo "⚠️  환경 변수에서 DB 정보를 읽을 수 없습니다"
        fi
    else
        echo "❌ PostgreSQL 클라이언트가 설치되지 않았습니다"
        echo "설치 명령: sudo apt-get install -y postgresql-client"
    fi
ENDSSH
echo ""

# 5. AWS S3 연결 확인
echo -e "${YELLOW}5. AWS S3 연결${NC}"
${EXEC_PREFIX} << 'ENDSSH'
    cd ~/itdaing
    source prod.env 2>/dev/null || true
    
    # AWS CLI 확인
    if command -v aws &> /dev/null; then
        echo "✅ AWS CLI 설치됨: $(aws --version 2>&1)"
        
        # AWS 자격 증명 확인
        if [ -n "$AWS_ACCESS_KEY_ID" ] && [ -n "$AWS_SECRET_ACCESS_KEY" ]; then
            echo "✅ AWS 자격 증명 환경 변수 설정됨"
            echo "  Region: ${AWS_REGION:-not set}"
            echo "  Bucket: ${STORAGE_S3_BUCKET:-not set}"
            
            # S3 버킷 접근 테스트
            if [ -n "$STORAGE_S3_BUCKET" ]; then
                echo ""
                echo "S3 버킷 접근 테스트:"
                AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID \
                AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY \
                AWS_DEFAULT_REGION=${AWS_REGION:-ap-northeast-2} \
                aws s3 ls s3://$STORAGE_S3_BUCKET 2>&1 | head -5 || echo "  ❌ 버킷 접근 실패"
            fi
        else
            echo "⚠️  AWS 자격 증명 환경 변수가 설정되지 않았습니다"
        fi
    else
        echo "❌ AWS CLI가 설치되지 않았습니다"
        echo "설치 명령: sudo apt-get install -y awscli"
    fi
ENDSSH
echo ""

# 6. nginx 확인
echo -e "${YELLOW}6. nginx 설정${NC}"
${EXEC_PREFIX} << 'ENDSSH'
    # nginx 설치 확인
    if command -v nginx &> /dev/null; then
        echo "✅ nginx 설치됨: $(nginx -v 2>&1)"
        
        # nginx 프로세스 확인
        if pgrep -x nginx > /dev/null; then
            echo "✅ nginx 실행 중"
        else
            echo "⚠️  nginx 실행 중이 아님"
        fi
        
        # nginx 설정 파일 확인
        echo ""
        echo "nginx 설정 파일:"
        if [ -d "/etc/nginx/sites-available" ]; then
            sudo ls -la /etc/nginx/sites-available/ | grep -v "^total" | awk '{print "  " $9}'
        fi
        
        if [ -d "/etc/nginx/sites-enabled" ]; then
            echo ""
            echo "활성화된 사이트:"
            sudo ls -la /etc/nginx/sites-enabled/ | grep -v "^total" | awk '{print "  " $9}'
        fi
        
        # nginx 설정 테스트
        echo ""
        echo "nginx 설정 테스트:"
        sudo nginx -t 2>&1 | head -5
    else
        echo "❌ nginx가 설치되지 않았습니다"
        echo "설치 명령: sudo apt-get install -y nginx"
    fi
ENDSSH
echo ""

# 7. Java 및 Gradle 확인
echo -e "${YELLOW}7. Java 및 Gradle${NC}"
${EXEC_PREFIX} << 'ENDSSH'
    cd ~/itdaing
    
    # Java 확인
    if command -v java &> /dev/null; then
        echo "✅ Java 설치됨: $(java -version 2>&1 | head -1)"
    else
        echo "❌ Java가 설치되지 않았습니다"
    fi
    
    # Gradle 확인
    if [ -f "gradlew" ]; then
        echo "✅ Gradle wrapper 존재"
        chmod +x gradlew 2>/dev/null
        echo "Gradle 버전:"
        ./gradlew --version 2>&1 | grep "Gradle" | head -1
    else
        echo "❌ gradlew 파일이 없습니다"
    fi
ENDSSH
echo ""

# 8. 포트 확인
echo -e "${YELLOW}8. 포트 사용 현황${NC}"
${EXEC_PREFIX} << 'ENDSSH'
    echo "주요 포트 확인:"
    echo "  8080 (Spring Boot): $(sudo netstat -tlnp 2>/dev/null | grep ':8080' || echo '사용 안 함')"
    echo "  80 (HTTP): $(sudo netstat -tlnp 2>/dev/null | grep ':80 ' || echo '사용 안 함')"
    echo "  443 (HTTPS): $(sudo netstat -tlnp 2>/dev/null | grep ':443 ' || echo '사용 안 함')"
ENDSSH
echo ""

echo -e "${GREEN}✅ 환경 점검 완료${NC}"
echo ""

