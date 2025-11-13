# 로컬 개발 환경 설정 가이드

AWS 환경과 유사한 로컬 개발 환경을 구성하는 방법을 설명합니다.

## 📋 개요

로컬 개발 환경은 다음을 포함합니다:
- **MySQL 8.0**: 현재 사용 중인 데이터베이스 (Docker)
- **PostgreSQL 15 + pgvector**: 챗봇용 데이터베이스 (향후 사용, Docker)
- **LocalStack**: AWS 서비스 로컬 모킹 (S3 등)

## 🚀 빠른 시작

### 1. 환경 변수 설정

```bash
# 환경 변수 예시 파일 복사
cp env.example .env

# 필요시 .env 파일 수정
```

### 2. Docker 컨테이너 시작

```bash
# MySQL만 시작 (기본)
docker-compose up -d mysql

# MySQL + LocalStack 시작
docker-compose up -d mysql localstack

# PostgreSQL 포함 시작 (챗봇 개발 시)
docker-compose --profile chatbot up -d
```

### 3. LocalStack S3 버킷 생성

LocalStack이 시작된 후 S3 버킷을 생성합니다:

```bash
# AWS CLI 설치 필요 (또는 LocalStack 컨테이너 내부에서 실행)
aws --endpoint-url=http://localhost:4566 s3 mb s3://itdaing-local

# 또는 LocalStack 컨테이너 내부에서
docker exec -it itdaing-localstack aws --endpoint-url=http://localhost:4566 s3 mb s3://itdaing-local
```

### 4. 백엔드 서버 시작

```bash
# Local Storage 사용 (기본)
./gradlew bootRun

# LocalStack S3 사용
STORAGE_PROVIDER=s3 ./gradlew bootRun
```

### 5. 프론트엔드 서버 시작

```bash
cd itdaing-web
npm install
npm run dev
```

## 🔧 환경 구성

### Storage Provider 선택

#### Local Storage (기본)
- 파일 시스템에 직접 저장
- `.env` 파일에서 `STORAGE_PROVIDER=local` 설정
- 또는 `application-local.yml`의 기본값 사용

#### LocalStack S3
- AWS S3와 동일한 API 사용
- 로컬에서 S3 기능 테스트 가능
- `.env` 파일에서 `STORAGE_PROVIDER=s3` 설정

```bash
# .env 파일 설정 예시
STORAGE_PROVIDER=s3
AWS_ENDPOINT_URL=http://localhost:4566
AWS_REGION=ap-northeast-2
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
STORAGE_S3_BUCKET=itdaing-local
STORAGE_S3_REGION=ap-northeast-2
STORAGE_S3_PUBLIC_BASE_URL=http://localhost:4566/itdaing-local
```

### 데이터베이스 선택

#### MySQL (현재 사용)
- 기본 데이터베이스
- 포트: 3306
- 연결 정보: `jdbc:mysql://localhost:3306/itdaing`

#### PostgreSQL (챗봇용, 향후 사용)
- pgvector 확장 포함
- 포트: 5432
- 연결 정보: `jdbc:postgresql://localhost:5432/itdaing_chatbot`
- 프로파일로 제어: `docker-compose --profile chatbot up -d`

## 📁 프로파일별 설정

### local 프로파일 (기본)
- MySQL Docker 컨테이너 사용
- LocalStack S3 또는 Local Storage 선택 가능
- Swagger UI 활성화
- 개발용 설정

### dev 프로파일
- 실제 AWS RDS/S3 연동
- 환경 변수로 자격 증명 주입
- IDE에서 외부 리소스 테스트용

### prod 프로파일
- EC2 배포용
- 실제 AWS 환경 사용
- 포트 80

## 🛠️ LocalStack 사용법

### S3 버킷 관리

```bash
# 버킷 생성
aws --endpoint-url=http://localhost:4566 s3 mb s3://itdaing-local

# 버킷 목록 확인
aws --endpoint-url=http://localhost:4566 s3 ls

# 파일 업로드 테스트
aws --endpoint-url=http://localhost:4566 s3 cp test.txt s3://itdaing-local/

# 파일 목록 확인
aws --endpoint-url=http://localhost:4566 s3 ls s3://itdaing-local/

# 버킷 삭제
aws --endpoint-url=http://localhost:4566 s3 rb s3://itdaing-local --force
```

### LocalStack 상태 확인

```bash
# Health check
curl http://localhost:4566/_localstack/health

# 서비스 목록 확인
curl http://localhost:4566/_localstack/health | jq
```

## 🗄️ 데이터베이스 관리

### MySQL

```bash
# 컨테이너 접속
docker exec -it itdaing-mysql mysql -u root -p

# 데이터베이스 선택
USE itdaing;

# 테이블 목록 확인
SHOW TABLES;
```

### PostgreSQL (챗봇용)

```bash
# 컨테이너 접속
docker exec -it itdaing-postgres psql -U itdaing -d itdaing_chatbot

# pgvector 확장 확인
\dx

# 벡터 확장 활성화 (필요 시)
CREATE EXTENSION IF NOT EXISTS vector;
```

## 🔄 AWS 환경과의 차이점

### 로컬 개발 환경
- LocalStack: AWS 서비스 모킹
- Docker MySQL: 실제 MySQL과 동일
- 환경 변수: `.env` 파일 사용

### AWS 프로덕션 환경
- 실제 AWS S3 사용
- RDS MySQL 사용
- 환경 변수: `prod.env` 또는 시스템 환경 변수
- Bastion을 통한 Private EC2 접근

## 📝 개발 워크플로우

### 1. 로컬 개발
```bash
# Docker 서비스 시작
docker-compose up -d mysql localstack

# LocalStack 버킷 생성
aws --endpoint-url=http://localhost:4566 s3 mb s3://itdaing-local

# 백엔드 시작 (LocalStack S3 사용)
STORAGE_PROVIDER=s3 ./gradlew bootRun

# 프론트엔드 시작
cd itdaing-web && npm run dev
```

### 2. AWS 환경 테스트
```bash
# dev 프로파일로 실행
SPRING_PROFILES_ACTIVE=dev ./gradlew bootRun
```

## 🐛 문제 해결

### LocalStack 연결 실패
```bash
# LocalStack 상태 확인
docker ps | grep localstack
curl http://localhost:4566/_localstack/health

# 재시작
docker-compose restart localstack
```

### S3 버킷 접근 실패
```bash
# 버킷 존재 확인
aws --endpoint-url=http://localhost:4566 s3 ls

# 버킷 재생성
aws --endpoint-url=http://localhost:4566 s3 mb s3://itdaing-local
```

### MySQL 연결 실패
```bash
# 컨테이너 상태 확인
docker ps | grep mysql

# 로그 확인
docker logs itdaing-mysql

# 재시작
docker-compose restart mysql
```

## 📚 참고 자료

- [LocalStack 공식 문서](https://docs.localstack.cloud/)
- [pgvector GitHub](https://github.com/pgvector/pgvector)
- [Docker Compose 문서](https://docs.docker.com/compose/)

## 🔮 향후 계획

### 챗봇 기능 추가 시
1. PostgreSQL + pgvector 데이터베이스 활성화
2. 벡터 임베딩 저장 및 검색 기능 구현
3. 챗봇 전용 프로파일 추가 (`chatbot`)

### 추가 AWS 서비스 모킹
- SQS (메시지 큐)
- SNS (알림)
- Lambda (서버리스 함수)

