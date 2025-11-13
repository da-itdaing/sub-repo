# Itdaing REST API 문서 (v1.0.0)

본 문서는 Itdaing 팝업스토어 추천 서비스의 REST API를 한글로 상세히 설명합니다. 실제 스펙은 `docs/openapi.json`을 기준으로 하며, Swagger UI에 동일하게 반영됩니다.

- 문서 버전: v1.0.0
- OpenAPI: 3.0.1
- 기본 서버 URL: http://localhost:8080
- Swagger UI: 애플리케이션 실행 후 `/swagger-ui.html` 접속

---

## 인증 및 권한

Itdaing API는 JWT Bearer Token 인증을 사용합니다.

1) 로그인으로 액세스 토큰 발급
- 엔드포인트: `POST /api/v1/auth/login`
- 응답 예시의 `data.accessToken` 값을 사용

2) 인증이 필요한 API 호출 시 헤더에 토큰 포함
- 헤더: `Authorization: Bearer {accessToken}`

3) 공개 API
- `/api/v1/auth/**` (회원가입/로그인): 인증 없이 호출 가능
- `GET /api/v1/master/**` (마스터 데이터 조회): 인증 없이 호출 가능

### 사용자 역할(Role)
- CONSUMER: 일반 소비자 (팝업 조회/위시리스트/리뷰 등)
- SELLER: 판매자 (팝업 등록/관리)
- ADMIN: 관리자 (시스템 관리/승인)

### JWT 토큰 구조 (예시 페이로드)
```json
{
  "sub": "1",
  "role": "ROLE_CONSUMER",
  "iss": "itdaing-server",
  "iat": 1730419200,
  "exp": 1730505600
}
```

---

## 공통 응답 규격

모든 API는 아래 형태의 공통 응답을 사용합니다.

- 성공: `{ "success": true, "data": ... }`
- 실패: `{ "success": false, "error": { "status": number, "code": string, "message": string, "fieldErrors"?: [{ field, value, reason }] } }`

### 에러 코드 표준
| HTTP | Code | 설명 |
|------|------|------|
| 400 | COMMON-001 | 입력값 검증 실패 |
| 401 | AUTH-401 | 인증 실패 |
| 403 | AUTH-403 | 권한 없음 |
| 404 | COMMON-404 | 리소스를 찾을 수 없음 |
| 409 | COMMON-409 | 리소스 중복 |

---

## 엔드포인트 요약

- Auth
  - `POST /api/v1/auth/signup/consumer` 소비자 회원가입 (공개)
  - `POST /api/v1/auth/signup/seller` 판매자 회원가입 (공개)
  - `POST /api/v1/auth/login` 로그인/토큰 발급 (공개)
  - `GET /api/v1/users/me` 내 프로필 조회 (인증 필요)
- Master Data (공개)
  - `GET /api/v1/master/regions` 지역 목록 조회
  - `GET /api/v1/master/styles` 스타일 목록 조회
  - `GET /api/v1/master/categories` 카테고리 목록 조회 (쿼리 필터)
  - `GET /api/v1/master/features` 특징(편의사항) 목록 조회

---

## 엔드포인트 상세

### Auth

#### POST /api/v1/auth/signup/consumer — 소비자 회원가입
- 인증: 불필요 (공개)
- 설명: 일반 소비자 계정을 생성합니다. 가입 시 역할은 CONSUMER입니다.
- 요청 Body (application/json): SignupConsumerRequest
  - 필드
    - email (string) — 이메일 주소, 예: `consumer1@example.com`
    - password (string, 8~20자) — 예: `P@ssw0rd1!`
    - passwordConfirm (string) — 비밀번호 확인
    - loginId (string, 4~30자) — 예: `juchan01`
    - name (string, ≤100자) — 예: `김소비`
    - nickname (string, ≤100자) — 예: `소비왕`
    - ageGroup (integer, enum: 10/20/30/40/50/60/70/80/90) — 나이대(10단위)
    - interestCategoryIds (array[int], 1~4개)
    - styleIds (array[int], 1~4개)
    - regionIds (array[int], 1~2개)
- 성공 응답: 201 Created
  - 예시
  ```json
  {
    "success": true,
    "data": {
      "userId": 1,
      "email": "consumer1@example.com",
      "role": "CONSUMER"
    }
  }
  ```
- 오류 응답
  - 400 COMMON-001: 입력값 검증 실패
  - 409 COMMON-409: 이메일 중복


#### POST /api/v1/auth/signup/seller — 판매자 회원가입
- 인증: 불필요 (공개)
- 설명: 팝업스토어 판매자 계정을 생성합니다. 가입 시 역할은 SELLER입니다.
- 요청 Body (application/json): SignupSellerRequest
  - 필드
    - email (string) — 예: `seller@example.com`
    - password (string, 8~20자) — 예: `password123`
    - passwordConfirm (string)
    - loginId (string, 4~20자, 정규식 ^[a-z0-9_-]+$)
    - name (string, ≤100자)
    - nickname (string, ≤100자)
