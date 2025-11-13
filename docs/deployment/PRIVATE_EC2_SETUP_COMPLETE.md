# Private EC2 환경 설정 완료

## ✅ 설정 완료 내역

### 1. 기존 프로젝트 폴더 제거
- ✅ `~/final-project` 폴더 제거 완료
- ✅ `~/itdaing` 폴더 제거 완료

### 2. 필수 도구 설치
- ✅ Java 21 설치 완료 (`openjdk version "21.0.8"`)
- ✅ Git 설치 완료 (`git version 2.43.0`)
- ✅ PostgreSQL 클라이언트 설치 완료

### 3. 프로젝트 업로드
- ✅ 전체 프로젝트 폴더 업로드 완료 (`~/itdaing`)
- ✅ `.git` 폴더 포함
- ✅ `prod.env` 파일 업로드 및 권한 설정 완료 (600)

### 4. 원격 디렉토리 구조
```
~/itdaing/
├── .git/              # Git 저장소
├── src/                # 백엔드 소스 코드
├── itdaing-web/        # 프론트엔드 소스 코드
├── gradlew             # Gradle wrapper
├── prod.env            # 프로덕션 환경 변수 (권한: 600)
└── ...
```

## 🔍 환경 확인

### SSH 접속 정보
- **호스트**: `private-ec2` (10.0.133.168)
- **사용자**: `ubuntu`
- **프록시**: Bastion EC2를 통한 접속

### 설치된 도구
- Java: OpenJDK 21.0.8
- Git: 2.43.0
- PostgreSQL 클라이언트: 설치됨

## 📝 다음 단계

### 1. SSH로 Private EC2 접속

```bash
ssh private-ec2
```

### 2. 프로젝트 디렉토리로 이동

```bash
cd ~/itdaing
```

### 3. 환경 변수 확인

```bash
# prod.env 파일 내용 확인 (비밀번호는 마스킹)
cat prod.env | sed 's/PASSWORD=.*/PASSWORD=***/'
```

### 4. 프로젝트 빌드 (선택사항)

```bash
# Gradle wrapper 권한 확인
chmod +x gradlew

# 빌드 실행
./gradlew clean build -x test
```

### 5. 환경 변수 로드 및 애플리케이션 실행

```bash
# 환경 변수 로드
source prod.env

# 또는 export로 개별 설정
export SPRING_PROFILES_ACTIVE=prod
export SPRING_DATASOURCE_URL=jdbc:postgresql://itdaing-db.cl4qagmger70.ap-northeast-2.rds.amazonaws.com:5432/itdaing-db
# ... 기타 환경 변수

# 애플리케이션 실행
./gradlew bootRun
```

### 6. 헬스 체크

```bash
# 다른 터미널에서
curl http://localhost:8080/actuator/health
```

## 🐛 문제 해결

### 빌드 실패 시

```bash
# Gradle wrapper 권한 확인
chmod +x gradlew

# 빌드 캐시 정리
./gradlew clean

# 상세 로그로 빌드
./gradlew build --stacktrace
```

### 환경 변수 로드 실패 시

```bash
# prod.env 파일 권한 확인
ls -l prod.env

# 파일 내용 확인
cat prod.env

# 수동으로 환경 변수 설정
export SPRING_PROFILES_ACTIVE=prod
# ... 기타 변수
```

### 데이터베이스 연결 실패 시

```bash
# PostgreSQL 클라이언트로 연결 테스트
psql -h itdaing-db.cl4qagmger70.ap-northeast-2.rds.amazonaws.com \
     -U itdaing_admin \
     -d itdaing-db

# 또는 telnet으로 포트 확인
telnet itdaing-db.cl4qagmger70.ap-northeast-2.rds.amazonaws.com 5432
```

## 📚 관련 문서

- [초기 설정 가이드](SETUP_PRIVATE_EC2.md)
- [배포 가이드](DEPLOY_TO_PRIVATE_EC2.md)
- [EC2 아키텍처](EC2_ARCHITECTURE.md)
- [prod.env 설정](PROD_ENV_SETUP.md)

