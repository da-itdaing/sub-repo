# AWS RDS PostgreSQL 설정 값 전달용

데이터베이스 생성 후 아래 형식으로 정보를 전달해주세요.

## 📋 전달할 정보

### 1. 데이터베이스 연결 정보
```
엔드포인트: [RDS_ENDPOINT]
포트: 5432
데이터베이스 이름: [DATABASE_NAME]
사용자명: [MASTER_USERNAME]
비밀번호: [MASTER_PASSWORD] (보안상 별도 채널로 전달)
```

### 2. 네트워크 정보
```
VPC: [VPC_ID 또는 이름]
보안 그룹: [SECURITY_GROUP_ID 또는 이름]
Public Access: Yes/No
```

### 3. 인스턴스 정보
```
인스턴스 클래스: db.t3.micro
엔진 버전: PostgreSQL 15.x (또는 13.x)
스토리지: 20 GB
```

## 📝 예시 형식

```
엔드포인트: itdaing-db.xxxxxxxxxxxx.ap-northeast-2.rds.amazonaws.com
포트: 5432
데이터베이스 이름: itdaing
사용자명: itdaing_admin
비밀번호: [별도 전달]

VPC: vpc-xxxxxxxxx
보안 그룹: sg-xxxxxxxxx
Public Access: No
```

## ⚠️ 보안 주의사항

1. **비밀번호는 절대 이 파일에 직접 작성하지 마세요**
2. **비밀번호는 별도의 안전한 방법으로 전달하세요**
3. **이 파일은 Git에 커밋하지 마세요** (.gitignore에 포함)

