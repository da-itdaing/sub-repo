# Backend 개발 계획서

## 📋 프로젝트 개요

**프로젝트명**: Itdaing (잇다잉) - 팝업스토어 추천 플랫폼  
**백엔드 기술 스택**: Spring Boot 3.5.7 + Java 21  
**데이터베이스**: MySQL 8.0 (Docker)  
**ORM**: JPA/Hibernate + QueryDSL  
**마이그레이션**: Flyway  
**인증**: JWT (jjwt 0.12.x)  
**API 문서**: OpenAPI 3.0 (Swagger UI)  
**빌드 도구**: Gradle (Kotlin DSL)  

---

## ✅ 완료된 작업

### 1. 프로젝트 구조 및 설정
- ✅ Spring Boot 3.5.7 프로젝트 설정
- ✅ Gradle Kotlin DSL 빌드 설정
- ✅ Java 21 설정
- ✅ 프로파일 관리 (`local`, `test`, `openapi`)
- ✅ OpenAPI/Swagger 설정

### 2. 데이터베이스 스키마
- ✅ Flyway 마이그레이션 스크립트 작성
  - `V1__init_schema.sql`: 초기 스키마 생성
  - `V2__extend_seller_profile.sql`: 판매자 프로필 확장
- ✅ MySQL 8.0 Docker 컨테이너 연동
- ✅ 주요 엔티티 구현
  - `Users` (사용자)
  - `SellerProfile` (판매자 프로필)
  - `Popup` (팝업스토어)
  - `ZoneArea` (존 영역)
  - `ZoneCell` (존 셀)
  - `Review` (리뷰)
  - `MessageThread`, `Message` (메시지)
  - `Category`, `Style`, `Region`, `Feature` (마스터 데이터)
  - `UserPrefCategory`, `UserPrefStyle`, `UserPrefRegion`, `UserPrefFeature` (사용자 선호)

### 3. 인증 및 보안
- ✅ JWT 기반 인증 시스템
  - `JwtTokenProvider`: 토큰 생성/검증
  - `JwtAuthFilter`: 요청 필터링
  - `JwtAuthenticationHandler`: 인증 성공/실패 핸들러
- ✅ Spring Security 설정
  - 역할 기반 접근 제어 (CONSUMER, SELLER, ADMIN)
  - 공개 API 엔드포인트 설정
- ✅ 비밀번호 암호화 (BCrypt)
- ✅ 로그인 API (`/api/auth/login`) - `loginId` 기반
- ✅ 회원가입 API
  - 소비자 회원가입 (`/api/auth/signup/consumer`)
  - 판매자 회원가입 (`/api/auth/signup/seller`)

### 4. 사용자 관리 API
- ✅ 사용자 조회 (`UserRepository`)
  - `findByEmail`, `findByLoginId`
  - `existsByEmail`, `existsByLoginId`
- ✅ 사용자 선호 정보 관리
  - 카테고리, 스타일, 지역, 편의시설 선호 저장

### 5. 판매자(Seller) API
- ✅ 판매자 프로필 관리 (`/api/sellers/me/profile`)
  - GET: 프로필 조회
  - PUT: 프로필 생성/수정
  - 필드: `profileImageUrl`, `introduction`, `activityRegion`, `snsUrl`, `category`, `contactPhone`
- ✅ 판매자 조회 API (`/api/sellers`)
  - GET `/api/sellers`: 전체 판매자 목록
  - GET `/api/sellers/{id}`: 특정 판매자 상세 정보

### 6. 팝업스토어(Popup) API
- ✅ 팝업 조회 API (`/api/popups`)
  - GET `/api/popups`: 전체 팝업 목록
  - GET `/api/popups/{id}`: 특정 팝업 상세 정보
- ✅ 팝업 관련 엔티티
  - `Popup`, `PopupImage`, `PopupCategory`, `PopupStyle`, `PopupFeature`
- ✅ `PopupQueryService`: 팝업 데이터 조회 서비스

### 7. 지역(Zone) API
- ✅ 존(Zone) 조회 API (`/api/zones`)
  - GET `/api/zones`: 전체 존 목록
  - GET `/api/zones/{id}`: 특정 존 상세 정보
- ✅ 존 셀(Cell) 조회
- ✅ `ZoneQueryService`: 존 데이터 조회 서비스
- ✅ 관리자용 존 생성 API (`/api/geo/areas`) - 준비됨

### 8. 리뷰(Review) API
- ✅ 리뷰 엔티티 구현
  - `Review`, `ReviewImage`
