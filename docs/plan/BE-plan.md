# Backend 개발 계획서

## 📋 프로젝트 개요

**프로젝트명**: Itdaing (잇다잉) - 광주광역시 플리마켓 플랫폼  
**백엔드 기술 스택**: Spring Boot 3.5.7 + Java 21  
**데이터베이스**: PostgreSQL 15 + pgvector (AWS RDS)  
**ORM**: JPA/Hibernate + QueryDSL  
**마이그레이션**: Flyway  
**인증**: JWT (jjwt 0.12.x)  
**API 문서**: OpenAPI 3.0 (Swagger UI)  
**빌드 도구**: Gradle (Kotlin DSL)  
**스토리지**: AWS S3  

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
  - `V1__init_schema.sql`: 초기 스키마 생성 (PostgreSQL)
  - `V2__extend_seller_profile.sql`: 판매자 프로필 확장
- ✅ AWS RDS PostgreSQL 15 + pgvector 연동
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
- ✅ 인증 관련 추가 API
  - GET `/api/users/me`: 내 프로필 조회
  - POST `/api/auth/refresh`: 토큰 재발급
  - POST `/api/auth/logout`: 로그아웃

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
  - GET `/api/popups/reviews`: 전체 리뷰 목록
  - GET `/api/popups/{id}/reviews`: 특정 팝업의 리뷰 목록
- ✅ 팝업 검색 API (`/api/popups/search`) - QueryDSL 기반 ✅ 완료
  - 키워드 검색 (제목/설명)
  - 지역 필터 (regionId)
  - 카테고리 필터 (categoryIds)
  - 날짜 범위 필터 (startDate, endDate)
  - 승인 상태 필터 (approvalStatus)
  - 페이지네이션 지원
  - 테스트 완료: 168개 팝업 검색 가능
- ✅ 팝업 관리 API (판매자용)
  - POST `/api/popups`: 팝업 등록
  - PUT `/api/popups/{id}`: 팝업 수정
  - DELETE `/api/popups/{id}`: 팝업 삭제
  - GET `/api/sellers/me/popups`: 내 팝업 목록 조회
- ✅ 팝업 관련 엔티티
  - `Popup`, `PopupImage`, `PopupCategory`, `PopupStyle`, `PopupFeature`
- ✅ `PopupQueryService`: 팝업 데이터 조회 서비스
  - `searchPopups()`: QueryDSL 기반 동적 검색 메서드 추가
- ✅ `PopupCommandService`: 팝업 생성/수정/삭제 서비스

### 7. 지역(Zone) API
- ✅ 존(Zone) 조회 API (`/api/zones`)
  - GET `/api/zones`: 전체 존 목록
- ✅ 존 셀(Cell) 조회
- ✅ `ZoneQueryService`: 존 데이터 조회 서비스
- ✅ 관리자용 구역(Area) 생성 API (`/api/geo/areas`)
  - POST `/api/geo/areas`: 구역 생성 (관리자)
  - GET `/api/geo/areas`: 구역 목록 조회 (관리자, 키워드 검색 및 페이지네이션 지원)
- ✅ 관리자용 존(Zone) 생성 API (`/api/geo/zones`)
  - POST `/api/geo/zones`: 존 생성 (관리자, 판매자 ID 지정)
  - GET `/api/geo/zones/me`: 내가 할당받은 존 목록 (판매자, 읽기 전용)
  - GET `/api/geo/zones`: 구역별 존 목록 (관리자)
  - PATCH `/api/geo/zones/{zoneId}/status`: 존 상태 변경 (관리자)

### 8. 리뷰(Review) API
- ✅ 리뷰 엔티티 구현
  - `Review`, `ReviewImage`
- ✅ 리뷰 조회 기능 (팝업별 리뷰 목록)
- ✅ 리뷰 관리 API (소비자용)
  - POST `/api/popups/{popupId}/reviews`: 리뷰 작성
  - PUT `/api/reviews/{id}`: 리뷰 수정
  - DELETE `/api/reviews/{id}`: 리뷰 삭제
- ✅ `ReviewCommandService`: 리뷰 생성/수정/삭제 서비스

### 9. 메시지(Message) API
- ✅ 메시지 스레드 및 메시지 엔티티
  - `MessageThread`, `Message`, `MessageAttachment`
