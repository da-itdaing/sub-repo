# Private EC2 환경 설정 완료 보고서

## ✅ 완료된 작업

### 1. 시스템 환경
- **OS**: Ubuntu 24.04.3 LTS
- **호스트**: ip-10-0-133-168 (10.0.133.168)
- **디스크**: 48GB 중 5.3GB 사용 (12%)
- **메모리**: 7.6GB 중 1.5GB 사용 (16%)

### 2. 프로젝트 디렉토리
- **위치**: `/home/ubuntu/itdaing`
- **크기**: 22MB
- **Git 저장소**: https://github.com/da-itdaing/sub-repo.git
- **prod.env 권한**: 600 (보안 설정 완료)

### 3. 필수 도구 설치
- ✅ **Java 21**: `openjdk version "21.0.8"`
- ✅ **Gradle**: `8.10.2` (wrapper)
- ✅ **Git**: `2.43.0`
- ✅ **PostgreSQL 클라이언트**: 설치됨
- ✅ **AWS CLI**: 설치됨 (v2)

### 4. PostgreSQL RDS 설정

#### 연결 정보
- **호스트**: `itdaing-db.cl4qagmger70.ap-northeast-2.rds.amazonaws.com`
- **포트**: `5432`
- **데이터베이스**: `itdaing-db`
- **사용자**: `itdaing_admin`

#### 상태
- ✅ RDS 연결 성공
- ✅ 데이터베이스 생성 완료
- ✅ 연결 테스트 성공

#### 연결 테스트
```bash
cd ~/itdaing
source prod.env
PGPASSWORD=$SPRING_DATASOURCE_PASSWORD psql \
  -h itdaing-db.cl4qagmger70.ap-northeast-2.rds.amazonaws.com \
  -U itdaing_admin \
  -d itdaing-db \
  -c "SELECT version();"
```

### 5. AWS S3 설정

#### 연결 정보
- **버킷**: `daitdaing-static-files`
- **리전**: `ap-northeast-2`
- **Storage Provider**: `s3`

#### 상태
- ✅ AWS CLI 설치 완료
- ✅ 자격 증명 환경 변수 설정됨
- ✅ S3 버킷 접근 가능

#### 접근 테스트
```bash
cd ~/itdaing
source prod.env
AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID \
AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY \
AWS_DEFAULT_REGION=$AWS_REGION \
aws s3 ls s3://$STORAGE_S3_BUCKET
```

### 6. nginx 설정

#### 설정 파일 위치
- **설정 파일**: `/etc/nginx/sites-available/itdaing.conf`
- **활성화**: `/etc/nginx/sites-enabled/itdaing.conf` (심볼릭 링크)

#### 설정 내용
```nginx
server {
    listen 80;
    listen [::]:80;
    server_name _;

    # React build
    root /var/www/itdaing;
    index index.html;

    # Serve SPA with fallback to index.html
    location / {
        try_files $uri /index.html;
    }

    # Proxy API calls to Spring Boot on 8080
    location /api/ {
        proxy_pass         http://127.0.0.1:8080/;
        proxy_set_header   Host               $host;
        proxy_set_header   X-Real-IP          $remote_addr;
        proxy_set_header   X-Forwarded-For    $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto  $scheme;
        proxy_http_version 1.1;
        proxy_set_header   Connection "";
    }

    # Healthcheck for ALB/monitoring
    location = /actuator/health {
        proxy_pass         http://127.0.0.1:8080/actuator/health;
        proxy_set_header   Host               $host;
        proxy_set_header   X-Real-IP          $remote_addr;
        proxy_set_header   X-Forwarded-For    $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto  $scheme;
    }
}
```

#### 상태
- ✅ nginx 설치됨 (`nginx/1.24.0`)
- ✅ nginx 실행 중
- ✅ 설정 파일 문법 검증 통과
- ✅ 포트 80 리스닝 중

