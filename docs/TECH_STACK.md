# 기술 스택

## Backend (itdaing/)

| 계층 | 사용 기술 | 비고 |
|------|-----------|------|
| 애플리케이션 | Spring Boot 3.5.7 (Java 21), Gradle | REST API, JWT 인증, OpenAPI |
| 데이터베이스 | PostgreSQL 15 + pgvector (AWS RDS) | 트랜잭션 + 임베딩 저장 |
| 캐시/세션 | Redis 7.x | 세션, 캐시 |
| 스토리지 | AWS S3 | 이미지 업로드, presigned URL |
| 보안 | AWS Secrets Manager + SSM | 환경변수 주입 |
| 배포 | ASG + ALB | Auto Scaling 지원 |

## Frontend (itdaing-app/)

| 영역 | 스택 | 버전 |
|------|------|------|
| 프레임워크 | React + Vite | 19.2.0 / 7.0.0 |
| 상태 관리 | Zustand + TanStack Query | 5.0.8 / 5.90 |
| UI/스타일 | Tailwind CSS + Motion | 4.1.0 / 11.15 |
| HTTP/검증 | Axios + Zod | 1.13.2 / 4.1.12 |
| 지도 | react-kakao-maps-sdk | 1.2.0 |
| 배포 | S3 + CloudFront | CDN |

## AI (chatbot/)