- ✅ 메시지 API (`/api/inquiries`)
  - POST: 스레드 생성 및 첫 메시지 전송
  - GET: 스레드 목록 조회 (페이지네이션 지원)
  - GET `/{threadId}`: 스레드 상세 조회 (페이지네이션 지원)
  - POST `/{threadId}/reply`: 답장 전송
  - DELETE `/messages/{messageId}`: 메시지 소프트 삭제

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
- ✅ 파일 업로드 API (`/api/uploads/images`)
  - POST `/api/uploads/images`: 이미지 업로드 (Multipart)

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
- **상태**: 핵심 관리자용 API 완료 (셀/구역/승인 관리)
- **완료된 작업**:
  - ✅ 셀(Cell) 생성/수정/삭제 API (관리자용) - 완료
  - ✅ 승인 관리 API (관리자용) - 완료
  - ✅ 구역(Area) 수정/삭제 API (관리자용) - 완료
- **남은 작업**:
  - 검색 및 필터링 API (QueryDSL 기반)
  - 추천 시스템 API
  - 통계 및 분석 API

### 2. 데이터 검증 및 제약 조건
- **상태**: 기본 제약 조건은 있으나, 비즈니스 로직 검증 강화 필요
- **필요 작업**:
  - 사용자 권한 검증 강화

---

## 📝 앞으로 해야 할 작업

### 1. 핵심 기능 API 완성 (우선순위: 높음)

#### 1.1 팝업 관리 API (판매자용)
- [x] POST `/api/popups`: 팝업 등록 (판매자용)
  - 요청: 팝업 정보, 이미지, 카테고리, 스타일, 편의시설, 셀 선택
  - 검증: 판매자 권한, 셀 선택 가능 여부
- [x] PUT `/api/popups/{id}`: 팝업 수정
  - 요청: 수정할 팝업 정보
  - 검증: 본인 소유 팝업인지 확인
  - 비고: 셀 재선택 및 속성 재매핑 완료
- [x] DELETE `/api/popups/{id}`: 팝업 삭제
  - 검증: 본인 소유 팝업인지 확인
  - 비고: 연관 이미지/조인 데이터 정리 완료
- [x] GET `/api/sellers/me/popups`: 내 팝업 목록 조회 (완료)

#### 1.2 존/셀 관리 API (관리자용)
- [x] POST `/api/geo/areas`: 구역 생성 (완료)
- [x] PUT `/api/geo/areas/{id}`: 구역 수정 (완료)
- [x] DELETE `/api/geo/areas/{id}`: 구역 삭제 (완료)
- [x] GET `/api/geo/areas/{id}`: 구역 상세 조회 (완료)
- [x] POST `/api/geo/zones`: 존 생성 (판매자용, 완료)
- [x] GET `/api/geo/zones/me`: 내가 만든 존 목록 (판매자용, 완료)
- [x] GET `/api/geo/zones`: 구역별 존 목록 (관리자용, 완료)
- [x] PATCH `/api/geo/zones/{zoneId}/status`: 존 상태 변경 (관리자용, 완료)
- [x] POST `/api/geo/cells`: 셀 생성 (완료)
  - 요청: 셀 이름, ZoneArea ID, 좌표(lat, lng), 소유자 ID
  - 검증: 좌표가 구역 폴리곤 내부에 있는지 확인
- [x] PUT `/api/geo/cells/{id}`: 셀 수정 (완료)
- [x] DELETE `/api/geo/cells/{id}`: 셀 삭제 (완료)
- [x] GET `/api/geo/cells`: 셀 목록 조회 (필터링 지원: areaId, ownerId, status) (완료)
- [x] GET `/api/geo/cells/{id}`: 셀 상세 조회 (완료)

#### 1.3 리뷰 관리 API
- [x] POST `/api/popups/{popupId}/reviews`: 리뷰 작성
  - 요청: 평점, 내용, 이미지
  - 검증: 중복 리뷰 방지 (`uk_review_once`)
  - 비고: 소비자만 작성 가능, 이미지 지원 완료
- [x] PUT `/api/reviews/{id}`: 리뷰 수정
  - 검증: 본인 작성 리뷰인지 확인
  - 비고: 평점 및 내용 수정, 이미지 재매핑 완료
- [x] DELETE `/api/reviews/{id}`: 리뷰 삭제
  - 검증: 본인 작성 리뷰 또는 관리자 권한
  - 비고: 연관 이미지 정리 완료

#### 1.4 승인 관리 API (관리자용)
- [x] GET `/api/admin/approvals`: 승인 대기 목록 (완료)
  - 팝업 승인 대기 목록 조회 (페이지네이션 지원)
  - 현재는 팝업만 지원, 향후 확장 가능
- [x] POST `/api/admin/approvals/{id}/approve`: 승인 처리 (완료)
  - 팝업 상태를 APPROVED로 변경
  - 승인 기록(ApprovalRecord) 생성
