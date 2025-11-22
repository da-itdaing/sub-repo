# Itdaing App 빠른 시작 가이드

> 📌 **우분투 서버 환경 전용 가이드**

## ⚙️ 서버 시작 (순서 중요!)

### 0단계: Redis 서버 확인 (필수)

백엔드는 **Redis**를 사용합니다 (캐싱, 세션 관리).

```bash
# Redis 실행 확인
ps aux | grep redis

# Redis 연결 테스트
redis-cli ping  # "PONG" 응답 확인
```

**Redis가 없다면**:
```bash
# 시스템 서비스로 시작
sudo systemctl start redis-server

# 또는 직접 실행
redis-server
```

**Redis 포트**: `6379`

---

### 1단계: 백엔드 서버 실행 (필수 우선)

```bash
cd /home/ubuntu/itdaing

# 방법 1: JAR 파일로 실행 (권장)
java -jar app.jar

# 방법 2: Gradle로 실행 (개발용)
./gradlew bootRun --args='--spring.profiles.active=local'

# 방법 3: 백그라운드 실행
nohup java -jar app.jar > /tmp/backend.log 2>&1 &
```

**백엔드 포트**: `8080` (고정, 변경 불가)  
**Health Check**: http://localhost:8080/actuator/health

**백엔드 종료 방법**:
```bash
# 프로세스 찾아서 종료
kill $(lsof -ti:8080) || echo "백엔드 미실행"
```

### 2단계: 프론트엔드 서버 실행

```bash
cd /home/ubuntu/itdaing-app

# Node.js 버전 설정 (자동으로 .nvmrc 읽음)
export NVM_DIR="$HOME/.nvm"
source "$NVM_DIR/nvm.sh"
nvm use

# 개발 서버 실행
npm run dev
```

**프론트엔드 포트**: `3000` (고정, 변경 불가)  
**접속 URL**: http://localhost:3000

**프론트엔드 종료 방법**:
```bash
# Ctrl+C 또는
lsof -ti:3000 | xargs kill -9
```

---

## 🚨 포트 충돌 해결

### 백엔드 포트 (8080) 충돌
```bash
# 포트 사용 중인 프로세스 확인
lsof -ti:8080

# 강제 종료
lsof -ti:8080 | xargs kill -9
```

### 프론트엔드 포트 (3000) 충돌
```bash
# 포트 사용 중인 프로세스 확인
lsof -ti:3000

# 강제 종료
lsof -ti:3000 | xargs kill -9
```

### 한 번에 모두 종료
```bash
# 백엔드 + 프론트엔드 모두 종료
lsof -ti:8080,3000 | xargs kill -9
```

---

## 로그인

### 소비자
```
아이디: consumer1
비밀번호: Test!1234
```

### 판매자
```
아이디: seller1
비밀번호: Test!1234
```

### 관리자
```
아이디: admin1
비밀번호: Test!1234
```

---

## 주요 기능 테스트

### 1. 조회수 순위 캐러셀
- http://localhost:3000 접속
- 상단 캐러셀 확인 (TOP 7)
- 하트 버튼 클릭 (로그인 다이얼로그)

### 2. 검색 기능
- Header 검색바에 "패션" 입력
- Enter 또는 검색 버튼 클릭
- SearchPage로 이동 확인

### 3. Seller 대시보드
- seller1으로 로그인
- 대시보드 통계 확인
- "+ 팝업 등록" 버튼 클릭
- 모든 필드 입력 및 이미지 업로드
- 사이드바 6개 메뉴 확인

### 4. Admin 관리
- admin1으로 로그인
- 존/셀 관리 클릭
- "존 그리기" → 지도에서 폴리곤 그리기
- "존 저장" → "셀 그리기" → "셀 저장"

---

## 🔧 트러블슈팅

### 1. "Port 8080 already in use" 에러
```bash
# 백엔드 프로세스 강제 종료
lsof -ti:8080 | xargs kill -9

# 다시 실행
cd /home/ubuntu/itdaing && java -jar app.jar
```

### 2. "Port 3000 already in use" 에러
```bash
# 프론트엔드 프로세스 강제 종료
lsof -ti:3000 | xargs kill -9

# 다시 실행
cd /home/ubuntu/itdaing-app && npm run dev
```

### 3. Node 버전 에러 ("Unsupported Node version")
```bash
# .nvmrc에 명시된 버전 설치 및 사용
nvm install 20.19.5
nvm use 20.19.5

# 버전 확인
node -v  # v20.19.5 출력되어야 함
```

### 4. 의존성 에러 (npm install 실패)
```bash
cd /home/ubuntu/itdaing-app

# 캐시 및 node_modules 삭제
rm -rf node_modules package-lock.json

# 재설치
npm install
```

### 5. Redis 연결 실패 ("Could not get resource from pool")
```bash
# Redis 상태 확인
ps aux | grep redis

# Redis가 없으면 시작
sudo systemctl start redis-server

# 연결 테스트
redis-cli ping  # PONG 응답 확인
```

### 6. 백엔드 연결 실패 ("Failed to fetch")
```bash
# 백엔드 Health Check
curl http://localhost:8080/actuator/health

# 응답이 없으면 백엔드가 실행되지 않은 것
cd /home/ubuntu/itdaing && java -jar app.jar
```

### 7. "nvm: command not found"
```bash
# NVM 설치
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# NVM 로드
export NVM_DIR="$HOME/.nvm"
source "$NVM_DIR/nvm.sh"

# Node.js 설치
nvm install 20.19.5
nvm use 20.19.5
```

### 8. 데이터가 표시되지 않음
```bash
# 데이터 흐름 확인
# 1. Redis 확인
redis-cli ping

# 2. PostgreSQL 확인 (백엔드가 연결 가능한지)
# 백엔드 로그 확인
tail -f /tmp/backend.log | grep -i "database\|redis"

# 3. 프론트엔드 Network 탭 확인
# 브라우저 개발자 도구 → Network → /api/ 요청 확인
```

---

## 📋 체크리스트

시작 전 확인사항:
- [ ] **Redis**가 실행 중인가? (`redis-cli ping`)
- [ ] 백엔드 포트 8080이 비어있는가? (`lsof -ti:8080`)
- [ ] 프론트엔드 포트 3000이 비어있는가? (`lsof -ti:3000`)
- [ ] Node.js 버전이 맞는가? (`node -v`)
- [ ] 백엔드가 실행 중인가? (http://localhost:8080/actuator/health)
- [ ] 프론트엔드가 실행 중인가? (http://localhost:3000)

## 🔄 데이터 흐름

```
Frontend (3000) → Vite Proxy → Backend (8080)
                                    ↓
                                Redis (6379) ← 캐싱
                                    ↓
                             PostgreSQL (5432) ← 메인 DB
```

자세한 내용은 [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)를 참고하세요.

---

**모든 준비 완료!** 🎉

## 🔗 관련 문서

- [README.md](./README.md) - 프로젝트 전체 개요
- [UBUNTU_DEVELOPMENT_GUIDE.md](./UBUNTU_DEVELOPMENT_GUIDE.md) - Ubuntu 개발 환경
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) - 시스템 아키텍처 및 데이터 흐름
- [docs/DEPLOYMENT_STATUS.md](./docs/DEPLOYMENT_STATUS.md) - 배포 및 실행 상태
- [docs/TEST_ACCOUNTS.md](./docs/TEST_ACCOUNTS.md) - 테스트 계정 정보