- ✅ 리뷰 조회 기능 (팝업별 리뷰 목록)

### 9. 메시지(Message) API
- ✅ 메시지 스레드 및 메시지 엔티티
  - `MessageThread`, `Message`, `MessageAttachment`
- ✅ 메시지 API (`/api/inquiries`)
  - POST: 스레드 생성 및 첫 메시지 전송
  - GET: 스레드 목록 조회
  - GET `/{threadId}`: 스레드 상세 조회

### 10. 마스터 데이터 API
- ✅ 마스터 데이터 조회 API (`/api/master`)
  - GET `/api/master/categories`: 카테고리 목록
  - GET `/api/master/styles`: 스타일 목록
  - GET `/api/master/regions`: 지역 목록
  - GET `/api/master/features`: 편의시설 목록

### 11. Mock 데이터 시스템
- ✅ Mock API 엔드포인트 (`/api/dev/**`)
  - `/api/dev/users/{username}`: 사용자 프로필 조회
  - `/api/dev/popups`: 팝업 목록
  - `/api/dev/sellers`: 판매자 목록
  - `/api/dev/zones`: 존 목록
  - `/api/dev/messages`: 메시지 목록
- ✅ `MockDataService`: JSON 파일 로딩 서비스
- ✅ Mock JSON 파일 위치: `src/main/resources/mock/`

### 12. 데이터 시딩
- ✅ `DevDataSeed`: 로컬 개발용 데이터 시딩
  - 마스터 데이터: Category, Style, Region, Feature
  - 사용자: ADMIN 3명, CONSUMER 10명, SELLER 50명
  - 존/셀, 팝업, 리뷰, 메시지 데이터 생성
- ✅ Mock JSON 기반 시딩 로직

### 13. 파일 업로드
- ✅ AWS S3 연동 준비 (`UploadController`)
- ✅ 파일 업로드 API (`/api/files/upload`)

### 14. 테스트
- ✅ 도메인별 테스트 태스크 설정
  - `testMaster`, `testUser`, `testGeo`, `testPopup`, `testSocial`, `testMsg`
- ✅ JPA 테스트 지원 (`JpaTestSupport`)
- ✅ 인증 테스트 지원 (`MvcNoSecurityTest`)

### 15. 에러 처리
- ✅ 전역 예외 처리 (`GlobalExceptionHandler`)
- ✅ 커스텀 예외 클래스
  - `BusinessException`
  - `PopupNotFoundException`
  - `SellerNotFoundException`

---

## 🚧 진행 중인 작업

### 1. API 완성도 향상
- **상태**: 기본 CRUD API는 구현되었으나, 일부 기능 보완 필요
- **필요 작업**:
  - 팝업 등록/수정/삭제 API (판매자용)
  - 존/셀 생성/수정/삭제 API (관리자용) - 구조는 있으나 실제 구현 필요
  - 리뷰 작성/수정/삭제 API
  - 승인 관리 API (관리자용)

### 2. 데이터 검증 및 제약 조건
- **상태**: 기본 제약 조건은 있으나, 비즈니스 로직 검증 강화 필요
- **필요 작업**:
  - 팝업 등록 시 셀 선택 검증
  - 리뷰 작성 시 중복 검증 (`uk_review_once` 제약)
  - 사용자 권한 검증 강화

---

## 📝 앞으로 해야 할 작업

### 1. 핵심 기능 API 완성 (우선순위: 높음)

#### 1.1 팝업 관리 API (판매자용)
- [ ] POST `/api/popups`: 팝업 등록
  - 요청: 팝업 정보, 이미지, 카테고리, 스타일, 편의시설, 셀 선택
  - 검증: 판매자 권한, 셀 선택 가능 여부
- [ ] PUT `/api/popups/{id}`: 팝업 수정
  - 요청: 수정할 팝업 정보
  - 검증: 본인 소유 팝업인지 확인
- [ ] DELETE `/api/popups/{id}`: 팝업 삭제
  - 검증: 본인 소유 팝업인지 확인
- [ ] GET `/api/sellers/me/popups`: 내 팝업 목록 조회

#### 1.2 존/셀 관리 API (관리자용)
- [ ] POST `/api/geo/areas`: 존 생성
  - 요청: 존 이름, GeoJSON (Polygon)
  - 검증: 관리자 권한, GeoJSON 유효성
- [ ] PUT `/api/geo/areas/{id}`: 존 수정
- [ ] DELETE `/api/geo/areas/{id}`: 존 삭제
- [ ] POST `/api/geo/cells`: 셀 생성
  - 요청: 셀 이름, ZoneArea ID, GeoJSON (Point/Polygon), 소유자 ID
