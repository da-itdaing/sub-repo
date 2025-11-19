#!/bin/bash
# Private EC2에 전체 프로젝트 폴더 업로드 스크립트

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 설정 확인
if [ -z "$PRIVATE_EC2_HOST" ] || [ -z "$PRIVATE_EC2_USER" ]; then
    echo -e "${RED}❌ 환경 변수가 설정되지 않았습니다.${NC}"
    echo ""
    echo "사용 방법:"
    echo "  export PRIVATE_EC2_HOST=<private-ec2-ip-or-hostname>"
    echo "  export PRIVATE_EC2_USER=ubuntu"
    echo "  ./scripts/deploy-full-project.sh"
    echo ""
    exit 1
fi

PRIVATE_EC2_HOST=${PRIVATE_EC2_HOST}
PRIVATE_EC2_USER=${PRIVATE_EC2_USER:-ubuntu}
REMOTE_DIR="/home/${PRIVATE_EC2_USER}/itdaing"

echo -e "${GREEN}🚀 전체 프로젝트 폴더 업로드 시작${NC}"
echo "대상: ${PRIVATE_EC2_USER}@${PRIVATE_EC2_HOST}"
echo "원격 디렉토리: ${REMOTE_DIR}"
echo ""

# 제외할 파일/폴더 목록
EXCLUDE_PATTERNS=(
    "--exclude=.gradle"
    "--exclude=build"
    "--exclude=out"
    "--exclude=.idea"
    "--exclude=.vscode"
    "--exclude=node_modules"
    "--exclude=.docker"
    "--exclude=*.log"
    "--exclude=.DS_Store"
    "--exclude=*.swp"
    "--exclude=*.swo"
    "--exclude=*~"
)
# 참고: .git 폴더는 포함됩니다

# rsync를 사용한 업로드
echo -e "${YELLOW}📤 프로젝트 폴더 업로드 중...${NC}"
rsync -avz --progress \
    "${EXCLUDE_PATTERNS[@]}" \
    ./ ${PRIVATE_EC2_USER}@${PRIVATE_EC2_HOST}:${REMOTE_DIR}/

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 업로드 완료${NC}"
else
    echo -e "${RED}❌ 업로드 실패${NC}"
    exit 1
fi

echo ""
# prod.env 파일 확인
if [ -f "prod.env" ]; then
    echo -e "${YELLOW}📤 prod.env 파일 업로드 중...${NC}"
    scp prod.env ${PRIVATE_EC2_USER}@${PRIVATE_EC2_HOST}:${REMOTE_DIR}/prod.env
    ssh ${PRIVATE_EC2_USER}@${PRIVATE_EC2_HOST} "chmod 600 ${REMOTE_DIR}/prod.env"
    echo -e "${GREEN}✅ prod.env 파일 업로드 완료${NC}"
else
    echo -e "${RED}⚠️  prod.env 파일이 없습니다. 수동으로 업로드하세요.${NC}"
fi
echo ""

echo -e "${GREEN}✅ 전체 프로젝트 폴더 업로드 완료!${NC}"
echo ""
echo "다음 단계:"
echo "  1. SSH로 Private EC2 접속:"
echo "     ssh ${PRIVATE_EC2_USER}@${PRIVATE_EC2_HOST}"
echo ""
echo "  2. 프로젝트 디렉토리로 이동:"
echo "     cd ${REMOTE_DIR}"
echo ""
echo "  3. prod.env 파일 확인:"
echo "     ls -la prod.env"
echo ""
echo "  4. 빌드 (필요한 경우):"
echo "     ./gradlew clean build -x test"
echo ""
echo "  5. 애플리케이션 실행:"
echo "     source prod.env"
echo "     ./gradlew bootRun"
echo ""
echo "     또는 systemd 서비스 사용:"
echo "     sudo systemctl start itdaing"

