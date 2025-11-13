# 개발 명령어 규칙

## 프로젝트 루트 디렉토리
모든 명령어는 프로젝트 루트(`~/itdaing`) 또는 해당 하위 디렉토리에서 실행합니다.

**참고**: 현재 Private EC2에서 직접 작업 중입니다. SSH 접속 없이 직접 명령어를 실행하세요.

## 환경 변수 로드

### 환경 변수 로드 (필수)
```bash
# Private EC2에서 작업 시작 전 항상 실행
cd ~/itdaing
source prod.env
```

## Mock DB 라이프사이클

### 초기화/시드 (파괴적)
```bash
/mock-db-reset
```
- 내부적으로 `scripts/mockdb-reset.sh`를 호출합니다 (Step 3에서 구현 예정).
- 순서: 스키마 드롭 → Flyway 마이그레이션 → DevDataSeed/시드 스크립트 → 헬스체크.
- 실행 전 RDS 타깃을 반드시 확인하고, 프로덕션에서는 절대 실행하지 마세요.

### 서버 기동 전 체크
1. `/mock-db-reset` (필요 시)
2. `/start-all` 또는 `/back-dev`
3. `/front-dev` (빌드 후 nginx 반영 시)

## 백엔드 명령어 (Gradle)

### 개발 서버 실행 (Private EC2)
```bash
# 환경 변수 로드 후 실행
cd ~/itdaing
source prod.env
./gradlew bootRun

# 백그라운드 실행
cd ~/itdaing
source prod.env
nohup ./gradlew bootRun > /tmp/itdaing-boot.log 2>&1 &
```

### 빌드
```bash
# 빌드
cd ~/itdaing
./gradlew build

# 테스트 제외 빌드
./gradlew build -x test

# 클린 빌드
./gradlew clean build

# JAR 파일만 생성
./gradlew bootJar
```

### 테스트
```bash
# 전체 테스트 실행
cd ~/itdaing
./gradlew test

# 특정 도메인 테스트
./gradlew testMaster      # 마스터 데이터 테스트
./gradlew testUser        # 사용자 도메인 테스트
./gradlew testGeo         # 지리 정보 테스트
./gradlew testPopup       # 팝업 도메인 테스트
./gradlew testSocial      # 소셜 기능 테스트
./gradlew testMsg         # 메시지 테스트

# 특정 클래스 테스트
./gradlew test --tests '*RepositoryTest'
./gradlew test --tests 'AuthControllerTest'

# 테스트 리포트 확인
open build/reports/tests/test/index.html
```

### OpenAPI 문서 생성
```bash
# OpenAPI 문서 생성 (openapi 프로파일로 부팅)
./gradlew generateOpenApiDocs
# 산출물: build/openapi/openapi.yaml
```

### 기타 유용한 명령어
```bash
# 의존성 트리 확인
./gradlew dependencies

# Gradle 래퍼 업데이트
./gradlew wrapper --gradle-version 8.5

# 프로젝트 구조 확인
./gradlew projects
```

## 프론트엔드 명령어 (npm)

### 빌드 및 배포 (Private EC2)
```bash
# Private EC2에서 빌드
cd ~/itdaing/itdaing-web
npm install
npm run build

# nginx 디렉토리로 복사
sudo cp -r ~/itdaing/itdaing-web/dist/* /var/www/itdaing/
sudo chown -R www-data:www-data /var/www/itdaing
```

### 개발 서버 실행
```bash
# itdaing-web 디렉토리로 이동
cd ~/itdaing/itdaing-web

# 개발 서버 시작 (로컬)
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview

# 의존성 설치
npm install
```

### 개발 도구
```bash
# TypeScript 타입 체크
npx tsc --noEmit

# ESLint 실행 (설정된 경우)
npx eslint .

# Prettier 포맷팅 (설정된 경우)
npx prettier --write .
```

## 서버 관리 명령어

### 백엔드 서버 관리
```bash
# 서버 상태 확인
lsof -ti:8080 && echo '실행 중' || echo '미실행'

# 서버 시작
cd ~/itdaing
source prod.env
nohup ./gradlew bootRun > /tmp/itdaing-boot.log 2>&1 &

# 서버 중지
kill $(lsof -ti:8080)

# 로그 확인
tail -f /tmp/itdaing-boot.log
```

### nginx 관리
```bash
# nginx 상태 확인
sudo systemctl status nginx

# nginx 재시작
sudo systemctl restart nginx

# nginx 설정 테스트
sudo nginx -t
```