- [ ] PUT `/api/geo/cells/{id}`: 셀 수정
- [ ] DELETE `/api/geo/cells/{id}`: 셀 삭제
- [ ] GET `/api/geo/cells`: 셀 목록 조회 (필터링 지원)

#### 1.3 리뷰 관리 API
- [ ] POST `/api/popups/{popupId}/reviews`: 리뷰 작성
  - 요청: 평점, 내용, 이미지
  - 검증: 중복 리뷰 방지 (`uk_review_once`)
- [ ] PUT `/api/reviews/{id}`: 리뷰 수정
  - 검증: 본인 작성 리뷰인지 확인
- [ ] DELETE `/api/reviews/{id}`: 리뷰 삭제
  - 검증: 본인 작성 리뷰 또는 관리자 권한

#### 1.4 승인 관리 API (관리자용)
- [ ] GET `/api/admin/approvals`: 승인 대기 목록
  - 팝업 승인 대기, 셀 승인 대기 등
- [ ] POST `/api/admin/approvals/{id}/approve`: 승인 처리
- [ ] POST `/api/admin/approvals/{id}/reject`: 거부 처리

### 2. 검색 및 필터링 기능 (우선순위: 중간)
- [ ] 팝업 검색 API
  - 키워드 검색 (제목, 설명)
  - 지역 필터링
  - 카테고리 필터링
  - 날짜 범위 필터링
  - 페이지네이션
- [ ] QueryDSL을 활용한 동적 쿼리 구현

### 3. 추천 시스템 (우선순위: 중간)
- [ ] 소비자 맞춤 추천 API
  - GET `/api/recommendations`: 추천 팝업 목록
  - 알고리즘: 사용자 선호 정보 기반
  - 지역, 카테고리, 스타일 가중치 적용

### 4. 통계 및 분석 API (우선순위: 낮음)
- [ ] 판매자 대시보드 통계
  - 팝업 조회수, 리뷰 평균 평점, 예약 수 등
- [ ] 관리자 대시보드 통계
  - 전체 팝업 수, 승인 대기 수, 사용자 수 등

### 5. 파일 업로드 완성 (우선순위: 중간)
- [ ] 이미지 업로드 API 완성
  - 프로필 이미지
  - 팝업 이미지
  - 리뷰 이미지
- [ ] 이미지 리사이징 및 최적화
- [ ] 파일 타입 및 크기 검증

### 6. 알림 시스템 (우선순위: 낮음)
- [ ] 메시지 알림
- [ ] 승인 알림
- [ ] 리뷰 알림

### 7. 성능 최적화 (우선순위: 중간)
- [ ] 데이터베이스 인덱스 최적화
- [ ] N+1 쿼리 문제 해결 (Fetch Join, Batch Size)
- [ ] 캐싱 전략 수립 (Redis 연동 고려)
- [ ] API 응답 시간 모니터링

### 8. 보안 강화 (우선순위: 높음)
- [ ] Rate Limiting 구현
- [ ] CORS 설정 정교화
- [ ] 입력값 검증 강화 (XSS, SQL Injection 방지)
- [ ] 로깅 및 감사(Audit) 로그

### 9. 테스트 작성 (우선순위: 중간)
- [ ] 단위 테스트 작성
  - Service 레이어 테스트
  - Repository 레이어 테스트
- [ ] 통합 테스트 작성
  - Controller 레이어 테스트
  - API 엔드포인트 테스트
- [ ] 테스트 커버리지 목표: 80% 이상

### 10. 문서화 (우선순위: 중간)
- [ ] API 문서 보완 (Swagger 어노테이션)
- [ ] README 업데이트
- [ ] 배포 가이드 작성

---

## 🐛 알려진 이슈

1. **리뷰 작성 시 중복 제약 위반**
   - `uk_review_once` 제약 조건으로 인한 `DataIntegrityViolationException`
   - **해결**: `DevDataSeed`에서 동적 리뷰 작성자 생성 로직 추가 완료

2. **GeoJSON 저장 형식**
   - 현재 `geometryData` 필드에 JSON 문자열로 저장
   - 향후 Hibernate Spatial 타입으로 전환 고려

3. **N+1 쿼리 문제**
   - 팝업 목록 조회 시 관련 엔티티 로딩 최적화 필요
   - Fetch Join 또는 Batch Size 설정 필요

---

## 📦 주요 의존성

