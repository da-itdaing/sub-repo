# DA-ITDAING 모노레포

> 팝업스토어 추천 플랫폼 - 풀스택 웹 애플리케이션

[![Tech Stack](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react)](https://react.dev/)
[![Tech Stack](https://img.shields.io/badge/Vite-7.0.0-646CFF?logo=vite)](https://vitejs.dev/)
[![Tech Stack](https://img.shields.io/badge/Spring_Boot-3.5.7-6DB33F?logo=spring-boot)](https://spring.io/)
[![Tech Stack](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql)](https://www.postgresql.org/)
[![Tech Stack](https://img.shields.io/badge/Redis-7.x-DC382D?logo=redis)](https://redis.io/)

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

| 브랜치 | 설명 |
|--------|------|
| **main** | 통합 메인 브랜치 (프로덕션) |
| **dev/be** | 백엔드 개발 |
| **dev/fe** | 프론트엔드 v1 (TS → 부분 JS 전환) |
| **test/fe** | 프론트엔드 v2 (완전 JS 전환) ← **현재** |
| **gh-pages** | API 문서 자동 배포 |

```
main (통합)
├── dev/be (백엔드)
├── dev/fe (프론트 v1)
└── test/fe (프론트 v2) ← 현재 진행 중 ✅
```

**상세 정보**: [docs/BRANCH_STRATEGY.md](docs/BRANCH_STRATEGY.md)

## 💼 빠른 시작

### 개발 환경 실행

```bash
# 1. Redis 확인 (필수!)
redis-cli ping  # PONG 응답 확인

# 2. 백엔드 실행
cd ~/itdaing && java -jar app.jar

# 3. 프론트엔드 실행 (itdaing-app)
cd ~/itdaing-app && nvm use && npm run dev
```

**상세 가이드**:
- [docs/DEVELOPMENT_GUIDE.md](docs/DEVELOPMENT_GUIDE.md) - 개발 환경 설정
- [itdaing-app/QUICK_START.md](itdaing-app/QUICK_START.md) - 빠른 시작 가이드
- [docs/BRANCH_STRATEGY.md](docs/BRANCH_STRATEGY.md) - 워크플로우

## 📚 기술 스택

### 백엔드
Spring Boot 3.5.7 · Java 21 · PostgreSQL 15 · Redis 7.x · AWS S3

### 프론트엔드 v2 (itdaing-app - 현재)
React 19 · Vite 7 · JavaScript · Zustand · React Query · Tailwind CSS v4

### 프론트엔드 v1 (itdaing-web)
React 18 · Vite 6 · TypeScript → JavaScript · Radix UI

**상세 비교**: [docs/TECH_STACK.md](docs/TECH_STACK.md)

## 📊 데이터 흐름

```
Frontend (3000) → Vite Proxy → Backend (8080)
                                    ↓
                                Redis (6379) ← 캐싱, 세션
                                    ↓
                             PostgreSQL (5432) ← 메인 DB
```

**상세 정보**: [itdaing-app/docs/ARCHITECTURE.md](itdaing-app/docs/ARCHITECTURE.md)

## 📋 커밋 규칙

```bash
[gitmoji] [타입]: [한글 설명]

# 예시
git commit -m "✨ 기능: 팝업 찜하기 기능 구현"
git commit -m "🐛 버그: Redis 연결 실패 시 재시도 로직 추가"
git commit -m "📝 문서: API 엔드포인트 문서화"
```

**상세 가이드**: [docs/COMMIT_CONVENTION.md](docs/COMMIT_CONVENTION.md)


## 📖 문서

### 🚀 시작하기
- [QUICK_START.md](itdaing-app/QUICK_START.md) - 빠른 시작 (5분 만에 실행)
- [DEVELOPMENT_GUIDE.md](docs/DEVELOPMENT_GUIDE.md) - 개발 환경 설정

### 📚 프로젝트 가이드
- [BRANCH_STRATEGY.md](docs/BRANCH_STRATEGY.md) - 브랜치 전략 및 워크플로우
- [TECH_STACK.md](docs/TECH_STACK.md) - 기술 스택 상세 비교
- [COMMIT_CONVENTION.md](docs/COMMIT_CONVENTION.md) - Gitmoji 커밋 규칙

### 🏗️ 아키텍처
- [ARCHITECTURE.md](itdaing-app/docs/ARCHITECTURE.md) - 시스템 아키텍처 및 데이터 흐름
- [DEPLOYMENT_STATUS.md](itdaing-app/docs/DEPLOYMENT_STATUS.md) - 배포 상태
- [UBUNTU_DEVELOPMENT_GUIDE.md](itdaing-app/UBUNTU_DEVELOPMENT_GUIDE.md) - Ubuntu 환경

### 🔧 백엔드
- [Backend README](itdaing/README.md)
- [Backend 개발 계획](itdaing/docs/plan/BE-plan.md)
- [Private EC2 접근](itdaing/docs/deployment/PRIVATE_EC2_ACCESS.md)

### 💻 프론트엔드
- [itdaing-app README](itdaing-app/README.md) - v2 (JS 전환)
- [TEST_ACCOUNTS.md](itdaing-app/docs/TEST_ACCOUNTS.md) - 테스트 계정
- [KAKAO_MAP_INTEGRATION.md](itdaing-app/docs/KAKAO_MAP_INTEGRATION.md) - 카카오맵

---

## 🤝 기여하기

1. 브랜치 선택: `test/fe` (프론트 v2), `dev/be` (백엔드)
2. 커밋 규칙: Gitmoji + 한글 메시지
3. Pull Request: 작업 브랜치 → `main`
4. 문서 업데이트: 새 기능 추가 시 필수

**상세 가이드**: [docs/BRANCH_STRATEGY.md](docs/BRANCH_STRATEGY.md)

## 📄 라이선스

사내 프로젝트

