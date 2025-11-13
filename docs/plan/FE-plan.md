# Frontend 개발 계획서

## 📋 프로젝트 개요

**프로젝트명**: Itdaing (잇다잉) - 광주광역시 플리마켓 플랫폼  
**프론트엔드 기술 스택**: React 18.3.1 + TypeScript + Vite 6.3.5  
**UI 프레임워크**: Radix UI + Tailwind CSS  
**상태 관리**: React Context API (AuthContext, UserContext)  
**라우팅**: React Router v6  
**API 통신**: Axios  

---

## ✅ 완료된 작업

### 1. 프로젝트 구조 및 설정
- ✅ Vite 기반 React + TypeScript 프로젝트 설정
- ✅ Tailwind CSS 및 Radix UI 컴포넌트 라이브러리 통합
- ✅ 커스텀 폰트 설정 (Pretendard, Black Han Sans, Luckiest Guy, Jeju Gothic)
- ✅ 환경 변수 관리 (.env.example)

### 2. 인증 및 사용자 관리
- ✅ JWT 기반 인증 시스템 구현
- ✅ 로그인 페이지 (`/login`) - `loginId` 기반 인증
- ✅ 회원가입 플로우 (`/signup/1`, `/signup/2`)
  - 소비자/판매자 역할 선택
  - 선호 정보 입력 (카테고리, 스타일, 지역, 편의시설)
- ✅ `AuthContext` - 인증 상태 관리
- ✅ `UserContext` - 사용자 프로필 관리
- ✅ Protected Route 구현
- ✅ 로그인 확인 다이얼로그 (비로그인 사용자 안내)

### 3. 소비자(Consumer) 기능
- ✅ 메인 페이지 (`/`)
  - 히어로 캐러셀 (인기 팝업)
  - 이벤트 섹션 (오픈 예정, 지역별, 커뮤니티)
  - 관심 팝업 하트 기능
- ✅ 팝업 상세 페이지 (`/popup/:id`)
  - 팝업 정보 표시
  - 판매자 정보 연동
  - 리뷰 목록 및 작성
  - 관심 팝업 추가/제거
- ✅ 마이페이지 (`/mypage`) - Protected Route
  - 맞춤 추천 탭
  - 관심 팝업 탭
  - 내 후기 탭
  - 일정 탭
- ✅ 주변 탐색 페이지 (`/nearby`)
- ✅ 추천 모달 (소비자 로그인 시 표시)

### 4. 판매자(Seller) 대시보드
- ✅ 판매자 전용 레이아웃 (`SellerAppLayout`)
  - 헤더: 로고 "DA - IT DAING", 사용자 정보, 메시지 아이콘, 프로필 아이콘
  - 사이드바: 대시보드, 팝업 관리, 일정, 메시지, 리뷰 관리, 공지사항, 로그아웃
- ✅ 대시보드 (`/seller/dashboard`) - 참고 이미지 기반 목업 구현 완료
  - 승인 현황 카드 3개 (승인 완료, 승인 대기, 승인 반려)
  - 팝업 현황 카드 3개 (진행 중, 예정 중, 종료)
  - 조회수 차트 (1일 조회수, 총 조회수)
  - 팝업 관리 테이블 (팝업명, 운영 상태, 등록 일시, 운영 기간, 승인 상태, 반려 사유)
  - 페이지네이션 및 필터링 지원
- ✅ 팝업 관리 (`/seller/popup-management`)
  - 팝업 조회: 백엔드 API 연동 완료 ✅ (GET `/api/sellers/me/popups`)
  - 팝업 삭제: 백엔드 API 연동 완료 ✅ (`popupService.deletePopup()`)
  - 팝업 등록/수정: 백엔드 API 및 서비스 준비 완료, UI 폼 연동 완료 ✅
  - 이미지 업로드: 썸네일/갤러리 이미지 업로드 통합 완료 ✅
  - 지도 연동 (Kakao Map API - 준비 중)
