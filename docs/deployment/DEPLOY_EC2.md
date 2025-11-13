# AWS EC2 배포 가이드 (without Docker)

본 문서는 EC2 인스턴스에 Spring Boot 애플리케이션을 직접 배포(jar 실행)하기 위한 설정을 요약합니다. Docker는 사용하지 않습니다.

## 1) JDK 21 설치 (macOS 로컬 개발/EC2 Ubuntu 기준)

- macOS(Homebrew):

```bash
brew install openjdk@21
sudo ln -sfn /opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-21.jdk
# zsh에 영구 반영
echo 'export PATH="/opt/homebrew/opt/openjdk@21/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
java -version
```

- Ubuntu(EC2):

```bash
sudo apt-get update
sudo apt-get install -y fontconfig openjdk-21-jdk
java -version
```

## 2) 애플리케이션 설정

운영용 프로파일 `prod`가 추가되었습니다: `src/main/resources/application-prod.yml`

- 서버 포트: 80 (루트 권한이 필요할 수 있습니다. 필요 시 8080 + ALB/Nginx 사용 권장)
- 데이터베이스(RDS) 및 S3 설정은 환경변수로 주입합니다.

필수 환경변수:

```bash
# DB (RDS)
export DB_URL='jdbc:mysql://<rds-endpoint>:3306/<db>'
export DB_USERNAME='<username>'
export DB_PASSWORD='<password>'

# JPA (옵션)
export JPA_DDL_AUTO='update'      # 운영에서는 update/validate 권장
export JPA_SHOW_SQL='false'

# AWS
export AWS_REGION='ap-northeast-2'    # 코드에서 별도 사용 시
export AWS_ACCESS_KEY_ID=''           # EC2 Instance Profile을 쓰면 비워둬도 됨
export AWS_SECRET_ACCESS_KEY=''       # EC2 Instance Profile을 쓰면 비워둬도 됨
export S3_BUCKET_NAME='daitdaing-server'

# Spring profile
export SPRING_PROFILES_ACTIVE='prod'
```

주의: 키/비밀번호를 깃에 커밋하지 마세요. EC2에선 Instance Profile(역할)을 권장합니다.

## 3) 패키징 및 배포

로컬에서 빌드 후 jar를 **Private EC2**로 전송:

> **참고**: 
> - **Bastion EC2**: 점프 서버 (SSH 접근용)
> - **Private EC2**: 애플리케이션 실행 서버 (jar 파일 및 prod.env 배치)

### 방법 1: Private EC2에 직접 접근 가능한 경우

```bash
./gradlew clean build -x test
scp build/libs/*-SNAPSHOT.jar ubuntu@<private-ec2-ip>:/home/ubuntu/app.jar
scp prod.env ubuntu@<private-ec2-ip>:/home/ubuntu/prod.env
```

### 방법 2: Bastion을 경유하여 전송하는 경우

```bash
./gradlew clean build -x test

# Bastion을 경유하여 Private EC2로 전송
scp -o ProxyJump=ubuntu@<bastion-ip> \
    build/libs/*-SNAPSHOT.jar \
    ubuntu@<private-ec2-ip>:/home/ubuntu/app.jar

scp -o ProxyJump=ubuntu@<bastion-ip> \
    prod.env \
    ubuntu@<private-ec2-ip>:/home/ubuntu/prod.env
```

## 4) Private EC2에서 실행 (systemd 권장)

**Private EC2 인스턴스**에서 systemd 서비스로 실행합니다.

`/etc/systemd/system/itdaing.service` 예시:

```ini
[Unit]
Description=itdaing server
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu
EnvironmentFile=/home/ubuntu/prod.env
ExecStart=/usr/bin/java -jar /home/ubuntu/app.jar
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

적용:

```bash
sudo systemctl daemon-reload
sudo systemctl enable itdaing
sudo systemctl start itdaing
sudo systemctl status itdaing
```

## 5) 로그

**Private EC2**에서 로그 확인:

```bash
# SSH로 Private EC2 접속
ssh private-ec2

# 서비스 로그 확인
journalctl -u itdaing -f

# 또는 실시간 로그 확인
sudo tail -f /var/log/itdaing/app.log  # 로그 파일이 있는 경우
```

## 6) 보안 메모

- 포트 80 바인딩은 루트 권한 요구될 수 있음. 8080에서 실행하고 ALB/Nginx로 80을 종단하는 구성을 권장.
- 운영 DB에 대해 `ddl-auto=create`는 데이터 손실 위험이 큼. `update` 또는 `validate` 사용을 권장.
- AWS 키는 환경변수나 Instance Profile로만 주입하고, 코드/설정 파일에 하드코딩하지 마세요.
