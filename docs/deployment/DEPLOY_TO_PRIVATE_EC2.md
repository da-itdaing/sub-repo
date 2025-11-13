# Private EC2 배포 가이드

## 📋 개요

프로젝트를 Private EC2에 배포하는 방법을 설명합니다.

## 🚀 배포 방법

### 방법 0: 초기 설정 (처음 설정 시)

기존 프로젝트 폴더를 제거하고 새로 시작하는 경우:

```bash
export PRIVATE_EC2_HOST=<private-ec2-ip>
export PRIVATE_EC2_USER=ubuntu
./scripts/setup-private-ec2.sh
```

이 스크립트는 기존 `final-project` 폴더를 제거하고 전체 프로젝트를 업로드합니다.

자세한 내용은 [초기 설정 가이드](SETUP_PRIVATE_EC2.md)를 참고하세요.

### 방법 1: JAR 파일만 배포 (권장)

애플리케이션 JAR 파일과 설정 파일만 업로드합니다.

#### 1. 환경 변수 설정

```bash
export PRIVATE_EC2_HOST=<private-ec2-ip-or-hostname>
export PRIVATE_EC2_USER=ubuntu
```

또는 SSH config에 설정:

```bash
# ~/.ssh/config
Host private-ec2
    HostName <private-ec2-ip>
    User ubuntu
    IdentityFile ~/.ssh/your-key.pem
```

그리고:
```bash
export PRIVATE_EC2_HOST=private-ec2
```

#### 2. 배포 스크립트 실행

```bash
./scripts/deploy-to-private-ec2.sh
```

이 스크립트는 다음을 수행합니다:
- 프로젝트 빌드
- JAR 파일 업로드
- prod.env 파일 업로드 (있는 경우)
- systemd 서비스 파일 생성

#### 3. 서비스 시작

```bash
# SSH로 Private EC2 접속
ssh private-ec2

# systemd 서비스 시작
sudo systemctl daemon-reload
sudo systemctl enable itdaing
sudo systemctl start itdaing
sudo systemctl status itdaing
```

### 방법 2: 전체 프로젝트 폴더 업로드

개발/디버깅 목적으로 전체 프로젝트 폴더를 업로드합니다.

#### 1. 환경 변수 설정

```bash
export PRIVATE_EC2_HOST=<private-ec2-ip-or-hostname>
export PRIVATE_EC2_USER=ubuntu
```

#### 2. 전체 프로젝트 업로드

```bash
./scripts/deploy-full-project.sh
```

이 스크립트는 다음을 제외하고 업로드합니다:
- `build/`, `out/`
- `node_modules/`
- `.gradle/`
- 기타 임시 파일

**참고**: `.git/` 폴더는 포함됩니다 (Git 히스토리 포함)

#### 3. 원격에서 빌드 및 실행

```bash
# SSH로 Private EC2 접속
ssh private-ec2

# 프로젝트 디렉토리로 이동
cd ~/itdaing

# 빌드
./gradlew clean build -x test

# 환경 변수 로드
source prod.env

# 실행
./gradlew bootRun
```

### 방법 3: 수동 업로드

#### 1. JAR 파일 업로드

```bash
# 빌드
./gradlew clean build -x test

# 업로드
scp build/libs/*-SNAPSHOT.jar ubuntu@<private-ec2-ip>:/home/ubuntu/itdaing/app/app.jar
```

#### 2. prod.env 파일 업로드

`deploy-to-private-ec2.sh` 스크립트는 자동으로 `prod.env` 파일을 업로드합니다.

수동 업로드가 필요한 경우:

```bash
scp prod.env ubuntu@<private-ec2-ip>:/home/ubuntu/itdaing/config/prod.env
ssh ubuntu@<private-ec2-ip> "chmod 600 /home/ubuntu/itdaing/config/prod.env"
```

#### 3. 전체 폴더 업로드 (rsync 사용)

