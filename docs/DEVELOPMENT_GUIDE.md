# 개발 환경 가이드

## 🚀 서비스 실행 순서

```
PostgreSQL (5432) → Redis (6379) → Backend (8080) → Frontend (3000)
```

---

## 1️⃣ Redis 확인 (필수!)

백엔드는 **Redis**를 캐싱 및 세션 관리에 사용합니다.

```bash
# Redis 상태 확인
ps aux | grep redis
redis-cli ping  # "PONG" 응답 확인

# Redis 시작 (없으면)
sudo systemctl start redis-server
```

**포트**: 6379

---

## 2️⃣ 백엔드 실행

```bash
cd ~/itdaing

# 방법 1: JAR 파일 실행 (권장)
java -jar app.jar

# 방법 2: Gradle 실행
./gradlew bootRun --args='--spring.profiles.active=local'

# 로그 확인
tail -f /tmp/backend.log
```

**포트**: 8080  
**Health Check**: http://localhost:8080/actuator/health

---

## 3️⃣ 프론트엔드 v2 실행 (itdaing-app - JS 버전)

```bash
cd ~/itdaing-app

# Node.js 버전 설정
export NVM_DIR="$HOME/.nvm"
source "$NVM_DIR/nvm.sh"
nvm use  # .nvmrc 기준 (v20.19.5)

# 의존성 설치 (최초 1회)
npm install

# 개발 서버 시작
npm run dev
```

**포트**: 3000 (고정)  
**접속**: http://localhost:3000  
**특징**: JavaScript + React 19 + Tailwind CSS v4

---

## 4️⃣ 프론트엔드 v1 실행 (itdaing-web - TS 버전)

```bash
cd ~/itdaing-web

# 의존성 설치 (최초 1회)
npm install

# 개발 서버 시작
npm run dev -- --host 0.0.0.0 --port 3000
```

**포트**: 3000  
**접속**: http://localhost:3000  
**특징**: TypeScript + React 18 + Radix UI

---

## 📊 데이터 흐름

```
Frontend (3000)
    │ HTTP Request (/api/*)
    ▼
Vite Proxy (자동 전달)
    │
    ▼
Backend (8080)
    │
    ├─► Redis (6379)         - 캐싱, 세션
    │
    └─► PostgreSQL (5432)    - 메인 DB
```

### 흐름 설명

1. **프론트엔드**에서 `/api/popups` 호출
2. **Vite Proxy**가 `http://localhost:8080/api/popups`로 전달
3. **백엔드**가 요청 처리:
   - Redis 캐시 확인 → 있으면 즉시 반환
   - 없으면 PostgreSQL 조회 → Redis에 캐싱
4. **응답**을 프론트엔드로 반환
5. **React Query**가 클라이언트에서 추가 캐싱

자세한 내용은 [itdaing-app/docs/ARCHITECTURE.md](../itdaing-app/docs/ARCHITECTURE.md)를 참고하세요.

---

## 🔧 트러블슈팅

### 포트 충돌

```bash
# 백엔드 포트 (8080) 충돌
lsof -ti:8080 | xargs kill -9

# 프론트엔드 포트 (3000) 충돌
lsof -ti:3000 | xargs kill -9

# 모두 종료
lsof -ti:8080,3000 | xargs kill -9
```

### Redis 연결 실패

```bash
# Redis 상태 확인
ps aux | grep redis

# Redis 시작
sudo systemctl start redis-server

# 연결 테스트
redis-cli ping  # PONG 응답 확인
```

### Node.js 버전 문제

```bash
# NVM 설치
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# NVM 로드
export NVM_DIR="$HOME/.nvm"
source "$NVM_DIR/nvm.sh"

# Node.js 설치 및 사용
nvm install 20.19.5
nvm use 20.19.5
```

---

## 📚 관련 문서

- [BRANCH_STRATEGY.md](./BRANCH_STRATEGY.md) - 브랜치 전략
- [TECH_STACK.md](./TECH_STACK.md) - 기술 스택 비교
- [COMMIT_CONVENTION.md](./COMMIT_CONVENTION.md) - 커밋 규칙
- [itdaing-app/QUICK_START.md](../itdaing-app/QUICK_START.md) - 빠른 시작 가이드
- [itdaing-app/docs/ARCHITECTURE.md](../itdaing-app/docs/ARCHITECTURE.md) - 시스템 아키텍처

