# AWS RDS PostgreSQL 설정 값 템플릿

데이터베이스 생성 후 아래 정보를 채워서 전달해주세요.

## 📋 데이터베이스 정보

### 기본 정보
- **DB Instance Identifier**: `_________________`
- **Database Name**: `_________________`
- **Master Username**: `_________________`
- **Master Password**: `_________________` (보안상 별도로 전달)

### 연결 정보
- **Endpoint**: `_________________.ap-northeast-2.rds.amazonaws.com`
- **Port**: `5432` (기본값)
- **Region**: `ap-northeast-2` (서울)

### 네트워크 정보
- **VPC**: `_________________`
- **Subnet Group**: `_________________`
- **Security Group**: `_________________`
- **Public Access**: `Yes` / `No`

### 인스턴스 정보
- **DB Instance Class**: `db.t3.micro`
- **Engine Version**: `PostgreSQL 15.x` (또는 `13.x`)
- **Storage**: `20 GB` (gp2)

## 🔧 애플리케이션 설정에 필요한 값

### 1. 데이터베이스 연결 문자열
```
jdbc:postgresql://[ENDPOINT]:5432/[DATABASE_NAME]
```

예시:
```
jdbc:postgresql://itdaing-db.xxxxxxxxxxxx.ap-northeast-2.rds.amazonaws.com:5432/itdaing
```

### 2. 환경 변수 (prod.env)
```bash
SPRING_DATASOURCE_URL=jdbc:postgresql://[ENDPOINT]:5432/[DATABASE_NAME]
SPRING_DATASOURCE_USERNAME=[MASTER_USERNAME]
SPRING_DATASOURCE_PASSWORD=[MASTER_PASSWORD]
```

### 3. 보안 그룹 인바운드 규칙
- **Type**: PostgreSQL
- **Port**: 5432
- **Source**: 
  - EC2 보안 그룹 (EC2에서 접근 시)
  - 또는 특정 IP 주소 (개발자 IP)

## 📝 체크리스트

데이터베이스 생성 후 확인사항:

- [ ] 엔드포인트 URL 확인
- [ ] 포트 번호 확인 (기본 5432)
- [ ] 데이터베이스 이름 확인
- [ ] 사용자명 확인
- [ ] 비밀번호 안전하게 저장
- [ ] 보안 그룹 인바운드 규칙 설정
- [ ] Public access 설정 확인
- [ ] 연결 테스트 (로컬 또는 EC2에서)

## 🔗 연결 테스트

### psql을 사용한 연결 테스트
```bash
psql -h [ENDPOINT] -p 5432 -U [MASTER_USERNAME] -d [DATABASE_NAME]
```

### 애플리케이션에서 연결 테스트
```bash
# EC2에서 실행
cd /path/to/project
SPRING_PROFILES_ACTIVE=prod ./gradlew bootRun
```

## ⚠️ 보안 주의사항

1. **비밀번호는 절대 Git에 커밋하지 마세요**
2. **prod.env 파일은 .gitignore에 포함되어 있습니다**
3. **비밀번호는 별도의 안전한 방법으로 전달하세요**
4. **보안 그룹은 최소한의 접근만 허용하세요**

