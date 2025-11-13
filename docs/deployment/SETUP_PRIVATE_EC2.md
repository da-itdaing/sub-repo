# Private EC2 초기 설정 가이드

## 📋 개요

Private EC2에 프로젝트를 처음 설정하는 방법을 설명합니다. 기존 프로젝트 폴더를 제거하고 새로 시작합니다.

## 🚀 빠른 시작

### 1. 환경 변수 설정

```bash
export PRIVATE_EC2_HOST=<private-ec2-ip-or-hostname>
export PRIVATE_EC2_USER=ubuntu
```

또는 SSH config 사용:

```bash
# ~/.ssh/config
Host private-ec2
    HostName <private-ec2-ip>
    User ubuntu
    IdentityFile ~/.ssh/your-key.pem

# 환경 변수 설정
export PRIVATE_EC2_HOST=private-ec2
```

### 2. 초기 설정 및 배포

```bash
./scripts/setup-private-ec2.sh
```

이 스크립트는 다음을 수행합니다:
- ✅ 기존 `final-project` 폴더 제거 확인
- ✅ 기존 `itdaing` 폴더 제거 확인
- ✅ 필수 도구 설치 확인 (Java 21, Git, PostgreSQL 클라이언트)
- ✅ 전체 프로젝트 폴더 업로드 (`.git` 포함)
- ✅ `prod.env` 파일 업로드 및 권한 설정
- ✅ 원격 초기 설정

## 📝 수동 설정 방법

### 1. SSH로 Private EC2 접속

```bash
ssh private-ec2
```

### 2. 기존 프로젝트 폴더 제거

```bash
# 기존 final-project 폴더 제거
rm -rf ~/final-project

# 기존 itdaing 폴더가 있다면 제거
rm -rf ~/itdaing
```

### 3. 필수 도구 설치

```bash
# 패키지 업데이트
sudo apt-get update

# Java 21 설치
sudo apt-get install -y fontconfig openjdk-21-jdk

# Git 설치
sudo apt-get install -y git

# PostgreSQL 클라이언트 설치 (선택사항)
sudo apt-get install -y postgresql-client

# 설치 확인
java -version
git --version
```

### 4. 프로젝트 디렉토리 생성

```bash
mkdir -p ~/itdaing
cd ~/itdaing
```

### 5. 로컬에서 프로젝트 업로드

로컬 터미널에서:

```bash
# 전체 프로젝트 업로드
rsync -avz --progress \
    --exclude=.gradle \
    --exclude=build \
    --exclude=node_modules \
    --exclude=.idea \
    --exclude=.vscode \
    ./ ubuntu@<private-ec2-ip>:~/itdaing/
```

### 6. prod.env 파일 업로드

```bash
# 로컬에서
scp prod.env ubuntu@<private-ec2-ip>:~/itdaing/prod.env

# Private EC2에서 권한 설정
ssh ubuntu@<private-ec2-ip>
chmod 600 ~/itdaing/prod.env
```

## ✅ 설정 확인

### 1. 프로젝트 구조 확인

```bash
cd ~/itdaing
ls -la
```

확인 사항:
- [ ] `prod.env` 파일 존재
- [ ] `.git` 폴더 존재
- [ ] `gradlew` 파일 존재
- [ ] `src/` 폴더 존재

### 2. 환경 변수 확인

```bash
# prod.env 파일 내용 확인 (비밀번호는 마스킹)
cat prod.env | sed 's/PASSWORD=.*/PASSWORD=***/'
```

### 3. Java 버전 확인

```bash
java -version
# 출력: openjdk version "21.x.x"
```

### 4. Git 확인

```bash
cd ~/itdaing
git status
git remote -v
```

## 🔧 초기 빌드 및 실행

### 1. 프로젝트 빌드

```bash
cd ~/itdaing
./gradlew clean build -x test
```

### 2. 환경 변수 로드

```bash
source prod.env
```

### 3. 애플리케이션 실행

```bash
# 개발 모드 실행
./gradlew bootRun

# 또는 JAR 파일 실행
java -jar build/libs/*-SNAPSHOT.jar
```

### 4. 연결 테스트

```bash
# 헬스 체크
curl http://localhost:8080/actuator/health

# Swagger UI 확인
curl http://localhost:8080/swagger-ui/index.html
```

## 🐛 문제 해결

### Java가 설치되지 않은 경우

```bash
sudo apt-get update
sudo apt-get install -y fontconfig openjdk-21-jdk
sudo update-alternatives --config java
```

### Git이 없는 경우

```bash
sudo apt-get install -y git
```

### 프로젝트 업로드 실패

```bash
# SSH 연결 테스트
ssh -v ubuntu@<private-ec2-ip>

# 디스크 공간 확인
df -h

# 권한 확인
ls -la ~/itdaing
```

### 빌드 실패

```bash
# Gradle wrapper 권한 확인
chmod +x gradlew

# 빌드 캐시 정리
./gradlew clean

# 상세 로그로 빌드
./gradlew build --stacktrace
```

## 📚 다음 단계

설정이 완료되면:

1. [애플리케이션 실행 가이드](DEPLOY_TO_PRIVATE_EC2.md)
2. [systemd 서비스 설정](DEPLOY_EC2.md#4-private-ec2에서-실행-systemd-권장)
3. [모니터링 및 로그 확인](DEPLOY_TO_PRIVATE_EC2.md#-배포-확인)

## 🔗 관련 문서

- [Private EC2 배포 가이드](DEPLOY_TO_PRIVATE_EC2.md)
- [EC2 아키텍처](EC2_ARCHITECTURE.md)
- [prod.env 설정](PROD_ENV_SETUP.md)

