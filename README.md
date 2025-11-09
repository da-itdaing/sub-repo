# itdaing-server

Spring Boot 3.5 (Java 21) 기반 백엔드 서비스.

- 빌드 도구: Gradle
- JDK: 21 (Temurin 권장)
- 주요 라이브러리: Spring Web, Security, Data JPA, Flyway, H2/MySQL, springdoc-openapi, jjwt, QueryDSL, MapStruct

## 프로파일 개요

- `local` (기본): H2 메모리 DB, Swagger UI 활성화, 빠른 개발용
- `dev`: IDE에서 RDS/S3 등 외부 리소스와 연동하는 개발용 (환경변수 주입)
- `prod`: EC2 배포용 (포트 80, 환경변수 기반). 운영 키/비밀번호는 절대 커밋하지 않음

프로파일 활성화 방법:

```bash
# 예) local
SPRING_PROFILES_ACTIVE=local ./gradlew bootRun

# 예) dev (RDS/S3 사용)
SPRING_PROFILES_ACTIVE=dev DB_URL=jdbc:mysql://<rds-endpoint>:3306/<db> \
DB_USERNAME=<user> DB_PASSWORD=<pass> S3_BUCKET_NAME=<bucket> \
./gradlew bootRun
```

## 필수 요구사항

- Java 21 설치 (macOS는 Homebrew의 openjdk@21 권장)
- IDE에서 Gradle 프로젝트로 Import, Gradle JVM은 JDK 21 지정

## 빠른 시작 (로컬)

```bash
./gradlew bootRun
# 혹은 명시적으로
SPRING_PROFILES_ACTIVE=local ./gradlew bootRun
```

- Swagger UI: http://localhost:8080/swagger-ui/index.html
- 헬스 체크: http://localhost:8080/actuator/health

루트 "/"는 인증 필요로 401이 정상입니다. 공개 엔드포인트는 `/api/master/**`(GET), `/api/auth/**`, `/v3/api-docs/**`, `/swagger-ui/**`, `/actuator/health` 입니다.

## JWT 설정 메모

- HS256은 최소 256비트(32바이트) 이상의 secret을 요구합니다.
- `application-local.yml`, `application-dev.yml`, `application-openapi.yml`의 기본값은 충분한 길이로 설정되어 있습니다.
- 만료시간은 밀리초(long)로 주입합니다.

환경변수로 덮어쓰기 예:

```bash
export JWT_SECRET='your-very-long-32+bytes-secret................................'
export JWT_ACCESS_TOKEN_EXPIRATION=900000
export JWT_REFRESH_TOKEN_EXPIRATION=1209600000
```

## 테스트

```bash
./gradlew test

# 특정 패키지/클래스만
./gradlew test --tests '*RepositoryTest'
```

일부 컨트롤러 테스트(판매자 프로필) 실패 케이스가 있으며, 실행에는 영향을 주지 않습니다. 필요 시 별도 이슈로 보정 가능합니다.

## EC2 배포 (Docker 없이)

- 문서: `docs/DEPLOY_EC2.md` 참조
- 핵심: `application-prod.yml` + 환경변수 기반 구성, systemd로 서비스 관리

## IDE 실행 가이드

- 문서: `docs/IDE_SETUP.md` 참조 (IntelliJ / Eclipse 세팅, ProxyJump, 원격 디버그)

## OpenAPI/Swagger를 GitHub Pages로 공개하기

본 레포지토리는 OpenAPI 문서를 Gradle 태스크로 생성하고, GitHub Pages(gh-pages 브랜치)에 정적 Swagger UI를 배포하는 워크플로를 포함합니다.

### 1) 문서 생성 (로컬)

```bash
./gradlew generateOpenApiDocs
# 산출물: build/openapi/openapi.yaml
```

### 2) GitHub Pages 퍼블리시 (CI)

- 워크플로: `.github/workflows/publish-openapi.yml`
- 트리거: 기본 push 및 수동 실행(workflow_dispatch)
- 첫 실행 후 GitHub Pages 설정에서 Source를 `gh-pages` 브랜치로 지정하세요.

배포 주소(예시):

- 사용자/오거나이제이션 페이지: https://da-itdaing.github.io/final-project/

조직 정책상 `GITHUB_TOKEN`에 write 권한을 줄 수 없을 때는 ‘배포 키(Deploy Key)’로 배포합니다.

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

## 라이선스

사내/프로젝트 정책에 따릅니다.

## CI (GitHub Actions)

[![CI](https://github.com/da-itdaing/final-project/actions/workflows/ci.yml/badge.svg?branch=dev/integration)](https://github.com/da-itdaing/final-project/actions/workflows/ci.yml)

- 트리거: `dev/integration` 브랜치로의 push, 해당 브랜치 대상 PR, 수동 실행(workflow_dispatch)
- 작업:
	- Backend: JDK 21, Gradle `bootJar -x test` (테스트는 기본 스킵) → 산출물 업로드
	- Frontend: Node 20, `itdaing-web`에서 `npm ci && npm run build` → `dist/` 업로드

필요 시 테스트를 CI에 포함하려면 `ci.yml`의 Gradle 명령에서 `-x test`를 제거하세요.

### gitmoji 커밋 컨벤션

- 커밋 메시지 앞에 gitmoji 사용 권장(예: ✨, 🐛, 🔧 등). 예시:
	- ✨ feat: 캐러셀 반응형 개선
	- 🐛 fix: 모바일 우측 overflow 수정
	- 🧹 refactor: 컴포넌트 분리
	- 📝 docs: README CI 배지 추가

간편 입력 도구:

```bash
npx gitmoji -c
```

직접 이모지 코드로도 가능: `git commit -m ":sparkles: feat: adjust breakpoints for hero carousel"`
