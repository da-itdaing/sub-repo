<p align="center">
  <img src="https://img.shields.io/badge/DaItdaing-플리마켓_연결_플랫폼-eb0000?style=for-the-badge" alt="DaItdaing"/>
</p>

<h1 align="center">다잇다잉 (DaItdaing)</h1>

<p align="center">
  <strong>흩어진 플리마켓 정보를 하나로, 취향 맞춤 연결 플랫폼</strong>
</p>

<p align="center">
  <a href="https://aischool.daitdaing.com/"><img src="https://img.shields.io/badge/Live_Demo-aischool.daitdaing.com-eb0000?style=flat-square" alt="Live Demo"/></a>
  <a href="https://da-itdaing.github.io/sub-repo/#/"><img src="https://img.shields.io/badge/API_Docs-OpenAPI-85EA2D?style=flat-square" alt="API Docs"/></a>
</p>

## 프로젝트 소개

**다잇다잉**은 광주광역시의 플리마켓, 팝업스토어, 전시회, 축제 정보를 한 곳에 모아 제공하는 플랫폼입니다.

| 사용자 | 주요 기능 |
|--------|----------|
| **소비자** | 플리마켓 검색, AI 맞춤 추천 (마켓버디), 찜하기, 리뷰, PWA |
| **판매자** | 존/셀 기반 위치 선정, AI 상권 분석 (셀러버디), 팝업 등록 |
| **관리자** | 사용자/팝업/존 관리, 검수 시스템, 대시보드 |

## 팀원

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/ChaeRi0609">
        <img src="https://github.com/ChaeRi0609.png" width="80px;" alt="황채리"/><br/>
        <sub><b>황채리</b></sub>
      </a><br/>
      <sub>Frontend</sub>
    </td>
    <td align="center">
      <a href="https://github.com/jangjuya">
        <img src="https://github.com/jangjuya.png" width="80px;" alt="장주찬"/><br/>
        <sub><b>장주찬</b></sub>
      </a><br/>
      <sub>Backend</sub>
    </td>
    <td align="center">
      <a href="https://github.com/Jongha611">
        <img src="https://github.com/Jongha611.png" width="80px;" alt="김종하"/><br/>
        <sub><b>김종하</b></sub>
      </a><br/>
      <sub>AI</sub>
    </td>
    <td align="center">
      <a href="https://github.com/dorae222">
        <img src="https://github.com/dorae222.png" width="80px;" alt="도형준"/><br/>
        <sub><b>도형준</b></sub>
      </a><br/>
      <sub>AI / Infra</sub>
    </td>
    <td align="center">
      <img src="https://cdn-icons-png.flaticon.com/512/5968/5968705.png" width="80px;" alt="정현희"/><br/>
      <sub><b>정현희</b></sub><br/>
      <sub>UI/UX Design</sub>
    </td>
  </tr>
</table>

> 인공지능 사관학교 6기 팀 프로젝트

## 기술 스택

### Frontend
![React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=flat-square&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.0.0-646CFF?style=flat-square&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4.1.0-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![TanStack Query](https://img.shields.io/badge/TanStack_Query-5.90-FF4154?style=flat-square&logo=reactquery&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-5.0.8-764ABC?style=flat-square)

### Backend
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.5.7-6DB33F?style=flat-square&logo=springboot&logoColor=white)
![Java](https://img.shields.io/badge/Java-21-ED8B00?style=flat-square&logo=openjdk&logoColor=white)
![Spring Security](https://img.shields.io/badge/Spring_Security-6.x-6DB33F?style=flat-square&logo=springsecurity&logoColor=white)
![QueryDSL](https://img.shields.io/badge/QueryDSL-5.0.0-007ACC?style=flat-square)

### AI
![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?style=flat-square&logo=fastapi&logoColor=white)
![LangGraph](https://img.shields.io/badge/LangGraph-1.0.3-1C3C3C?style=flat-square&logo=langchain&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-412991?style=flat-square&logo=openai&logoColor=white)

### Database & Infra
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![pgvector](https://img.shields.io/badge/pgvector-0.3.6-4169E1?style=flat-square)
![Redis](https://img.shields.io/badge/Redis-7.x-DC382D?style=flat-square&logo=redis&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-EC2/RDS/ALB-FF9900?style=flat-square&logo=amazonaws&logoColor=white)
![CloudFront](https://img.shields.io/badge/CloudFront-CDN-8C4FFF?style=flat-square&logo=amazonaws&logoColor=white)

## 프로젝트 구조

```
daitdaing/
├── itdaing-app/     # Frontend (React 19 + Vite + PWA)
├── itdaing/         # Backend (Spring Boot 3.5)
├── chatbot/         # AI Service (FastAPI + LangGraph)
└── docs/            # 공통 문서
```

## 브랜치 전략

| 브랜치 | 용도 | 담당 |
|--------|------|------|
| `main` | 통합 프로덕션 | - |
| `dev/fe` | 프론트엔드 개발 | 황채리 |
| `dev/be` | 백엔드 개발 | 장주찬 |
| `dev/ai` | AI 서비스 개발 | 김종하, 도형준 |

## 빠른 시작

```bash
# Frontend
cd itdaing-app && npm install && npm run dev

# Backend
cd itdaing && ./gradlew bootRun

# AI Chatbot
cd chatbot && source .venv/bin/activate && uvicorn app.main:app --port 9001
```

## 시스템 아키텍처

```
User → CloudFront → ALB ─┬─ /api/* → Spring Boot (ASG) → PostgreSQL + Redis
                         └─ /ai/*  → FastAPI (ASG)    → pgvector
```

## 문서

| 문서 | 설명 |
|------|------|
| [itdaing-app/README.md](itdaing-app/README.md) | 프론트엔드 가이드 |
| [itdaing/README.md](itdaing/README.md) | 백엔드 가이드 |
| [chatbot/README.md](chatbot/README.md) | AI 챗봇 가이드 |
| [API Docs](https://da-itdaing.github.io/sub-repo/#/) | OpenAPI 문서 |

## 커밋 규칙

```
✨ feat: 새 기능    🐛 fix: 버그 수정    📝 docs: 문서
♻️ refactor: 리팩터링    💄 style: UI/스타일    🔧 chore: 설정
```