- [x] POST `/api/admin/approvals/{id}/reject`: 거부 처리 (완료)
  - 팝업 상태를 REJECTED로 변경
  - 거부 사유 저장 및 승인 기록 생성

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

4. **데이터베이스 연결 및 초기 데이터 설정**
   - ✅ AWS RDS PostgreSQL 연결 확인 완료 (2025-01-13)
   - ✅ 초기 테스트 데이터 삽입 완료 (admin1, seller1, consumer1)
   - ✅ 비밀번호 해시 업데이트 완료 (BCrypt)
   - ✅ 백엔드 API 테스트 성공 (curl)
   - ✅ 팝업 더미 데이터 스크립트 작성 완료 (광주광역시 플리마켓 플랫폼, 2025-01-27)
  - ✅ 더미 데이터 확장 완료 (5배 이상 확장, 2025-01-27)
  - ✅ DB 스크립트 통합 완료 (2025-11-13)
    - `init-all-data.sql`: 모든 초기 데이터를 하나의 스크립트로 통합
    - 관리자 5명, 판매자 15명, 소비자 50명
    - ZoneArea 25개, ZoneCell 125개, Popup 168개 이상
     - 관리자: 5명 (목표 달성)
     - 판매자: 16명 (목표 15명 이상 달성)
     - 소비자: 50명 (목표 달성)
     - ZoneArea: 22개 (목표 25개 이상에 근접)
     - ZoneCell: 126개 (목표 75개 이상 달성)
     - Popup: 168개 (목표 125개 이상 달성)
     - PopupImage: 323개
     - PopupCategory: 275개
     - PopupStyle: 279개
     - PopupFeature: 361개
     - ZoneArea: 5개 (광주 동구, 서구, 남구, 북구, 광산구)
     - ZoneCell: 15개 (각 Area당 3개씩)
     - Popup: 25개 (APPROVED: 16개, PENDING: 7개, REJECTED: 2개)
     - PopupImage, PopupCategory, PopupStyle, PopupFeature 포함

---

## 📦 주요 의존성

### Spring Boot Starters
- `spring-boot-starter-web`: REST API
- `spring-boot-starter-data-jpa`: JPA/Hibernate
- `spring-boot-starter-security`: 보안
- `spring-boot-starter-validation`: Bean Validation
- `spring-boot-starter-actuator`: 모니터링

### 데이터베이스
- `postgresql`: PostgreSQL 드라이버
- `h2`: 테스트용 인메모리 DB
- `flyway-core`, `flyway-database-postgresql`: 마이그레이션
- `hibernate-spatial`: 공간 데이터 타입 (PostGIS/pgvector 지원)

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
- `POST /api/auth/refresh`: 토큰 재발급
- `POST /api/auth/logout`: 로그아웃
- `GET /api/master/**`: 마스터 데이터 조회
- `GET /api/popups`: 팝업 목록 조회
- `GET /api/popups/{id}`: 팝업 상세 조회
- `GET /api/popups/reviews`: 전체 리뷰 목록
- `GET /api/popups/{id}/reviews`: 팝업별 리뷰 목록
- `GET /api/zones`: 존 목록 조회
- `GET /api/sellers`: 판매자 목록 조회
- `GET /api/sellers/{id}`: 판매자 상세 조회

### 인증 필요 API
- `GET /api/users/me`: 내 프로필 조회
- `GET /api/sellers/me/profile`: 내 판매자 프로필 조회
- `PUT /api/sellers/me/profile`: 내 판매자 프로필 수정
- `POST /api/inquiries`: 메시지 스레드 생성
- `GET /api/inquiries`: 메시지 스레드 목록
- `GET /api/inquiries/{threadId}`: 스레드 상세 조회
- `POST /api/inquiries/{threadId}/reply`: 답장 전송
- `DELETE /api/inquiries/messages/{messageId}`: 메시지 삭제

### 소비자 전용 API
- `POST /api/popups/{popupId}/reviews`: 리뷰 작성
- `PUT /api/reviews/{id}`: 리뷰 수정
- `DELETE /api/reviews/{id}`: 리뷰 삭제 (소비자 또는 관리자)

