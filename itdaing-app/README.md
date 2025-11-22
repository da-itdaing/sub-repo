# Itdaing App

React + Vite 기반 팝업 스토어 추천 서비스 Consumer App

## 프로젝트 구조

```
src/
├── api/              # API 클라이언트 (Axios)
├── components/       # 공통 컴포넌트
│   ├── layout/      # Header, Footer, BottomNav
│   ├── common/      # HeroCarousel 등
│   └── popup/       # EventCard, EventSection
├── pages/           # 페이지 컴포넌트
├── hooks/           # Custom Hooks
├── routes/          # 라우팅 설정
├── services/        # API 서비스 레이어
├── store/           # Zustand 스토어 (인증)
├── styles/          # 글로벌 CSS
└── utils/           # 유틸리티 (이미지, 토큰 등)
```

## 기술 스택

- **React 18** - UI 라이브러리
- **Vite 5** - 빌드 도구
- **React Router v7** - 라우팅
- **Zustand** - 클라이언트 상태 관리
- **React Query** - 서버 상태 관리
- **Axios** - HTTP 클라이언트
- **Tailwind CSS 3** - 스타일링
- **React Hook Form + Zod** - 폼 관리 및 검증
- **Lucide React** - 아이콘

## 시작하기

### 1. 백엔드 서버 실행 (필수)

프론트엔드는 백엔드 API에 의존하므로 **반드시 백엔드와 Redis를 먼저 실행**해야 합니다.

#### Redis 서버 확인 (필수)

백엔드는 **Redis**를 캐싱과 세션 관리에 사용합니다.

```bash
# Redis 실행 상태 확인
ps aux | grep redis

# Redis 연결 테스트
redis-cli ping  # "PONG" 응답이 나와야 함
```

Redis가 실행되지 않았다면:
```bash
sudo systemctl start redis-server
# 또는
redis-server
```

#### Spring Boot 서버 실행

```bash
cd /home/ubuntu/itdaing

# JAR 파일이 있는 경우 (권장)
java -jar app.jar

# 또는 Gradle로 실행
./gradlew bootRun --args='--spring.profiles.active=local'
```

**백엔드 포트**: `8080` (고정)  
**Redis 포트**: `6379`  
**Health Check**: http://localhost:8080/actuator/health

> ⚠️ **포트 충돌 해결**: `lsof -ti:8080 | xargs kill -9`

### 2. Node.js 버전 확인 및 의존성 설치

```bash
cd /home/ubuntu/itdaing-app

# Node.js 버전 설정 (.nvmrc 기준)
export NVM_DIR="$HOME/.nvm"
source "$NVM_DIR/nvm.sh"
nvm use

# 의존성 설치
npm install
```

### 3. 환경 변수 설정 (선택)

