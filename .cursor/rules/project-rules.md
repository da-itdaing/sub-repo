# Itdaing 프로젝트 개발 규칙

## 프로젝트 개요
- **프로젝트명**: Itdaing (잇다잉) - 팝업스토어 추천 플랫폼
- **아키텍처**: 프론트엔드(React) + 백엔드(Spring Boot) + PostgreSQL (AWS RDS) + S3
- **개발 환경**: Private EC2에서 개발 및 테스트 수행

## 디렉토리 구조
```
final-project/
├── itdaing-web/          # 프론트엔드 (React + TypeScript + Vite)
├── src/                  # 백엔드 (Spring Boot)
├── docs/                 # 문서
│   ├── plan/            # 개발 계획서 (FE-plan.md, BE-plan.md)
│   ├── deployment/      # 배포 가이드
│   └── ...
└── .cursor/              # Cursor IDE 설정
```

## 기술 스택

### 프론트엔드
- React 18.3.1
- TypeScript 5.9.3
- Vite 6.3.5
- Tailwind CSS
- Radix UI
- React Router v6
- Axios

### 백엔드
- Spring Boot 3.5.7
- Java 21
- PostgreSQL 15 + pgvector (AWS RDS)
- JPA/Hibernate
- QueryDSL
- Flyway
- JWT (jjwt 0.12.x)
- AWS S3

## 개발 환경 설정

### 필수 요구사항
- Java 21 (JDK)
- Node.js 20+
- Gradle (프로젝트에 포함된 wrapper 사용)
- SSH 접속 설정 (`~/.ssh/config`에 `private-ec2` 호스트 설정)

### 환경 변수
- 프로덕션 환경 변수는 `prod.env` 파일로 관리 (Private EC2에만 존재)
- Git에 커밋하지 않음 (`.gitignore`에 포함)

## 코딩 규칙

### 프론트엔드
- TypeScript strict mode 사용
- 함수형 컴포넌트 및 Hooks 사용
- 컴포넌트는 PascalCase로 명명
- 파일명은 컴포넌트명과 동일하게 작성
- Props 인터페이스는 컴포넌트 파일 내부에 정의

### 백엔드
- Java 21 문법 사용
- Lombok 사용 (보일러플레이트 코드 제거)
- DTO는 record 또는 @Builder 패턴 사용
- Service 레이어에서 비즈니스 로직 처리
- Repository는 JPA Repository 인터페이스 사용

## API 규칙

### 엔드포인트 명명
- RESTful API 설계 원칙 준수
- 소문자와 하이픈 사용: `/api/popups/{id}`
- 동사는 HTTP 메서드로 표현

### 인증
- JWT Bearer Token 사용
- 공개 API: `/api/auth/**`, `/api/master/**`, `GET /api/popups/**`, `GET /api/zones/**`, `GET /api/sellers/**`
- 인증 필요 API: Authorization 헤더에 `Bearer {token}` 포함

### 응답 형식
- 성공: `ApiResponse<T>` 래퍼 사용
- 에러: `GlobalExceptionHandler`에서 일관된 형식으로 처리

## 데이터베이스 규칙

### 마이그레이션
- Flyway를 사용한 버전 관리
- 마이그레이션 파일: `src/main/resources/db/migration/V{version}__{description}.sql`
- PostgreSQL 문법 사용
- 롤백은 수동으로 처리 (Flyway는 롤백 미지원)

### 네이밍
- 테이블명: snake_case
- 컬럼명: snake_case
- 인덱스: `idx_{table}_{column}`
- 외래키: `fk_{table}_{referenced_table}`

### 데이터베이스 접근
- AWS RDS PostgreSQL 사용
- Private EC2에서만 접근 가능
- 연결 정보는 `prod.env`에 저장

## 테스트 규칙

### 백엔드
- 도메인별 테스트 태스크 사용
  - `./gradlew testMaster`
  - `./gradlew testUser`
  - `./gradlew testGeo`
  - `./gradlew testPopup`
  - `./gradlew testSocial`
  - `./gradlew testMsg`