## 데이터베이스 명령어

### Flyway 마이그레이션
```bash
# 마이그레이션 상태 확인 (로컬)
./gradlew flywayInfo

# 마이그레이션 실행 (bootRun 시 자동 실행됨)
./gradlew flywayMigrate
```

### PostgreSQL RDS 접속
```bash
# Private EC2에서 접속
cd ~/itdaing
source prod.env
PGPASSWORD=$SPRING_DATASOURCE_PASSWORD psql -h itdaing-db.cl4qagmger70.ap-northeast-2.rds.amazonaws.com -U itdaing_admin -d itdaing-db

# 데이터베이스 목록 확인
cd ~/itdaing
source prod.env
PGPASSWORD=$SPRING_DATASOURCE_PASSWORD psql -h itdaing-db.cl4qagmger70.ap-northeast-2.rds.amazonaws.com -U itdaing_admin -d postgres -c '\l'

# 테이블 목록 확인
cd ~/itdaing
source prod.env
PGPASSWORD=$SPRING_DATASOURCE_PASSWORD psql -h itdaing-db.cl4qagmger70.ap-northeast-2.rds.amazonaws.com -U itdaing_admin -d itdaing-db -c '\dt'
```

## S3 명령어

### S3 버킷 확인
```bash
# 버킷 목록 확인
cd ~/itdaing
source prod.env
AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY AWS_DEFAULT_REGION=$AWS_REGION aws s3 ls s3://$STORAGE_S3_BUCKET

# 파일 업로드
cd ~/itdaing
source prod.env
AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY AWS_DEFAULT_REGION=$AWS_REGION aws s3 cp /tmp/file.png s3://$STORAGE_S3_BUCKET/uploads/

# 파일 다운로드
cd ~/itdaing
source prod.env
AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY AWS_DEFAULT_REGION=$AWS_REGION aws s3 cp s3://$STORAGE_S3_BUCKET/uploads/file.png /tmp/
```

## 로그 확인

### 백엔드 로그
```bash
# 실시간 로그 확인
tail -f /tmp/itdaing-boot.log

# 최근 100줄 확인
tail -n 100 /tmp/itdaing-boot.log

# 에러만 확인
grep -i error /tmp/itdaing-boot.log | tail -20
```

### nginx 로그
```bash
# 액세스 로그
sudo tail -f /var/log/nginx/access.log

# 에러 로그
sudo tail -f /var/log/nginx/error.log
```

## 프로세스 관리

### 실행 중인 프로세스 확인
```bash
# 백엔드 프로세스 확인
ps aux | grep 'gradlew bootRun'

# 포트 사용 확인
sudo ss -tlnp | grep -E ':(80|443|8080)'
```

### 프로세스 종료
```bash
# 특정 포트를 사용하는 프로세스 종료
kill $(lsof -ti:8080)
```

## Git 작업

### 일반적인 워크플로우
```bash
# 현재 상태 확인
git status

# 변경사항 스테이징
git add .

# 커밋 (gitmoji 사용)
git commit -m "✨ feat: add new feature"

# 원격 저장소에 푸시
git push origin main
```

### Git 작업
```bash
# 상태 확인
cd ~/itdaing
git status

# 최신 코드 가져오기
cd ~/itdaing
git pull origin main

# 변경사항 확인
cd ~/itdaing
git diff
```

## 파일 관리

### 파일 복사
```bash
# 파일 복사
cp /tmp/file.txt ~/itdaing/

# 디렉토리 복사
cp -r /tmp/directory ~/itdaing/
```

## 환경 변수 설정

### 프로덕션 환경
```bash
# Private EC2에서 환경 변수 로드 (작업 시작 전 필수)
cd ~/itdaing
source prod.env

# 환경 변수 확인 (비밀번호 마스킹)
cd ~/itdaing
cat prod.env | sed 's/PASSWORD=.*/PASSWORD=***/'
```

## 주의사항

1. **작업 환경**: 현재 Private EC2에서 직접 작업 중입니다. SSH 접속 없이 명령어를 실행하세요.
2. **환경 변수**: 작업 시작 전 항상 `cd ~/itdaing && source prod.env` 실행
3. **포트**: 백엔드는 8080, nginx는 80/443 포트 사용
4. **로그 파일**: 백엔드 로그는 `/tmp/itdaing-boot.log`에 저장
5. **데이터베이스**: AWS RDS PostgreSQL 사용 (로컬 DB 없음)
6. **스토리지**: AWS S3 사용 (로컬 스토리지 없음)