### 관리자 전용 API
- `POST /api/geo/areas`: 구역 생성
- `GET /api/geo/areas`: 구역 목록 조회 (판매자도 읽기 가능)
- `GET /api/geo/areas/{id}`: 구역 상세 조회 (판매자도 읽기 가능)
- `PUT /api/geo/areas/{id}`: 구역 수정
- `DELETE /api/geo/areas/{id}`: 구역 삭제
- `POST /api/geo/zones`: 존 생성 (판매자 ID 지정)
- `GET /api/geo/zones`: 구역별 존 목록 조회
- `PATCH /api/geo/zones/{zoneId}/status`: 존 상태 변경
- `POST /api/geo/cells`: 셀 생성 (판매자 ID 지정)
- `PUT /api/geo/cells/{id}`: 셀 수정
- `DELETE /api/geo/cells/{id}`: 셀 삭제
- `GET /api/geo/cells`: 셀 목록 조회 (필터링 지원, 판매자도 읽기 가능)
- `GET /api/geo/cells/{id}`: 셀 상세 조회 (판매자도 읽기 가능)
- `GET /api/admin/approvals`: 승인 대기 목록 조회
- `POST /api/admin/approvals/{id}/approve`: 승인 처리
- `POST /api/admin/approvals/{id}/reject`: 거부 처리

### 판매자 전용 API
- `GET /api/geo/zones/me`: 내가 할당받은 존 목록 (읽기 전용)
- `GET /api/geo/areas`: 구역 목록 조회 (읽기 전용)
- `GET /api/geo/cells`: 셀 목록 조회 (읽기 전용, 팝업 등록 시 선택용)
- `GET /api/geo/cells/{id}`: 셀 상세 조회 (읽기 전용)
- `POST /api/popups`: 팝업 등록 (cellId 선택)
- `PUT /api/popups/{id}`: 팝업 수정
- `DELETE /api/popups/{id}`: 팝업 삭제
- `GET /api/sellers/me/popups`: 내 팝업 목록 조회

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

### Phase 2: 핵심 기능 API 완성 (완료)
- ✅ 팝업 관리 API (완료)
- ✅ 리뷰 관리 API (완료)
- ✅ 존/셀 관리 API (완료)
- ✅ 승인 관리 API (완료)

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

**최종 업데이트**: 2025-11-13 (팝업 검색 API 완료, DB 스크립트 통합 완료, E2E 테스트 완료)

## 📊 현재 구현 상태 요약

### 완료된 핵심 기능
- ✅ 인증 시스템 (JWT 기반)
- ✅ 사용자 관리 (소비자/판매자/관리자)
- ✅ 마스터 데이터 조회
- ✅ 팝업 조회 (목록/상세)
- ✅ 팝업 관리 (등록/수정/삭제) - 판매자용
- ✅ 판매자 조회 (목록/상세)
- ✅ 리뷰 조회 (팝업별)
- ✅ 리뷰 관리 (작성/수정/삭제) - 소비자용
- ✅ 메시지 시스템 (스레드 생성/조회)
- ✅ 구역(Area) 생성 (관리자)
- ✅ 존(Zone) 생성 및 관리 (판매자/관리자)

### 미구현 핵심 기능 (우선순위 높음)
- ✅ 셀(Cell) 생성/수정/삭제 (관리자용) - 완료
- ✅ 구역(Area) 수정/삭제 (관리자용) - 완료
- ✅ 승인 관리 API (관리자용) - 완료
- ✅ Zone 생성 권한 변경 (관리자 전용으로 변경, 판매자는 선택만 가능) - 완료

## ✅ 프론트엔드-백엔드 연결 검증 완료

**테스트 일시**: 2025-01-27  
**테스트 방법**: Vite 프록시를 통한 실제 API 호출 테스트

### 검증된 연결
- ✅ 백엔드 서버 실행 확인 (포트 8080)
- ✅ 프론트엔드 개발 서버 실행 확인 (포트 5173)
- ✅ Vite 프록시 설정 확인 (`/api` → `http://localhost:8080`)
- ✅ 팝업 API 연결 테스트 완료 (`GET /api/popups`)
- ✅ 판매자 API 연결 테스트 완료 (`GET /api/sellers`)
- ✅ 마스터 데이터 API 연결 테스트 완료 (`GET /api/master/categories`)
- ✅ 리뷰 API 연결 테스트 완료 (`GET /api/popups/reviews`)

**결과**: 모든 주요 API 엔드포인트가 프론트엔드에서 백엔드로 정상적으로 연결됨을 확인

### 실제 테스트 결과
- ✅ 백엔드 서버: 포트 8080에서 실행 중 (Health Check: UP)
- ✅ 프론트엔드 서버: 포트 5173에서 실행 중 (Vite dev server)
- ✅ 프록시 테스트: `/api/popups`, `/api/sellers`, `/api/master/categories`, `/api/popups/reviews` 모두 성공
- ✅ API 응답 형식: 모든 엔드포인트가 `{success: true, data: ...}` 형식으로 정상 응답
- ✅ 코드 구현: 모든 서비스 레이어 메서드 구현 완료 및 검증됨

