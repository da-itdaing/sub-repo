# Itdaing (잇다잉)

팝업스토어 추천 플랫폼 - 풀스택 웹 애플리케이션

## 📋 프로젝트 개요

**Itdaing**은 소비자에게 맞춤형 팝업스토어를 추천하고, 판매자가 팝업을 등록·관리할 수 있는 플랫폼입니다.

### 기술 스택

#### 백엔드
- **프레임워크**: Spring Boot 3.5.7
- **언어**: Java 21
- **빌드 도구**: Gradle (Kotlin DSL)
- **데이터베이스**: MySQL 8.0 (Docker)
- **ORM**: JPA/Hibernate + QueryDSL
- **마이그레이션**: Flyway
- **인증**: JWT (jjwt 0.12.x)
- **API 문서**: OpenAPI 3.0 (Swagger UI)
- **주요 라이브러리**: Spring Web, Security, Data JPA, MapStruct

#### 프론트엔드
- **프레임워크**: React 18.3.1
- **언어**: TypeScript 5.9.3
- **빌드 도구**: Vite 6.3.5
- **UI 라이브러리**: Radix UI + Tailwind CSS
- **상태 관리**: React Context API
- **라우팅**: React Router v6
- **API 통신**: Axios

## 📁 프로젝트 구조

```
final-project/
├── itdaing-web/          # 프론트엔드 (React + TypeScript + Vite)
├── src/                  # 백엔드 (Spring Boot)
│   ├── main/java/        # Java 소스 코드
│   └── main/resources/   # 설정 파일 및 리소스
├── plan/                 # 개발 계획서
│   ├── BE-plan.md        # 백엔드 개발 계획
│   └── FE-plan.md        # 프론트엔드 개발 계획
├── docs/                 # 문서
└── .cursor/             # Cursor IDE 설정
```

## 🚀 빠른 시작

### 필수 요구사항

- **Java 21** (macOS는 Homebrew의 `openjdk@21` 권장)
- **Node.js 20+**
- **Docker** (MySQL, PostgreSQL, LocalStack 컨테이너용)
- **Gradle** (프로젝트에 포함된 wrapper 사용)
- **AWS CLI** (LocalStack 사용 시, 선택사항)

### 1. 환경 변수 설정

```bash
# 환경 변수 예시 파일 복사
cp env.example .env

# 필요시 .env 파일 수정
```

### 2. Docker 서비스 시작

```bash
# MySQL만 시작 (기본)
docker-compose up -d mysql

# MySQL + LocalStack 시작 (S3 모킹)
docker-compose up -d mysql localstack

# PostgreSQL 포함 시작 (챗봇 개발 시)
docker-compose --profile chatbot up -d

# 컨테이너 상태 확인
docker ps | grep itdaing
```

### 3. LocalStack S3 버킷 생성 (LocalStack 사용 시)

```bash
# LocalStack 초기 설정 스크립트 실행
./scripts/setup-localstack.sh

# 또는 수동으로
aws --endpoint-url=http://localhost:4566 s3 mb s3://itdaing-local
```

### 4. 백엔드 서버 시작

```bash
# 프로젝트 루트에서 실행
./gradlew bootRun

# 또는 특정 프로파일 지정
SPRING_PROFILES_ACTIVE=local ./gradlew bootRun
```

- **Swagger UI**: http://localhost:8080/swagger-ui/index.html
- **헬스 체크**: http://localhost:8080/actuator/health
- **API 문서**: http://localhost:8080/v3/api-docs

### 5. 프론트엔드 서버 시작

```bash
# itdaing-web 디렉토리로 이동
cd itdaing-web

# 의존성 설치 (최초 1회)
npm install

# 개발 서버 시작
npm run dev
```

- **프론트엔드**: http://localhost:5173

### 전체 서버 동시 실행

Cursor IDE 명령어 사용:
```
/start-all
```

또는 수동으로:
```bash
# 터미널 1: MySQL
docker-compose up -d mysql

# 터미널 2: 백엔드
./gradlew bootRun

# 터미널 3: 프론트엔드
cd itdaing-web && npm run dev -- --host
```

## 🔧 프로파일 개요

### 백엔드 프로파일

- **`local`** (기본): MySQL Docker 컨테이너 사용, LocalStack S3 또는 Local Storage 선택 가능, Swagger UI 활성화, 개발용
- **`dev`**: IDE에서 RDS/S3 등 외부 리소스와 연동하는 개발용 (환경변수 주입)
- **`prod`**: EC2 배포용 (포트 80, 환경변수 기반). 운영 키/비밀번호는 절대 커밋하지 않음
- **`chatbot`**: PostgreSQL + pgvector 사용 (향후 챗봇 기능용)

프로파일 활성화 방법:
```bash
# 기본 (local)
./gradlew bootRun

# LocalStack S3 사용
STORAGE_PROVIDER=s3 ./gradlew bootRun

# 챗봇 프로파일 포함
SPRING_PROFILES_ACTIVE=chatbot,local ./gradlew bootRun
```

### Storage Provider 선택

- **`local`**: 로컬 파일 시스템에 저장 (기본)
- **`s3`**: AWS S3 또는 LocalStack S3 사용

환경 변수로 제어:
```bash
STORAGE_PROVIDER=s3 ./gradlew bootRun
```

## 📝 API 엔드포인트

### 공개 API
- `POST /api/auth/login` - 로그인
- `POST /api/auth/signup/consumer` - 소비자 회원가입
- `POST /api/auth/signup/seller` - 판매자 회원가입
- `GET /api/master/**` - 마스터 데이터 조회
- `GET /api/popups/**` - 팝업 조회
- `GET /api/zones/**` - 존 조회
- `GET /api/sellers/**` - 판매자 조회