- 통합 테스트는 `@SpringBootTest` 사용
- 단위 테스트는 Mock 사용

### 프론트엔드
- 테스트는 아직 미구현 (추후 Vitest + React Testing Library 예정)

## Git 규칙

### 브랜치 전략
- `main`: 프로덕션 브랜치
- 기능 브랜치: `feature/{description}`

### 커밋 메시지
- gitmoji 사용 (예: `✨ feat:`, `🐛 fix:`, `🔧 chore:`)
- 형식: `{emoji} {type}: {description}`
- 예: `✨ feat: add hero carousel breakpoints`

## 배포 규칙

### 개발 및 테스트
- 모든 개발 및 테스트는 Private EC2에서 수행
- 프론트엔드: 빌드 후 nginx를 통해 서빙
- 백엔드: Spring Boot 애플리케이션 실행

### 프로덕션
- 백엔드: Private EC2에서 jar 실행 (systemd 서비스 권장)
- 프론트엔드: nginx를 통해 정적 파일 서빙
- 데이터베이스: AWS RDS PostgreSQL
- 스토리지: AWS S3

## 보안 규칙

### 민감 정보
- API 키, 비밀번호는 환경 변수로 관리
- `prod.env` 파일은 절대 Git에 커밋하지 않음
- 파일 권한은 600으로 설정

### 인증/인가
- 모든 API는 기본적으로 인증 필요
- 역할 기반 접근 제어 (CONSUMER, SELLER, ADMIN)
- JWT 토큰 만료 시간: 24시간

## 문서화 규칙

### 코드 주석
- JavaDoc 형식 사용 (백엔드)
- JSDoc 형식 사용 (프론트엔드)
- 복잡한 로직은 인라인 주석 추가

### API 문서
- Swagger/OpenAPI 사용
- 엔드포인트는 `@Operation` 어노테이션으로 설명
- DTO는 `@Schema` 어노테이션으로 필드 설명

## 성능 규칙

### 백엔드
- N+1 쿼리 문제 방지 (Fetch Join 사용)
- 페이지네이션 적용 (대량 데이터 조회 시)
- 인덱스 최적화

### 프론트엔드
- Lazy Loading 적용 (라우트 레벨)
- 이미지 최적화 (Lazy Loading, WebP)
- 불필요한 리렌더링 방지 (useMemo, useCallback)

## 에러 처리 규칙

### 백엔드
- 커스텀 예외 클래스 사용 (`BusinessException` 상속)
- `GlobalExceptionHandler`에서 일관된 에러 응답
- 로깅은 `@Slf4j` 사용

### 프론트엔드
- API 에러는 try-catch로 처리
- 사용자에게 친화적인 에러 메시지 표시
- 네트워크 에러는 재시도 로직 고려

## Mock 데이터 규칙

### 개발 환경
- Mock JSON 파일: `public/mock/` (프론트), `src/main/resources/mock/` (백엔드)
- Mock API: `/api/dev/**` 엔드포인트
- 우선순위: Backend API → Mock API → Static JSON

### 데이터 시딩
- `DevDataSeed` 클래스로 개발용 데이터 생성
- 프로덕션 프로파일에서는 비활성화 가능
- 샘플 계정:
  - 소비자: `consumer1` ~ `consumer10` / `pass!1234`
  - 판매자: `seller1` ~ `seller50` / `pass!1234`
  - 관리자: `admin1` ~ `admin3` / `pass!1234`

## Private EC2 작업 규칙

### 필수 사항
- 모든 작업은 Private EC2에서 수행
- 작업 전 항상 `source prod.env` 실행
- 변경사항은 Git으로 관리하고 Private EC2에 반영

### 주의사항
- `prod.env` 파일은 절대 수정하지 않음 (환경 변수 변경 시 별도 관리)
- 데이터베이스는 AWS RDS 사용 (로컬 DB 없음)
- 스토리지는 AWS S3 사용 (로컬 스토리지 없음)