```bash
rsync -avz --progress \
    --exclude=build \
    --exclude=node_modules \
    --exclude=.gradle \
    ./ ubuntu@<private-ec2-ip>:/home/ubuntu/itdaing/
```

**참고**: `.git/` 폴더는 포함됩니다.

## 📁 원격 디렉토리 구조

배포 후 Private EC2의 디렉토리 구조:

```
/home/ubuntu/itdaing/
├── app/
│   └── app.jar              # Spring Boot 애플리케이션
├── config/
│   └── prod.env             # 환경 변수 파일
├── logs/                    # 로그 파일 (선택사항)
└── [프로젝트 파일들]        # 전체 프로젝트 업로드 시
```

## ⚙️ systemd 서비스 설정

### 서비스 파일 생성

`/etc/systemd/system/itdaing.service`:

```ini
[Unit]
Description=Itdaing Server
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/itdaing/app
EnvironmentFile=/home/ubuntu/itdaing/config/prod.env
ExecStart=/usr/bin/java -jar /home/ubuntu/itdaing/app/app.jar
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=itdaing

[Install]
WantedBy=multi-user.target
```

### 서비스 관리

```bash
# 서비스 시작
sudo systemctl start itdaing

# 서비스 중지
sudo systemctl stop itdaing

# 서비스 재시작
sudo systemctl restart itdaing

# 서비스 상태 확인
sudo systemctl status itdaing

# 서비스 로그 확인
journalctl -u itdaing -f

# 부팅 시 자동 시작
sudo systemctl enable itdaing
```

## 🔍 배포 확인

### 1. 애플리케이션 상태 확인

```bash
# 서비스 상태
sudo systemctl status itdaing

# 프로세스 확인
ps aux | grep java

# 포트 확인
sudo netstat -tlnp | grep 8080
```

### 2. 로그 확인

```bash
# 실시간 로그
journalctl -u itdaing -f

# 최근 로그
journalctl -u itdaing -n 100

# 특정 시간대 로그
journalctl -u itdaing --since "1 hour ago"
```

### 3. 연결 테스트

```bash
# 로컬에서 (Private EC2가 Public IP를 가지고 있는 경우)
curl http://<private-ec2-ip>:8080/actuator/health

# Private EC2 내부에서
curl http://localhost:8080/actuator/health
```

## 🔄 업데이트 배포

### JAR 파일만 업데이트

```bash
# 로컬에서
./gradlew clean build -x test
scp build/libs/*-SNAPSHOT.jar ubuntu@<private-ec2-ip>:/home/ubuntu/itdaing/app/app.jar

# Private EC2에서
ssh ubuntu@<private-ec2-ip>
sudo systemctl restart itdaing
```

### 전체 프로젝트 업데이트

```bash
# 로컬에서
./scripts/deploy-full-project.sh

# Private EC2에서
ssh ubuntu@<private-ec2-ip>
cd ~/itdaing
./gradlew clean build -x test
sudo systemctl restart itdaing
```

## 🐛 문제 해결

### 연결 실패

```bash
# SSH 연결 테스트
ssh -v ubuntu@<private-ec2-ip>

# 네트워크 확인
ping <private-ec2-ip>
```

### 서비스 시작 실패

```bash
# 서비스 로그 확인
journalctl -u itdaing -n 50

# 환경 변수 확인
sudo systemctl show itdaing --property=EnvironmentFile

# 수동 실행 테스트
cd /home/ubuntu/itdaing/app
source /home/ubuntu/itdaing/config/prod.env
java -jar app.jar
```

### 데이터베이스 연결 실패

```bash
# RDS 연결 테스트
psql -h <rds-endpoint> -p 5432 -U itdaing_admin -d itdaing-db

# 보안 그룹 확인
# Private EC2의 보안 그룹이 RDS의 보안 그룹에 허용되어 있는지 확인
```

## 📚 관련 문서

- [EC2 아키텍처](EC2_ARCHITECTURE.md)
- [prod.env 설정](PROD_ENV_SETUP.md)
- [EC2 배포 가이드](DEPLOY_EC2.md)

