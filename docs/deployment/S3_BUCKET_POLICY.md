# S3 버킷 정책 설정 가이드

## ⚠️ 현재 정책의 문제점

제공하신 정책은 보안상 매우 위험합니다:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "Statement1",
      "Effect": "Allow",
      "Principal": "*",  // ⚠️ 모든 사용자에게 권한 부여
      "Action": ["s3:*"],  // ⚠️ 모든 작업 허용
      "Resource": "arn:aws:s3:::daitdaing-static-files/*"
    }
  ]
}
```

**문제점:**
1. `Principal: "*"` - 인터넷의 누구나 버킷에 접근 가능
2. `Action: ["s3:*"]` - 모든 작업 허용 (삭제, 수정 등)
3. 버킷 레벨 권한 없음 - `ListBucket` 같은 작업 실패 가능

## ✅ 권장 정책 (사용자 업로드 + 공개 읽기)

### 아키텍처 이해
- **사용자**: S3에 이미지 업로드 (Presigned URL 또는 애플리케이션을 통한 업로드)
- **애플리케이션**: DB에서 S3 이미지 URL을 읽어서 프론트엔드에 제공
- **프론트엔드**: S3 이미지 URL을 직접 표시 (공개 읽기 필요)

### 옵션 1: 공개 읽기 + 애플리케이션 쓰기 (권장)

이미지는 공개적으로 읽을 수 있지만, 쓰기는 애플리케이션(IAM 사용자)만 가능:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::daitdaing-static-files/uploads/*"
    },
    {
      "Sid": "AllowListBucket",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::166357011361:user/hj"
      },
      "Action": [
        "s3:ListBucket",
        "s3:GetBucketLocation"
      ],
      "Resource": "arn:aws:s3:::daitdaing-static-files"
    },
    {
      "Sid": "AllowApplicationWrite",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::166357011361:user/hj"
      },
      "Action": [
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:PutObjectAcl"
      ],
      "Resource": "arn:aws:s3:::daitdaing-static-files/uploads/*"
    }
  ]
}
```

**특징:**
- ✅ 이미지는 공개적으로 읽을 수 있음 (`uploads/*` 경로)
- ✅ 쓰기는 애플리케이션만 가능 (IAM 사용자)
- ✅ 사용자는 애플리케이션을 통해 업로드 (Presigned URL 또는 직접 업로드 API)

### 옵션 2: Presigned URL 사용 (더 안전)