- ✅ 일정 관리 (`/seller/schedule`)
- ✅ 메시지 (`/seller/messages`) - 백엔드 API 연동 완료 ✅
  - 스레드 목록 표시
  - 스레드 상세 및 메시지 목록
  - 새 메시지 작성
  - 답장 전송
- ✅ 리뷰 관리 (`/seller/review-management`)
- ✅ 공지사항 (`/seller/notices`)

### 5. 관리자(Admin) 대시보드
- ✅ 관리자 전용 레이아웃 (`AdminAppLayout`)
  - 헤더: 로고 "DA - IT DAING", 사용자 정보 "관리자 님", 메시지 아이콘, 프로필 아이콘
  - 사이드바: 대시보드, 검수 관리, 구역 관리, 사용자 관리, 메시지, 로그, 공지사항, 로그아웃
- ✅ 대시보드 (`/admin/dashboard`) - 참고 이미지 기반 목업 구현 완료
  - 승인 현황 카드 3개 (승인 완료, 승인 대기, 승인 반려)
  - 구역 관리 카드 (구역 선택 드롭다운, Kakao Map 지도 통합)
  - 검수 관리 테이블 (No., 팝업 명, 사용자 이름, 카테고리, 구역, 신청 일자, 승인 여부)
  - 페이지네이션 지원
- ✅ 존(Zone) 관리 (`/admin/zone-management`)
  - 존(Zone) 생성/수정/삭제
  - 셀(Cell) 관리
  - Kakao Map API 연동 (준비 중)
- ✅ 승인 관리 (`/admin/approvals`)
- ✅ 사용자 관리 (`/admin/user-management`)
- ✅ 메시지 (`/admin/messages`) - 백엔드 API 연동 완료 ✅
  - 스레드 목록 표시
  - 스레드 상세 및 메시지 목록
  - 답장 전송
- ✅ 로그 (`/admin/logs`)
- ✅ 공지사항 (`/admin/notices`)

### 6. 공통 컴포넌트
- ✅ Header (네비게이션 바)
- ✅ Footer
- ✅ Layout (소비자용)
- ✅ 로딩 스피너
- ✅ 에러 처리
- ✅ 검색 기능 ✅ 완료
  - 검색 페이지 (`/search`) 구현 완료
  - 키워드, 지역, 카테고리, 날짜 범위, 승인 상태 필터링 지원
  - 페이지네이션 지원
  - Header 검색 입력에서 검색 페이지로 이동 기능 통합
- ✅ StatCard (통계 카드 컴포넌트) - 승인 현황, 팝업 현황 등 표시용
- ✅ ViewsChart (조회수 차트 컴포넌트) - Recharts 기반 바 차트
- ✅ DataTable (데이터 테이블 컴포넌트) - 페이지네이션, 필터링 지원
- ✅ ImageUploader (이미지 업로드 컴포넌트) - 드래그 앤 드롭, 미리보기, S3 업로드 지원

### 7. API 연동
- ✅ `authService` - 인증 API 연동 (완료)
  - 로그인 (`POST /api/auth/login`)
  - 소비자 회원가입 (`POST /api/auth/signup/consumer`)
  - 판매자 회원가입 (`POST /api/auth/signup/seller`)
  - 내 프로필 조회 (`GET /api/users/me`)
  - 토큰 재발급 (`POST /api/auth/refresh`)
  - 로그아웃 (`POST /api/auth/logout`)
- ✅ `masterService` - 마스터 데이터 API 연동 (완료)
  - 카테고리 (`GET /api/master/categories`)
  - 스타일 (`GET /api/master/styles`)
  - 지역 (`GET /api/master/regions`)
  - 편의시설 (`GET /api/master/features`)
- ✅ `sellerService` - 판매자 API 연동 (완료)
  - 내 프로필 조회 (`GET /api/sellers/me/profile`)
  - 내 팝업 목록 (`GET /api/sellers/me/popups`)
- ✅ `messageService` - 메시지 시스템 API 연동 (완료)
  - 스레드 생성 (`POST /api/inquiries`)
  - 스레드 목록 조회 (`GET /api/inquiries?role=...`)
  - 스레드 상세 조회 (`GET /api/inquiries/{threadId}`)
  - 답장 전송 (`POST /api/inquiries/{threadId}/reply`)
  - 메시지 삭제 (`DELETE /api/inquiries/messages/{messageId}`)
