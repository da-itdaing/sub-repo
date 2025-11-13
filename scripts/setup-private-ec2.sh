#!/bin/bash
# Private EC2 초기 설정 및 프로젝트 배포 스크립트

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 설정 확인
if [ -z "$PRIVATE_EC2_HOST" ] || [ -z "$PRIVATE_EC2_USER" ]; then
    echo -e "${RED}❌ 환경 변수가 설정되지 않았습니다.${NC}"
    echo ""
    echo "사용 방법:"
    echo "  export PRIVATE_EC2_HOST=<private-ec2-ip-or-hostname>"
    echo "  export PRIVATE_EC2_USER=ubuntu"
    echo "  ./scripts/setup-private-ec2.sh"
    echo ""
    exit 1
fi

PRIVATE_EC2_HOST=${PRIVATE_EC2_HOST}
PRIVATE_EC2_USER=${PRIVATE_EC2_USER:-ubuntu}
REMOTE_DIR="/home/${PRIVATE_EC2_USER}/itdaing"
OLD_PROJECT_DIR="/home/${PRIVATE_EC2_USER}/final-project"

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Private EC2 초기 설정 및 프로젝트 배포${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo "대상: ${PRIVATE_EC2_USER}@${PRIVATE_EC2_HOST}"
echo "원격 디렉토리: ${REMOTE_DIR}"
echo ""

# 1. 기존 프로젝트 폴더 제거 확인
echo -e "${YELLOW}🗑️  기존 프로젝트 폴더 확인 중...${NC}"
if ssh ${PRIVATE_EC2_USER}@${PRIVATE_EC2_HOST} "[ -d '${OLD_PROJECT_DIR}' ]" 2>/dev/null; then
    echo -e "${YELLOW}⚠️  기존 final-project 폴더가 발견되었습니다.${NC}"
    read -p "제거하시겠습니까? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}🗑️  기존 final-project 폴더 제거 중...${NC}"
        ssh ${PRIVATE_EC2_USER}@${PRIVATE_EC2_HOST} "rm -rf ${OLD_PROJECT_DIR}"
        echo -e "${GREEN}✅ 기존 폴더 제거 완료${NC}"
    else
        echo -e "${YELLOW}⚠️  기존 폴더를 유지합니다.${NC}"
    fi
else
    echo -e "${GREEN}✅ 기존 final-project 폴더가 없습니다.${NC}"
fi
echo ""

# 2. 기존 itdaing 폴더 제거 확인
if ssh ${PRIVATE_EC2_USER}@${PRIVATE_EC2_HOST} "[ -d '${REMOTE_DIR}' ]" 2>/dev/null; then
    echo -e "${YELLOW}⚠️  기존 itdaing 폴더가 발견되었습니다.${NC}"
    read -p "제거하고 새로 시작하시겠습니까? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}🗑️  기존 itdaing 폴더 제거 중...${NC}"
        ssh ${PRIVATE_EC2_USER}@${PRIVATE_EC2_HOST} "rm -rf ${REMOTE_DIR}"
        echo -e "${GREEN}✅ 기존 폴더 제거 완료${NC}"
    fi
fi
echo ""

# 3. 원격 디렉토리 생성
echo -e "${YELLOW}📁 원격 디렉토리 생성 중...${NC}"
ssh ${PRIVATE_EC2_USER}@${PRIVATE_EC2_HOST} "mkdir -p ${REMOTE_DIR}"
echo -e "${GREEN}✅ 디렉토리 생성 완료${NC}"
echo ""

# 4. 필수 도구 설치 확인
echo -e "${YELLOW}🔧 필수 도구 설치 확인 중...${NC}"
ssh ${PRIVATE_EC2_USER}@${PRIVATE_EC2_HOST} << 'ENDSSH'
    # Java 21 확인
    if ! command -v java &> /dev/null || ! java -version 2>&1 | grep -q "21"; then
        echo "Java 21 설치 중..."
        sudo apt-get update
        sudo apt-get install -y fontconfig openjdk-21-jdk
    fi
    
    # Git 확인
    if ! command -v git &> /dev/null; then
        echo "Git 설치 중..."
        sudo apt-get install -y git
    fi
    
    # PostgreSQL 클라이언트 확인 (선택사항)
    if ! command -v psql &> /dev/null; then
        echo "PostgreSQL 클라이언트 설치 중..."
        sudo apt-get install -y postgresql-client
    fi
    
    echo "필수 도구 확인 완료"
ENDSSH
echo -e "${GREEN}✅ 필수 도구 확인 완료${NC}"
echo ""

# 5. prod.env 파일 확인
if [ ! -f "prod.env" ]; then
    echo -e "${RED}❌ prod.env 파일이 없습니다!${NC}"
    echo "prod.env 파일을 프로젝트 루트에 생성하세요."
    exit 1
fi
echo -e "${GREEN}✅ prod.env 파일 확인 완료${NC}"
echo ""

# 6. 프로젝트 업로드
echo -e "${YELLOW}📤 프로젝트 폴더 업로드 중...${NC}"
echo "이 작업은 시간이 걸릴 수 있습니다..."
echo ""

# 제외할 파일/폴더 목록
EXCLUDE_PATTERNS=(
    "--exclude=.gradle"
    "--exclude=build"
    "--exclude=out"
    "--exclude=.idea"
    "--exclude=.vscode"
    "--exclude=node_modules"
    "--exclude=itdaing-web/node_modules"
    "--exclude=itdaing-web/dist"
    "--exclude=.docker"
    "--exclude=*.log"
    "--exclude=.DS_Store"
    "--exclude=*.swp"
    "--exclude=*.swo"
    "--exclude=*~"
)

rsync -avz --progress \
    "${EXCLUDE_PATTERNS[@]}" \
    ./ ${PRIVATE_EC2_USER}@${PRIVATE_EC2_HOST}:${REMOTE_DIR}/

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 프로젝트 업로드 완료${NC}"
else
    echo -e "${RED}❌ 업로드 실패${NC}"
    exit 1
fi
echo ""

# 7. prod.env 파일 권한 설정
echo -e "${YELLOW}🔒 prod.env 파일 권한 설정 중...${NC}"
ssh ${PRIVATE_EC2_USER}@${PRIVATE_EC2_HOST} "chmod 600 ${REMOTE_DIR}/prod.env"
echo -e "${GREEN}✅ 파일 권한 설정 완료${NC}"
echo ""

# 8. 원격에서 초기 설정
echo -e "${YELLOW}⚙️  원격 초기 설정 중...${NC}"
ssh ${PRIVATE_EC2_USER}@${PRIVATE_EC2_HOST} << ENDSSH
    cd ${REMOTE_DIR}
    
    # Gradle wrapper 실행 권한 부여
    chmod +x gradlew
    
    # Git 설정 확인
    if [ -d ".git" ]; then
        echo "Git 저장소 확인 완료"
    fi
    
    # 프로젝트 구조 확인
    echo "프로젝트 구조:"
    ls -la | head -20
ENDSSH
echo -e "${GREEN}✅ 초기 설정 완료${NC}"
echo ""

# 9. 완료 메시지
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Private EC2 설정 완료!${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo "다음 단계:"
echo ""
echo "1. SSH로 Private EC2 접속:"
echo -e "   ${YELLOW}ssh ${PRIVATE_EC2_USER}@${PRIVATE_EC2_HOST}${NC}"
echo ""
echo "2. 프로젝트 디렉토리로 이동:"
echo -e "   ${YELLOW}cd ${REMOTE_DIR}${NC}"
echo ""
echo "3. 환경 변수 확인:"
echo -e "   ${YELLOW}cat prod.env${NC}"
echo ""
echo "4. 빌드 (선택사항):"
echo -e "   ${YELLOW}./gradlew clean build -x test${NC}"
echo ""
echo "5. 애플리케이션 실행:"
echo -e "   ${YELLOW}source prod.env${NC}"
echo -e "   ${YELLOW}./gradlew bootRun${NC}"
echo ""
echo "6. 또는 systemd 서비스 사용:"
echo -e "   ${YELLOW}sudo systemctl start itdaing${NC}"
echo ""

