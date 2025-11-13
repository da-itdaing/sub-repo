#!/bin/bash
# Private EC2에 프로젝트 배포 스크립트

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 설정 확인
if [ -z "$PRIVATE_EC2_HOST" ] || [ -z "$PRIVATE_EC2_USER" ]; then
    echo -e "${RED}❌ 환경 변수가 설정되지 않았습니다.${NC}"
    echo ""
    echo "사용 방법:"
    echo "  export PRIVATE_EC2_HOST=<private-ec2-ip-or-hostname>"
    echo "  export PRIVATE_EC2_USER=ubuntu"
    echo "  ./scripts/deploy-to-private-ec2.sh"
    echo ""
    echo "또는 직접 지정:"
    echo "  PRIVATE_EC2_HOST=<ip> PRIVATE_EC2_USER=ubuntu ./scripts/deploy-to-private-ec2.sh"
    exit 1
fi

PRIVATE_EC2_HOST=${PRIVATE_EC2_HOST}
PRIVATE_EC2_USER=${PRIVATE_EC2_USER:-ubuntu}
REMOTE_DIR="/home/${PRIVATE_EC2_USER}/itdaing"

echo -e "${GREEN}🚀 Private EC2 배포 시작${NC}"
echo "대상: ${PRIVATE_EC2_USER}@${PRIVATE_EC2_HOST}"
echo "원격 디렉토리: ${REMOTE_DIR}"
echo ""

# 1. 빌드
echo -e "${YELLOW}📦 프로젝트 빌드 중...${NC}"
./gradlew clean build -x test
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ 빌드 실패${NC}"
    exit 1
fi
echo -e "${GREEN}✅ 빌드 완료${NC}"
echo ""

# 2. 원격 디렉토리 생성
echo -e "${YELLOW}📁 원격 디렉토리 생성 중...${NC}"
ssh ${PRIVATE_EC2_USER}@${PRIVATE_EC2_HOST} "mkdir -p ${REMOTE_DIR}/{app,logs,config}"
echo -e "${GREEN}✅ 디렉토리 생성 완료${NC}"
echo ""

# 3. JAR 파일 업로드
echo -e "${YELLOW}📤 JAR 파일 업로드 중...${NC}"
JAR_FILE=$(ls -t build/libs/*-SNAPSHOT.jar | grep -v plain | head -1)
scp "${JAR_FILE}" ${PRIVATE_EC2_USER}@${PRIVATE_EC2_HOST}:${REMOTE_DIR}/app/app.jar
echo -e "${GREEN}✅ JAR 파일 업로드 완료: $(basename ${JAR_FILE})${NC}"
echo ""

# 4. prod.env 파일 업로드 (있는 경우)
if [ -f "prod.env" ]; then
    echo -e "${YELLOW}📤 prod.env 파일 업로드 중...${NC}"
    scp prod.env ${PRIVATE_EC2_USER}@${PRIVATE_EC2_HOST}:${REMOTE_DIR}/config/prod.env
    ssh ${PRIVATE_EC2_USER}@${PRIVATE_EC2_HOST} "chmod 600 ${REMOTE_DIR}/config/prod.env"
    echo -e "${GREEN}✅ prod.env 파일 업로드 완료${NC}"
else
    echo -e "${YELLOW}⚠️  prod.env 파일이 없습니다. 수동으로 업로드하세요.${NC}"
fi
echo ""

# 5. systemd 서비스 파일 업로드
echo -e "${YELLOW}📤 systemd 서비스 파일 생성 중...${NC}"
cat > /tmp/itdaing.service <<EOF
[Unit]
Description=Itdaing Server
After=network.target

[Service]
Type=simple
User=${PRIVATE_EC2_USER}
WorkingDirectory=${REMOTE_DIR}/app
EnvironmentFile=${REMOTE_DIR}/config/prod.env
ExecStart=/usr/bin/java -jar ${REMOTE_DIR}/app/app.jar
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=itdaing

[Install]
WantedBy=multi-user.target
EOF

scp /tmp/itdaing.service ${PRIVATE_EC2_USER}@${PRIVATE_EC2_HOST}:/tmp/itdaing.service
ssh ${PRIVATE_EC2_USER}@${PRIVATE_EC2_HOST} "sudo mv /tmp/itdaing.service /etc/systemd/system/itdaing.service && sudo chmod 644 /etc/systemd/system/itdaing.service"
rm /tmp/itdaing.service
echo -e "${GREEN}✅ systemd 서비스 파일 생성 완료${NC}"
echo ""

# 6. 완료 메시지
echo -e "${GREEN}✅ 배포 완료!${NC}"
echo ""
echo "다음 단계:"
echo "  1. SSH로 Private EC2 접속:"
echo "     ssh ${PRIVATE_EC2_USER}@${PRIVATE_EC2_HOST}"
echo ""
echo "  2. prod.env 파일 확인 (없는 경우):"
echo "     ls -la ${REMOTE_DIR}/config/prod.env"
echo ""
echo "  3. systemd 서비스 시작:"
echo "     sudo systemctl daemon-reload"
echo "     sudo systemctl enable itdaing"
echo "     sudo systemctl start itdaing"
echo "     sudo systemctl status itdaing"
echo ""
echo "  4. 로그 확인:"
echo "     journalctl -u itdaing -f"

