# DA-ITDAING 모노레포

팝업스토어 추천 플랫폼 - 풀스택 웹 애플리케이션

## 📁 프로젝트 구조 (test/fe 브랜치)

```
/home/ubuntu/
├── itdaing/              # 백엔드 (Spring Boot + Java 21)
│   ├── src/              # Java 소스 코드
│   ├── docs/             # API 문서
│   ├── scripts/          # 배포 및 관리 스크립트
│   ├── app.jar           # 실행 가능한 JAR (89MB)
│   └── build.gradle.kts  # Gradle 빌드 설정
│
├── itdaing-app/          # 프론트엔드 (React + Vite) - TS→JS 전환 버전
│   ├── src/              # React 소스 코드 (JavaScript)
│   │   ├── api/          # API 클라이언트 (Axios)
│   │   ├── components/   # 재사용 컴포넌트
│   │   ├── pages/        # 페이지 컴포넌트
│   │   │   ├── consumer/ # Consumer App 페이지
│   │   │   └── seller/   # Seller Dashboard 페이지 (예정)
│   │   ├── hooks/        # Custom Hooks
│   │   ├── services/     # API 서비스
│   │   ├── store/        # Zustand 상태 관리
│   │   └── utils/        # 유틸리티
│   ├── docs/             # 프로젝트 문서
│   ├── public/           # 정적 파일
│   ├── README.md         # 프로젝트 개요
│   ├── QUICK_START.md    # 빠른 시작 가이드
│   └── package.json      # NPM 패키지 설정
│
└── .gitignore            # Git 제외 파일

# 비교:
# - itdaing-web (dev/fe): TypeScript + React 18 + Radix UI
# - itdaing-app (test/fe): JavaScript + React 19 + Tailwind CSS v4
```

## 🌿 브랜치 전략

### 주요 브랜치

- **main**: 통합 메인 브랜치 (프로덕션)
- **dev/be**: 백엔드 개발 브랜치 (`itdaing/` 중심)
- **dev/fe**: 프론트엔드 1차 시도 (`itdaing-web/` - TS에서 부분 JS 전환)
- **test/fe**: 프론트엔드 2차 시도 (`itdaing-app/` - 완전 JS 전환) + 백엔드
- **gh-pages**: API 문서 자동 배포 브랜치

### 브랜치 간 관계

```
main (통합)
├── dev/be (백엔드)
├── dev/fe (프론트 1차: TS → 부분 JS)
└── test/fe (프론트 2차: 완전 JS + 최신 스택)
```

### 브랜치별 트래킹 파일

| 브랜치 | 트래킹 디렉토리 | 기술 스택 | 목적 |
|--------|----------------|-----------|------|
| **main** | 전체 | - | 통합 |
| **dev/be** | `itdaing/` | Spring Boot | 백엔드 개발 |
| **dev/fe** | `itdaing-web/` | TS + React 18 + Radix UI | **1차 TS→JS 전환 시도** |
| **test/fe** | `itdaing-app/`, `itdaing/` | JS + React 19 + Tailwind v4 | **2차 완전 JS 전환** |

### 프론트엔드 전환 히스토리

| 항목 | dev/fe (itdaing-web) | test/fe (itdaing-app) |
|------|---------------------|---------------------|
| **시도** | 1차 (부분 전환) | 2차 (완전 전환) |
| **언어** | TypeScript → 부분 JavaScript | 완전 JavaScript |
| **React** | 18.3.1 | 19.2.0 |
| **Vite** | 6.3.5 | 7.0.0 |
| **스타일링** | Tailwind CSS + Radix UI | Tailwind CSS v4 (Pure) |
| **상태관리** | Context API + React Query | Zustand + React Query |
| **라우터** | React Router v6 | React Router v7 |
| **상태** | 진행 중단 | 현재 진행 중 ✅ |

## 💼 개발 워크플로우

### 프론트엔드 v2 작업 (test/fe - JS 전환 버전)

```bash
# 1. 프론트엔드 v2 브랜치로 전환
git checkout test/fe

# 2. 최신 변경사항 가져오기
git pull origin test/fe

# 3. 프론트엔드 디렉토리로 이동
cd ~/itdaing-app

# 4. 개발 작업 수행
# 현재: Consumer App 페이지 구현 중
# 향후: Seller/Admin Dashboard 순차적 추가 예정

# 5. 커밋 (Gitmoji 사용 - 한글 권장)
git add .
git commit -m "✨ 기능: 팝업 상세 페이지 구현"

# 6. 푸시
git push origin test/fe

# 7. GitHub에서 Pull Request 생성: test/fe → main
```

### 백엔드 작업 (dev/be)