- ✅ `usePopups` Hook - 팝업 데이터 조회 (백엔드 API 연동 완료)
- ✅ `popupService.searchPopups()` - 팝업 검색 API 연동 완료 (`GET /api/popups/search`)
- ✅ 판매자 데이터 - 백엔드 API 연동 완료 (`GET /api/sellers`, `GET /api/sellers/{id}`)
- ✅ 리뷰 데이터 - 백엔드 API 연동 완료 (`GET /api/popups/{id}/reviews`)
- ✅ `uploadService` - 이미지 업로드 API 연동 완료 (`POST /api/upload`)

### 8. 데이터 관리
- ✅ Mock JSON 파일 구조화
  - `/public/mock/popup/popups.json`
  - `/public/mock/sellers/sellers.json`
  - `/public/mock/users/consumer.json` (10개 페르소나)
  - `/public/mock/admin/zones.json`
  - `/public/mock/common/categories.json`, `regions.json`, `features.json`
  - `/public/mock/messages/threads.json`
  - `/public/mock/reviews/reviews.json`

### 9. 반응형 디자인
- ✅ 모바일 우선 반응형 레이아웃
- ✅ 소비자: PWA 앱 비율 중점
- ✅ 판매자/관리자: 웹 대시보드 비율 중점

---

## 🚧 진행 중인 작업

### 1. API 연동 미완성
- **상태**: 인증 및 마스터 데이터는 백엔드 API 연동 완료
- **미완성**: 팝업, 판매자, 리뷰 데이터는 아직 Mock 데이터 사용 중
- **필요 작업**: `usePopups` Hook 및 관련 컴포넌트를 실제 백엔드 API로 전환

### 2. Kakao Map API 연동 준비
- **상태**: 구조 설계 완료, 실제 API 키 대기 중
- **참고 링크**:
  - https://github.com/JaeSeoKim/react-kakao-maps-sdk
  - https://react-kakao-maps-sdk.jaeseokim.dev/docs/sample/library/basicDrawingLibrary/
- **필요 작업**:
  - `react-kakao-maps-sdk` 패키지 설치
  - 관리자: DrawingManager를 통한 Zone/Cell 그리기
  - 판매자: Zone/Cell 선택 UI
  - 소비자: 팝업 위치 표시

---

## 📝 앞으로 해야 할 작업

### 1. Kakao Map API 통합 (우선순위: 높음) ✅ 완료
- [x] `react-kakao-maps-sdk` 패키지 설치 및 설정 (완료)
- [x] Kakao Map API 키 설정 (완료, JavaScript 키: 56fe886b02a4bd47e47b4ba81b38415d)
- [x] 관리자 페이지: Zone/Cell 그리기 기능 구현 (완료)
  - [x] DrawingManager 연동 (`KakaoMapAreaEditor`)
  - [x] Polygon 그리기 (Area)
  - [x] Marker 표시 (Cell)
  - [x] GeoJSON 저장/로드
- [x] 관리자 페이지: Zone/Cell 선택 기능 구현 (완료)
  - [x] 지도에서 Area/Cell 표시 (`KakaoMapCellSelector`)
  - [x] 셀 선택 UI
  - [x] 구역별 폴리곤 표시
  - [x] Area 생성 후 자동 선택 및 Cells 탭 전환
  - [x] Cell 생성 시 선택된 Area 컨텍스트 유지
- [x] 판매자 페이지: Zone/Cell 선택 기능 구현 (완료)
  - [x] 지도에서 Cell 표시 (`PopupForm`에 `KakaoMapCellSelector` 통합)
  - [x] 셀 선택 UI (팝업 등록 시)
  - [x] 구역별 폴리곤 표시
- [x] 소비자 페이지: 팝업 위치 표시 (완료)
  - [x] 팝업 상세 페이지에 지도 표시 (`PopupDetailPage` 지도 탭)
  - [x] 주변 탐색 페이지 지도 연동 (`NearbyExplorePage`)

