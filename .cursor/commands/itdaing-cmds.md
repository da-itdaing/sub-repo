# Itdaing Project Commands

## 🎯 Context Shortcuts

### /consumer
**Focus:** World A (Consumer App)
- **Tech:** Mobile-first, `max-w-[480px]`, BottomNav, React 19.
- **Persona:** B2C User (Map, Popup, Reviews).

### /dashboard
**Focus:** World B (Seller/Admin Dashboard)
- **Tech:** Desktop-first, Sidebar, Charts, Tables.
- **Persona:** B2B User (Manage Popups, Analytics, Users).

### /api-gen
**Instruction:** Generate Axios call code based on `openapi.json`. Unwrap `response.data.data`.

### /scaffold
**Instruction:** Generate feature structure (`src/features/<name>`) with hooks and components.

---

## 🛠️ Development Commands

### Frontend (itdaing-app)
- **Install:** `npm install`
- **Run Dev:** `npm run dev`
- **Build:** `npm run build`
- **Lint:** `npm run lint`

### Backend (itdaing)
- **Run:** `./gradlew bootRun`
- **Test All:** `./gradlew test`
- **Test Domain:** `./gradlew testPopup`, `./gradlew testUser` (Defined in `build.gradle.kts`)

---

## 🌿 Git Workflow Shortcuts

### Sync Backend Changes to Frontend
```bash
git checkout dev/fe && git merge --ff-only dev/be
```

### Start New QA Feature
```bash
git checkout dev/fe && git pull origin dev/fe
git checkout -b test/fe/feature-name
```

### Push to Staging
```bash
git checkout dev/fe && git merge --ff-only test/fe
git push origin dev/fe
```

---

## ☁️ Infra & Environment

### Check Backend Environment (EC2)
```bash
cd ~/itdaing && source prod.env
echo "DB: $SPRING_DATASOURCE_URL"
```

### Check Java Process
```bash
lsof -ti:8080
```

### Tail Backend Logs
```bash
tail -f ~/itdaing/logs/app.log
```
