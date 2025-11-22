# Seller 대시보드 가이드

## 📋 개요

판매자(Seller) 전용 대시보드가 구현되었습니다. seller 계정으로 로그인하면 자동으로 seller 전용 페이지로 이동합니다.

## 🎯 구현된 기능

### 1. 판매자 대시보드 (`/seller/dashboard`)
- **통계 카드**:
  - 전체 팝업 수
  - 진행 중인 팝업 수
  - 승인 대기 팝업 수
  - 총 조회수
- **주간 통계**:
  - 조회수, 찜, 평균 평점
  - 기간 선택 가능 (오늘/이번 주/이번 달)
- **최근 팝업 목록**:
  - 팝업명, 상태, 승인 상태, 기간, 조회수, 찜 수
- **빠른 액션**:
  - 새 팝업 등록
  - 팝업 관리
  - 내 정보

### 2. 팝업 관리 (`/seller/popups`)
- **검색 및 필터**:
  - 팝업명으로 검색
  - 운영 상태 필터 (전체/진행 중/오픈 예정/종료)
  - 승인 상태 필터 (전체/완료/대기/반려)
- **팝업 목록**:
  - 상세 정보 표시 (제목, 기간, 위치, 통계)
  - 반려 사유 표시
  - 편집/삭제 액션
- **상태 배지**:
  - 진행 중: 초록색
  - 오픈 예정: 파란색
  - 종료: 회색
  - 승인 완료: 초록색
  - 승인 대기: 노란색
  - 승인 반려: 빨간색

### 3. 새 팝업 등록 (`/seller/popups/create`)
- **기본 정보**:
  - 팝업명
  - 카테고리 (패션/뷰티/푸드/엔터테인먼트/아트/테크)
  - 설명
- **운영 정보**:
  - 시작일/종료일
  - 운영 시간
  - 연락처
- **위치 정보**:
  - 주소
  - 상세 주소
- **이미지**:
  - 썸네일 이미지 (필수)
  - 추가 이미지 (최대 5개)

### 4. 판매자 프로필 (`/seller/profile`)
- **기본 정보**:
  - 이름, 이메일, 연락처
- **사업자 정보**:
  - 상호명, 사업자 등록번호, 사업장 주소
- **소개**:
  - 판매자 소개 텍스트
- **계정 설정**:
  - 비밀번호 변경
  - 회원 탈퇴

## 🚀 사용 방법

### 1. Seller 계정으로 로그인

```
URL: http://localhost:3000/login

1. 로그인 페이지에서 "판매자" 탭 선택
2. seller 계정 정보 입력:
   - 로그인 ID: seller (또는 백엔드에서 생성한 seller 계정)
   - 비밀번호: (백엔드에서 설정한 비밀번호)
3. 로그인 버튼 클릭
```

### 2. 자동 리다이렉션

로그인 성공 시 사용자 역할(role)에 따라 자동으로 페이지 이동:
- **SELLER**: `/seller/dashboard` (판매자 대시보드)
- **CONSUMER**: `/` (메인 페이지)
- **ADMIN**: `/admin/dashboard` (관리자 대시보드, 추후 구현)

### 3. 페이지 네비게이션

각 페이지 상단에 "← 대시보드로 돌아가기" 링크가 있어 쉽게 이동 가능합니다.

## 📁 파일 구조

```
src/
├── pages/
│   └── seller/
│       ├── SellerDashboardPage.jsx    # 대시보드
│       ├── SellerPopupsPage.jsx       # 팝업 관리
│       ├── SellerProfilePage.jsx      # 프로필
│       └── SellerPopupCreatePage.jsx  # 팝업 등록
├── routes/
│   ├── paths.js                       # 라우트 경로 상수
│   └── index.jsx                      # 라우터 설정
└── services/
    └── authService.js                 # 인증 API (로그인 시 role 확인)
```

## 🔐 권한 관리

### ProtectedRoute

모든 seller 페이지는 `ProtectedRoute`로 보호됩니다:
- 로그인하지 않은 사용자는 로그인 페이지로 리다이렉트
- 로그인한 사용자만 접근 가능

### Role 기반 접근 제어 (추후 구현 예정)

현재는 로그인한 모든 사용자가 seller 페이지에 접근할 수 있습니다.
추후 `ProtectedRoute`를 개선하여 SELLER role을 가진 사용자만 접근하도록 할 수 있습니다:

```jsx
// ProtectedRoute.jsx (개선 예시)
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to={ROUTES.home} replace />;
  }

  return children;
};
```

## 📊 데이터 구조

### 현재 상태 (하드코딩)

개발 단계에서는 페이지에 하드코딩된 샘플 데이터를 사용합니다:

