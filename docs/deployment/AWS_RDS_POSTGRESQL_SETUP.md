# AWS RDS PostgreSQL 설정 가이드 (토이 프로젝트용)

## 📋 개요

AWS RDS에서 PostgreSQL 데이터베이스를 생성하고 설정하는 방법을 설명합니다. 토이 프로젝트용으로 비용 효율적인 설정을 권장합니다.

## 🎯 권장 설정 (토이 프로젝트용)

### 1. 데이터베이스 생성 방법
- **Standard create** 선택 (완전한 설정 옵션 사용)

### 2. 엔진 옵션
- **Engine**: PostgreSQL
- **Engine version**: **PostgreSQL 15.x** (최신 안정 버전 권장)
  - 또는 PostgreSQL 13.x (이미지에서 선택된 버전)
- **Multi-AZ DB cluster**: 체크 해제 (비용 절감)

### 3. 템플릿
- **Dev/Test** 선택 (토이 프로젝트에 적합)
  - 또는 **Free tier** (1년 무료 사용 가능한 경우)

### 4. 가용성 및 내구성
- **Single DB instance** 선택 ⚠️ **토이 프로젝트용 권장**
  - Multi-AZ는 비용이 2배이므로 토이 프로젝트에는 불필요
  - 고가용성이 필요한 경우에만 Multi-AZ 선택

### 5. 설정 (Settings)

#### 필수 입력값:
- **DB instance identifier**: `itdaing-db` (또는 원하는 이름)
- **Database 1**: `itdaing` (애플리케이션에서 사용할 데이터베이스 이름)

#### 자격 증명 설정:
- **Master username**: `itdaing_admin` (또는 원하는 사용자명)
- **Master password**: 강력한 비밀번호 설정
  - 최소 8자 이상
  - 대문자, 소문자, 숫자, 특수문자 포함 권장
  - 예: `Itdaing!2024Secure`

#### 자격 증명 관리:
- **Manage in AWS Secrets Manager**: 선택 해제 (토이 프로젝트용)
  - 간단한 비밀번호 관리로 충분

### 6. 암호화
- **Encryption**: 체크 해제 (토이 프로젝트용, 비용 절감)
  - 프로덕션 환경에서는 반드시 활성화

### 7. 인스턴스 구성
- **DB instance class**: `db.t3.micro` 선택
  - vCPU: 2
  - RAM: 1 GiB
  - 네트워크 성능: Low to Moderate
  - **비용**: 약 $15-18/월

### 8. 스토리지
- **Storage type**: `General Purpose SSD (gp2)`
- **Allocated storage**: `20 GB` (토이 프로젝트용 충분)
- **Storage autoscaling**: 체크 해제 (비용 절감)

### 9. 연결 (Connectivity)

#### 네트워크 및 보안:
- **Virtual private cloud (VPC)**: 
  - 기존 VPC가 있다면 선택
  - 없다면 **Default VPC** 선택
- **DB subnet group**: `default` 선택
- **Public access**: 
  - **Yes** 선택 (EC2 외부에서 접근 필요 시)
  - **No** 선택 (EC2 내부에서만 접근 시)
- **VPC security group**: 
  - **Create new** 선택하여 새 보안 그룹 생성 권장
  - 이름: `itdaing-db-sg`
  - 인바운드 규칙 추가:
    - Type: PostgreSQL
    - Port: 5432
    - Source: EC2 보안 그룹 또는 특정 IP 주소

#### 가용성 영역:
- **Availability Zone**: `No preference` 선택

### 10. 인증서 기관
- **Certificate authority**: `rds-ca-2019` (기본값)

### 11. 추가 구성 (Additional configuration)

#### 초기 데이터베이스 이름:
- 이미 "Database 1"에서 설정함

#### DB 파라미터 그룹:
- 기본값 사용

#### 옵션 그룹:
- 기본값 사용

#### 백업:
- **Backup retention period**: `7 days` (토이 프로젝트용)
- **Backup window**: `No preference`
- **Copy tags to snapshots**: 체크 해제

#### 모니터링:
- **CloudWatch metrics**: 체크 (기본)
- **Performance Insights**: 
  - **체크 해제** (토이 프로젝트용, 비용 절감)
  - 또는 체크하고 Retention period: 7 days