#### nginx 관리 명령어
```bash
# 설정 테스트
sudo nginx -t

# nginx 재시작
sudo systemctl restart nginx

# nginx 상태 확인
sudo systemctl status nginx

# 로그 확인
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### 7. 포트 사용 현황
- ✅ **포트 80**: nginx 리스닝 중
- ⚠️ **포트 8080**: Spring Boot 미실행 (애플리케이션 시작 필요)
- ⚠️ **포트 443**: HTTPS 미설정 (선택사항)

## 📋 환경 변수 (prod.env)

### 주요 설정
- `SPRING_PROFILES_ACTIVE=prod`
- `SPRING_DATASOURCE_URL`: PostgreSQL RDS 연결 문자열
- `AWS_REGION`: `ap-northeast-2`
- `STORAGE_PROVIDER`: `s3`
- `STORAGE_S3_BUCKET`: `daitdaing-static-files`

### 보안
- ✅ 파일 권한: `600` (소유자만 읽기/쓰기)
- ✅ Git 추적 제외됨

## 🚀 다음 단계

### 1. 애플리케이션 빌드 및 실행

```bash
# SSH 접속
ssh private-ec2

# 프로젝트 디렉토리로 이동
cd ~/itdaing

# 환경 변수 로드
source prod.env

# 빌드 (선택사항)
./gradlew clean build -x test

# 애플리케이션 실행
./gradlew bootRun
```

### 2. 프론트엔드 빌드 및 배포

```bash
# 프론트엔드 빌드
cd ~/itdaing/itdaing-web
npm install
npm run build

# nginx 디렉토리로 복사
sudo cp -r dist/* /var/www/itdaing/

# 권한 설정
sudo chown -R www-data:www-data /var/www/itdaing
```

### 3. systemd 서비스 설정 (선택사항)

애플리케이션을 systemd 서비스로 등록하여 자동 시작:

```bash
sudo nano /etc/systemd/system/itdaing.service
```

서비스 파일 내용:
```ini
[Unit]
Description=Itdaing Spring Boot Application
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/itdaing
EnvironmentFile=/home/ubuntu/itdaing/prod.env
ExecStart=/home/ubuntu/itdaing/gradlew bootRun
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

서비스 활성화:
```bash
sudo systemctl daemon-reload
sudo systemctl enable itdaing
sudo systemctl start itdaing
sudo systemctl status itdaing
```

## 🔍 문제 해결

### PostgreSQL 연결 실패
```bash
# 연결 테스트
cd ~/itdaing
source prod.env
PGPASSWORD=$SPRING_DATASOURCE_PASSWORD psql \
  -h itdaing-db.cl4qagmger70.ap-northeast-2.rds.amazonaws.com \
  -U itdaing_admin \
  -d itdaing-db \
  -c "SELECT 1;"
```

### S3 접근 실패
```bash
# 자격 증명 확인
cd ~/itdaing
source prod.env
echo "AWS_ACCESS_KEY_ID: ${AWS_ACCESS_KEY_ID:0:10}..."
echo "AWS_SECRET_ACCESS_KEY: ${AWS_SECRET_ACCESS_KEY:0:10}..."
echo "STORAGE_S3_BUCKET: $STORAGE_S3_BUCKET"

# 버킷 접근 테스트
AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID \
AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY \
AWS_DEFAULT_REGION=$AWS_REGION \
aws s3 ls s3://$STORAGE_S3_BUCKET
```

### nginx 설정 오류
```bash
# 설정 파일 문법 검사
sudo nginx -t

# 설정 파일 확인
sudo cat /etc/nginx/sites-available/itdaing.conf

# 로그 확인
sudo tail -50 /var/log/nginx/error.log
```

## 📚 관련 문서

- [초기 설정 가이드](SETUP_PRIVATE_EC2.md)
- [배포 가이드](DEPLOY_TO_PRIVATE_EC2.md)
- [EC2 아키텍처](EC2_ARCHITECTURE.md)
- [prod.env 설정](PROD_ENV_SETUP.md)

