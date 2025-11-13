# AWS LocalStack 로컬 개발 환경 설정

AWS 환경과 유사한 로컬 개발 환경을 구성하여 실제 AWS 서비스 없이도 개발할 수 있습니다.

## 📋 개요

LocalStack은 AWS 서비스를 로컬에서 모킹하는 도구입니다. 이 프로젝트에서는 주로 **S3**를 모킹하여 사용합니다.

## 🚀 빠른 시작

### 1. LocalStack 시작

```bash
# LocalStack만 시작
docker-compose up -d localstack

# MySQL과 함께 시작
docker-compose up -d mysql localstack
```

### 2. S3 버킷 생성

```bash
# 자동 스크립트 사용 (권장)
./scripts/setup-localstack.sh

# 또는 수동으로
aws --endpoint-url=http://localhost:4566 s3 mb s3://itdaing-local
```

### 3. 환경 변수 설정

`.env` 파일에 다음 설정 추가:

```bash
STORAGE_PROVIDER=s3
AWS_ENDPOINT_URL=http://localhost:4566
AWS_REGION=ap-northeast-2
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
STORAGE_S3_BUCKET=itdaing-local
STORAGE_S3_REGION=ap-northeast-2
STORAGE_S3_PUBLIC_BASE_URL=http://localhost:4566/itdaing-local
```

### 4. 백엔드 서버 시작

```bash
STORAGE_PROVIDER=s3 ./gradlew bootRun
```

## 🔧 LocalStack 설정

### 서비스 포트

- **게이트웨이**: `4566` (모든 AWS 서비스 접근)
- **S3**: `4566` (게이트웨이를 통해 접근)

### 환경 변수

LocalStack 컨테이너 환경 변수:
- `SERVICES=s3`: 사용할 AWS 서비스 목록
- `AWS_DEFAULT_REGION=ap-northeast-2`: 기본 리전
- `DEBUG=1`: 디버그 모드 활성화

## 📦 S3 버킷 관리

### 버킷 생성

```bash
aws --endpoint-url=http://localhost:4566 s3 mb s3://itdaing-local
```

### 파일 업로드/다운로드

```bash
# 파일 업로드
aws --endpoint-url=http://localhost:4566 s3 cp test.jpg s3://itdaing-local/uploads/

# 파일 다운로드
aws --endpoint-url=http://localhost:4566 s3 cp s3://itdaing-local/uploads/test.jpg ./

# 파일 목록 확인
aws --endpoint-url=http://localhost:4566 s3 ls s3://itdaing-local/uploads/
```

### 버킷 정책 설정

```bash
# Public Read 정책 (개발용)
aws --endpoint-url=http://localhost:4566 s3api put-bucket-policy \
    --bucket itdaing-local \
    --policy '{
      "Version": "2012-10-17",
      "Statement": [{
        "Effect": "Allow",
        "Principal": "*",
        "Action": "s3:GetObject",
        "Resource": "arn:aws:s3:::itdaing-local/*"
      }]
    }'
```

## 🔍 LocalStack 상태 확인

### Health Check

```bash
# 기본 헬스 체크
curl http://localhost:4566/_localstack/health

# 상세 정보 (JSON)
curl http://localhost:4566/_localstack/health | jq
```

### 서비스 상태 확인

```bash
# 실행 중인 서비스 확인
docker exec itdaing-localstack aws --endpoint-url=http://localhost:4566 s3 ls
```

## 🐛 문제 해결

### LocalStack 연결 실패

```bash
# 컨테이너 상태 확인
docker ps | grep localstack

# 로그 확인
docker logs itdaing-localstack

# 재시작
docker-compose restart localstack
```

### S3 버킷 접근 실패

```bash
# 버킷 존재 확인
aws --endpoint-url=http://localhost:4566 s3 ls

# 버킷 재생성
aws --endpoint-url=http://localhost:4566 s3 rb s3://itdaing-local --force
aws --endpoint-url=http://localhost:4566 s3 mb s3://itdaing-local
```

### AWS SDK 연결 실패

- `AWS_ENDPOINT_URL` 환경 변수가 설정되어 있는지 확인
- `forcePathStyle=true` 설정이 적용되었는지 확인 (StorageAutoConfig에서 자동 설정)

## 📝 AWS 환경과의 차이점

### 로컬 개발 (LocalStack)
- 엔드포인트: `http://localhost:4566`
- 인증: `test` / `test` (임의 값)
- 영구 저장: Docker 볼륨에 저장
- 제한: 일부 고급 기능 미지원

### AWS 프로덕션
- 엔드포인트: 실제 AWS 엔드포인트
- 인증: 실제 AWS 자격 증명
- 영구 저장: S3에 저장
- 기능: 모든 AWS 기능 지원

## 🔄 실제 AWS로 전환

로컬에서 개발한 후 실제 AWS로 전환:

1. `.env` 파일에서 `AWS_ENDPOINT_URL` 제거 또는 주석 처리
2. 실제 AWS 자격 증명 설정
3. 실제 S3 버킷 이름 설정
4. `STORAGE_PROVIDER=s3` 유지

## 📚 참고 자료

- [LocalStack 공식 문서](https://docs.localstack.cloud/)
- [LocalStack GitHub](https://github.com/localstack/localstack)
- [AWS S3 CLI 참조](https://docs.aws.amazon.com/cli/latest/reference/s3/)

