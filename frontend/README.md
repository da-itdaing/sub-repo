# Frontend

## Docker로 빌드/실행하기

멀티스테이지 Dockerfile과 Nginx 설정이 포함되어 있습니다. 아래 명령으로 이미지 빌드 후 실행할 수 있습니다.

### 1) 이미지 빌드

```bash
docker build -t final-frontend:latest .
```

### 2) 컨테이너 실행 (기본 80 포트)

```bash
docker run --rm -p 8080:80 final-frontend:latest
```

이제 브라우저에서 http://localhost:8080 접속하면 앱을 확인할 수 있습니다.

### 참고

- Dockerfile: Vite 빌드(Node 20-alpine) → Nginx로 정적 서빙(nginx:alpine)
- `nginx.conf`: SPA 라우팅을 위해 `try_files $uri /index.html;` 설정
- `.dockerignore`: node_modules, dist 등 빌드 컨텍스트 축소

## 로컬 개발

```bash
npm install
npm run dev
```

## 프로덕션 빌드

```bash
npm run build
npm run preview
```

## React DevTools Profiler 사용법

"Profiling not supported" 메시지는 프로덕션 번들(최적화 빌드)을 열었을 때 발생합니다. Profiler는 아래 중 하나가 필요합니다.

- 개발 서버(Development build): 권장. 아래처럼 실행하면 Profiler 탭이 활성화됩니다.

```bash
npm run dev
```

- 프로덕션 프로파일링 빌드: 진단용으로 프로덕션 번들을 프로파일링 전용 빌드로 생성할 수 있습니다. 이 레포는 Vite에서 `VITE_REACT_PROFILE=true`를 사용하면 React의 profiling 번들을 사용하도록 설정되어 있습니다.

```bash
# 프로파일링 빌드 생성
VITE_REACT_PROFILE=true npm run build

# 로컬에서 확인
npm run preview
```

Docker 이미지도 프로파일링 빌드로 만들고 싶다면, 빌드 단계에서 환경변수를 넣어 빌드하세요(간단 방법):

```bash
# 프로파일링 빌드 이미지 (React Profiler 활성화된 프로덕션 번들)
docker build --build-arg VITE_REACT_PROFILE=true -t final-frontend:profile .
```

참고: 프로파일링 빌드는 성능/사이즈 상의 페널티가 있으니, 문제 진단 시에만 사용하고 일반 배포에는 개발 서버 또는 일반 프로덕션 빌드를 사용하세요.
# Frontend (React + Vite + TypeScript)

This app ships three role-specific sections besides the common Home page:
- Consumer: `/consumer/*`
- Seller: `/seller/*`
- Manager: `/manager/*`

All data is mocked in `src/common/data/dummy.ts` and exposed through `src/common/services/api.ts`.

### Use real backend APIs (optional)

This project now supports talking to the real backend per the provided API spec. By default, the app uses the mock API. To enable real HTTP calls:

1) Provide a base URL via environment variable and toggle the flag

```bash
# .env.local (or pass as build args)
VITE_API_BASE_URL=https://your-backend.example.com
VITE_USE_REAL_API=true
```

2) Start the dev server or build as usual. The app will:

- Use JWT from login response and attach it as `Authorization: Bearer <token>`
- Call endpoints like `/api/public/auth/login`, `/api/v1/me`, `/api/v1/popups/{id}`
- Fall back to mock data for still-unspecified endpoints

Notes:
- For logout using cookie strategy, also set `VITE_API_WITH_CREDENTIALS=true` if needed.
- The facade maps server responses to the existing UI types; some fields are best-effort until BE stabilizes.

## Scripts

- `npm run dev` — Start dev server (http://localhost:5173)
- `npm run build` — Type-check and build to `dist/`
- `npm run preview` — Preview the production build

## Quick start

```bash
cd frontend
npm install
npm run dev
```

Build and preview:

```bash
npm run build
npm run preview
```

## Folder structure

```
frontend/
├─ index.html
├─ tsconfig.json
├─ vite.config.ts
├─ src/
│  ├─ main.tsx
│  ├─ styles.css
│  ├─ routes/
│  │  └─ AppRoutes.tsx
│  ├─ screens/
│  │  └─ Home.tsx
│  ├─ types/
│  │  └─ index.ts
│  ├─ common/
│  │  ├─ components/
│  │  │  ├─ BottomTab.tsx
│  │  │  ├─ Card.tsx
│  │  │  ├─ Carousel.tsx
│  │  │  ├─ Chips.tsx
│  │  │  ├─ Header.tsx
│  │  │  └─ SectionHeader.tsx
│  │  ├─ layouts/
│  │  │  └─ BaseLayout.tsx
│  │  ├─ data/
│  │  │  └─ dummy.ts
│  │  └─ services/
│  │     └─ api.ts
│  ├─ consumer/
│  │  ├─ ConsumerRoutes.tsx
│  │  └─ pages/
│  │     ├─ Dashboard.tsx
│  │     ├─ Events.tsx
│  │     └─ Popups.tsx
│  ├─ seller/
│  │  ├─ SellerRoutes.tsx
│  │  └─ pages/
│  │     ├─ Dashboard.tsx
│  │     ├─ Orders.tsx
│  │     └─ Products.tsx
│  └─ manager/
│     ├─ ManagerRoutes.tsx
│     └─ pages/
│        ├─ Approvals.tsx
│        ├─ Dashboard.tsx
│        └─ Reports.tsx
```

## Notes

- The UI is intentionally minimal and styled via `styles.css`.
- Replace dummy data with real APIs later; the `api.ts` module is a good seam to swap implementations.
