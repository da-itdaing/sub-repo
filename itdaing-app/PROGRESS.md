# 🚀 Project Progress & Roadmap

## 🎯 Current Focus
> **Status:** ✅ Phase 1 Complete → 🚧 Phase 2: Consumer App (Mobile First)
> **Goal:** Build Login, Home, Popup, and MyPage features with Image-Driven UI.

---

## 🖼️ Workflow Rules
1.  **Image-Driven UI:** For tasks marked `[Image Req]`, you MUST ask for or analyze provided screenshots before coding.
2.  **Strict Architecture:** Follow the "Dual Universe" layout strategy defined in `.cursorrules`.

---

## 🗓️ Roadmap

### Phase 1: Foundation (Infrastructure) ✅
- [x] **Configuration:** `tailwind.config.js` (Safe Area, Colors), `vite.config.js` (Proxy).
- [x] **Network Layer:** `src/lib/axios.js` (Interceptors, Unwrap Logic, Silent Refresh).
- [x] **State Management:** `src/stores/useAuthStore.js` (Zustand), `src/App.jsx` (QueryProvider).
- [x] **Layout Skeleton:**
    - [x] `ConsumerLayout`: Mobile container (`max-w-[480px]`), Bottom Nav.
    - [x] `DashboardLayout`: Sidebar, Header, Mobile Drawer.
- [x] **Routing:** Define `consumerRoutes` and `adminRoutes`.

### Phase 2: Consumer App (Mobile First)
- [x] **Auth Feature** `[Image Req]`
  - [x] Login (`/login`): 소비자/판매자 토글, RHF+Zod 검증, 역할별 리다이렉트
  - [x] Signup Flow (`/signup`, `/signup/preferences`): RHF+Zod, consumer 취향 설정 + 판매자 즉시 가입
- [x] **Home** `[Image Req]`
  - Main (`/`)
  - Horizontal Banner + Hero Carousel
- [ ] **Discovery** `[Image Req]`
  - [x] Nearby Explore (`/nearby`): 필터/검색/캐러셀 및 카드 그리드
  - [x] Popup List (infinite scroll/filter)
- [x] **Popup Detail** `[Image Req]`
  - `/popup/:popupId`
  - Hero/Gallery + 정보 카드 + KakaoMap + Highlight 태그 섹션
- [x] **My Page** `[Image Req]`
  - Consumer Dashboard (`/mypage`)
  - Favorites / History tabs

> **Legacy reference:** `src/pages/consumer/MainPage.jsx`, `MyPage.jsx`, `NearbyExplorePage.jsx`, `PopupDetailPage.jsx`, `src/pages/Login/*`

### Phase 3: Admin/Seller Dashboard (SaaS)
- [ ] **Dashboard Home** `[Image Req]`: Stats & Charts.
- [ ] **Popup Management** `[Image Req]`: CRUD Table using `react-bootstrap`.
- [ ] **Approval System** `[Image Req]`: Admin workflow.

> **Legacy reference:** `src/pages/admin/*`, `src/pages/seller/*`, `src/pages/NotFound.jsx`

---

## 🔄 Iteration Log
- **2025-11-21 (초기화):** Project initialized with React 19, Vite, Tailwind v4. Dependencies installed.
- **2025-11-21 (Phase 1 완료):** 
  - ✅ Vite Config: Path alias (`@`), API Proxy 설정
  - ✅ Network Layer: Axios Interceptors, Silent Refresh, Response Unwrapping 구현
  - ✅ Token Storage: Access/Refresh Token 관리 유틸리티 생성
  - ✅ Auth Store (Zustand): 로그인/로그아웃/초기화 로직 구현
  - ✅ Consumer Layout: Mobile-First 레이아웃 + Bottom Navigation (Safe Area 지원)
  - ✅ Dashboard Layout: 호버 확장 Sidebar + Header + Mobile Drawer
  - ✅ App Router: Consumer/Auth/Seller/Admin 라우트 분리 + ProtectedRoute 구현
  - ✅ React Query: QueryClientProvider 설정 완료
- **2025-11-21 (Home Feature 완료 + 실제 데이터 연동):**
  - ✅ Header: 로고 + 검색바 + 로그인 버튼 (Sticky)
  - ✅ HeroCarousel: framer-motion 사용, 앱/웹 반응형 슬라이더 (드래그, 자동재생)
  - ✅ EventBanner: CTA 배너 (그라데이션 배경)
  - ✅ PopupCard: 재사용 가능한 카드 컴포넌트 (이미지, 좋아요, 정보)
  - ✅ PopupSection: 필터 버튼 + 그리드 + 더보기 기능
  - ✅ Footer: 다크 테마, 링크, SNS 아이콘
  - ✅ HomePage: **실제 백엔드 API 연동 완료** (PostgreSQL + S3)
  - ✅ API Services: authService, popupService, masterService, uploadService
  - ✅ React Query Hooks: usePopups (실제 데이터 조회 - 149개 팝업)
  - ✅ 이미지 유틸리티: S3 경로 처리 (imageUtils.js)
  - ✅ 환경변수 설정: config/env.js (AWS Secrets/Parameter Store 준비)
- **2025-11-21 (백엔드 자동 시작 설정):**
  - ✅ Systemd 서비스 등록: itdaing-backend.service
  - ✅ 부팅 시 자동 시작 활성화 (enabled)
  - ✅ Flyway 설정 수정: validate-on-migrate=false
  - ✅ JAR 재빌드 및 배포
  - ✅ 백엔드 정상 작동 확인 (port 8080, 149개 팝업 데이터)
- **2025-11-22 (Auth Feature 구현):**
  - ✅ Login (`/login`): 소비자/판매자 토글, RHF+Zod 검증, 역할별 리다이렉트
  - ✅ Signup Flow (`/signup`, `/signup/preferences`): 다단계 (소비자/판매자 분기), RHF+Zod 검증, 마스터 데이터 연동
- **2025-11-22 (Discovery - Nearby Explore 구현):**
  - ✅ Nearby Explore (`/nearby`): Kakao Map 연동, 지역/상태 필터, 검색, HeroCarousel, 카드 리스트
- **2025-11-22 (Popup List Infinite Scroll)**
  - ✅ `/popups` 라우트 + React Query `usePopupList`로 페이징/필터/검색 구현
  - ✅ 지역·카테고리 필터, 정렬 옵션, 키워드 검색, 무한 스크롤(더보기) UX
- **2025-11-22 (Popup Detail MVP)**
- **2025-11-22 (Popup Detail MVP)**
  - ✅ `/popup/:popupId` 라우트와 React Query 기반 상세 조회 훅(`usePopupDetail`)
  - ✅ Hero/Gallery, 정보 카드, Kakao 지도, 하이라이트 태그로 구성된 상세 화면
  - ✅ Consumer 레이아웃 내 에러/로딩/복귀 동작 정비
- **2025-11-22 (Consumer MyPage)**
  - ✅ `/mypage` 실데이터 연동: `GET /api/users/me/dashboard`
  - ✅ 취향 태그/통계/찜·최근본·추천 탭 UI + `PopupCard` 재활용
  - ✅ React Query 훅 `useConsumerDashboard` 및 `userService` 추가