```javascript
const dashboardStats = {
  totalPopups: 5,
  activePopups: 2,
  pendingApproval: 1,
  totalViews: 490,
  totalFavorites: 87,
  weeklyViews: 185,
};

const recentPopups = [
  {
    id: 1,
    title: '여울원 팝업 IN 광주',
    status: '진행 중',
    approvalStatus: '완료',
    // ...
  },
  // ...
];
```

### TODO: API 연동

각 파일의 TODO 주석을 확인하여 실제 API와 연동해야 합니다:

```javascript
// TODO: API에서 실제 데이터 가져오기
const { data: dashboardStats, isLoading, error } = useDashboardStats();
const { data: popups } = useSellerPopups();
```

## 🎨 스타일링

### Tailwind CSS 사용

모든 컴포넌트는 Tailwind CSS를 사용하여 스타일링되었습니다:
- 반응형 디자인 (mobile-first)
- 일관된 색상 팔레트
- Primary Color: `#eb0000`

### 아이콘

`lucide-react` 라이브러리 사용:
- `Package`, `CheckCircle`, `Clock`, `Eye`, `Heart` 등

### 상태 색상

- 초록색 (`green-*`): 진행 중, 승인 완료
- 파란색 (`blue-*`): 오픈 예정, 정보
- 노란색 (`yellow-*`): 승인 대기
- 빨간색 (`red-*`): 승인 반려, 삭제

## 🔄 백엔드 연동 체크리스트

### 1. 인증 API
- [x] 로그인 API (`/api/auth/login`)
- [x] 프로필 조회 API (`/api/users/me`)
- [x] 로그인 시 role 확인 (`SELLER`, `CONSUMER`, `ADMIN`)

### 2. Seller Dashboard API (구현 필요)
- [ ] 대시보드 통계 조회 (`/api/seller/dashboard/stats`)
- [ ] 최근 팝업 목록 조회 (`/api/seller/popups?limit=5`)

### 3. Seller Popup Management API (구현 필요)
- [ ] 팝업 목록 조회 (`/api/seller/popups`)
- [ ] 팝업 상세 조회 (`/api/seller/popups/:id`)
- [ ] 팝업 등록 (`POST /api/seller/popups`)
- [ ] 팝업 수정 (`PUT /api/seller/popups/:id`)
- [ ] 팝업 삭제 (`DELETE /api/seller/popups/:id`)

### 4. Seller Profile API (구현 필요)
- [ ] 판매자 프로필 조회 (`/api/seller/profile`)
- [ ] 판매자 프로필 수정 (`PUT /api/seller/profile`)

## 🧪 테스트 시나리오

### 1. 로그인 테스트
1. seller 계정으로 로그인
2. seller 대시보드로 자동 이동 확인
3. 통계 데이터 표시 확인

### 2. 네비게이션 테스트
1. "새 팝업 등록" 버튼 클릭 → 팝업 등록 페이지 이동
2. "팝업 관리" 클릭 → 팝업 목록 페이지 이동
3. "내 정보" 클릭 → 프로필 페이지 이동
4. "← 대시보드로 돌아가기" → 대시보드 이동

### 3. 팝업 관리 테스트
1. 검색 기능 테스트 (팝업명으로 검색)
2. 필터 기능 테스트 (상태, 승인 상태)
3. 팝업 정보 표시 확인

### 4. 팝업 등록 테스트
1. 필수 필드 검증 (*)
2. 이미지 업로드 UI
3. 폼 제출 (현재는 alert 표시)

### 5. 프로필 관리 테스트
1. 프로필 정보 표시
2. 폼 수정
3. 저장 버튼 (현재는 alert 표시)

## 🐛 알려진 이슈

### 1. 하드코딩된 데이터
- **현상**: 샘플 데이터가 하드코딩되어 있음
- **해결**: 백엔드 API와 연동 필요

### 2. 파일 업로드 미구현
- **현상**: 이미지 업로드 UI만 있고 실제 업로드는 미구현
- **해결**: 백엔드 파일 업로드 API와 연동 필요

### 3. 편집/삭제 기능 미구현
- **현상**: 버튼만 있고 실제 기능은 미구현
- **해결**: 백엔드 API와 연동 필요

## 📝 다음 단계

### 우선순위 1: API 연동
1. Seller Dashboard API 구현 및 연동
2. Seller Popup Management API 구현 및 연동
3. React Query 훅 생성 (`useSellerDashboard`, `useSellerPopups`)

### 우선순위 2: 기능 완성
1. 팝업 편집 기능 구현
2. 팝업 삭제 기능 구현
3. 파일 업로드 기능 구현

### 우선순위 3: UX 개선
1. Loading Skeleton 추가
2. Toast 알림 시스템 추가
3. 에러 처리 개선

## 🎉 완료!

seller 계정으로 로그인하여 대시보드를 확인하세요:
```
http://localhost:3000/login
```

문의사항이 있으면 언제든지 문의해주세요!