```bash
# 1. 백엔드 개발 브랜치로 전환
git checkout dev/be

# 2. 최신 변경사항 가져오기
git pull origin dev/be

# 3. 백엔드 디렉토리로 이동
cd ~/itdaing

# 4. 개발 작업 수행
# ... 코드 작성 ...

# 5. 커밋 (Gitmoji 사용 - 한글 권장)
git add .
git commit -m "✨ 기능: 팝업 추천 API 엔드포인트 추가"

# 6. 푸시
git push origin dev/be

# 7. GitHub에서 Pull Request 생성: dev/be → main
```

### 프론트엔드 v1 작업 (dev/fe - TypeScript 버전)

```bash
# 1. 프론트엔드 v1 브랜치로 전환
git checkout dev/fe

# 2. 최신 변경사항 가져오기
git pull origin dev/fe

# 3. 프론트엔드 디렉토리로 이동
cd ~/itdaing-web

# 4. 개발 작업 수행
# TypeScript + React 18 기반 개발

# 5. 커밋 (Gitmoji 사용 - 한글 권장)
git add .
git commit -m "💄 스타일: Seller Dashboard UI 개선"

# 6. 푸시
git push origin dev/fe

# 7. GitHub에서 Pull Request 생성: dev/fe → main
```

## 📚 API 문서

### 자동 배포

- **URL**: https://da-itdaing.github.io/sub-repo/
- **자동 배포**: main 브랜치에 push하면 GitHub Actions가 자동으로 배포
- **트리거 경로**:
  - `itdaing/src/**`
  - `itdaing/build.gradle.kts`
  - `itdaing/docs/openapi.json`

### 수동 업데이트

백엔드 API 변경 후 문서를 즉시 업데이트하려면:

```bash
# 루트 디렉토리에서 실행
./update-openapi-docs.sh
```

이 스크립트는:
1. Gradle로 OpenAPI 문서 생성 (`itdaing/docs/openapi.json`)
2. 프론트엔드에 복사 (`itdaing-web/openapi.json`)
3. Git 커밋 및 푸시 가이드 제공

## 🚀 개발 환경

### 필수 서비스 실행 순서

```
PostgreSQL (5432) → Redis (6379) → Backend (8080) → Frontend (3000)
```

#### 1. Redis 확인 (필수!)

백엔드는 **Redis**를 캐싱 및 세션 관리에 사용합니다.

```bash
# Redis 상태 확인
ps aux | grep redis
redis-cli ping  # "PONG" 응답 확인

# Redis 시작 (없으면)
sudo systemctl start redis-server
```

#### 2. 백엔드 실행

```bash
cd ~/itdaing

# 방법 1: JAR 파일 실행 (권장)
java -jar app.jar

# 방법 2: Gradle 실행
./gradlew bootRun --args='--spring.profiles.active=local'

# 로그 확인
tail -f /tmp/backend.log
```

**포트**: 8080  
**Health Check**: http://localhost:8080/actuator/health

#### 3. 프론트엔드 v2 실행 (itdaing-app - JS 버전)

```bash
cd ~/itdaing-app

# Node.js 버전 설정
export NVM_DIR="$HOME/.nvm"
source "$NVM_DIR/nvm.sh"
nvm use  # .nvmrc 기준 (v20.19.5)

# 의존성 설치 (최초 1회)
npm install

# 개발 서버 시작
npm run dev
```

**포트**: 3000 (고정)  
**접속**: http://localhost:3000  
**특징**: JavaScript + React 19 + Tailwind CSS v4

#### 4. 프론트엔드 v1 실행 (itdaing-web - TS 버전)

```bash
cd ~/itdaing-web

# 의존성 설치 (최초 1회)
npm install

# 개발 서버 시작
npm run dev -- --host 0.0.0.0 --port 3000
```

**포트**: 3000  
**접속**: http://localhost:3000  
**특징**: TypeScript + React 18 + Radix UI

### 데이터 흐름

```
Frontend (3000)
    │ HTTP Request (/api/*)
    ▼
Vite Proxy (자동 전달)
    │
    ▼
Backend (8080)
    │
    ├─► Redis (6379)         - 캐싱, 세션
    │
    └─► PostgreSQL (5432)    - 메인 DB
```

## 🔧 기술 스택

### 백엔드
- **Spring Boot** 3.5.7
- **Java** 21
- **PostgreSQL** 15 + pgvector (AWS RDS)
- **Redis** 7.x - 캐싱 및 세션 관리
- **AWS S3** - 이미지 스토리지
- **Gradle** (Kotlin DSL)

### 프론트엔드 v2 (itdaing-app - JavaScript 전환)
- **React** 19.2.0
- **Vite** 7.0.0
- **React Router** v7.9.6
- **Tailwind CSS** v4.1.0 (Pure CSS 기반)
- **Zustand** - 클라이언트 상태 관리
- **React Query** - 서버 상태 관리
- **Axios** - HTTP 클라이언트
- **개발 방향**: TypeScript → JavaScript 전환 실험

### 프론트엔드 v1 (itdaing-web - TypeScript 기반)
- **React** 18.3.1
- **TypeScript** 5.9.3
- **Vite** 6.3.5
- **Tailwind CSS** + **Radix UI**
- **개발 상태**: 초기 안정 버전

