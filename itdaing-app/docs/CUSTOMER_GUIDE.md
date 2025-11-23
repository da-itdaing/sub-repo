# Consumer Experience & Architecture Guide

> Mirrors the structure of `SELLER_GUIDE.md`, focused on the consumer-facing React (itdaing-app) experience and how it maps to the Spring Boot backend.

---

## 📋 개요
- **앱 셸**: Header → Home (HeroCarousel, EventSection, HorizontalBanner) → Footer + BottomNav
- **라우팅 기준**: React Router v7 (`ROUTES.home`, `ROUTES.login`, `ROUTES.popupDetail(:id)`, `ROUTES.mypage`, `ROUTES.nearby`)
- **상태 스토어**: `useAuthStore`(Zustand) + React Query master data caches

---

## 🧱 전체 아키텍처 요약 (from `docs/ARCHITECTURE.md`)

| Layer | Responsibility | Notes |
| --- | --- | --- |
| Pages (`src/pages`) | Route-level shells (HomePage, LoginPage, NearbyExplorePage, PopupDetailPage, MyPage, Signup steps) | Use React Query hooks and shared components; maintain `max-w-[540px]/[1200px]` alignment. |
| Components (`src/components`) | HeroCarousel, EventSection, HorizontalBanner, BottomNav, Footer, Header, ReviewWritePage, MyPage tabs | Must hydrate from master data or API payloads; no hardcoded chips/resgions. |
| Hooks (`src/hooks`) | `useMasterData`, `usePopups`, `useAuthInitialization` | Wrap React Query fetchers with caching and selection limits enforcement. |
| Services (`src/services`) | `authService`, `popupService`, `reviewService`, `wishlistService` (TBD) | Axios clients hitting `/api/**` via Vite proxy; unify ApiResponse handling. |
| Backend | Spring Boot controllers → services → repositories | Redis caches master data & refresh tokens; PostgreSQL stores popups, favorites, reviews. |

**Auth Flow:** Login → `authService.login` → access/refresh tokens stored in localStorage → Axios interceptor attaches `Authorization` header → on 401 try `/api/auth/refresh` → update Zustand store → re-run original request.

---

## 🎨 UX & Responsive Expectations (from Figma bundle)

### Home
- HeroCarousel: 5-card overlap, center card clickable, left/right clicks navigate, dots indicate slide.
- HorizontalBanner sits directly under the carousel (web + mobile).
- EventSection: web = 1 row × 4 columns grid; mobile = horizontal scroll with snap. “더보기” adds 4 cards at a time up to 20. Filters show 광주 5개구 only.
- Scroll-to-top FAB anchored to right edge responsive to container width.
- **Status Logic**: Upcoming (`now < start`), Ongoing (`start <= now <= end`), Ended (`now > end`). Logic must use current KST. **Ended popups must be hidden** from recommendation/feed lists.

### Signup Flow
- Step1: credential & role selection (consumer default).
- Sticky step header (`SignupStepHeader`) exposes “이전으로 / 홈으로” actions + 시각적 progress bar. Step1 카드 하단에는 “가입 취소” 버튼으로 홈 복귀.
- Step2 (`SignupStep2`): preference chips for Categories, Styles, Regions, Features. Limits: Cat 1~4, Style 1~4, Region 1~2 (동/서/남/북/광산), Feature 1~4. Chips must highlight count (e.g., “선택된 카테고리: 2/4”).
- Validation via React Hook Form + Zod; disable next if constraints not met.

### Popup Detail + Review
- Tabs: 설명 / 지도 / 후기. “후기 작성하기” button enters `ReviewWritePage`.
- Heart button toggles favorites; requires login. Unauthed press triggers modal: “로그인 후 이용 가능합니다. 지금 로그인할까요?”
- Review tab shows distribution bars + individual cards; login-gated actions for create/edit/delete.
- `ReviewWritePage`는 평점 + 텍스트 입력 + **이미지 업로드** 후 `createReview` API를 호출하고, 성공 시 상세 페이지로 돌아가도록 구성한다.

### MyPage
- Tabs: 맞춤 추천 · 관심 팝업 · 내 후기 · 일정 (itdaing-web 참조). 각 탭은 동일한 카드/통계 스타일을 공유한다.
- Favorites tab uses same EventCard visuals; data must sync with wishlist backend (`GET /api/wishlist`).
- Stats row: 관심 팝업/추천 큐레이션/관심 지역/선호 카테고리 숫자 표기, Logout 버튼은 헤더에 위치.
- Review & 일정 탭은 빈 상태 + CTA (향후 리뷰 작성 + 캘린더 연동)로 구성.
- **Guest View**: If unauthenticated, show a "Login Required" placeholder with a login button instead of redirecting.

### Nearby Explore
- Map at top (React Kakao Maps SDK) with taller height on desktop (>=768px). Search + filters below map; card grid uses same Home layout rules.
- Mobile view must strictly use **horizontal scroll** for cards.

---

## 🔄 Backend Integration Touchpoints

| Feature | Endpoint(s) | Frontend Modules |
| --- | --- | --- |
| Master data | `GET /api/master/categories`, `styles`, `regions`, `features` | `src/hooks/useMasterData.js`, consumed by Signup/MyPage filters |
| Favorites | (TBD) e.g., `POST /api/wishlist/{popupId}` / `DELETE` / `GET /api/wishlist` | `EventCard`, `PopupDetailPage`, `MyPageFavorites` |
| Reviews | `POST /api/popups/{id}/reviews`, `PUT /api/reviews/{id}`, `DELETE /api/reviews/{id}`, `GET /api/popups/{id}/reviews` | `PopupDetailPage`, `ReviewWritePage`, React Query cache invalidation |
| Nearby map | `GET /api/popups/search` with region/category filters | `NearbyExplorePage`, map markers |
| Image Upload | `POST /api/upload` (Multipart) | `src/services/uploadService.js`, `ImageUploader.jsx` |

---

## 📄 Consumer Documentation Set

1. **`CUSTOMER_FOUNDATION.md`** – stack & master data (already created).
2. **`CUSTOMER_GUIDE.md` (this file)** – experience + architectural mapping.
3. **`CONSUMER_GAP_REPORT.md`** – findings from implementation audits (Plan Step 3 & 4).
4. **`CONSUMER_DOC_TODO.md`** – running checklist for doc tasks (mirrors seller TODO doc).

All docs must stay under `/home/ubuntu/itdaing-app/docs` and cross-link to relevant code.

---

### Toast & Login Gating
- 전역 `ToastProvider`가 `AppRouter`를 감싸며 `useToast()` 훅을 통해 하트/알림 메시지를 출력.
- 전역 `LoginPromptProvider` / `useLoginPrompt()`가 보호된 CTA에 통합되어 confirm 기반 UX를 대체한다.
- Favorites/Review 등 보호된 액션은 `useAuthStore().isAuthenticated`를 확인하고, 비로그인 시 로그인 확인 다이얼로그(추후 Bottom Sheet)로 유도한다.
- 헤더, 셀러/관리자 레이아웃 상단 모두 `로그아웃` 버튼을 제공하며 클릭 시 홈으로 이동한다.

## ✅ Next Steps
1. Implement image upload in `ReviewWritePage`.
2. Fix popup status logic (KST).
3. Improve MyPage guest experience.
4. Optimize layout scrolling (white space fix).
5. Implement Search Auto-complete.
