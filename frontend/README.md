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
# Frontend (React + Vite + TypeScript)

This app ships three role-specific sections besides the common Home page:
- Consumer: `/consumer/*`
- Seller: `/seller/*`
- Manager: `/manager/*`

All data is mocked in `src/common/data/dummy.ts` and exposed through `src/common/services/api.ts`.

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