| 영역 | 스택 | 버전 |
|------|------|------|
| 프레임워크 | FastAPI | 0.110 |
| 오케스트레이션 | LangGraph + LangChain | 1.0.3 / 1.0.5 |
| LLM | OpenAI GPT-4o-mini | - |
| 벡터DB | pgvector | 0.3.6 |
| 체크포인트 | AsyncPostgresSaver | - |
| 배포 | ASG + ALB (/ai/*) | Port 9001 |

## 인프라 아키텍처

```
User → CloudFront → ALB ─┬─ /api/* → Spring Boot ASG → RDS + Redis
                         └─ /ai/*  → FastAPI ASG    → RDS (pgvector)
                         
CloudFront → S3 (정적 파일)
```

| 리소스 | 설정 |
|--------|------|
| CloudFront | `d13zy39nisv09l.cloudfront.net` |
| S3 버킷 | `daitdaing-frontend-prod` |
| ALB | `aischool-bastion-alb` |
| RDS | `db.t3.medium` (PostgreSQL 15) |

---

## 📊 기술 스택 비교

| 항목 | v1 (itdaing-web) | v2 (itdaing-app) |
|------|-----------------|-----------------|
| **시도** | 1차 (부분 전환) | 2차 (완전 전환) |
| **언어** | TS → 부분 JS | **완전 JS** ✅ |
| **React** | 18.3.1 | **19.2.0** ✅ |
| **Vite** | 6.3.5 | **7.0.0** ✅ |
| **스타일링** | Tailwind + Radix UI | **Tailwind v4 Pure** ✅ |
| **상태관리** | Context API | **Zustand** ✅ |
| **라우터** | React Router v6 | **React Router v7** ✅ |
| **개발 속도** | 중간 | **빠름** ✅ |
| **타입 안정성** | 높음 | 중간 |
| **유지보수** | 복잡 | **간단** ✅ |
| **상태** | 진행 중단 | **현재 진행 중** ✅ |

---

## 🎯 기술 스택 선택 이유 (v2)

### 1. JavaScript 전환
**이유**:
- 개발 속도 향상 (타입 정의 불필요)
- 프로토타입 빠른 구현
- 러닝 커브 감소

**단점**:
- 타입 안정성 감소 (Zod로 런타임 검증)
- IDE 자동완성 제한

### 2. React 19
**이유**:
- Server Components (향후 활용)
- 개선된 성능
- 최신 기능 활용

### 3. Vite 7
**이유**:
- 빠른 HMR (Hot Module Replacement)
- 최적화된 빌드
- 향상된 개발 경험

### 4. Tailwind CSS v4
**이유**:
- Pure CSS 기반 (JavaScript 엔진 불필요)
- 빌드 속도 향상
- 더 작은 번들 크기

### 5. Zustand
**이유**:
- 간결한 API
- 보일러플레이트 최소화
- Context API보다 간단

---

## 📦 주요 의존성

### 백엔드
```gradle
dependencies {
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-data-redis")
    implementation("org.postgresql:postgresql")
    implementation("com.amazonaws:aws-java-sdk-s3")
}
```

### 프론트엔드 v2 (itdaing-app)
```json
{
  "dependencies": {
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "react-router-dom": "^7.9.6",
    "zustand": "^5.0.8",
    "@tanstack/react-query": "^5.90.10",
    "axios": "^1.13.2",
    "react-hook-form": "^7.66.1",
    "zod": "^4.1.12",
    "lucide-react": "^0.554.0",
    "tailwind-merge": "^3.4.0",
    "clsx": "^2.1.1"
  },
  "devDependencies": {
    "vite": "^7.0.0",
    "@vitejs/plugin-react": "^5.0.0",
    "tailwindcss": "^4.1.0"
  }
}
```

---

## ☁️ 인프라 & 배포

| 구성 | 기술 | 비고 |
|------|------|------|
| Reverse Proxy | **Nginx + AWS ACM** | HTTPS 종단, `/` 정적 파일 + `/api` 백엔드 라우팅 |
| Compute | **AWS EC2** | Bastion을 통한 접속, AMI 기반 Auto Scaling 계획 |
| Database | **Amazon RDS (PostgreSQL + pgvector)** | 트랜잭션 + 임베딩 저장 |
| Cache/Session | **Self-hosted Redis 7.x (EC2)** | Backend 인스턴스에 직접 설치, 세션/캐시/Rate Limit |
| Secrets | **Secrets Manager + SSM Parameter Store** | IAM Role 기반 런타임 주입 |
| Storage | **Amazon S3** | 이미지 업로드, 정적 리소스 |
| CDN (Plan) | **S3 + CloudFront** | 정적 자산 글로벌 캐싱(예정) |
| Delivery | `npm run build` → `cp dist/* /usr/share/nginx/html` | PWA 산출물 포함 |

---

## 🤖 AI / 챗봇 스택 (실험)

- **LangGraph**로 대화 플로우 관리, **FastAPI** 서버(포트 9000)에서 API 제공 (별도 EC2 인스턴스)
- **PostgresSaver + pgvector**를 활용하여 임베딩/대화 로그를 PostgreSQL에 저장
- 백엔드/프론트엔드와의 통합은 API Gateway → Backend → Front 흐름으로 확장 예정
- Swagger(OpenAPI) 문서는 main 브랜치에서 GitHub Actions가 [`https://da-itdaing.github.io/sub-repo/#/`](https://da-itdaing.github.io/sub-repo/#/) 로 배포

---

## 🔄 마이그레이션 전략

### TypeScript → JavaScript

#### 1단계: 파일 확장자 변경
- `.tsx` → `.jsx`
- `.ts` → `.js`

#### 2단계: 타입 제거
- `interface`, `type` 정의 제거
- 함수 매개변수 타입 제거
- 제네릭 제거

#### 3단계: 런타임 검증 추가
- Zod 스키마로 API 응답 검증
- React Hook Form + Zod로 폼 검증

#### 4단계: JSDoc 활용 (선택)
```javascript
/**
 * 팝업 목록을 가져옵니다
 * @param {Object} filters - 필터 옵션
 * @param {string} filters.category - 카테고리
 * @param {number} filters.page - 페이지 번호
 * @returns {Promise<Array>} 팝업 목록
 */
export const fetchPopups = async (filters) => {
  // ...
};
```

---

## 📚 관련 문서

- [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) - 개발 환경 설정
- [BRANCH_STRATEGY.md](./BRANCH_STRATEGY.md) - 브랜치 전략
- [itdaing-app/README.md](../itdaing-app/README.md) - 프론트엔드 v2 상세 가이드

