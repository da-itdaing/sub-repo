# 기술 스택

## 🔧 백엔드

- **Spring Boot** 3.5.7
- **Java** 21
- **PostgreSQL** 15 + pgvector (AWS RDS)
- **Redis** 7.x - 캐싱 및 세션 관리
- **AWS S3** - 이미지 스토리지
- **Gradle** (Kotlin DSL)

---

## 💻 프론트엔드 v2 (itdaing-app - JavaScript 전환)

### 핵심 스택
- **React** 19.2.0
- **Vite** 7.0.0
- **JavaScript** (TypeScript에서 전환)
- **React Router** v7.9.6

### UI/스타일링
- **Tailwind CSS** v4.1.0 (Pure CSS 기반)
- **Lucide React** - 아이콘

### 상태 관리
- **Zustand** - 클라이언트 상태 관리
- **React Query (TanStack Query)** - 서버 상태 관리

### HTTP & 폼
- **Axios** - HTTP 클라이언트
- **React Hook Form** - 폼 관리
- **Zod** - 스키마 검증

### 특징
- ✅ 완전한 JavaScript 전환
- ✅ React 19의 최신 기능 활용
- ✅ Tailwind CSS v4 Pure (CSS 기반)
- ✅ 간결한 상태 관리 (Zustand)

---

## 💻 프론트엔드 v1 (itdaing-web - TypeScript 버전)

### 핵심 스택
- **React** 18.3.1
- **TypeScript** 5.9.3
- **Vite** 6.3.5
- **React Router** v6

### UI/스타일링
- **Tailwind CSS**
- **Radix UI** - 컴포넌트 라이브러리

### 상태 관리
- **Context API** - 클라이언트 상태
- **React Query** - 서버 상태

### 특징
- ⚠️ TypeScript에서 부분 JavaScript 전환 시도
- ⚠️ 진행 중단 상태

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

