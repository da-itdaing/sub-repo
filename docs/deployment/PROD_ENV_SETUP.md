# prod.env 파일 설정 가이드

## 📋 개요

`prod.env` 파일은 프로덕션 환경에서 사용하는 환경 변수를 관리하는 파일입니다. 이 파일은 **절대 Git에 커밋하지 마세요**.

## 🔧 설정 방법

### 1. RDS 데이터베이스 정보 입력

RDS 생성 후 제공받은 정보를 아래 형식으로 입력하세요:

```bash
# RDS 엔드포인트로 교체
SPRING_DATASOURCE_URL=jdbc:postgresql://[RDS_ENDPOINT]:5432/[DATABASE_NAME]

# 마스터 사용자명으로 교체
SPRING_DATASOURCE_USERNAME=[MASTER_USERNAME]

# 마스터 비밀번호로 교체
SPRING_DATASOURCE_PASSWORD=[MASTER_PASSWORD]
```

### 2. 예시

```bash
SPRING_DATASOURCE_URL=jdbc:postgresql://itdaing-db.xxxxxxxxxxxx.ap-northeast-2.rds.amazonaws.com:5432/itdaing
SPRING_DATASOURCE_USERNAME=itdaing_admin
SPRING_DATASOURCE_PASSWORD=Itdaing!2024Secure
```

## 📝 RDS 정보 전달 형식

데이터베이스 생성 후 아래 정보를 제공해주세요:

```
엔드포인트: [RDS_ENDPOINT]
데이터베이스 이름: [DATABASE_NAME]
사용자명: [MASTER_USERNAME]
비밀번호: [MASTER_PASSWORD]
```

예시:
```
엔드포인트: itdaing-db.xxxxxxxxxxxx.ap-northeast-2.rds.amazonaws.com
데이터베이스 이름: itdaing
사용자명: itdaing_admin
비밀번호: Itdaing!2024Secure
```

## ✅ 설정 확인

### 1. 파일 위치 확인
```bash
# 프로젝트 루트에 있는지 확인
ls -la prod.env
```

### 2. Git에서 제외 확인
```bash
# .gitignore에 포함되어 있는지 확인
grep prod.env .gitignore
```

### 3. 환경 변수 로드 확인
애플리케이션은 `application-prod.yml`에서 다음 환경 변수를 읽습니다:
- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`

## 🚀 사용 방법

### Private EC2에서 실행 시

`prod.env` 파일은 **Private EC2 인스턴스**에 배치되어 사용됩니다.

> **참고**: 
> - **Bastion EC2**: 점프 서버 역할 (SSH 접근용)
> - **Private EC2**: 실제 애플리케이션이 실행되는 서버 (prod.env 파일 사용)

#### 1. Private EC2에 파일 업로드

```bash
# 로컬에서 Private EC2로 파일 전송
scp prod.env ubuntu@<private-ec2-ip>:/home/ubuntu/prod.env

# 또는 Bastion을 경유하여 전송
scp -o ProxyJump=ubuntu@<bastion-ip> prod.env ubuntu@<private-ec2-ip>:/home/ubuntu/prod.env
```

#### 2. Private EC2에서 환경 변수 로드

```bash
# SSH로 Private EC2 접속
ssh private-ec2

# 환경 변수 파일 로드
source prod.env

# 또는 직접 export
export $(cat prod.env | grep -v '^#' | xargs)

# 애플리케이션 실행
./gradlew bootRun
```

#### 3. 파일 권한 설정

```bash
# Private EC2에서 실행
chmod 600 prod.env  # 소유자만 읽기/쓰기 가능
```

### systemd 서비스에서 사용 시

Private EC2의 `/etc/systemd/system/itdaing.service` 파일에서:

```ini
[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu
EnvironmentFile=/home/ubuntu/prod.env
ExecStart=/usr/bin/java -jar /home/ubuntu/app.jar
Restart=always
RestartSec=10
```

## 🔒 보안 주의사항

1. **절대 Git에 커밋하지 마세요**
   - `.gitignore`에 `prod.env`가 포함되어 있는지 확인
   - 실수로 커밋했다면 즉시 제거하고 비밀번호 변경

2. **파일 권한 설정**
   ```bash
   chmod 600 prod.env  # 소유자만 읽기/쓰기 가능
   ```

3. **비밀번호 관리**
   - 강력한 비밀번호 사용
   - 정기적으로 변경
   - AWS Secrets Manager 사용 고려 (선택사항)

4. **백업**
   - 안전한 곳에 별도로 백업 보관
   - 암호화된 저장소 사용 권장

## 📚 관련 문서

- [AWS RDS PostgreSQL 설정 가이드](AWS_RDS_POSTGRESQL_SETUP.md)
- [EC2 배포 가이드](DEPLOY_EC2.md)
- [RDS 설정 값 템플릿](RDS_CONFIGURATION_TEMPLATE.md)