### 인증 필요 API
- `GET /api/sellers/me/profile` - 내 프로필 조회
- `PUT /api/sellers/me/profile` - 내 프로필 수정
- `POST /api/inquiries` - 메시지 스레드 생성

루트 "/"는 인증 필요로 401이 정상입니다.

## 🧪 테스트

### 백엔드 테스트

```bash
# 전체 테스트 실행
./gradlew test

# 특정 도메인 테스트
./gradlew testMaster      # 마스터 데이터
./gradlew testUser        # 사용자 도메인
./gradlew testGeo         # 지리 정보
./gradlew testPopup       # 팝업 도메인
./gradlew testSocial      # 소셜 기능
./gradlew testMsg         # 메시지

# 특정 클래스 테스트
./gradlew test --tests '*RepositoryTest'
```

### 샘플 계정

- **소비자**: `consumer1` ~ `consumer10` / `pass!1234`
- **판매자**: `seller1` ~ `seller50` / `pass!1234`
- **관리자**: `admin1` ~ `admin3` / `pass!1234`

## 🔐 보안 설정

### JWT 설정

- HS256은 최소 256비트(32바이트) 이상의 secret을 요구합니다.
- `application-*.yml` 기본값이 있으며, 운영/배포 환경에서는 `prod.env`로 덮어씁니다.
- 만료시간 등 민감 설정은 `prod.env`에서 관리하세요.

### 환경 변수

- `.env` 파일은 Git에 커밋하지 않습니다.
- 프로덕션 환경 변수는 `prod.env` 파일로 관리합니다 (서버에만 존재).

## 📚 개발 가이드

### 개발 계획서

- **백엔드**: `plan/BE-plan.md` 참조
- **프론트엔드**: `plan/FE-plan.md` 참조

### 로컬 개발 환경 설정

- **로컬 개발 가이드**: `docs/LOCAL_DEVELOPMENT.md` 참조
  - LocalStack 설정 및 사용법
  - PostgreSQL + pgvector 설정 (챗봇용)
  - AWS 환경과의 차이점

### 데이터베이스 마이그레이션

- **마이그레이션 가이드**: `docs/DATABASE_MIGRATION.md` 참조
  - MySQL Flyway 마이그레이션
  - PostgreSQL + pgvector 설정 (향후)

### Cursor IDE 명령어

- `/front-dev` - 프론트엔드 개발 서버 실행
- `/back-dev` - 백엔드 개발 서버 실행
- `/start-all` - 모든 서버 실행
- `/stop-all` - 모든 서버 중지

자세한 내용은 `.cursor/README.md` 참조

## 🚢 배포

### EC2 배포 (Docker 없이)

- 문서: `docs/DEPLOY_EC2.md` 참조
- 핵심: `application-prod.yml` + 환경변수 기반 구성, systemd로 서비스 관리

### IDE 실행 가이드

- 문서: `docs/IDE_SETUP.md` 참조 (IntelliJ / Eclipse 세팅, ProxyJump, 원격 디버그)

## 📖 OpenAPI/Swagger 문서

### 로컬에서 문서 생성

```bash
./gradlew generateOpenApiDocs
# 산출물: build/openapi/openapi.yaml
```

### GitHub Pages로 공개

본 레포지토리는 OpenAPI 문서를 Gradle 태스크로 생성하고, GitHub Pages(gh-pages 브랜치)에 정적 Swagger UI를 배포하는 워크플로를 포함합니다.

- 워크플로: `.github/workflows/publish-openapi.yml`
- 트리거: 기본 push 및 수동 실행(workflow_dispatch)
- 첫 실행 후 GitHub Pages 설정에서 Source를 `gh-pages` 브랜치로 지정하세요.

배포 주소(예시):
- 사용자/오거나이제이션 페이지: https://da-itdaing.github.io/sub-repo/

### 권한 정책이 엄격한 조직에서의 설정(Deploy Key 사용)

1) 로컬에서 배포 전용 키 생성(비밀번호 없이):
```bash
ssh-keygen -t ed25519 -C "gh-pages deploy" -f gh-pages -N ""
```

2) GitHub → Repository → Settings → Deploy keys → Add deploy key
   - Title: gh-pages
   - Key: `gh-pages.pub` 내용 붙여넣기
   - Allow write access 체크

3) GitHub → Repository → Settings → Secrets and variables → Actions → New repository secret
   - Name: `GH_PAGES_DEPLOY_KEY`
   - Secret: `gh-pages`(개인키) 파일 내용 전체 붙여넣기

4) Actions 탭에서 "Publish OpenAPI to GitHub Pages" 실행

5) Settings → Pages → Branch: `gh-pages` / Folder: `/ (root)` 설정

위 절차를 마치면 상단 주소에서 Swagger UI가 공개됩니다.

## 📦 빌드

### 백엔드 빌드

```bash
# 전체 빌드 (테스트 포함)
./gradlew build

# 테스트 제외 빌드
./gradlew build -x test

# JAR 파일 생성
./gradlew bootJar
```

### 프론트엔드 빌드

```bash
cd itdaing-web

# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

## 🐛 알려진 이슈

일부 컨트롤러 테스트(판매자 프로필) 실패 케이스가 있으며, 실행에는 영향을 주지 않습니다. 필요 시 별도 이슈로 보정 가능합니다.

## 📄 라이선스

사내/프로젝트 정책에 따릅니다.