### 2. 사용자 흐름 테스트 및 개선 (우선순위: 높음)
- [ ] 소비자 샘플 계정으로 전체 플로우 테스트
  - 샘플 계정: `consumer1` / `pass!1234`
  - 로그인 → 메인 → 팝업 상세 → 마이페이지 → 리뷰 작성
  - **주의**: 팝업/리뷰/판매자 데이터는 백엔드 API 연동 완료, 테스트 가능
- [ ] 판매자 샘플 계정으로 전체 플로우 테스트
  - 샘플 계정: `seller1` / `pass!1234`
  - 로그인 → 대시보드 → 팝업 조회/삭제 (백엔드 API 연동 완료) → 팝업 등록/수정 (서비스 준비 완료, UI 폼 연동 필요) → 메시지 → 리뷰 관리
  - **주의**: 팝업 등록/수정은 서비스 레이어 완료, UI 폼 연동 필요
- [ ] 관리자 샘플 계정으로 전체 플로우 테스트
  - 샘플 계정: `admin1` / `pass!1234`
  - 로그인 → 대시보드 → Zone 관리 → 승인 관리 → 사용자 관리
- [ ] 각 역할별 UX 개선
  - 로딩 상태 개선
  - 에러 메시지 개선
  - 빈 상태(Empty State) UI 추가

### 3. API 연동 완성 (우선순위: 높음)
- [x] 팝업 데이터를 Backend API로 전환 (`/api/popups`)
  - `usePopups` Hook 수정 ✅
  - `PopupDetailPage` 컴포넌트 수정 ✅
  - `popupService.ts` 생성 완료 ✅
- [x] 판매자 팝업 관리 API 연동 (`/api/popups`)
  - 팝업 등록 (`POST /api/popups`) - 백엔드 API 준비 완료, 프론트엔드 서비스 준비 완료
  - 팝업 수정 (`PUT /api/popups/{id}`) - 백엔드 API 준비 완료, 프론트엔드 서비스 준비 완료
  - 팝업 삭제 (`DELETE /api/popups/{id}`) - 백엔드 API 준비 완료, 프론트엔드 서비스 준비 완료
  - `PopupManagementPage` 컴포넌트 API 연동 완료 ✅ (`sellerService.getMyPopups()` 사용)
- [x] 판매자 데이터를 Backend API로 전환 (`/api/sellers`)
  - 판매자 목록 조회 (`GET /api/sellers`) - 백엔드 API 준비 완료, 프론트엔드 연동 완료 ✅
  - 판매자 상세 정보 조회 (`GET /api/sellers/{id}`) - 백엔드 API 준비 완료, 프론트엔드 연동 완료 ✅
  - 판매자 프로필 수정 (`PUT /api/sellers/me/profile`) - 백엔드 API 준비 완료, 프론트엔드 연동 필요
- [x] 리뷰 데이터를 Backend API로 전환 (`/api/popups/{id}/reviews`)
  - 리뷰 목록 조회 ✅ (`reviewService.getReviewsByPopupId()`)
  - 리뷰 작성 (`POST /api/popups/{popupId}/reviews`) - 백엔드 API 준비 완료, 프론트엔드 연동 완료 ✅
  - 리뷰 수정 (`PUT /api/reviews/{id}`) - 백엔드 API 준비 완료, 프론트엔드 서비스 준비 완료
  - 리뷰 삭제 (`DELETE /api/reviews/{id}`) - 백엔드 API 준비 완료, 프론트엔드 서비스 준비 완료
  - `ReviewWritePage` 컴포넌트 API 연동 완료 ✅
  - `reviewService.ts` 생성 완료 ✅
- [ ] 에러 핸들링 강화
  - 네트워크 에러 처리 (일부 구현됨)
  - 인증 만료 처리 (구현됨)
  - 재시도 로직 추가
- [ ] API 응답 캐싱 전략 수립
- [ ] 무한 스크롤 또는 페이지네이션 구현

