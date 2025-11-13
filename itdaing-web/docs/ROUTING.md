# 페이지 경로 설계 문서

## 개요
이 문서는 Itdaing 웹 애플리케이션의 페이지 경로 설계 및 라우팅 구조를 설명합니다.

## 기술 스택
- **React Router v6**: 클라이언트 사이드 라우팅
- **Axios**: HTTP 클라이언트
- **JWT**: 인증 토큰 관리

## 페이지 경로 구조

### 공개 페이지 (인증 불필요)
- `/` - 메인 페이지 (홈)
- `/login` - 로그인 페이지
- `/signup/1` - 회원가입 1단계 (기본 정보 입력)
- `/signup/2` - 회원가입 2단계 (선호 정보 입력)
- `/popup/:id` - 팝업스토어 상세 페이지
- `/nearby` - 주변 탐색 페이지 (지도 기반)

### 인증 필요 페이지
- `/mypage` - 마이페이지 (CONSUMER 권한)
- `/seller/dashboard` - 판매자 대시보드 (SELLER 권한)

## 라우팅 구조

```
/
├── /login
├── /signup
│   ├── /signup/1
│   └── /signup/2
├── /popup/:id
├── /mypage (Protected)
├── /nearby
└── /seller/dashboard (Protected, SELLER only)
```

## API 엔드포인트 매핑

### 인증 API
- `POST /api/auth/login` - 로그인
- `POST /api/auth/signup/consumer` - 소비자 회원가입
- `POST /api/auth/signup/seller` - 판매자 회원가입
- `GET /api/users/me` - 내 프로필 조회
- `POST /api/auth/logout` - 로그아웃
- `POST /api/auth/refresh` - 토큰 재발급

### 마스터 데이터 API
- `GET /api/master/regions` - 지역 목록
- `GET /api/master/styles` - 스타일 목록
- `GET /api/master/categories` - 카테고리 목록
- `GET /api/master/features` - 특징(편의사항) 목록

## 인증 흐름

1. **로그인**
   - 사용자가 `/login`에서 이메일/비밀번호 입력
   - `POST /api/auth/login` 호출
   - JWT 토큰을 localStorage에 저장
   - 원래 페이지로 리다이렉트 또는 역할에 따라 대시보드로 이동

2. **회원가입**
   - `/signup/1`에서 기본 정보 입력
   - `/signup/2`에서 선호 정보 입력
   - `POST /api/auth/signup/consumer` 또는 `/api/auth/signup/seller` 호출
   - 자동 로그인 후 메인 페이지로 이동

3. **인증 보호**
   - `ProtectedRoute` 컴포넌트로 인증 필요 페이지 보호
   - 미인증 시 `/login`으로 리다이렉트
   - 로그인 후 원래 페이지로 복귀

## 파일 구조

```
src/
├── pages/              # 페이지 컴포넌트
│   ├── MainPage.tsx
│   ├── LoginPage.tsx
│   ├── SignupPage1.tsx
│   ├── SignupPage2.tsx
│   ├── PopupDetailPage.tsx
│   ├── MyPage.tsx
│   ├── NearbyExplorePage.tsx
│   └── SellerDashboard.tsx
├── components/
│   ├── layout/
│   │   └── Layout.tsx   # 공통 레이아웃
│   └── auth/
│       └── ProtectedRoute.tsx  # 인증 보호 라우트
├── routes/
│   └── index.tsx       # 라우터 설정
├── services/
│   ├── api.ts          # Axios 인스턴스
│   ├── authService.ts  # 인증 서비스
│   └── masterService.ts # 마스터 데이터 서비스
└── context/
    └── AuthContext.tsx  # 인증 컨텍스트
```

## 환경 변수

`.env` 파일에 다음 변수를 설정할 수 있습니다:
```
VITE_API_BASE_URL=http://localhost:8080/api
```

## 향후 추가 예정

다음 API들이 백엔드에서 구현되면 추가 연동 예정:
- 팝업스토어 목록/상세 조회 API
- 리뷰 작성/조회 API
- 위시리스트 추가/삭제 API
- 판매자 대시보드 관련 API