Kakao Map API 키는 백엔드에서 자동으로 로드됩니다. 필요 시 `.env` 파일 생성:

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_KAKAO_MAP_KEY=YOUR_KAKAO_MAP_KEY_HERE
```

### 4. 프론트엔드 개발 서버 실행

```bash
npm run dev
```

**프론트엔드 포트**: `3000` (고정, 변경 불가)  
**접속 URL**: http://localhost:3000

> ⚠️ **포트 충돌 해결**: `lsof -ti:3000 | xargs kill -9`
> 
> 📌 **중요**: 프론트엔드는 항상 **포트 3000**을 사용해야 합니다. Vite proxy 설정이 백엔드(8080)로 연결되어 있습니다.

### 4. 빌드

```bash
npm run build
```

## 주요 기능

### ✅ 완료된 기능

- **인증 시스템**
  - 로그인 (`/login`)
  - 회원가입 2단계 (`/signup/step1`, `/signup/step2`)
  - JWT 토큰 기반 인증
  - Silent Refresh (401 에러 시 자동 토큰 갱신)
  - Zustand를 통한 인증 상태 관리

- **홈 페이지** (`/`)
  - Hero Carousel (자동 슬라이드)
  - 팝업 목록 섹션 (곧 오픈, 울 동네, 카테고리별)
  - React Query를 통한 데이터 캐싱
  - 더보기/접기 기능

- **팝업 상세** (`/popup/:id`)
  - 팝업 정보 (제목, 위치, 날짜, 운영시간)
  - 이미지 갤러리
  - 리뷰 목록 및 평점

- **마이페이지** (`/mypage`)
  - 프로필 정보
  - 찜한 팝업, 리뷰, 설정 메뉴
  - Protected Route (로그인 필요)

- **내 주변 탐색** (`/nearby`)
  - 지도 기반 팝업 탐색 (Kakao Map 연동 예정)

- **레이아웃 컴포넌트**
  - Header (로고, 검색바, 로그인/로그아웃)
  - Footer (회사 정보, SNS 링크)
  - BottomNav (하단 네비게이션 바)

### 🔄 추가 개발 필요

- Kakao Map API 실제 연동
- 회원가입 2단계 마스터 데이터 동적 로드
- 찜하기 기능
- 리뷰 작성 기능
- 이미지 업로드
- 검색 기능
- 푸시 알림

## API 통신

### Base URL
```
http://localhost:8080
```

### 주요 엔드포인트

- `POST /api/auth/login` - 로그인
- `POST /api/auth/signup/consumer` - 소비자 회원가입
- `POST /api/auth/refresh` - 토큰 갱신
- `GET /api/users/me` - 내 프로필 조회
- `GET /api/popups` - 팝업 목록
- `GET /api/popups/:id` - 팝업 상세
- `GET /api/popups/:id/reviews` - 팝업 리뷰 목록

자세한 API 스펙은 `openapi.json` 참고

## 이미지 처리

백엔드에서 S3 URL을 포함한 ImagePayload 객체를 반환합니다:

```javascript
{
  url: "https://s3.amazonaws.com/...",
  key: "uploads/..."
}
```

`getImageUrl()` 및 `getImageUrls()` 유틸리티 함수를 사용하여 처리합니다.

## 포트 구성

| 서비스 | 포트 | 변경 가능 여부 | 비고 |
|--------|------|---------------|------|
| 백엔드 (Spring Boot) | 8080 | ❌ 불가 | 프론트 Vite proxy 설정에 하드코딩 |
| 프론트엔드 (Vite) | 3000 | ❌ 불가 | vite.config.js에 고정 |

> ⚠️ **포트 변경 시 주의**: 포트를 변경하려면 `vite.config.js`의 proxy 설정도 함께 수정해야 합니다.

## 백엔드 종료 방법

```bash
# 포트 8080 프로세스 찾기
lsof -ti:8080

# 프로세스 종료
lsof -ti:8080 | xargs kill -9

# 또는 한 번에
kill $(lsof -ti:8080) 2>/dev/null || echo "백엔드 미실행"
```

## 데이터 흐름

```
Frontend (Port 3000)
    │ HTTP Request (/api/*)
    ▼
Vite Proxy (자동 전달)
    │
    ▼
Backend (Port 8080)
    │
    ├─► Redis (Port 6379)    - 캐싱 및 세션
    │
    └─► PostgreSQL (Port 5432) - 메인 DB
```

1. **프론트엔드**에서 `/api/popups` 호출
2. **Vite Proxy**가 `http://localhost:8080/api/popups`로 전달
3. **백엔드**가 요청 처리:
   - Redis 캐시 확인 → 있으면 즉시 반환
   - 없으면 PostgreSQL 조회 → Redis에 캐싱
4. **응답**을 프론트엔드로 반환
5. **React Query**가 클라이언트에서 추가 캐싱

자세한 내용은 [ARCHITECTURE.md](./docs/ARCHITECTURE.md)를 참고하세요.

## 주의사항

- **Node.js 버전**: v20.19.5 이상 권장 (`.nvmrc` 참고)
- **Redis 필수**: 백엔드는 Redis에 의존합니다 (캐싱, 세션)
- **백엔드 필수**: 프론트엔드 실행 전 `http://localhost:8080`에서 백엔드가 실행 중이어야 합니다
- **Vite Proxy**: `/api` 요청이 자동으로 백엔드(`http://localhost:8080`)로 전달됩니다
- **우분투 환경**: 이 프로젝트는 Ubuntu 서버에서 개발/실행됩니다

## 문서

- [QUICK_START.md](./QUICK_START.md) - 빠른 시작 가이드
- [UBUNTU_DEVELOPMENT_GUIDE.md](./UBUNTU_DEVELOPMENT_GUIDE.md) - Ubuntu 개발 환경 가이드
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) - 시스템 아키텍처 및 데이터 흐름
- [docs/DEPLOYMENT_STATUS.md](./docs/DEPLOYMENT_STATUS.md) - 배포 및 실행 상태
- [docs/TEST_ACCOUNTS.md](./docs/TEST_ACCOUNTS.md) - 테스트 계정 정보
- [docs/KAKAO_MAP_INTEGRATION.md](./docs/KAKAO_MAP_INTEGRATION.md) - Kakao Map 통합 가이드
- [docs/SELLER_GUIDE.md](./docs/SELLER_GUIDE.md) - 판매자 기능 가이드

## 라이센스

© 2025 Da-Itdaing. All rights reserved.
