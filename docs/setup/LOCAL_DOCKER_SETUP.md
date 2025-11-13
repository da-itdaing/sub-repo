# 로컬 Docker 환경 설정 가이드

## 📋 개요

로컬 개발 환경에서는 Docker를 사용하여 PostgreSQL과 LocalStack S3를 실행합니다. 이들은 **포트를 통해 연결**됩니다.

## 🐘 PostgreSQL (Docker)

### 포트 설정
- **호스트 포트**: `5432`
- **컨테이너 포트**: `5432`
- **연결 문자열**: `jdbc:postgresql://localhost:5432/itdaing`

### docker-compose.yml 설정

```yaml
postgres:
  image: pgvector/pgvector:pg15
  ports:
    - "5432:5432"  # 호스트:컨테이너 포트 매핑
```

### 애플리케이션 연결

`application-local.yml`에서:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/itdaing
    # localhost:5432는 Docker가 호스트의 5432 포트를 컨테이너의 5432 포트로 매핑
```

### 연결 확인

```bash
# Docker 컨테이너 상태 확인
docker ps | grep postgres

# PostgreSQL 연결 테스트
psql -h localhost -p 5432 -U itdaing -d itdaing
```

## ☁️ LocalStack S3 (Docker)

### 포트 설정
- **호스트 포트**: `4566` (LocalStack 게이트웨이)
- **외부 서비스 포트**: `4510-4559`
- **엔드포인트**: `http://localhost:4566`

### docker-compose.yml 설정

```yaml
localstack:
  image: localstack/localstack:latest
  ports:
    - "4566:4566"            # LocalStack 게이트웨이
    - "4510-4559:4510-4559"  # 외부 서비스 포트 범위
```

### 애플리케이션 연결

`application-local.yml`에서:

```yaml
aws:
  endpoint-url: http://localhost:4566  # Docker 포트를 통해 접근
```

`StorageAutoConfig.java`에서:

```java
String endpointUrl = System.getenv("AWS_ENDPOINT_URL");
if (endpointUrl != null && !endpointUrl.isEmpty()) {
    builder.endpointOverride(java.net.URI.create(endpointUrl));
    builder.forcePathStyle(true);  // LocalStack은 path-style access 사용
}
```

### 연결 확인

```bash
# Docker 컨테이너 상태 확인
docker ps | grep localstack

# LocalStack 헬스 체크
curl http://localhost:4566/_localstack/health

# S3 버킷 목록 확인
aws --endpoint-url=http://localhost:4566 s3 ls
```

## 🔄 로컬 vs 프로덕션 차이점

### 로컬 개발 환경 (Docker)

| 서비스 | 연결 방식 | 엔드포인트 |
|--------|----------|-----------|
| PostgreSQL | 포트 매핑 | `localhost:5432` |
| S3 (LocalStack) | 포트 매핑 | `http://localhost:4566` |

### 프로덕션 환경 (AWS)

| 서비스 | 연결 방식 | 엔드포인트 |
|--------|----------|-----------|
| PostgreSQL (RDS) | VPC 내부 | `itdaing-db.xxx.rds.amazonaws.com:5432` |
| S3 | AWS 엔드포인트 | `s3.ap-northeast-2.amazonaws.com` |

## ⚙️ 환경 변수 설정

### 로컬 개발 (.env 파일)

```bash
# PostgreSQL (Docker)
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/itdaing
SPRING_DATASOURCE_USERNAME=itdaing
SPRING_DATASOURCE_PASSWORD=password

# LocalStack S3 (Docker)
AWS_ENDPOINT_URL=http://localhost:4566
AWS_REGION=ap-northeast-2
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
STORAGE_PROVIDER=s3
STORAGE_S3_BUCKET=itdaing-local
```

### 프로덕션 (prod.env 파일)

```bash
# PostgreSQL (RDS)
SPRING_DATASOURCE_URL=jdbc:postgresql://itdaing-db.xxx.rds.amazonaws.com:5432/itdaing-db
SPRING_DATASOURCE_USERNAME=itdaing_admin
SPRING_DATASOURCE_PASSWORD=[실제 비밀번호]

# AWS S3 (실제)
AWS_REGION=ap-northeast-2
AWS_ACCESS_KEY_ID=[실제 키]
AWS_SECRET_ACCESS_KEY=[실제 시크릿]
STORAGE_PROVIDER=s3
STORAGE_S3_BUCKET=daitdaing-static-files
```

## 🔍 포트 충돌 확인

### PostgreSQL 포트 충돌

```bash
# 5432 포트 사용 중인 프로세스 확인
lsof -i :5432

# 다른 PostgreSQL이 실행 중이면 중지하거나 포트 변경
# docker-compose.yml에서 포트 변경:
# ports:
#   - "5433:5432"  # 호스트 포트를 5433으로 변경
```

### LocalStack 포트 충돌

```bash
# 4566 포트 사용 중인 프로세스 확인
lsof -i :4566

# 다른 LocalStack이 실행 중이면 중지
docker ps | grep localstack
docker stop itdaing-localstack
```

## 🚀 시작 방법

### 1. Docker 서비스 시작

```bash
# PostgreSQL만 시작
docker-compose up -d postgres

# PostgreSQL + LocalStack 시작
docker-compose up -d postgres localstack

# 모든 서비스 시작
docker-compose up -d
```

### 2. 애플리케이션 실행

```bash
# 환경 변수 로드 (선택사항)
source .env  # 또는 export 명령어 사용

# 애플리케이션 실행
./gradlew bootRun
```

## 📚 관련 문서

- [로컬 개발 환경 설정](LOCAL_DEVELOPMENT.md)
- [Docker 사용 규칙](../.cursor/rules/docker-rules.md)
- [LocalStack 설정](AWS_LOCALSTACK_SETUP.md)

