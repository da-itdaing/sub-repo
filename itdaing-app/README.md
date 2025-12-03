# 📱 Itdaing App

> 다잇다잉 프론트엔드 - React 19 + Vite 7 기반 팝업스토어 추천 서비스

## 📋 개요

**Itdaing App**은 팝업스토어 추천 플랫폼의 프론트엔드입니다.  
소비자, 판매자, 관리자를 위한 반응형 웹 앱으로, PWA를 지원합니다.

## 🛠️ 기술 스택

| 분류 | 기술 | 버전 |
|------|------|------|
| **Framework** | React | 19.2.0 |
| **Build Tool** | Vite | 7.0.0 |
| **Routing** | React Router | 7.9.6 |
| **Server State** | TanStack Query | 5.90.10 |
| **Client State** | Zustand | 5.0.8 |
| **HTTP Client** | Axios | 1.13.2 |
| **Styling** | Tailwind CSS | 4.1.0 |
| **Form** | React Hook Form | 7.66.1 |
| **Validation** | Zod | 4.1.12 |
| **Animation** | Motion | 11.15.0 |
| **Icons** | Lucide React | 0.554.0 |
| **Map** | react-kakao-maps-sdk | 1.2.0 |

## 📁 프로젝트 구조

```
itdaing-app/
├── src/
│   ├── api/              # Axios 클라이언트 & 인터셉터
│   ├── chatbot/          # AI 챗봇 UI (마켓버디 & 셀러버디)
│   │   ├── components/   # ChatLayout, MessageBubble, ChatMotions
│   │   ├── hooks/        # useChatSession
│   │   └── pages/        # ConsumerChatbotPage, SellerChatbotPage
│   ├── components/       # 공통 컴포넌트
│   │   ├── layout/       # Header, Footer, BottomNav
│   │   ├── common/       # HeroCarousel, NumberedMarker
│   │   ├── consumer/     # 소비자 전용 (HorizontalBanner 등)
│   │   ├── seller/       # 판매자 전용 (SellerChatbotPopup 등)
│   │   ├── popup/        # EventCard, EventSection
│   │   ├── map/          # ZonePolygonMap, MapComponents
│   │   └── pwa/          # SplashScreen, InstallGuide
│   ├── pages/            # 페이지 컴포넌트
│   │   ├── consumer/     # 소비자 페이지
│   │   ├── seller/       # 판매자 페이지
│   │   └── admin/        # 관리자 페이지
│   ├── layouts/          # 레이아웃 (Consumer, Seller, Admin)
│   ├── hooks/            # Custom Hooks
│   ├── routes/           # 라우팅 설정
│   ├── services/         # API 서비스 레이어
│   ├── store/            # Zustand 스토어 (인증)
│   ├── constants/        # 상수 (입력 제한 등)
│   └── utils/            # 유틸리티 (이미지, 토큰 등)
├── public/               # 정적 파일 & PWA 자산
├── docs/                 # 문서
└── vite.config.js        # Vite 설정 (proxy, 코드 스플리팅)
```

## 🚀 실행 방법

### 개발 환경

```bash
cd itdaing-app

# Node.js 버전 설정 (v20.19+)
nvm use

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

**접속 URL:** http://localhost:5173

### 빌드 & 배포

```bash
# 프로덕션 빌드
npm run build

