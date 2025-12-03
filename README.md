# 🛍️ 다잇다잉 (DaItdaing)

> **흩어진 플리마켓 정보를 하나로, 취향 맞춤 연결 플랫폼**

[![Live Demo](https://img.shields.io/badge/🌐_Live-aischool.daitdaing.com-ff5757?style=for-the-badge)](https://aischool.daitdaing.com/)
[![API Docs](https://img.shields.io/badge/📖_API_Docs-OpenAPI-85EA2D?style=for-the-badge)](https://da-itdaing.github.io/sub-repo/#/)

---

## 📖 프로젝트 소개

**다잇다잉**은 광주광역시의 플리마켓, 팝업스토어, 전시회, 축제 정보를 한 곳에 모아 제공하는 플랫폼입니다.

### 🎯 핵심 기능

| 사용자 유형 | 주요 기능 |
|------------|----------|
| **소비자** | 플리마켓 검색, AI 기반 맞춤 추천, 찜하기, 리뷰 작성, PWA 오프라인 지원 |
| **판매자** | 존/셀 기반 위치 선정, AI 상권 분석, 팝업 등록 및 관리 |
| **관리자** | 사용자/팝업/존 관리, 검수 시스템, 대시보드 |

### 🤖 AI 챗봇 - 마켓버디 & 셀러버디

- **마켓버디**: 소비자 취향에 맞는 플리마켓 추천
- **셀러버디**: 판매자에게 최적의 존 위치 및 상권 정보 제공

---

## 👥 팀원 정보

| 이름 | 역할 | GitHub |
|------|------|--------|
| **황채리** | Frontend | [@ChaeRi0609](https://github.com/ChaeRi0609) |
| **장주찬** | Backend | [@jangjuya](https://github.com/jangjuya) |
| **김종하** | AI | [@Jongha611](https://github.com/Jongha611) |
| **도형준** | AI/Infra | [@dorae222](https://github.com/dorae222) |
| **정현희** | UI/UX Design (Figma) | - |

---

## 🛠️ 기술 스택

### Frontend
![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.0-646CFF?style=flat-square&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4.0-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-5.0-443E38?style=flat-square&logo=react&logoColor=white)
![React Query](https://img.shields.io/badge/React_Query-5.x-FF4154?style=flat-square&logo=reactquery&logoColor=white)

### Backend
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.5.7-6DB33F?style=flat-square&logo=springboot&logoColor=white)
![Java](https://img.shields.io/badge/Java-21-ED8B00?style=flat-square&logo=openjdk&logoColor=white)
![Gradle](https://img.shields.io/badge/Gradle-8.x-02303A?style=flat-square&logo=gradle&logoColor=white)

### AI/ML
![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi&logoColor=white)
![LangGraph](https://img.shields.io/badge/LangGraph-0.2-1C3C3C?style=flat-square&logo=langchain&logoColor=white)
![LangChain](https://img.shields.io/badge/LangChain-0.3-1C3C3C?style=flat-square&logo=langchain&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-412991?style=flat-square&logo=openai&logoColor=white)

### Database
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![pgvector](https://img.shields.io/badge/pgvector-0.7-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-7.x-DC382D?style=flat-square&logo=redis&logoColor=white)

### Infrastructure
![AWS](https://img.shields.io/badge/AWS-EC2/RDS/ALB-FF9900?style=flat-square&logo=amazonaws&logoColor=white)
![CloudFront](https://img.shields.io/badge/CloudFront-CDN-FF9900?style=flat-square&logo=amazonaws&logoColor=white)
![S3](https://img.shields.io/badge/S3-Storage-569A31?style=flat-square&logo=amazons3&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-1.x-009639?style=flat-square&logo=nginx&logoColor=white)

### DevOps & Tools
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-CI/CD-2088FF?style=flat-square&logo=githubactions&logoColor=white)
![LangSmith](https://img.shields.io/badge/LangSmith-Observability-1C3C3C?style=flat-square&logo=langchain&logoColor=white)
![Secrets Manager](https://img.shields.io/badge/AWS_Secrets-Manager-FF9900?style=flat-square&logo=amazonaws&logoColor=white)

---

## 📁 프로젝트 구조

```
daitdaing/
├── chatbot/              # 🤖 AI 챗봇 서비스 (FastAPI + LangGraph)
│   ├── app/              # FastAPI 애플리케이션
│   │   ├── graphs/       # LangGraph 오케스트레이션
│   │   ├── routers/      # API 라우터
│   │   └── tools/        # RAG, SQL 도구
│   ├── data/             # 상권 분석 데이터
│   └── scripts/          # 유틸리티 스크립트
│
├── itdaing/              # 🔧 백엔드 (Spring Boot)
│   ├── src/              # Java 소스 코드
│   ├── docs/             # API 문서
│   └── app.jar           # 실행 가능한 JAR
│
├── itdaing-app/          # 💻 프론트엔드 (React 19 + PWA)
│   ├── src/
│   │   ├── chatbot/      # 챗봇 UI 컴포넌트
│   │   ├── components/   # 공통 컴포넌트
│   │   └── pages/        # 페이지 컴포넌트
│   └── public/           # PWA 매니페스트, 아이콘
│
└── docs/                 # 📚 공통 문서
```

---

## 🌿 브랜치 전략

| 브랜치 | 용도 | 배포 대상 |
|--------|------|----------|
| `main` | 통합 프로덕션 브랜치 | - |
| `dev/fe` | 프론트엔드 개발 | S3 + CloudFront |
| `dev/be` | 백엔드 개발 | Spring ASG |
| `dev/ai` | AI 서비스 개발 | Chatbot ASG |
| `archive/itdaing-web` | 레거시 프론트 보관 | - |

```
main (통합)
├── dev/be (백엔드)
├── dev/fe (프론트)
├── dev/ai (AI) ← New!
└── archive/itdaing-web
```

---

## 🚀 빠른 시작

### 1. 프론트엔드
```bash
cd itdaing-app
npm install && npm run dev
```

### 2. 백엔드
```bash
cd itdaing
java -jar app.jar
```

### 3. AI 챗봇
```bash
cd chatbot
source .venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 9000
```

---

## 📊 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────────┐
│                        CloudFront (CDN)                          │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Application Load Balancer                     │
├─────────────────────────────────────────────────────────────────┤
│     /api/*  → Spring Boot (ASG)    │    /ai/*  → FastAPI (ASG)   │
└─────────────────────────────────────────────────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    ▼                       ▼
            ┌─────────────┐         ┌─────────────┐
            │   Redis     │         │ PostgreSQL  │
            │  (Session)  │         │ + pgvector  │
            └─────────────┘         └─────────────┘
```

---

## 📋 커밋 규칙 (Gitmoji)

```bash
# 예시
git commit -m "✨ feat: 챗봇 세션 유지 기능 구현"
git commit -m "🐛 fix: 마크다운 렌더링 버그 수정"
git commit -m "🔧 chore: gitignore 업데이트"
git commit -m "📝 docs: README 팀원 정보 추가"
```

---

## 📖 문서

| 문서 | 설명 |
|------|------|
| [QUICK_START.md](itdaing-app/QUICK_START.md) | 빠른 시작 가이드 |
| [BRANCH_STRATEGY.md](docs/BRANCH_STRATEGY.md) | 브랜치 전략 |
| [ARCHITECTURE.md](itdaing-app/docs/ARCHITECTURE.md) | 시스템 아키텍처 |
| [chatbot/README.md](chatbot/README.md) | AI 챗봇 문서 |

---

## 📄 라이선스

인공지능 사관학교 6기 - 팀 프로젝트