---

## 🔗 프론트엔드-백엔드 연동 현황

### 완료된 API 연동
- ✅ 팝업 조회 API (`GET /api/popups`, `GET /api/popups/{id}`)
  - 프론트엔드: `popupService.getPopups()`, `popupService.getPopupById()`
  - Hook: `usePopups()`, `usePopupById()`
- ✅ 팝업 삭제 API (`DELETE /api/popups/{id}`)
  - 프론트엔드: `popupService.deletePopup()`
- ✅ 리뷰 조회 API (`GET /api/popups/{id}/reviews`)
  - 프론트엔드: `reviewService.getReviewsByPopupId()`
  - Hook: `useReviewsByPopupId()`
- ✅ 리뷰 작성 API (`POST /api/popups/{popupId}/reviews`)
  - 프론트엔드: `reviewService.createReview()`
  - 컴포넌트: `ReviewWritePage`
- ✅ 판매자 내 팝업 목록 API (`GET /api/sellers/me/popups`)
  - 프론트엔드: `sellerService.getMyPopups()`
  - 컴포넌트: `PopupManagementPage`

### 백엔드 API 준비 완료 (프론트엔드 서비스 레이어 완료, UI 폼 연동 필요)
- ✅ 팝업 등록 API (`POST /api/popups`)
  - 프론트엔드 서비스: `popupService.createPopup()` 준비 완료
  - UI 폼 연동 완료 ✅ (`PopupForm`, `PopupManagement`)
- ✅ 팝업 수정 API (`PUT /api/popups/{id}`)
  - 프론트엔드 서비스: `popupService.updatePopup()` 준비 완료
  - UI 폼 연동 완료 ✅ (`PopupForm`, `PopupManagement`)
- ✅ 리뷰 수정 API (`PUT /api/reviews/{id}`)
  - 프론트엔드 서비스: `reviewService.updateReview()` 준비 완료
  - UI 연동 완료 ✅ (`PopupDetailPage`, `ReviewWritePage`)
- ✅ 리뷰 삭제 API (`DELETE /api/reviews/{id}`)
  - 프론트엔드 서비스: `reviewService.deleteReview()` 준비 완료
  - UI 연동 완료 ✅ (`PopupDetailPage`)
- ✅ 판매자 프로필 수정 API (`PUT /api/sellers/me/profile`)
  - 프론트엔드 서비스: `sellerService.updateProfile()` 준비 완료
  - UI 연동 완료 ✅ (`SellerProfileForm`, `SellerDashboard`)

### 완료된 API 연동 (추가)
- ✅ 판매자 목록/상세 API (`GET /api/sellers`, `GET /api/sellers/{id}`)
  - 프론트엔드: `sellerService.getSellers()`, `sellerService.getSellerById()`
  - Hook: `useSellers()`, `useSellerById()`

### 백엔드 API 준비 완료 (프론트엔드 연동 필요)
- (없음 - 모든 주요 API 연동 완료)

## 📝 다음 단계 (Next Steps)

### 프론트엔드 작업 필요
1. **UI 폼 연동** (서비스 레이어 완료, UI 폼 연동 필요)
   - ✅ 팝업 등록 폼 완료 (`popupService.createPopup()` 사용)
   - ✅ 팝업 수정 폼 완료 (`popupService.updatePopup()` 사용)
   - ✅ 리뷰 수정/삭제 UI 완료 (`reviewService.updateReview()`, `reviewService.deleteReview()` 사용)
   - ✅ 판매자 프로필 수정 폼 완료 (`PUT /api/sellers/me/profile`)

2. **에러 핸들링 강화**
   - ✅ 에러 바운더리 구현 완료 (`ErrorBoundary` 컴포넌트)
   - ✅ 네트워크 에러 처리 개선 완료
   - ✅ 재시도 로직 추가 완료

3. **Kakao Map API 통합**
   - 관리자/판매자 페이지에서 지도 기능 구현
   - 셀 선택 기능 구현

### 백엔드 작업 필요
1. **관리자용 API**
   - 셀(Cell) 생성/수정/삭제 API
   - 구역(Area) 수정/삭제 API
   - 승인 관리 API

2. **검색 및 필터링** ✅ 완료
   - ✅ 팝업 검색 API (`/api/popups/search`) - QueryDSL 기반
   - ✅ 키워드, 지역, 카테고리, 날짜 범위, 승인 상태 필터링 지원
   - ✅ 페이지네이션 지원

