# Itdaing Web - 라우팅 구조 문서

## 개요

이 문서는 Itdaing 웹 애플리케이션의 페이지 라우팅 구조와 백엔드 API 연동 방식을 설명합니다.

## 라우팅 구조

### 공개 라우트 (인증 불필요)

| 경로 | 컴포넌트 | 설명 |
|------|----------|------|
| `/` | `MainPage` | 메인 페이지 (팝업스토어 목록) |
| `/login` | `LoginPage` | 로그인 페이지 |
| `/signup/consumer` | `SignupConsumerPage` | 소비자 회원가입 페이지 |
| `/signup/seller` | `SignupSellerPage` | 판매자 회원가입 페이지 |
| `/popups/:id` | `PopupDetailPage` | 팝업스토어 상세 페이지 |
| `/nearby` | `NearbyExplorePage` | 주변 탐색 페이지 |

### 보호된 라우트 (인증 필요)

| 경로 | 컴포넌트 | 권한 | 설명 |
|------|----------|------|------|
| `/mypage` | `MyPage` | CONSUMER | 마이페이지 |
| `/seller/dashboard` | `SellerDashboardPage` | SELLER | 판매자 대시보드 |

## 파일 구조

```
src/
├── pages/              # 페이지 컴포넌트
│   ├── MainPage.tsx
│   ├── LoginPage.tsx
│   ├── SignupConsumerPage.tsx
│   ├── SignupSellerPage.tsx
│   ├── PopupDetailPage.tsx
│   ├── MyPage.tsx
│   ├── NearbyExplorePage.tsx
│   └── SellerDashboardPage.tsx
├── components/         # 재사용 가능한 컴포넌트
│   ├── auth/
│   ├── common/
│   ├── consumer/
│   └── seller/
├── routes/            # 라우트 설정
│   └── index.tsx
├── services/          # API 서비스
│   ├── authService.ts
│   └── masterService.ts
├── utils/             # 유틸리티
│   └── api.ts
├── context/           # Context API
│   ├── AuthContext.tsx
│   └── UserContext.tsx
└── App.tsx            # 메인 App 컴포넌트
```

## 백엔드 API 엔드포인트 매핑

### 인증 API

| 프론트엔드 | 백엔드 엔드포인트 | 메서드 | 설명 |
|-----------|------------------|--------|------|
| `login()` | `/api/auth/login` | POST | 로그인 |
| `signupConsumer()` | `/api/auth/signup/consumer` | POST | 소비자 회원가입 |
| `signupSeller()` | `/api/auth/signup/seller` | POST | 판매자 회원가입 |
| `getMyProfile()` | `/api/users/me` | GET | 내 프로필 조회 |

### 마스터 데이터 API

| 프론트엔드 | 백엔드 엔드포인트 | 메서드 | 설명 |
|-----------|------------------|--------|------|
| `getRegions()` | `/api/master/regions` | GET | 지역 목록 조회 |
| `getStyles()` | `/api/master/styles` | GET | 스타일 목록 조회 |
| `getCategories()` | `/api/master/categories` | GET | 카테고리 목록 조회 |
| `getFeatures()` | `/api/master/features` | GET | 특징(편의사항) 목록 조회 |

## 인증 흐름

1. **로그인**
   - 사용자가 `/login`에서 로그인
   - 백엔드 `/api/auth/login` 호출
   - JWT 토큰을 localStorage에 저장
   - `AuthContext`에서 사용자 프로필 조회
   - 원래 페이지로 리다이렉트

2. **보호된 라우트 접근**
   - `ProtectedRoute` 컴포넌트가 인증 상태 확인
   - 미인증 시 `/login`으로 리다이렉트 (원래 경로 저장)
   - 권한 확인 (CONSUMER/SELLER/ADMIN)

3. **로그아웃**
   - localStorage에서 토큰 제거
   - `AuthContext` 상태 초기화
   - 메인 페이지로 리다이렉트

## 환경 변수

`.env` 파일에 다음 변수를 설정할 수 있습니다:

```env
VITE_API_BASE_URL=http://localhost:8080
```

기본값은 `http://localhost:8080`입니다.

## 주요 기능

### 1. 라우팅
- React Router v6 사용
- URL 기반 라우팅
- 브라우저 히스토리 지원
- 보호된 라우트 지원

### 2. 인증 관리
- JWT 토큰 기반 인증
- Context API를 통한 전역 상태 관리
- 자동 토큰 갱신 (향후 구현 예정)
- 로그인 후 원래 페이지로 복귀

### 3. API 통신
- 공통 API 클라이언트 (`utils/api.ts`)
- 자동 인증 헤더 추가
- 에러 처리
- 타입 안전성

## 향후 구현 예정

다음 기능들은 백엔드 API가 구현되면 추가될 예정입니다:

- 팝업스토어 조회/검색 API 연동
- 리뷰 CRUD API 연동
- 위시리스트 API 연동
- 마이페이지 데이터 API 연동
- 판매자 대시보드 API 연동

## 개발 가이드

### 새로운 페이지 추가하기

1. `src/pages/`에 새 페이지 컴포넌트 생성
2. `src/routes/index.tsx`에 lazy import 추가
3. `src/App.tsx`에 라우트 추가

예시:
```tsx
// src/pages/NewPage.tsx
export function NewPage() {
  return <div>New Page</div>;
}

// src/routes/index.tsx
export const NewPage = lazy(() => import('../pages/NewPage').then(m => ({ default: m.NewPage })));

// src/App.tsx
<Route path="/new" element={<NewPage />} />
```

### 새로운 API 서비스 추가하기

1. `src/services/`에 새 서비스 파일 생성
2. `utils/api.ts`의 공통 함수 사용

예시:
```tsx
// src/services/popupService.ts
import { get, post } from '../utils/api';

export async function getPopups() {
  return get<Popup[]>('/api/popups');
}
```

## 참고사항

- 모든 API 응답은 `ApiResponse<T>` 형식을 따릅니다
- 인증이 필요한 API는 `requireAuth: true` 옵션을 사용합니다
- 에러 처리는 각 페이지에서 개별적으로 처리합니다

