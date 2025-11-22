# Ubuntu 서버 개발 환경 가이드

> 📌 **이 프로젝트는 Ubuntu 서버에서 개발/실행됩니다**

## 환경 정보

- **OS**: Ubuntu Server
- **작업 디렉토리**: `/home/ubuntu/itdaing-app`
- **백엔드 디렉토리**: `/home/ubuntu/itdaing`
- **사용자**: `ubuntu`

## Git과 시스템 파일

### .gitignore 구조

루트의 `.gitignore`는 우분투 시스템 파일들을 자동으로 제외합니다:

```gitignore
# 시스템 캐시 및 히스토리
.cache/
.config/
.local/
.bash_history
.bash_logout
.bashrc
.profile
.zshrc
.lesshst
.viminfo
.mysql_history
.psql_history
.wget-hsts
.sudo_as_admin_successful

# IDE 및 개발 도구
.cursor-server/
.vscode-server/
.dbclient/
.dotnet/
.redhat/

# 패키지 관리자 캐시
.gradle/
.npm/
.nvm/

# 보안 (제외 필수)
.ssh/
*.pem
*.key
*.jks
*.p12
*.keystore
*.crt
*.p8
```

### 트래킹 확인

현재 Git이 어떤 파일을 트래킹하는지 확인:

```bash
cd /home/ubuntu
git ls-files | head -20
```

시스템 파일이 제외되는지 확인:

```bash
git check-ignore -v .bash_history .bashrc .config .cache
```

## 포트 관리

### 포트 구성 (변경 불가)

| 서비스 | 포트 | 비고 |
|--------|------|------|
| 백엔드 (Spring Boot) | **8080** | `vite.config.js` proxy 설정에 하드코딩 |
| 프론트엔드 (Vite) | **3000** | `vite.config.js`에 고정 |

### 포트 사용 확인

```bash
# 포트 8080 사용 확인
lsof -ti:8080

# 포트 3000 사용 확인
lsof -ti:3000

# 여러 포트 한 번에 확인
lsof -ti:8080,3000
```

### 프로세스 종료

```bash
# 백엔드 종료
kill $(lsof -ti:8080) 2>/dev/null || echo "백엔드 미실행"

# 프론트엔드 종료
kill $(lsof -ti:3000) 2>/dev/null || echo "프론트엔드 미실행"

# 모두 종료
lsof -ti:8080,3000 | xargs kill -9 2>/dev/null || echo "프로세스 없음"
```

## Redis 관리

백엔드는 **Redis**를 필수적으로 사용합니다.
- **캐싱**: API 응답 캐싱 (팝업 목록, 카테고리 등)
- **세션**: JWT Refresh Token 저장
- **Rate Limiting**: API 호출 제한

### Redis 상태 확인

```bash
# Redis 프로세스 확인
ps aux | grep redis

# Redis 연결 테스트
redis-cli ping  # "PONG" 응답 확인

# Redis 정보 확인
redis-cli info stats

# Redis 포트 확인
lsof -ti:6379
```

### Redis 시작/종료

```bash
# 시스템 서비스로 시작
sudo systemctl start redis-server
sudo systemctl status redis-server

# 또는 직접 실행
redis-server

# 종료
sudo systemctl stop redis-server
# 또는
redis-cli shutdown
```

### Redis 캐시 확인

```bash
# 모든 키 확인
redis-cli KEYS "*"

# 특정 키 조회
redis-cli GET "popups:list:*"

# 캐시 초기화 (개발용)
redis-cli FLUSHALL
```

---

## 백엔드 관리

### 백엔드 실행 방법

#### 방법 1: JAR 파일 실행 (권장)

```bash
cd /home/ubuntu/itdaing
java -jar app.jar
```

#### 방법 2: Gradle 실행 (개발용)

```bash
cd /home/ubuntu/itdaing
./gradlew bootRun --args='--spring.profiles.active=local'
```

#### 방법 3: 백그라운드 실행

```bash
cd /home/ubuntu/itdaing
nohup java -jar app.jar > /tmp/backend.log 2>&1 &

# 로그 확인
tail -f /tmp/backend.log
```

#### 방법 4: start-backend.sh 스크립트 사용

```bash
cd /home/ubuntu/itdaing
./start-backend.sh
```

### 백엔드 상태 확인

```bash
# Health Check
curl http://localhost:8080/actuator/health

# 프로세스 확인
lsof -ti:8080 && echo "백엔드 실행 중" || echo "백엔드 미실행"

# 로그 확인 (백그라운드 실행 시)
tail -f /tmp/backend.log
```

### 백엔드 종료

```bash
# 단일 명령어
kill $(lsof -ti:8080) || echo "백엔드 미실행"

# 강제 종료
lsof -ti:8080 | xargs kill -9
```

## 프론트엔드 관리

### Node.js 버전 관리

프로젝트는 `.nvmrc` 파일을 통해 Node.js 버전을 관리합니다.

```bash
cd /home/ubuntu/itdaing-app

# .nvmrc 내용 확인
cat .nvmrc  # 20.19.5

# NVM 로드
export NVM_DIR="$HOME/.nvm"
source "$NVM_DIR/nvm.sh"

# .nvmrc 기준으로 Node.js 버전 전환
nvm use

# 버전 확인
node -v  # v20.19.5 출력되어야 함
```

### 프론트엔드 실행