#### 로그 내보내기:
- 모든 로그 타입 체크 해제 (토이 프로젝트용)

#### 유지보수:
- **Auto minor version upgrade**: 체크
- **Maintenance window**: `No preference`

#### 삭제 보호:
- **Enable deletion protection**: 체크 해제 (토이 프로젝트용)
  - 실수로 삭제 방지가 필요하면 체크

### 12. 태그 (선택사항)
- 필요시 태그 추가

### 13. 데이터베이스 인증
- **Password authentication** 선택

## 📝 생성 후 필요한 정보

데이터베이스 생성이 완료되면 다음 정보를 확인하세요:

### 1. 엔드포인트 (Endpoint)
- RDS 콘솔 > Databases > 인스턴스 선택
- **Connectivity & security** 탭에서 확인
- 형식: `itdaing-db.xxxxxxxxxxxx.ap-northeast-2.rds.amazonaws.com`

### 2. 포트
- 기본값: `5432`

### 3. 데이터베이스 이름
- 설정한 값: `itdaing`

### 4. 사용자명
- 설정한 값: `itdaing_admin`

### 5. 비밀번호
- 생성 시 설정한 값

## 🔧 애플리케이션 설정

### prod.env 파일 업데이트

```bash
# PostgreSQL RDS 설정
SPRING_PROFILES_ACTIVE=prod
SPRING_DATASOURCE_URL=jdbc:postgresql://[ENDPOINT]:5432/itdaing
SPRING_DATASOURCE_USERNAME=itdaing_admin
SPRING_DATASOURCE_PASSWORD=[YOUR_PASSWORD]

# JWT 설정
JWT_SECRET=[YOUR_JWT_SECRET]
JWT_ISSUER=itdaing-prod
JWT_ACCESS_TOKEN_EXPIRATION=86400000
JWT_REFRESH_TOKEN_EXPIRATION=1209600000

# AWS S3 설정
AWS_REGION=ap-northeast-2
AWS_ACCESS_KEY_ID=[YOUR_ACCESS_KEY]
AWS_SECRET_ACCESS_KEY=[YOUR_SECRET_KEY]
S3_BUCKET_NAME=daitdaing-static-files
```

### application-prod.yml 확인

`src/main/resources/application-prod.yml` 파일이 PostgreSQL 설정을 사용하는지 확인하세요.

## 💰 예상 비용 (토이 프로젝트용)

- **DB 인스턴스 (db.t3.micro)**: 약 $15-18/월
- **스토리지 (20 GB gp2)**: 약 $2-3/월
- **데이터 전송**: 무료 (같은 리전 내)
- **총 예상 비용**: 약 **$17-21/월**

### 비용 절감 팁:
1. Single DB instance 사용 (Multi-AZ 사용 안 함)
2. Performance Insights 비활성화
3. 백업 보관 기간 최소화 (7일)
4. 불필요한 모니터링 옵션 비활성화
5. 사용하지 않을 때 인스턴스 중지 (중지 시 스토리지 비용만 발생)

## 🔒 보안 권장사항

1. **보안 그룹 설정**
   - EC2 인스턴스의 보안 그룹만 허용
   - 특정 IP 주소만 허용 (개발자 IP)

2. **비밀번호 관리**
   - 강력한 비밀번호 사용
   - 정기적으로 변경
   - AWS Secrets Manager 사용 고려 (프로덕션)

3. **암호화**
   - 프로덕션 환경에서는 반드시 활성화
   - SSL/TLS 연결 사용

## 🚨 주의사항

1. **Public access**
   - Yes로 설정하면 인터넷에서 접근 가능
   - 보안 그룹으로 접근 제어 필수

2. **삭제 보호**
   - 실수로 삭제 방지하려면 활성화
   - 삭제 시 비활성화 필요

3. **백업**
   - 자동 백업은 활성화되어 있음
   - 수동 스냅샷 생성 권장 (중요 시점)

## 📚 참고 자료

- [AWS RDS PostgreSQL 문서](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_PostgreSQL.html)
- [RDS 가격](https://aws.amazon.com/rds/pricing/)
- [RDS 보안 모범 사례](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.html)

