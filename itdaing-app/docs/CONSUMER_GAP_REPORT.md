# Consumer Gap Report

> Audit reference for `/home/ubuntu/itdaing-app/src` (React 19) against the UX/contract expectations documented in `CUSTOMER_FOUNDATION.md` and `CUSTOMER_GUIDE.md`.

_Last updated: 2025-11-24 (Completed Core Features)_

---

## 1. Signup Flow (`src/pages/SignupStep1.jsx`, `src/pages/SignupStep2.jsx`)
- ✅ Uses `useMasterData()` to hydrate categories/styles/regions/features.
- ✅ Region chips/logic now enforce **1~2개** 선택 + 가이드 문구 업데이트 (광주 5개구 자동 필터링).
- ✅ Age group 선택 UI 추가, 제출 시 지정된 값을 payload에 전달.
- ✅ Step header/이전·홈 이동/가입 취소 버튼 추가, Progress UI `SignupStepHeader`로 통일.
- ⚠️ No persisted state for selections if user navigates away (only Step1 stored). Consider saving Step2 progress to localStorage or Zustand to avoid loss.

## 2. Home / EventSection (`src/pages/HomePage.jsx`, `src/components/popup/EventSection.jsx`)
- ✅ Layout matches App Shell requirement (max width, hero + banner + sections).
- ✅ Region filter chips now hydrate from master 데이터 (광주 5개구) via `useMasterData()`. Desktop 4열/모바일 스크롤, 최대 20개 제한 적용.
- ✅ Section 데이터는 더 이상 12개로 잘리지 않고 EventSection 내부 `MAX_ITEMS(20)` 로직을 그대로 활용.
- ⚠️ Ended popups appearing in recommendations/sections. Need strict KST-based filtering.
- ⚠️ No loading skeleton for EventSection; entire blocks pop in after fetch.

## 3. Nearby Explore (`src/pages/NearbyExplorePage.jsx`)
- ✅ Map rendered above filters/cards with responsive height.
- ✅ Region 필터를 `useMasterData()`에서 받아 일관성 유지, 선택시 지도 중심/카드 하이라이트 동기화.
- ✅ Map marker click syncs selection + scrolls 카드 리스트 가운데로 이동.
- ⚠️ Mobile card view should strictly use horizontal scroll (currently mixed or needs verification).

## 4. Favorites / Wishlist
- ✅ `EventCard.jsx` + `HeroCarousel.jsx` + `PopupDetailPage.jsx` 모두 `wishlistService` 연동 및 `LoginPromptProvider` 기반 가드를 사용.
- ✅ **Backend Sync**: `WishlistService`가 `PopupSummaryResponse`에 `isFavorite`, `thumbnail`, `favoriteCount`를 올바르게 매핑하여 반환.
- ✅ `MyPage` 관심 탭 및 `/mypage/favorites` 페이지가 `/wishlist` API 데이터를 그대로 표출하여 실제 즐겨찾기 목록 확인 가능.
- ✅ 소비자/판매자/관리자 헤더 모두 즉시 로그아웃 동선 제공 (`Header`, `SellerLayout`, `AdminLayout`), 로그아웃 시 홈으로 이동.

## 5. Reviews
- ✅ `PopupDetailPage.jsx`에 “후기 작성하기” CTA와 로그인 가드 추가, ReviewWritePage로 이동.
- ✅ `ReviewWritePage.jsx` 신설: 평점/내용/이미지 입력 후 `createReview` API 연동, 성공 시 상세 페이지로 리다이렉션.
- ✅ **Image Upload**: `ImageUploader`가 `{ url, key }` 객체를 처리하도록 수정되고, S3 업로드 및 리뷰 첨부가 정상 작동함.
- ✅ 내 후기 페이지 (`/mypage/reviews`) 신설 및 빈 상태(Empty State) UI 구현.
- ⚠️ 리뷰 수정/삭제, 작성 후 캐시 무효화/리스트 자동 갱신, 후기 신고 등 고급 기능은 미구현.

## 6. MyPage & Settings
- ✅ 마이페이지 탭 구조(추천·관심·후기·일정) 완성 및 통계 카드 연동.
- ✅ **Schedule/Calendar**: `CalendarSection` 컴포넌트 추가, 관심 팝업의 일정(시작~종료)을 캘린더에 점으로 표시하고 날짜 클릭 시 해당 팝업 리스트 노출.
- ✅ **Settings**: `/mypage/settings` 페이지 신설, 프로필 이미지 변경 및 로그아웃 기능 제공.
- ✅ Guest View: 비로그인 시 마이페이지 접근 시 로그인 유도 UI 표시 (Redirect 대신).

## 7. Auth Store & Guards (`src/store/authStore.js`, 전역 모달, CTA)
- ✅ `setUser` guards/isAuthenticated` 이미 보완(무한 루프 fix).
- ✅ 헤더/대시보드 레이아웃에 로그아웃 액션 배치.
- ✅ 전역 로그인 모달(`LoginPromptProvider`) + `useLoginPrompt()` 훅 도입.
- ⚠️ 모달 디자인/애니메이션 고도화 필요.

## 8. Search & Maps
- ⚠️ Search bar in Header lacks auto-complete suggestions. Only supports enter-to-search.
- ⚠️ Kakao Map triggers "passive event listener" violation. Needs optimization.

## 9. Documentation Coverage (`/docs`)
- ✅ `CUSTOMER_FOUNDATION.md`, `CUSTOMER_GUIDE.md`, `CONSUMER_DOC_TODO.md` 생성 및 업데이트.
- ✅ `DB_SCHEMA.md`: 백엔드 DB 스키마 완전 문서화 완료.
- ✅ 기능 배포 시마다 본 Gap Report/가이드/TODO에 진행 상황을 갱신 중.

---

### Next Priorities
1. Fix Popup Filtering (exclude ended) & Mobile Layouts.
2. Enhance Search (Suggestions) & Login Page UI.
3. Fix Map violation & Improve Modal Animations.