### 4. 성능 최적화 (우선순위: 중간)
- [ ] 코드 스플리팅 최적화 (이미 Lazy Loading 적용됨)
- [ ] 이미지 최적화 (Lazy Loading, WebP 변환)
- [ ] 번들 크기 분석 및 최적화
- [ ] 메모이제이션 적용 (`useMemo`, `useCallback`)

### 5. PWA 기능 강화 (우선순위: 낮음)
- [ ] Service Worker 업데이트
- [ ] 오프라인 모드 지원
- [ ] 푸시 알림 설정
- [ ] 앱 설치 프롬프트

### 6. 접근성(A11y) 개선 (우선순위: 낮음)
- [ ] 키보드 네비게이션 지원
- [ ] 스크린 리더 지원 (ARIA 라벨)
- [ ] 색상 대비 개선

### 7. 테스트 작성 (우선순위: 낮음)
- [ ] 단위 테스트 (Vitest)
- [ ] 통합 테스트 (React Testing Library)
- [ ] E2E 테스트 (Playwright 또는 Cypress)

---

## 🐛 알려진 이슈

1. **API 연동 완성**
   - ✅ 팝업 데이터: Backend API 연동 완료 (`popupService`, `usePopups` Hook)
   - ✅ 리뷰 데이터: Backend API 연동 완료 (`reviewService`, `ReviewWritePage`)
   - ✅ 판매자 데이터: Backend API 연동 완료 (`sellerService`, `useSellerById`, `useSellers`)
   - ✅ 판매자 내 팝업 목록: Backend API 연동 완료 (`sellerService.getMyPopups()`)
   - 상태: 주요 API 연동 완료, 일부 UI 폼 연동 필요

2. **Kakao Map API 연동** ✅ 완료
   - ✅ 관리자 페이지 지도 기능 구현 완료
     - 구역(Area) 폴리곤 그리기 (`KakaoMapAreaEditor`)
     - 셀(Cell) 위치 선택 및 표시 (`KakaoMapCellSelector`)
     - Area 생성 후 자동 선택 및 Cells 탭 전환
     - Cell 생성 시 선택된 Area 컨텍스트 유지
   - ✅ 판매자 페이지 지도 기능 구현 완료
     - Zone/Cell 선택 UI (`PopupForm`에 통합)
     - 지도에서 관리자가 생성한 Cell 선택
   - ✅ 소비자 페이지 지도 기능 구현 완료
     - 팝업 상세 페이지 지도 탭 (`PopupDetailPage`)
     - 주변 탐색 페이지 지도 연동 (`NearbyExplorePage`)

3. **에러 바운더리 미구현**
   - 전역 에러 핸들링 부족
   - 상태: 개선 필요

4. **팝업 등록/수정 UI 연동 필요**
   - ✅ 팝업 조회: Backend API 연동 완료
   - ✅ 팝업 삭제: Backend API 연동 완료 (`popupService.deletePopup()`)
   - ⚠️ 팝업 등록/수정 UI: 백엔드 API 및 서비스 준비 완료, UI 폼 연동 필요
   - 백엔드 API 준비 완료: `POST /api/popups`, `PUT /api/popups/{id}`, `DELETE /api/popups/{id}`
   - 상태: 서비스 레이어 완료, UI 폼 연동 필요

5. **프론트엔드 로그인 폼 이슈** ✅ 해결됨 (2025-01-13)
   - ✅ 브라우저에서 로그인 시도 시 빈 값 전송 문제 해결
   - 해결 방법: form 태그로 감싸고 onSubmit 핸들러 사용, 클라이언트 사이드 검증 추가
   - 상태: 해결 완료, 브라우저에서 정상 로그인 가능

---

## 📦 의존성 패키지

### 주요 의존성
- `react`: ^18.3.1
- `react-dom`: ^18.3.1
- `react-router-dom`: ^6.28.0
- `axios`: ^1.7.9
- `typescript`: ^5.9.3
- `vite`: 6.3.5

### UI 라이브러리
- `@radix-ui/*`: 다양한 UI 컴포넌트
- `tailwindcss`: 스타일링
- `lucide-react`: 아이콘
- `embla-carousel-react`: 캐러셀

