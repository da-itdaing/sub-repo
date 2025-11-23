# DA-ITDAING 모노레포

> 팝업스토어 추천 플랫폼 - 풀스택 웹 애플리케이션

[![Tech Stack](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react)](https://react.dev/)
[![Tech Stack](https://img.shields.io/badge/Vite-7.0.0-646CFF?logo=vite)](https://vitejs.dev/)
[![Tech Stack](https://img.shields.io/badge/Spring_Boot-3.5.7-6DB33F?logo=spring-boot)](https://spring.io/)
[![Tech Stack](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql)](https://www.postgresql.org/)
[![Tech Stack](https://img.shields.io/badge/Redis-7.x-DC382D?logo=redis)](https://redis.io/)

## 🌐 서비스 링크 & 문서

- 프로덕션: [`https://aischool.daitdaing.com/`](https://aischool.daitdaing.com/)  
  - ACM SSL 인증서를 적용한 Nginx 리버스 프록시에서 React PWA 정적 산출물과 API를 동시에 제공
- API 문서: [`https://da-itdaing.github.io/sub-repo/#/`](https://da-itdaing.github.io/sub-repo/#/) (main 브랜치에서 GitHub Actions로 OpenAPI 배포)


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
├── itdaing-app/          # 프론트엔드 (React 19 + Vite 7 + Tailwind v4) - Consumer/Seller/Admin 통합
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
│   ├── docs/             # 프로젝트 문서 (배포, 가이드, 아키텍처)
│   ├── public/           # 정적 파일
│   ├── README.md         # 프로젝트 개요
│   ├── QUICK_START.md    # 빠른 시작 가이드
│   └── package.json      # NPM 패키지 설정
│
├── itdaing-web/          # 레거시 프론트 (React 18 + TS) - 마이그레이션 레퍼런스 (현재는 추적/배포 대상 아님)
│   ├── src/              # 기존 Seller/Admin Dashboard
│   ├── public/           # 정적 파일
│   └── package.json      # NPM 패키지 설정
│
└── .gitignore            # Git 제외 파일

# 비교 포커스:
# - dev/be → dev/fe → main 순으로 동기화
# - test/fe는 dev/fe 기반 QA/핫픽스 전용
# - itdaing-web은 레거시 레퍼런스로만 유지, 배포/기능 개발은 itdaing-app 중심
```

## 🌿 브랜치 전략

### 주요 브랜치

| 브랜치 | 설명 |
|--------|------|
| **main** | 통합 메인 브랜치 (프로덕션) |
| **dev/be** | 백엔드 스테이징 (Spring Boot) |
| **dev/fe** | 프론트/통합 스테이징 (React 19 + Tailwind v4) ← **현재** |
| **test/fe** | QA·실험·핫픽스 브랜치 (dev/fe 기반) |
| **gh-pages** | API 문서 자동 배포 |

```
main (통합 / 배포)
└── dev/be (백엔드 스테이징)
    └── dev/fe (프론트/통합 스테이징) ✅
        └── test/fe (QA·실험 브랜치)
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
- Spring Boot 3.5.7 · Java 21
- PostgreSQL 15 (AWS RDS) + pgvector 확장
- Redis 7.x (세션 + 캐시 + 레이트리밋)
- Gradle + OpenAPI (Swagger) 문서 자동 생성

### 프론트엔드 v2 (itdaing-app - 현재)
- React 19 · Vite 7 · Tailwind CSS v4 · React Query · Zustand
- Kakao Map SDK, Kakao 로그인, PWA(Service Worker + offline.html)
- npm run build → Nginx 정적 호스팅, PWA asset copy

### 프론트엔드 v1 (itdaing-web, 레거시)
- React 18 · Vite 6 · TypeScript · Radix UI
- 현재는 기능 참고용으로만 유지 (신규 작업 없음)

### 인프라 & 배포
- Nginx (ACM 인증서) 리버스 프록시로 HTTPS 종단 및 정적 파일 서빙
- AWS EC2: AMI 기반 Auto Scaling 그룹으로 백엔드 운영 예정
- Bastion Host를 통해서만 프라이빗 서브넷 서버 접근
- AWS Secrets Manager + Systems Manager Parameter Store + EC2 IAM Role로 민감 정보 관리
- 현재는 Nginx에 정적 파일을 `npm run build` → `cp dist/* /usr/share/nginx/html` 방식으로 배포, PWA 파일 포함
- 향후 S3 + CloudFront 무중단 배포 계획 수립 중

### AI / 챗봇 서비스 (WIP)
- LangGraph + FastAPI 기반 챗봇을 9000 포트에서 별도 운영 테스트
- PostgresSaver + pgvector를 활용해 대화/문서 임베딩 저장
- API Gateway 구성이 확정되면 main 브랜치 아키텍처 문서에 상세화 예정

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

## 🚀 배포 파이프라인 (현재)

1. `npm run build` (itdaing-app) → `dist/` + `public/`의 PWA 자산 생성  
2. Nginx 서버(ACM HTTPS)로 산출물을 `cp -R dist/* /usr/share/nginx/html` 형태로 복사  
3. Service Worker, manifest, offline.html까지 함께 배포하여 PWA 기능 유지  
4. 백엔드는 `java -jar itdaing/app.jar` 또는 AMI 기반 Auto Scaling 그룹으로 구동  
5. Secrets Manager / Parameter Store 값을 EC2 IAM Role이 주입하여 민감정보를 로컬에 남기지 않음  
6. 차후 S3 + CloudFront를 도입해 정적 리소스를 CDN 으로 제공할 예정

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
- [SYNC_BACKEND.md](docs/SYNC_BACKEND.md) - dev/be 백엔드 동기화 방법

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

1. 브랜치 선택: `dev/be`(백엔드) / `dev/fe`(프론트·통합) / `test/fe`(QA·핫픽스, dev/fe 기반)
2. 커밋 규칙: Gitmoji + 한글 메시지
3. Pull Request: 작업 브랜치 → `main`
4. 문서 업데이트: 새 기능 추가 시 필수

**상세 가이드**: [docs/BRANCH_STRATEGY.md](docs/BRANCH_STRATEGY.md)

## 📄 라이선스

사내 프로젝트
