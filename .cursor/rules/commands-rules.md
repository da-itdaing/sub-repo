# 개발 명령어 규칙

## 프로젝트 루트 디렉토리
모든 명령어는 프로젝트 루트(`/Users/dorae222/Desktop/final-project`) 또는 해당 하위 디렉토리에서 실행합니다.

## Docker 명령어

### MySQL 컨테이너 관리
```bash
# MySQL 컨테이너 시작
docker-compose up -d mysql

# MySQL 컨테이너 상태 확인
docker ps | grep itdaing-mysql

# MySQL 컨테이너 중지
docker-compose stop mysql

# MySQL 컨테이너 완전 제거 (데이터 유지)
docker-compose down mysql

# MySQL 컨테이너 로그 확인
docker logs itdaing-mysql

# MySQL 컨테이너 접속
docker exec -it itdaing-mysql mysql -u root -p
```

### Docker 전체 관리
```bash
# 모든 컨테이너 중지 및 제거
docker-compose down

# 볼륨까지 제거 (주의: 데이터 삭제됨)
docker-compose down -v
```

## 백엔드 명령어 (Gradle)

### 개발 서버 실행
```bash
# 기본 실행 (local 프로파일)
./gradlew bootRun

# 특정 프로파일 지정
SPRING_PROFILES_ACTIVE=local ./gradlew bootRun
SPRING_PROFILES_ACTIVE=dev ./gradlew bootRun

# 백그라운드 실행 (로그 파일로 출력)
./gradlew bootRun > /tmp/itdaing-boot.log 2>&1 &
```

### 빌드
```bash
# 전체 빌드 (테스트 포함)
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

### 개발 서버 실행
```bash
# itdaing-web 디렉토리로 이동
cd itdaing-web

# 개발 서버 시작 (기본 포트: 5173)
npm run dev

# 호스트 바인딩 (다른 기기에서 접근 가능)
npm run dev -- --host

# 백그라운드 실행 (로그 파일로 출력)
npm run dev -- --host > /tmp/itdaing-web-dev.log 2>&1 &
```

### 빌드 및 배포
```bash
# 프로덕션 빌드
npm run build
# 산출물: dist/

# 빌드 결과 미리보기
npm run preview

# 의존성 설치
npm install

# 패키지 업데이트 확인
npm outdated

# 보안 취약점 확인
npm audit
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

## 통합 개발 환경 실행

### 모든 서버 동시 실행
```bash
# 터미널 1: MySQL
docker-compose up -d mysql

# 터미널 2: 백엔드
./gradlew bootRun

# 터미널 3: 프론트엔드
cd itdaing-web && npm run dev -- --host
```

### 서버 중지
```bash
# 백엔드 중지: Ctrl+C 또는
pkill -f "gradlew bootRun"

# 프론트엔드 중지: Ctrl+C 또는
pkill -f "vite"

# MySQL 중지
docker-compose stop mysql
```

## 데이터베이스 명령어

### Flyway 마이그레이션
```bash
# 마이그레이션 상태 확인
./gradlew flywayInfo

# 마이그레이션 실행 (bootRun 시 자동 실행됨)
./gradlew flywayMigrate

# 마이그레이션 롤백 (수동 SQL 필요)
# Flyway는 자동 롤백을 지원하지 않으므로 수동으로 처리
```

### MySQL 직접 접속
```bash
# Docker 컨테이너를 통한 접속
docker exec -it itdaing-mysql mysql -u root -p

# 데이터베이스 선택
USE itdaing;

# 테이블 목록 확인
SHOW TABLES;

# 데이터 확인
SELECT * FROM users LIMIT 10;
```

## 로그 확인

### 백엔드 로그
```bash
# 실시간 로그 확인 (백그라운드 실행 시)
tail -f /tmp/itdaing-boot.log

# 최근 100줄 확인
tail -n 100 /tmp/itdaing-boot.log
```

### 프론트엔드 로그
```bash
# 실시간 로그 확인 (백그라운드 실행 시)
tail -f /tmp/itdaing-web-dev.log

# 최근 100줄 확인
tail -n 100 /tmp/itdaing-web-dev.log
```

### Docker 로그
```bash
# MySQL 컨테이너 로그
docker logs -f itdaing-mysql

# 최근 100줄
docker logs --tail 100 itdaing-mysql
```

## 프로세스 관리

### 실행 중인 프로세스 확인
```bash
# 백엔드 프로세스 확인
ps aux | grep "gradlew bootRun"

# 프론트엔드 프로세스 확인
ps aux | grep "vite"

# 포트 사용 확인
lsof -i :8080  # 백엔드
lsof -i :5173  # 프론트엔드
lsof -i :3306  # MySQL
```

### 프로세스 종료
```bash
# 특정 포트를 사용하는 프로세스 종료
kill -9 $(lsof -t -i:8080)  # 백엔드
kill -9 $(lsof -t -i:5173)  # 프론트엔드

# 프로세스 이름으로 종료
pkill -f "gradlew bootRun"
pkill -f "vite"
```

## 환경 변수 설정

### 로컬 개발 환경
```bash
# .env 파일 생성 (itdaing-web/)
cd itdaing-web
cp .env.example .env
# .env 파일 편집

# 백엔드 환경 변수 (프로파일 기반)
# application-local.yml, application-dev.yml 참조
```

### 프로덕션 환경
```bash
# prod.env 파일 사용 (서버에만 존재)
source prod.env
./gradlew bootRun
```

## Git 명령어 (참고)

### 일반적인 워크플로우
```bash
# 현재 상태 확인
git status

# 변경사항 스테이징
git add .

# 커밋 (gitmoji 사용)
git commit -m "✨ feat: add new feature"

# 브랜치 생성 및 전환
git checkout -b feature/new-feature

# 원격 저장소에 푸시
git push origin feature/new-feature
```

## 유용한 단축 명령어

### 서버 재시작 스크립트
```bash
# 모든 서버 중지 후 재시작
# (별도 스크립트 파일로 만들 수 있음)

# 1. 기존 프로세스 종료
pkill -f "gradlew bootRun"
pkill -f "vite"
docker-compose stop mysql

# 2. MySQL 시작
docker-compose up -d mysql
sleep 5

# 3. 백엔드 시작
./gradlew bootRun > /tmp/itdaing-boot.log 2>&1 &
sleep 10

# 4. 프론트엔드 시작
cd itdaing-web && npm run dev -- --host > /tmp/itdaing-web-dev.log 2>&1 &
```

## 주의사항

1. **포트 충돌**: 8080(백엔드), 5173(프론트엔드), 3306(MySQL) 포트가 이미 사용 중인지 확인
2. **데이터베이스 연결**: 백엔드 실행 전 MySQL 컨테이너가 실행 중인지 확인
3. **환경 변수**: 로컬 개발 시 `local` 프로파일 사용, 외부 리소스 연동 시 `dev` 프로파일 사용
4. **로그 파일**: 백그라운드 실행 시 로그 파일 위치 확인 (`/tmp/itdaing-*.log`)
5. **의존성 설치**: 프론트엔드 의존성 변경 시 `npm install` 재실행 필요