```bash
cd /home/ubuntu/itdaing-app

# Node.js 버전 설정
export NVM_DIR="$HOME/.nvm"
source "$NVM_DIR/nvm.sh"
nvm use

# 개발 서버 실행
npm run dev
```

### 프론트엔드 빌드

```bash
cd /home/ubuntu/itdaing-app
npm run build

# 빌드 결과물 확인
ls -lh dist/

# 프로덕션 미리보기
npm run preview
```

## 일반적인 워크플로우

### 1. 새로운 세션 시작

```bash
# 1. 작업 디렉토리로 이동
cd /home/ubuntu/itdaing-app

# 2. Git 최신 상태 확인
git status
git pull origin test/fe

# 3. Node.js 환경 설정
export NVM_DIR="$HOME/.nvm"
source "$NVM_DIR/nvm.sh"
nvm use

# 4. Redis 확인 (필수!)
redis-cli ping  # PONG 응답 확인
# 없으면: sudo systemctl start redis-server

# 5. 백엔드 실행 (다른 터미널)
cd /home/ubuntu/itdaing
java -jar app.jar

# 6. 프론트엔드 실행
cd /home/ubuntu/itdaing-app
npm run dev
```

### 2. 개발 중

```bash
# Redis 상태 확인
redis-cli ping

# 백엔드 상태 확인
curl http://localhost:8080/actuator/health

# 프론트엔드 접속
# http://localhost:3000

# 로그 확인
tail -f /tmp/backend.log  # 백엔드 로그
# 프론트엔드 로그는 터미널에 직접 출력됨

# Redis 캐시 확인 (디버깅용)
redis-cli KEYS "*"
redis-cli GET "popups:list:all"
```

### 3. 작업 종료

```bash
# 1. 프론트엔드 종료 (Ctrl+C 또는)
lsof -ti:3000 | xargs kill -9

# 2. 백엔드 종료
kill $(lsof -ti:8080)

# 3. Git 커밋 (선택)
cd /home/ubuntu/itdaing-app
git add .
git commit -m "feat: ..."
```

## 환경변수 관리

### 백엔드 환경변수

백엔드는 `/home/ubuntu/itdaing/prod.env` 파일을 사용:

```bash
cd /home/ubuntu/itdaing

# 환경변수 로드
source prod.env

# 환경변수 확인 (예시)
echo $SPRING_DATASOURCE_URL
```

### 프론트엔드 환경변수

프론트엔드는 `.env` 파일을 사용 (선택적):

```bash
cd /home/ubuntu/itdaing-app

# .env 파일 생성 (선택)
cat > .env << EOF
VITE_API_BASE_URL=http://localhost:8080
VITE_KAKAO_MAP_KEY=YOUR_KEY_HERE
EOF
```

> ⚠️ **주의**: `.env` 파일은 `.gitignore`에 포함되어 Git에 커밋되지 않습니다.

## 디버깅 팁

### 백엔드 디버깅

```bash
# API 테스트
curl http://localhost:8080/api/popups
curl http://localhost:8080/api/auth/login -X POST \
  -H "Content-Type: application/json" \
  -d '{"loginId":"consumer1","password":"pass!1234"}'

# Swagger UI 접속
# http://localhost:8080/swagger-ui/index.html

# 로그 레벨 확인
tail -f /tmp/backend.log | grep ERROR
```

### 프론트엔드 디버깅

```bash
# 브라우저 개발자 도구 활용
# - Console 탭: JavaScript 에러
# - Network 탭: API 요청/응답
# - React DevTools: 컴포넌트 상태

# 빌드 에러 확인
cd /home/ubuntu/itdaing-app
npm run build
```

## 주의사항

1. **포트 변경 금지**
   - 백엔드 8080, 프론트엔드 3000은 변경하지 마세요
   - `vite.config.js`의 proxy 설정이 의존합니다

2. **시스템 파일 커밋 금지**
   - `.bash_history`, `.bashrc` 등은 자동으로 제외됩니다
   - 혹시 커밋되면 즉시 `git rm --cached` 처리

3. **환경변수 보안**
   - `prod.env` 파일은 절대 Git에 커밋하지 마세요
   - `.env` 파일도 `.gitignore`에 포함되어 있습니다

4. **Node.js 버전**
   - 항상 `.nvmrc`에 명시된 버전 사용
   - `nvm use` 명령어로 자동 전환

5. **백엔드 우선 실행**
   - 프론트엔드는 백엔드 API에 의존합니다
   - 반드시 백엔드를 먼저 실행하세요

## 데이터 흐름

```
Frontend (3000)
    │ /api/* 요청
    ▼
Vite Proxy (자동 전달)
    │
    ▼
Backend (8080)
    │
    ├─► Redis (6379)
    │   ├─ 캐시 확인 (팝업 목록 등)
    │   └─ 세션 확인 (Refresh Token)
    │
    └─► PostgreSQL (5432)
        └─ 메인 데이터 조회/저장
```

자세한 내용은 [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)를 참고하세요.

---

## 관련 문서

- [README.md](./README.md) - 프로젝트 개요
- [QUICK_START.md](./QUICK_START.md) - 빠른 시작 가이드
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) - 시스템 아키텍처 및 데이터 흐름
- [docs/DEPLOYMENT_STATUS.md](./docs/DEPLOYMENT_STATUS.md) - 배포 상태
- [docs/TEST_ACCOUNTS.md](./docs/TEST_ACCOUNTS.md) - 테스트 계정