### Spring Boot Starters
- `spring-boot-starter-web`: REST API
- `spring-boot-starter-data-jpa`: JPA/Hibernate
- `spring-boot-starter-security`: 보안
- `spring-boot-starter-validation`: Bean Validation
- `spring-boot-starter-actuator`: 모니터링

### 데이터베이스
- `mysql-connector-j`: MySQL 드라이버
- `h2`: 테스트용 인메모리 DB
- `flyway-core`, `flyway-mysql`: 마이그레이션

### 인증
- `jjwt-api`, `jjwt-impl`, `jjwt-jackson`: JWT

### 유틸리티
- `lombok`: 보일러플레이트 코드 제거
- `mapstruct`: DTO 매핑
- `querydsl-jpa`: 동적 쿼리

### 공간 데이터
- `hibernate-spatial`: 공간 데이터 타입
- `jts-core`: JTS Geometry

### AWS
- `aws-sdk-s3`: S3 파일 업로드

### API 문서
- `springdoc-openapi-starter-webmvc-ui`: Swagger UI

---

## 🗄️ 데이터베이스 스키마 요약

### 주요 테이블
- `users`: 사용자 정보
- `seller_profile`: 판매자 프로필
- `popup`: 팝업스토어 정보
- `popup_image`: 팝업 이미지
- `popup_category`, `popup_style`, `popup_feature`: 팝업 속성
- `zone_area`: 존 영역
- `zone_cell`: 존 셀
- `review`: 리뷰
- `review_image`: 리뷰 이미지
- `message_thread`: 메시지 스레드
- `message`: 메시지
- `message_attachment`: 메시지 첨부파일
- `category`, `style`, `region`, `feature`: 마스터 데이터
- `user_pref_category`, `user_pref_style`, `user_pref_region`, `user_pref_feature`: 사용자 선호

### 주요 제약 조건
- `uk_review_once`: 사용자당 팝업당 리뷰 1개만 작성 가능
- `uk_user_email`: 이메일 중복 방지
- `uk_user_login_id`: 로그인 ID 중복 방지

---

## 🔗 API 엔드포인트 요약

### 공개 API
- `POST /api/auth/login`: 로그인
- `POST /api/auth/signup/consumer`: 소비자 회원가입
- `POST /api/auth/signup/seller`: 판매자 회원가입
- `GET /api/master/**`: 마스터 데이터 조회
- `GET /api/popups/**`: 팝업 조회
- `GET /api/zones/**`: 존 조회
- `GET /api/sellers/**`: 판매자 조회

### 인증 필요 API
- `GET /api/sellers/me/profile`: 내 프로필 조회
- `PUT /api/sellers/me/profile`: 내 프로필 수정
- `POST /api/inquiries`: 메시지 스레드 생성
- `GET /api/inquiries`: 메시지 스레드 목록

### 관리자 전용 API
- `POST /api/geo/areas`: 존 생성
- `GET /api/geo/areas`: 존 목록 조회

### Mock API (개발용)
- `GET /api/dev/users/{username}`: 사용자 프로필
- `GET /api/dev/popups`: 팝업 목록
- `GET /api/dev/sellers`: 판매자 목록
- `GET /api/dev/zones`: 존 목록
- `GET /api/dev/messages`: 메시지 목록

---

## 📅 마일스톤

### Phase 1: 기본 인프라 구축 (완료)
- ✅ 프로젝트 설정
- ✅ 데이터베이스 스키마
- ✅ 인증 시스템
- ✅ 기본 CRUD API

### Phase 2: 핵심 기능 API 완성 (진행 중)
- 🚧 팝업 관리 API
- 🚧 존/셀 관리 API
- 🚧 리뷰 관리 API
- ⏳ 승인 관리 API

### Phase 3: 고급 기능 및 최적화 (예정)
- ⏳ 검색 및 필터링
- ⏳ 추천 시스템
- ⏳ 성능 최적화
- ⏳ 테스트 작성

---

## 🧪 테스트 샘플 계정

### 소비자 (CONSUMER)
- `loginId`: `consumer1`
- `password`: `pass!1234`
- 총 10개 페르소나 (consumer1 ~ consumer10)

### 판매자 (SELLER)
- `loginId`: `seller1`
- `password`: `pass!1234`
- 총 50개 계정 (seller1 ~ seller50)

### 관리자 (ADMIN)
- `loginId`: `admin1`
- `password`: `pass!1234`
- 총 3개 계정 (admin1 ~ admin3)

---

**최종 업데이트**: 2025-01-27