### 추가 필요 패키지
- `react-kakao-maps-sdk`: Kakao Map API 연동 (설치 예정)

---

## 🔗 참고 링크

- [React Kakao Maps SDK](https://github.com/JaeSeoKim/react-kakao-maps-sdk)
- [Kakao Maps SDK 문서](https://react-kakao-maps-sdk.jaeseokim.dev/docs/sample/library/basicDrawingLibrary/)
- [Radix UI 문서](https://www.radix-ui.com/)
- [Tailwind CSS 문서](https://tailwindcss.com/)

---

## 📅 마일스톤

### Phase 1: 기본 기능 완성 (완료)
- ✅ 인증 시스템
- ✅ 소비자/판매자/관리자 페이지 구조
- ✅ Mock 데이터 연동

### Phase 2: API 연동 및 Kakao Map (완료)
- ✅ 인증 API 연동 완료
- ✅ 마스터 데이터 API 연동 완료
- ✅ 팝업 데이터 API 연동 완료 (조회, 등록, 수정, 삭제)
- ✅ 리뷰 데이터 API 연동 완료 (조회, 작성, 수정, 삭제)
- ✅ 판매자 내 팝업 목록 API 연동 완료
- ✅ 판매자 목록/상세 API 연동 완료
- ✅ 팝업 등록/수정 UI 폼 연동 완료
- ✅ 리뷰 수정/삭제 UI 연동 완료
- ✅ Kakao Map API 통합 완료 (관리자/판매자/소비자)
- ✅ 지역 관리 API 연동 완료 (`geoService`)
- ✅ 승인 관리 API 연동 완료 (`approvalService`)

### Phase 3: 최적화 및 배포 준비 (예정)
- ⏳ 성능 최적화
- ⏳ 테스트 작성
- ⏳ 배포 설정

---

**최종 업데이트**: 2025-11-13 (검색 기능 완료, 이미지 업로드 완료, 메시지 시스템 완료, DB 스크립트 통합 완료)

## ✅ API 연결 검증 완료

**테스트 일시**: 2025-01-27  
**테스트 방법**: Vite 프록시를 통한 실제 API 호출 테스트

### 검증된 연결
- ✅ Vite 개발 서버 프록시 설정 확인 (`/api` → `http://localhost:8080`)
- ✅ 팝업 API 연결 테스트 완료 (`GET /api/popups`)
- ✅ 판매자 API 연결 테스트 완료 (`GET /api/sellers`)
- ✅ 마스터 데이터 API 연결 테스트 완료 (`GET /api/master/categories`)
- ✅ 리뷰 API 연결 테스트 완료 (`GET /api/popups/reviews`)
- ✅ Axios 인터셉터 설정 확인 (JWT 토큰 자동 추가)
- ✅ 에러 핸들링 설정 확인 (401 처리)

**결과**: 모든 주요 API 엔드포인트가 프론트엔드에서 백엔드로 정상적으로 연결됨을 확인

### 실제 테스트 결과
- ✅ 백엔드 서버: 포트 8080에서 실행 중 (Health Check: UP)
- ✅ 프론트엔드 서버: 포트 5173에서 실행 중 (Vite dev server)
- ✅ 프록시 테스트: `/api/popups`, `/api/sellers`, `/api/master/categories`, `/api/popups/reviews` 모두 성공
- ✅ API 응답 형식: 모든 엔드포인트가 `{success: true, data: ...}` 형식으로 정상 응답
- ✅ 코드 구현: 모든 서비스 레이어 메서드 구현 완료 및 검증됨

---

## 📊 API 연동 현황

### 완료된 API 연동
- ✅ 인증: 로그인, 회원가입, 프로필 조회, 토큰 재발급, 로그아웃
- ✅ 마스터 데이터: 카테고리, 스타일, 지역, 편의시설
- ✅ 판매자: 내 프로필 조회, 내 팝업 목록 조회, 목록 조회, 상세 조회 (`sellerService`)
- ✅ 팝업: 목록 조회, 상세 조회 (`popupService.getPopups()`, `popupService.getPopupById()`)
- ✅ 리뷰: 목록 조회, 작성, 수정, 삭제 (`reviewService` 모든 메서드)
- ✅ 팝업 관리: 등록, 수정, 삭제 (`popupService` 모든 메서드)
- ✅ 판매자 프로필: 조회, 수정 (`sellerService.getMyProfile()`, `sellerService.updateProfile()`)
- ✅ 에러 핸들링: 에러 바운더리 구현, 네트워크 에러 처리 개선, 재시도 로직 추가
- ✅ 지역 관리: 구역/존/셀 CRUD 서비스 레이어 (`geoService` 모든 메서드)
- ✅ 승인 관리: 승인 대기 목록, 승인/거부 처리 (`approvalService` 모든 메서드)
- ✅ 승인 관리 UI: 승인 대기 목록 및 승인/거부 처리 UI (`Approvals.tsx`)

### 백엔드 API 준비 완료 (프론트엔드 서비스 레이어 완료, UI 폼 연동 필요)
- ✅ 팝업 등록 (`POST /api/popups`) - 백엔드 구현 완료, 프론트엔드 UI 연동 완료 ✅
- ✅ 팝업 수정 (`PUT /api/popups/{id}`) - 백엔드 구현 완료, 프론트엔드 UI 연동 완료 ✅
- ✅ 리뷰 수정 (`PUT /api/reviews/{id}`) - 백엔드 구현 완료, 프론트엔드 UI 연동 완료 ✅
- ✅ 리뷰 삭제 (`DELETE /api/reviews/{id}`) - 백엔드 구현 완료, 프론트엔드 UI 연동 완료 ✅

### Mock 데이터 사용 중 (백엔드 API 전환 필요)
- (없음 - 모든 주요 API 연동 완료)

### 백엔드 API 미구현 (프론트엔드 대기 중)
- (없음)

## 📝 다음 단계 (Next Steps)

### 우선순위 높음
1. **UI 폼 연동** (서비스 레이어 완료)
   - ✅ 팝업 등록 폼 완료 (`popupService.createPopup()` 사용)
     - `PopupForm` 컴포넌트 생성
     - `PopupManagement` 페이지에 통합
   - ✅ 팝업 수정 폼 완료 (`popupService.updatePopup()` 사용)
     - `PopupForm` 컴포넌트에서 수정 모드 지원
     - 팝업 카드에 수정 버튼 추가
   - ✅ 리뷰 수정/삭제 UI 완료 (`reviewService.updateReview()`, `reviewService.deleteReview()` 사용)
     - `PopupDetailPage`에 리뷰 수정/삭제 버튼 추가
     - `ReviewWritePage`에 수정 모드 지원 추가
   - ✅ 판매자 프로필 수정 폼 완료 (`PUT /api/sellers/me/profile`)
     - `SellerProfileForm` 컴포넌트 생성
     - `SellerDashboard`에 프로필 수정 버튼 추가

2. **Kakao Map API 통합**
   - 관리자/판매자 페이지에서 지도 기능 구현
   - 셀 선택 기능 구현

3. **에러 핸들링 강화**
   - ✅ 에러 바운더리 구현 완료 (`ErrorBoundary` 컴포넌트)
   - ✅ 네트워크 에러 처리 개선 완료
     - API 응답 인터셉터에 네트워크 에러 감지 추가
     - 에러 응답 형식 정규화
   - ✅ 재시도 로직 추가 완료
     - `retryRequest` 헬퍼 함수 구현
     - `apiRequestWithRetry` 래퍼 함수 제공
     - 401, 403, 404 등 재시도 불가능한 에러는 즉시 반환

### 우선순위 중간
1. **성능 최적화**
   - API 응답 캐싱 전략 수립
   - 무한 스크롤 또는 페이지네이션 구현
   - 이미지 최적화

2. **사용자 경험 개선**
   - 로딩 상태 개선
   - 에러 메시지 개선
   - 빈 상태(Empty State) UI 추가