- 성공 응답: 200 OK
  - 예시
  ```json
  {
    "success": true,
    "data": {
      "userId": 2,
      "email": "seller@example.com",
      "role": "SELLER"
    }
  }
  ```
- 오류 응답
  - 400 COMMON-001: 입력값 검증 실패
  - 409 COMMON-409: 이메일 중복


#### POST /api/v1/auth/login — 로그인/토큰 발급
- 인증: 불필요 (공개)
- 설명: 이메일/비밀번호로 로그인하여 JWT 액세스 토큰을 발급합니다.
- 요청 Body (application/json): LoginRequest
  - 필드
    - loginId (string) — 예: `juchan01`
    - password (string) — 예: `P@ssw0rd1`
- 성공 응답: 200 OK
  - 예시
  ```json
  {
    "success": true,
    "data": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...signature"
    }
  }
  ```
- 오류 응답
  - 401 AUTH-401: 이메일 또는 비밀번호가 올바르지 않음


#### GET /api/v1/users/me — 내 프로필 조회
- 인증: 필요 (Bearer 토큰)
- 설명: 현재 인증된 사용자의 프로필 정보를 반환합니다.
- 요청 헤더
  - Authorization: `Bearer {accessToken}`
- 성공 응답: 200 OK
  - 예시(소비자)
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "email": "consumer@example.com",
      "name": "김소비",
      "nickname": "소비왕",
      "role": "CONSUMER"
    }
  }
  ```
  - 예시(판매자)
  ```json
  {
    "success": true,
    "data": {
      "id": 2,
      "email": "seller@example.com",
      "name": "박판매",
      "nickname": "팝업왕",
      "role": "SELLER"
    }
  }
  ```
- 오류 응답
  - 401 AUTH-401: 인증 필요/토큰 유효하지 않음
  - 404 COMMON-404: 사용자를 찾을 수 없음

---

### Master Data (공개)

모든 Master Data 조회는 인증 없이 호출할 수 있습니다.

#### GET /api/v1/master/regions — 지역 목록 조회
- 설명: 광주광역시 구 단위 지역 목록을 조회합니다.
- 성공 응답: 200 OK
  - 응답 스키마: `ApiResponse<List<RegionResponse>>`
  - RegionResponse: { id: number, name: string }

#### GET /api/v1/master/styles — 스타일 목록 조회
- 설명: 팝업스토어 스타일 목록을 조회합니다.
- 성공 응답: 200 OK
  - 응답 스키마: `ApiResponse<List<StyleResponse>>`
  - StyleResponse: { id: number, name: string }

#### GET /api/v1/master/features — 특징(편의사항) 목록 조회
- 설명: 팝업스토어의 편의/특징 항목 목록을 조회합니다.
- 성공 응답: 200 OK
  - 응답 스키마: `ApiResponse<List<FeatureResponse>>`
  - FeatureResponse: { id: number, name: string }

#### GET /api/v1/master/categories — 카테고리 목록 조회
- 설명: 카테고리 목록을 조회합니다. 쿼리 파라미터로 타입 필터가 가능합니다.
- 쿼리 파라미터
  - arg0 (string, enum: `POPUP` | `CONSUMER`) — 카테고리 타입 필터
- 성공 응답: 200 OK
  - 응답 스키마: `ApiResponse<List<CategoryResponse>>`
  - CategoryResponse: { id: number, name: string, type: `POPUP|CONSUMER` }

---

## 스키마 요약 (components.schemas)

- SignupConsumerRequest
  - email, password(8~20), passwordConfirm, loginId(4~30), name(≤100), nickname(≤100), ageGroup(enum), interestCategoryIds(1~4), styleIds(1~4), regionIds(1~2)
- SignupSellerRequest
  - email, password(8~20), passwordConfirm, loginId(4~20, ^[a-z0-9_-]+$), name(≤100), nickname(≤100)
- LoginRequest
  - loginId, password
- 공통 응답 Wrapper
  - ApiResponse<T> = { success: boolean, data?: T, error?: ApiError }
  - ApiError = { status: number, code: string, message: string, fieldErrors?: FieldError[] }
  - FieldError = { field: string, value: string, reason: string }
- 목록 응답 예시
  - RegionResponse | StyleResponse | FeatureResponse | CategoryResponse

---

## 사용 팁 및 모범 사례

- 인증이 필요한 API는 반드시 `Authorization: Bearer {토큰}` 헤더를 포함하세요.
- 회원가입 시 비밀번호 길이/형식, ID 길이 제약, 배열 길이 제약(1~4, 1~2)을 지켜야 400 에러를 피할 수 있습니다.
- 로그인 실패(401), 이메일 중복(409), 존재하지 않는 리소스(404)에 대한 에러 메시지를 참고하여 재시도 로직을 구현하세요.
- Swagger UI의 Authorize를 활용하면 손쉽게 Bearer 토큰을 주입해 테스트할 수 있습니다.

---

## 변경 이력
- v1.0.0: 최초 공개. JWT 전역 보안 스키마 도입, Auth/Master Data 공개 범위 정의, 에러 코드 표준화.
