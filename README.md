# Itdaing (잇다잉)

팝업스토어 추천 플랫폼 - 풀스택 웹 애플리케이션

## 📋 프로젝트 개요

**Itdaing**은 소비자에게 맞춤형 팝업스토어를 추천하고, 판매자가 팝업을 등록·관리할 수 있는 플랫폼입니다.

### 기술 스택

#### 백엔드
- **프레임워크**: Spring Boot 3.5.7
- **언어**: Java 21
- **빌드 도구**: Gradle (Kotlin DSL)
- **데이터베이스**: PostgreSQL 15 + pgvector (AWS RDS)
- **ORM**: JPA/Hibernate + QueryDSL
- **마이그레이션**: Flyway
- **인증**: JWT (jjwt 0.12.x)
- **API 문서**: OpenAPI 3.0 (Swagger UI)
- **주요 라이브러리**: Spring Web, Security, Data JPA, MapStruct
- **스토리지**: AWS S3

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

## 🚀 개발 환경

### Private EC2 접근

모든 개발 및 테스트는 Private EC2에서 수행됩니다.

```bash
# SSH 접속
ssh private-ec2

# 프로젝트 디렉토리로 이동
cd ~/itdaing

# 환경 변수 로드
source prod.env
```

자세한 내용은 [Private EC2 접근 가이드](docs/deployment/PRIVATE_EC2_ACCESS.md)를 참고하세요.

### 백엔드 서버 시작

```bash
ssh private-ec2 "cd ~/itdaing && source prod.env && ./gradlew bootRun"
```

### 프론트엔드 빌드 및 배포

```bash
ssh private-ec2 "cd ~/itdaing/itdaing-web && npm install && npm run build"
```

## 🔧 프로파일 개요

### 백엔드 프로파일

- **`prod`**: 프로덕션 환경 (AWS RDS PostgreSQL + AWS S3 사용)
- **`dev`**: 개발 환경 (환경변수 주입)
- **`chatbot`**: 챗봇 기능용 (PostgreSQL + pgvector)

프로파일 활성화:
```bash
# Private EC2에서
cd ~/itdaing
source prod.env  # SPRING_PROFILES_ACTIVE=prod
./gradlew bootRun
```

### Storage Provider

프로덕션 환경에서는 항상 **AWS S3**를 사용합니다.

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

## 📚 개발 계획 및 문서

프로젝트 개발 시 다음 문서를 참고하세요:

- **백엔드 계획**: [`docs/plan/BE-plan.md`](docs/plan/BE-plan.md)
- **프론트엔드 계획**: [`docs/plan/FE-plan.md`](docs/plan/FE-plan.md)
- **Private EC2 접근**: [`docs/deployment/PRIVATE_EC2_ACCESS.md`](docs/deployment/PRIVATE_EC2_ACCESS.md)
- **배포 가이드**: [`docs/deployment/DEPLOY_TO_PRIVATE_EC2.md`](docs/deployment/DEPLOY_TO_PRIVATE_EC2.md)
- **환경 설정**: [`docs/deployment/PRIVATE_EC2_ENV_SETUP.md`](docs/deployment/PRIVATE_EC2_ENV_SETUP.md)
- **S3 버킷 정책**: [`docs/deployment/S3_BUCKET_POLICY.md`](docs/deployment/S3_BUCKET_POLICY.md)

모든 문서는 [`docs/README.md`](docs/README.md)에서 확인할 수 있습니다.

## 🚢 배포

### Private EC2 배포

- 문서: [`docs/deployment/DEPLOY_TO_PRIVATE_EC2.md`](docs/deployment/DEPLOY_TO_PRIVATE_EC2.md) 참조
- 핵심: `application-prod.yml` + 환경변수 기반 구성, systemd로 서비스 관리
- 초기 설정: [`docs/deployment/SETUP_PRIVATE_EC2.md`](docs/deployment/SETUP_PRIVATE_EC2.md) 참조

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
