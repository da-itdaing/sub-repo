# Frontend 개발 계획서

## 📋 프로젝트 개요

**프로젝트명**: Itdaing (잇다잉) - 팝업스토어 추천 플랫폼  
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
- ✅ 대시보드 (`/seller/dashboard`)
  - 통계 및 차트
  - 내 팝업 목록
- ✅ 팝업 관리 (`/seller/popup-management`)
  - 팝업 등록/수정/삭제
  - 지도 연동 (Kakao Map API - 준비 중)
- ✅ 일정 관리 (`/seller/schedule`)
- ✅ 메시지 (`/seller/messages`)
- ✅ 리뷰 관리 (`/seller/review-management`)
- ✅ 공지사항 (`/seller/notices`)

### 5. 관리자(Admin) 대시보드
- ✅ 관리자 전용 레이아웃 (`AdminAppLayout`)
- ✅ 대시보드 (`/admin/dashboard`)
  - 시스템 통계
  - 승인 대기 목록
- ✅ 존(Zone) 관리 (`/admin/zone-management`)
  - 존(Zone) 생성/수정/삭제
  - 셀(Cell) 관리
  - Kakao Map API 연동 (준비 중)
- ✅ 승인 관리 (`/admin/approvals`)
- ✅ 사용자 관리 (`/admin/user-management`)
- ✅ 메시지 (`/admin/messages`)
- ✅ 로그 (`/admin/logs`)
- ✅ 공지사항 (`/admin/notices`)

### 6. 공통 컴포넌트
- ✅ Header (네비게이션 바)
- ✅ Footer
- ✅ Layout (소비자용)
- ✅ 로딩 스피너
- ✅ 에러 처리
- ✅ 검색 기능

### 7. API 연동
- ✅ `authService` - 인증 API 연동
- ✅ `mockDataService` - Mock 데이터 로딩 (JSON 파일)
- ✅ `masterService` - 마스터 데이터 API (`/api/master/**`)
- ✅ `usePopups` Hook - 팝업 데이터 조회
- ✅ API 우선순위: Backend API → Mock JSON 파일

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

### 1. 로그인 리다이렉트 이슈
- **문제**: 로그인 성공 후 리다이렉트가 제대로 동작하지 않음
- **원인 분석 필요**: `authService.getMyProfile()` 호출 및 `navigate` 실행 확인
- **예상 해결**: 네트워크/콘솔 로그 확인 후 상태 관리 로직 수정

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

### 1. Kakao Map API 통합 (우선순위: 높음)
- [ ] `react-kakao-maps-sdk` 패키지 설치 및 설정
- [ ] Kakao Map API 키 환경 변수 설정
- [ ] 관리자 페이지: Zone/Cell 그리기 기능 구현
  - [ ] DrawingManager 연동
  - [ ] Polygon 그리기 (Zone)
  - [ ] Marker/Polygon 그리기 (Cell)
  - [ ] GeoJSON 저장/로드
- [ ] 판매자 페이지: Zone/Cell 선택 기능 구현
  - [ ] 지도에서 Zone/Cell 표시
  - [ ] 셀 선택 UI
- [ ] 소비자 페이지: 팝업 위치 표시
  - [ ] 팝업 상세 페이지에 지도 표시
  - [ ] 주변 탐색 페이지 지도 연동

### 2. 사용자 흐름 테스트 및 개선 (우선순위: 높음)
- [ ] 소비자 샘플 계정으로 전체 플로우 테스트
  - 샘플 계정: `consumer1` / `pass!1234`
  - 로그인 → 메인 → 팝업 상세 → 마이페이지 → 리뷰 작성
- [ ] 판매자 샘플 계정으로 전체 플로우 테스트
  - 샘플 계정: `seller1` / `pass!1234`
  - 로그인 → 대시보드 → 팝업 등록 → 메시지 → 리뷰 관리
- [ ] 관리자 샘플 계정으로 전체 플로우 테스트
  - 샘플 계정: `admin1` / `pass!1234`
  - 로그인 → 대시보드 → Zone 관리 → 승인 관리 → 사용자 관리
- [ ] 각 역할별 UX 개선
  - 로딩 상태 개선
  - 에러 메시지 개선
  - 빈 상태(Empty State) UI 추가

### 3. API 연동 완성 (우선순위: 중간)
- [ ] 모든 Mock 데이터를 Backend API로 전환
- [ ] 에러 핸들링 강화
  - 네트워크 에러 처리
  - 인증 만료 처리
  - 재시도 로직
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

1. **로그인 리다이렉트 문제**
   - 로그인 성공 후 메인 페이지로 리다이렉트되지 않음
   - 상태: 조사 중

2. **Kakao Map API 미연동**
   - 관리자/판매자 페이지에서 지도 기능 미구현
   - 상태: API 키 대기 중

3. **에러 바운더리 미구현**
   - 전역 에러 핸들링 부족
   - 상태: 개선 필요

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

### Phase 2: API 연동 및 Kakao Map (진행 중)
- 🚧 Backend API 완전 연동
- 🚧 Kakao Map API 통합
- ⏳ 사용자 흐름 테스트

### Phase 3: 최적화 및 배포 준비 (예정)
- ⏳ 성능 최적화
- ⏳ 테스트 작성
- ⏳ 배포 설정

---

**최종 업데이트**: 2025-01-27