# S3 배포 (CloudFront)
aws s3 sync dist/ s3://daitdaing-frontend-prod/ --delete
aws cloudfront create-invalidation --distribution-id E3V0JILQTE8I63 --paths "/*"
```

## 🎯 주요 기능

### 소비자 (Consumer)

| 기능 | 경로 | 설명 |
|------|------|------|
| 홈 | `/` | 팝업 목록, 캐러셀, 카테고리 |
| 팝업 상세 | `/popup/:id` | 상세 정보, 리뷰, 지도 |
| 검색 | `/search` | 팝업 검색 |
| 마이페이지 | `/mypage` | 프로필, 찜, 리뷰 |
| 챗봇 | `/chatbot` | 마켓버디 AI 추천 |

### 판매자 (Seller)

| 기능 | 경로 | 설명 |
|------|------|------|
| 대시보드 | `/seller` | 통계, 팝업 관리 |
| 팝업 등록 | `/seller/popup/create` | 새 팝업 등록 |
| 팝업 수정 | `/seller/popup/:id/edit` | 팝업 수정 |
| 챗봇 | (팝업) | 셀러버디 존 추천 |

### 관리자 (Admin)

| 기능 | 경로 | 설명 |
|------|------|------|
| 대시보드 | `/admin` | 전체 통계 |
| 사용자 관리 | `/admin/users` | 회원 관리 |
| 검수 관리 | `/admin/popups` | 팝업 승인/반려 |
| 존/셀 관리 | `/admin/zones` | 지역 관리 |

## 🤖 AI 챗봇

### 마켓버디 (Consumer)
- 팝업스토어 맞춤 추천
- 지역/카테고리/분위기 기반 검색
- 빨간색 테마

### 셀러버디 (Seller)
- 존/상권 추천
- 유동인구, 업종 분석
- 파란색 테마
- 지도 연동 (존/셀 시각화)

## 📱 PWA 지원

- **오프라인 지원**: Service Worker
- **앱 설치**: iOS Safari, Android Chrome
- **푸시 알림**: (예정)

설치 가이드: 홈 화면의 "앱 다운로드 안내" 배너 클릭

## 🔧 환경 변수

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_KAKAO_MAP_KEY=YOUR_KAKAO_MAP_KEY
```

> ⚠️ 프로덕션에서는 CloudFront를 통해 API 요청이 ALB로 라우팅됩니다.

## 📊 코드 스플리팅

`vite.config.js`에서 자동 청크 분리:

| 청크 | 포함 내용 |
|------|----------|
| `react-vendor` | React 코어 |
| `router-vendor` | React Router |
| `query-vendor` | TanStack Query, Axios |
| `kakao-vendor` | Kakao Maps SDK |
| `ui-vendor` | Lucide, clsx, tailwind-merge |
| `admin-pages` | 관리자 페이지 |
| `seller-pages` | 판매자 페이지 |
| `chatbot` | 챗봇 모듈 |

## 🌐 프록시 설정

개발 서버에서 API 요청 자동 프록시:

| 경로 | 대상 |
|------|------|
| `/api/*` | `http://localhost:8080` (Spring) |
| `/ai/*` | 챗봇 서버 (FastAPI) |

> ⚠️ 프록시 대상은 `vite.config.js`에서 환경에 맞게 설정

## 📚 문서

| 문서 | 설명 |
|------|------|
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | 시스템 아키텍처 |
| [CUSTOMER_GUIDE.md](./docs/CUSTOMER_GUIDE.md) | 소비자 기능 가이드 |
| [SELLER_GUIDE.md](./docs/SELLER_GUIDE.md) | 판매자 기능 가이드 |
| [KAKAO_MAP_INTEGRATION.md](./docs/KAKAO_MAP_INTEGRATION.md) | 카카오맵 연동 |
| [QUICK_START.md](./QUICK_START.md) | 빠른 시작 가이드 |

## 🎨 디자인 시스템

### 색상

| 용도 | 색상 | Tailwind |
|------|------|----------|
| 브랜드 (Primary) | #eb0000 | `text-[#eb0000]` |
| 소비자 테마 | Rose/Red | `bg-rose-*` |
| 판매자 테마 | Blue/Cyan | `bg-blue-*` |

### 레이아웃

- **소비자**: 모바일 퍼스트 (max-w-[480px])
- **판매자/관리자**: 데스크탑 퍼스트 (사이드바 레이아웃)

## 📄 라이선스

인공지능 사관학교 6기 프로젝트

© 2025 Da-Itdaing. All rights reserved.
