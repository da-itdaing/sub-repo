# Private EC2 접근 가이드

## 📋 개요

이 문서는 Cursor IDE에서 Private EC2에 직접 접근하여 작업하는 방법을 설명합니다.

## 🔐 SSH 접속 설정

### SSH Config 확인

`~/.ssh/config` 파일에 다음 설정이 있어야 합니다:

```
Host private-ec2
    HostName 10.0.133.168
    User ubuntu
    ProxyJump bastion
    IdentityFile ~/.ssh/id_rsa
    IdentitiesOnly yes
```

### 접속 테스트

```bash
ssh private-ec2
```

## 📁 프로젝트 구조

```
/home/ubuntu/itdaing/
├── .git/              # Git 저장소
├── src/               # 백엔드 소스 코드
├── itdaing-web/       # 프론트엔드 소스 코드
├── gradlew            # Gradle wrapper
├── prod.env           # 프로덕션 환경 변수 (권한: 600)
└── ...
```

## ⚙️ 환경 변수 로드

모든 작업 전에 환경 변수를 로드해야 합니다:

```bash
cd ~/itdaing
source prod.env
```

또는 원격 실행 시:

```bash
ssh private-ec2 "cd ~/itdaing && source prod.env && 명령어"
```

## 🚀 주요 작업

### 1. 백엔드 서버 관리

#### 서버 상태 확인
```bash
ssh private-ec2 "lsof -ti:8080 && echo '실행 중' || echo '미실행'"
```

#### 서버 시작
```bash
ssh private-ec2 "cd ~/itdaing && source prod.env && nohup ./gradlew bootRun > /tmp/itdaing-boot.log 2>&1 &"
```

#### 서버 중지
```bash
ssh private-ec2 "kill \$(lsof -ti:8080)"
```

#### 로그 확인
```bash
ssh private-ec2 "tail -f /tmp/itdaing-boot.log"
```

### 2. Git 작업

#### 상태 확인
```bash
ssh private-ec2 "cd ~/itdaing && git status"
```

#### 최신 코드 가져오기
```bash
ssh private-ec2 "cd ~/itdaing && git pull origin main"
```

#### 변경사항 확인
```bash
ssh private-ec2 "cd ~/itdaing && git diff"
```

### 3. 빌드 및 배포

#### 프로젝트 빌드
```bash
ssh private-ec2 "cd ~/itdaing && ./gradlew clean build -x test"
```

#### JAR 파일 실행
```bash
ssh private-ec2 "cd ~/itdaing && source prod.env && java -jar build/libs/*-SNAPSHOT.jar"
```

### 4. 데이터베이스 작업

#### 연결 테스트
```bash
ssh private-ec2 "cd ~/itdaing && source prod.env && PGPASSWORD=\$SPRING_DATASOURCE_PASSWORD psql -h itdaing-db.cl4qagmger70.ap-northeast-2.rds.amazonaws.com -U itdaing_admin -d itdaing-db -c 'SELECT version();'"
```

#### 데이터베이스 목록 확인
```bash
ssh private-ec2 "cd ~/itdaing && source prod.env && PGPASSWORD=\$SPRING_DATASOURCE_PASSWORD psql -h itdaing-db.cl4qagmger70.ap-northeast-2.rds.amazonaws.com -U itdaing_admin -d postgres -c '\l'"
```

### 5. S3 작업

#### 버킷 목록 확인
```bash
ssh private-ec2 "cd ~/itdaing && source prod.env && AWS_ACCESS_KEY_ID=\$AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY=\$AWS_SECRET_ACCESS_KEY AWS_DEFAULT_REGION=\$AWS_REGION aws s3 ls s3://\$STORAGE_S3_BUCKET"
```

#### 파일 업로드
```bash
ssh private-ec2 "cd ~/itdaing && source prod.env && AWS_ACCESS_KEY_ID=\$AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY=\$AWS_SECRET_ACCESS_KEY AWS_DEFAULT_REGION=\$AWS_REGION aws s3 cp /tmp/file.png s3://\$STORAGE_S3_BUCKET/uploads/"
```

#### 파일 다운로드
```bash
ssh private-ec2 "cd ~/itdaing && source prod.env && AWS_ACCESS_KEY_ID=\$AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY=\$AWS_SECRET_ACCESS_KEY AWS_DEFAULT_REGION=\$AWS_REGION aws s3 cp s3://\$STORAGE_S3_BUCKET/uploads/file.png /tmp/"
```

### 6. 파일 전송

#### 로컬 → Private EC2
```bash
scp 파일명 private-ec2:/tmp/
scp -r 디렉토리 private-ec2:/tmp/
```

#### Private EC2 → 로컬
```bash
scp private-ec2:~/itdaing/파일명 ./
scp -r private-ec2:~/itdaing/디렉토리 ./
```

## 🔍 환경 확인

### 시스템 정보
```bash
ssh private-ec2 "uname -a && df -h / && free -h"
```

### Java 버전
```bash
ssh private-ec2 "java -version"
```

### Gradle 버전
```bash
ssh private-ec2 "cd ~/itdaing && ./gradlew --version"
```

### 포트 사용 현황
```bash
ssh private-ec2 "sudo ss -tlnp | grep -E ':(80|443|8080)'"
```

## 🛠️ 문제 해결

### 백엔드 서버가 시작되지 않을 때
```bash
# 포트 확인
ssh private-ec2 "lsof -ti:8080"

# 프로세스 강제 종료
ssh private-ec2 "kill -9 \$(lsof -ti:8080)"

# 로그 확인
ssh private-ec2 "tail -50 /tmp/itdaing-boot.log"
```

### 환경 변수가 로드되지 않을 때
```bash
# prod.env 파일 확인
ssh private-ec2 "ls -l ~/itdaing/prod.env"

# 환경 변수 수동 로드
ssh private-ec2 "cd ~/itdaing && export SPRING_PROFILES_ACTIVE=prod && export SPRING_DATASOURCE_URL=..."
```

### Git 충돌 해결
```bash
ssh private-ec2 "cd ~/itdaing && git status"
ssh private-ec2 "cd ~/itdaing && git stash"
ssh private-ec2 "cd ~/itdaing && git pull origin main"
```

## 📚 관련 문서

- [Private EC2 환경 설정](PRIVATE_EC2_ENV_SETUP.md)
- [배포 가이드](DEPLOY_TO_PRIVATE_EC2.md)
- [S3 버킷 정책](S3_BUCKET_POLICY.md)

