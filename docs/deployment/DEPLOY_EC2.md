# Private EC2 배포 가이드

본 문서는 Private EC2 인스턴스에 Spring Boot 애플리케이션을 직접 배포(jar 실행)하기 위한 설정을 요약합니다.

## 1) JDK 21 설치 (Private EC2 Ubuntu 기준)

```bash
sudo apt-get update
sudo apt-get install -y fontconfig openjdk-21-jdk
java -version
```

## 2) 애플리케이션 설정

운영용 프로파일 `prod`가 추가되었습니다: `src/main/resources/application-prod.yml`

- 서버 포트: 8080 (nginx를 통해 80으로 프록시)
- 데이터베이스(AWS RDS PostgreSQL) 및 S3 설정은 환경변수로 주입합니다.

필수 환경변수 (`prod.env` 파일):

```bash
# Spring Profile
SPRING_PROFILES_ACTIVE=prod

# DB (RDS PostgreSQL)
SPRING_DATASOURCE_URL=jdbc:postgresql://<rds-endpoint>:5432/<db>
SPRING_DATASOURCE_USERNAME=<username>
SPRING_DATASOURCE_PASSWORD=<password>

# JWT
JWT_SECRET=<secret>
JWT_ISSUER=itdaing-prod
JWT_ACCESS_TOKEN_EXPIRATION=86400000
JWT_REFRESH_TOKEN_EXPIRATION=1209600000

# AWS
AWS_REGION=ap-northeast-2
AWS_ACCESS_KEY_ID=<access-key>
AWS_SECRET_ACCESS_KEY=<secret-key>

# S3
STORAGE_PROVIDER=s3
STORAGE_S3_BUCKET=<bucket-name>
STORAGE_S3_REGION=ap-northeast-2
STORAGE_S3_BASE_DIR=uploads
```

주의: 키/비밀번호를 깃에 커밋하지 마세요. `prod.env` 파일은 Private EC2에만 존재하며 권한은 600으로 설정합니다.

## 3) 패키징 및 배포

로컬에서 빌드 후 jar를 **Private EC2**로 전송:

> **참고**: 
> - **Bastion EC2**: 점프 서버 (SSH 접근용)
> - **Private EC2**: 애플리케이션 실행 서버 (jar 파일 및 prod.env 배치)

### 방법 1: Private EC2에 직접 접근 가능한 경우

```bash
./gradlew clean build -x test
scp build/libs/*-SNAPSHOT.jar private-ec2:~/itdaing/app.jar
scp prod.env private-ec2:~/itdaing/prod.env
```

### 방법 2: 배포 스크립트 사용

```bash
# 전체 프로젝트 배포 (권장)
./scripts/deploy-full-project.sh

# 또는 JAR만 배포
./scripts/deploy-to-private-ec2.sh
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
WorkingDirectory=/home/ubuntu/itdaing
EnvironmentFile=/home/ubuntu/itdaing/prod.env
ExecStart=/usr/bin/java -jar /home/ubuntu/itdaing/app.jar
Restart=always
RestartSec=10
StandardOutput=append:/tmp/itdaing-boot.log
StandardError=append:/tmp/itdaing-boot.log

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

# 또는 로그 파일 확인
tail -f /tmp/itdaing-boot.log
```

## 6) nginx 설정

nginx를 통해 프론트엔드 정적 파일과 백엔드 API를 서빙합니다.

`/etc/nginx/sites-available/itdaing` 예시:

```nginx
server {
    listen 80;
    server_name <your-domain>;

    # 프론트엔드 정적 파일
    location / {
        root /var/www/itdaing;
        try_files $uri $uri/ /index.html;
    }

    # 백엔드 API 프록시
    location /api {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

활성화:

```bash
sudo ln -s /etc/nginx/sites-available/itdaing /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 7) 보안 메모

- 포트 8080에서 실행하고 nginx로 80을 프록시하는 구성을 권장합니다.
- 운영 DB에 대해 `ddl-auto=create`는 데이터 손실 위험이 큼. `validate` 사용을 권장합니다.
- AWS 키는 환경변수로만 주입하고, 코드/설정 파일에 하드코딩하지 마세요.
- `prod.env` 파일 권한은 600으로 설정합니다: `chmod 600 ~/itdaing/prod.env`

## 8) 관련 문서

- [Private EC2 접근 가이드](PRIVATE_EC2_ACCESS.md)
- [Private EC2 초기 설정](SETUP_PRIVATE_EC2.md)
- [Private EC2 환경 설정](PRIVATE_EC2_ENV_SETUP.md)