애플리케이션이 Presigned URL을 생성하여 사용자에게 제공:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::daitdaing-static-files/uploads/*"
    },
    {
      "Sid": "AllowListBucket",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::166357011361:user/hj"
      },
      "Action": [
        "s3:ListBucket",
        "s3:GetBucketLocation"
      ],
      "Resource": "arn:aws:s3:::daitdaing-static-files"
    },
    {
      "Sid": "AllowApplicationGeneratePresignedURL",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::166357011361:user/hj"
      },
      "Action": [
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::daitdaing-static-files/uploads/*"
    }
  ]
}
```

**Presigned URL 사용 흐름:**
1. 사용자가 프론트엔드에서 이미지 업로드 요청
2. 백엔드가 Presigned URL 생성 (임시 업로드 권한)
3. 프론트엔드가 Presigned URL로 직접 S3에 업로드
4. 업로드 완료 후 백엔드에 알림
5. 백엔드가 DB에 S3 URL 저장

### 옵션 3: 특정 IAM 사용자만 허용 (기존, 제한적)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowListBucket",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::166357011361:user/hj"
      },
      "Action": [
        "s3:ListBucket",
        "s3:GetBucketLocation"
      ],
      "Resource": "arn:aws:s3:::daitdaing-static-files"
    },
    {
      "Sid": "AllowObjectOperations",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::166357011361:user/hj"
      },
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:PutObjectAcl"
      ],
      "Resource": "arn:aws:s3:::daitdaing-static-files/*"
    }
  ]
}
```

**주의:** 이 옵션은 이미지가 공개적으로 읽을 수 없습니다. CloudFront나 애플리케이션을 통한 프록시가 필요합니다.

### 옵션 2: IAM 역할 사용 (EC2 Instance Profile 권장)

EC2에서 Instance Profile을 사용하는 경우:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowListBucket",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::166357011361:role/itdaing-ec2-role"
      },
      "Action": [
        "s3:ListBucket",
        "s3:GetBucketLocation"
      ],
      "Resource": "arn:aws:s3:::daitdaing-static-files"
    },
    {
      "Sid": "AllowObjectOperations",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::166357011361:role/itdaing-ec2-role"
      },
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:PutObjectAcl"
      ],
      "Resource": "arn:aws:s3:::daitdaing-static-files/*"
    }
  ]
}
```

### 옵션 3: 공개 읽기 + 특정 사용자 쓰기

일부 파일을 공개적으로 읽을 수 있게 하되, 쓰기는 특정 사용자만:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::daitdaing-static-files/uploads/*"
    },
    {
      "Sid": "AllowListBucket",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::166357011361:user/hj"
      },
      "Action": [
        "s3:ListBucket",
        "s3:GetBucketLocation"
      ],
      "Resource": "arn:aws:s3:::daitdaing-static-files"
    },
    {
      "Sid": "AllowObjectOperations",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::166357011361:user/hj"
      },
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:PutObjectAcl"
      ],
      "Resource": "arn:aws:s3:::daitdaing-static-files/*"
    }
  ]
}
```

## 🔄 업로드 흐름 이해

### 현재 아키텍처
1. **사용자 업로드**: 사용자가 이미지를 업로드
2. **S3 저장**: 이미지가 S3에 저장됨
3. **DB 저장**: 애플리케이션이 DB에 S3 URL 저장
4. **이미지 표시**: 프론트엔드가 DB에서 URL을 가져와 S3에서 직접 이미지 로드

### 권장 업로드 방식

#### 방식 1: 애플리케이션을 통한 업로드 (간단)
```
사용자 → 프론트엔드 → 백엔드 API → S3 업로드 → DB 저장
```
- 장점: 간단하고 안전
- 단점: 백엔드 서버를 통과하므로 대용량 파일 시 부하

#### 방식 2: Presigned URL 사용 (권장)
```
사용자 → 프론리엔드 → 백엔드 API (Presigned URL 요청)
     → Presigned URL 받음 → 직접 S3 업로드 → 백엔드에 완료 알림 → DB 저장
```
- 장점: 백엔드 부하 감소, 직접 업로드로 빠름
- 단점: 구현이 약간 복잡

## 📋 정책 적용 방법

### AWS 콘솔에서 적용

1. **S3 콘솔 접속**
   - AWS 콘솔 → S3 → `daitdaing-static-files` 버킷 선택

2. **권한 탭 이동**
   - 버킷 선택 → "권한" 탭 클릭

3. **버킷 정책 편집**
   - "버킷 정책" 섹션 → "편집" 클릭
   - 위의 권장 정책 중 하나를 붙여넣기
   - IAM 사용자 ARN을 실제 값으로 수정
   - "변경 사항 저장" 클릭

### AWS CLI로 적용

```bash
# 정책 파일 생성
cat > s3-bucket-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowListBucket",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::166357011361:user/hj"
      },
      "Action": [
        "s3:ListBucket",
        "s3:GetBucketLocation"
      ],
      "Resource": "arn:aws:s3:::daitdaing-static-files"
    },
    {
      "Sid": "AllowObjectOperations",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::166357011361:user/hj"
      },
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:PutObjectAcl"
      ],
      "Resource": "arn:aws:s3:::daitdaing-static-files/*"
    }
  ]
}
EOF

# 정책 적용
aws s3api put-bucket-policy \
  --bucket daitdaing-static-files \
  --policy file://s3-bucket-policy.json \
  --region ap-northeast-2
```

## 🔍 IAM 사용자 ARN 확인 방법

### AWS 콘솔에서 확인
1. IAM 콘솔 → 사용자 → `hj` 선택
2. "사용자 ARN" 복사

### AWS CLI로 확인
```bash
aws iam get-user --user-name hj --query 'User.Arn' --output text
```

## ✅ 정책 적용 후 테스트

### Private EC2에서 테스트

```bash
ssh private-ec2
cd ~/itdaing
source prod.env

# 버킷 목록 확인
AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID \
AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY \
AWS_DEFAULT_REGION=$AWS_REGION \
aws s3 ls s3://$STORAGE_S3_BUCKET

# 파일 업로드 테스트
echo "test" > /tmp/test.txt
AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID \
AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY \
AWS_DEFAULT_REGION=$AWS_REGION \
aws s3 cp /tmp/test.txt s3://$STORAGE_S3_BUCKET/test.txt

# 파일 다운로드 테스트
AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID \
AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY \
AWS_DEFAULT_REGION=$AWS_REGION \
aws s3 cp s3://$STORAGE_S3_BUCKET/test.txt /tmp/test-download.txt

# 파일 삭제 테스트
AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID \
AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY \
AWS_DEFAULT_REGION=$AWS_REGION \
aws s3 rm s3://$STORAGE_S3_BUCKET/test.txt
```

## 🛡️ 보안 모범 사례

1. **최소 권한 원칙**
   - 필요한 최소한의 권한만 부여
   - `s3:*` 대신 구체적인 작업만 허용

2. **Principal 제한**
   - `"*"` 사용 금지
   - 특정 IAM 사용자/역할만 허용

3. **리소스 제한**
   - 특정 경로(`uploads/*`)만 허용 가능
   - 버킷 전체가 아닌 필요한 부분만

4. **IAM 정책과 버킷 정책 조합**
   - IAM 정책으로 사용자 권한 제어
   - 버킷 정책으로 버킷 레벨 제어

## 📚 관련 문서

- [AWS S3 버킷 정책 예제](https://docs.aws.amazon.com/AmazonS3/latest/userguide/example-bucket-policies.html)
- [IAM 정책과 버킷 정책의 차이](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-iam-policies.html)
- [Private EC2 환경 설정](PRIVATE_EC2_ENV_SETUP.md)

