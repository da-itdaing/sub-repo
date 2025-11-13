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

# prod 환경
- prod 환경 변수는 저장소 루트의 `prod.env` 파일로 관리합니다. 서버/배포 스크립트나 systemd가 이 파일을 로드하도록 구성되어 있습니다.
- README 내 개별 환경변수 세팅 예시는 제거했습니다. 필요한 값은 `prod.env`에서 관리하세요.
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
- `application-*.yml` 기본값이 있으며, 운영/배포 환경에서는 `prod.env`로 덮어씁니다.
- 만료시간 등 민감 설정은 `prod.env`에서 관리하세요. (README의 개별 환경변수 예시는 제거함)

## 테스트

```bash
./gradlew test

# 특정 패키지/클래스만
./gradlew test --tests '*RepositoryTest'
```

일부 컨트롤러 테스트(판매자 프로필) 실패 케이스가 있으며, 실행에는 영향을 주지 않습니다. 필요 시 별도 이슈로 보정 가능합니다.

## VS Code에서 백엔드/프론트 동시 실행 (Tasks)

`.vscode/tasks.json`을 통해 백엔드(Spring Boot)와 프론트엔드(Vite)를 간편하게 실행할 수 있습니다.

- Backend: Gradle bootRun (현재 워크스페이스 `final-project`에서 실행)
- Frontend: Vite dev 서버 (상위 디렉터리에 위치한 `itdaing-web` 기준)
- Start: All — 백엔드와 프론트엔드를 병렬로 실행

실행 방법:

1) VS Code 메뉴 → Terminal → Run Task...
2) 다음 중 하나를 선택
	- "Backend: bootRun (Gradle)"
	- "Frontend: dev (itdaing-web)"
	- "Start: All (backend + itdaing-web)"

참고:
- 프론트엔드가 다른 경로(`figma-make` 등)에 있는 경우, 해당 경로에 맞는 Task를 추가해 사용하세요.
- `itdaing-web`이 현재 워크스페이스 밖에 있다면, Task의 동작 경로(`cwd`)만 맞으면 실행 가능합니다.

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