## 🔒 보안

### 민감 정보 관리

다음 파일들은 **절대 Git에 커밋하지 않습니다**:
- `itdaing/prod.env` (프로덕션 환경 변수)
- `itdaing-web/.env.local` (로컬 환경 변수)
- `.ssh/` (SSH 키)
- `*.pem`, `*.key` (인증서)

환경 변수 예시는 다음 파일을 참고하세요:
- `itdaing/env.example`

## 📋 Gitmoji 커밋 컨벤션

커밋 메시지는 **Gitmoji + 한글**을 사용합니다:

```bash
# 형식: [gitmoji] [타입]: [한글 설명]
git commit -m "✨ 기능: 팝업 찜하기 기능 구현"
git commit -m "🐛 버그: Redis 연결 실패 시 재시도 로직 추가"
git commit -m "📝 문서: API 엔드포인트 문서화"
```

### 주요 Gitmoji

- ✨ `기능:` - 새로운 기능 추가
- 🐛 `버그:` - 버그 수정
- 📝 `문서:` - 문서 추가/수정
- 💄 `스타일:` - UI/스타일 수정
- ♻️ `리팩토링:` - 코드 리팩터링
- ⚡️ `성능:` - 성능 개선
- 🔒 `보안:` - 보안 관련
- 🚀 `배포:` - 배포 관련
- 🔧 `설정:` - 설정 파일 수정
- 🙈 `gitignore:` - .gitignore 수정

**예시**:
```bash
✅ git commit -m "✨ 기능: Kakao Map 연동 및 마커 클러스터링"
✅ git commit -m "🐛 버그: 로그인 시 토큰 저장 안되는 문제 수정"
✅ git commit -m "📝 문서: Redis 통합 및 데이터 흐름 설명 추가"

❌ git commit -m "add kakao map feature"  # gitmoji 없음, 영어
❌ git commit -m "fix bug"                 # 구체적이지 않음
```

## 📖 프로젝트 문서

### 백엔드 (itdaing/)
- [백엔드 README](itdaing/README.md)
- [백엔드 개발 계획](itdaing/docs/plan/BE-plan.md)
- [Private EC2 접근 가이드](itdaing/docs/deployment/PRIVATE_EC2_ACCESS.md)

### 프론트엔드 v2 (itdaing-app/ - JS 전환 버전)

#### 📘 시작 가이드
- [README](itdaing-app/README.md) - 프로젝트 개요 및 기술 스택
- [QUICK_START](itdaing-app/QUICK_START.md) - 빠른 시작 가이드 (서버 실행, 트러블슈팅)
- [UBUNTU_DEVELOPMENT_GUIDE](itdaing-app/UBUNTU_DEVELOPMENT_GUIDE.md) - Ubuntu 개발 환경 전용 가이드

#### 📚 상세 문서 (docs/)
- [ARCHITECTURE](itdaing-app/docs/ARCHITECTURE.md) - 시스템 아키텍처 및 데이터 흐름
  - Frontend → Backend → Redis → PostgreSQL 흐름
  - 팝업 조회, 로그인, Token Refresh 시나리오
  - 캐싱 전략 및 성능 최적화
- [DEPLOYMENT_STATUS](itdaing-app/docs/DEPLOYMENT_STATUS.md) - 배포 및 실행 상태
- [TEST_ACCOUNTS](itdaing-app/docs/TEST_ACCOUNTS.md) - 테스트 계정 정보
- [KAKAO_MAP_INTEGRATION](itdaing-app/docs/KAKAO_MAP_INTEGRATION.md) - Kakao Map 통합 가이드
- [SELLER_GUIDE](itdaing-app/docs/SELLER_GUIDE.md) - 판매자 기능 가이드 (예정)

**개발 계획**:
1. ✅ Consumer App 페이지 (진행 중)
2. 🔜 Seller Dashboard 페이지 (순차 진행 예정)
3. 🔜 Admin Dashboard 페이지 (순차 진행 예정)

### 프론트엔드 v1 (itdaing-web/ - TypeScript 버전)
- [프론트엔드 개발 계획](itdaing/docs/plan/FE-plan.md)

## 🤝 기여 가이드

### 1. 브랜치 선택
- **Consumer App**: `test/fe` 브랜치
- **Backend**: `dev/be` 브랜치
- **Seller/Admin**: `dev/fe` 브랜치

### 2. 커밋 규칙
- Gitmoji 사용 필수
- 한글 커밋 메시지 (주요 키워드만 영어)
- 구체적이고 명확한 설명

### 3. Pull Request
- 작업 브랜치 → `main` 브랜치
- 코드 리뷰 후 머지

### 4. 문서 업데이트
- 새 기능 추가 시 관련 문서 업데이트
- API 변경 시 OpenAPI 문서 갱신

## 📄 라이선스

사내 프로젝트

