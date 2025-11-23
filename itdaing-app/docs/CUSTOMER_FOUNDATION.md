# Consumer Foundation & Master Data

> Source-consolidated reference for the consumer app (React 19, `/home/ubuntu/itdaing-app`) and the Spring Boot backend (`/home/ubuntu/itdaing`).

---

## 1. Active Tech Stack (from `docs/TECH_STACK.md`)

### Frontend (itdaing-app)
- React 19.2.0 + Vite 7 (pure JavaScript build)
- Tailwind CSS v4.1.0 (pure CSS) + Lucide React icons
- State: Zustand (client) + React Query (server cache)
- Forms & Validation: React Hook Form + Zod
- HTTP: Axios with auth interceptors

### Backend (itdaing)
- Spring Boot 3.5.7 (Java 21) with Gradle Kotlin DSL
- PostgreSQL 15 + pgvector (AWS RDS) as the main DB
- Redis 7.x for refresh tokens, caching, and rate limiting
- AWS S3 for asset storage

---

## 2. Master Data & Contract Truth

| Domain | Canonical Source | Notes / Limits |
| --- | --- | --- |
| Regions | `GET /api/master/regions` | Only 광주 5개구: 동구, 서구, 남구, 북구, 광산구. These IDs must be used across signup filters, local feeds, and Nearby Explore. |
| Categories | `GET /api/master/categories` | Distinguish POPUP vs CONSUMER categories. Consumer interest selection uses these IDs (1~4 items). |
| Styles | `GET /api/master/styles` | Styled chips in signup/MyPage must hydrate from this list (min 1, max 4 selections). |
| Features | `GET /api/master/features` | Convenience/amenity chips (min 1, max 4 selections). |
| Signup Limits | `SignupConsumerRequest` schema (OpenAPI) | `interestCategoryIds`: 1~4, `styleIds`: 1~4, `regionIds`: 1~2, `featureIds`: 1~4, `ageGroup`: enumerated tens (10~90). |
| Wishlist/Favorites | `wishlist` handling (TBD) | Any “관심 팝업” action must check auth, sync to backend, and refresh MyPage favorites. |
| Reviews | `/api/popups/{popupId}/reviews`, `/api/reviews/{id}` | Consumers can create one review per popup (`uk_review_once`). Require login prompts and React Query invalidation. |

**Implementation rule:** UI components must always derive chip labels/options from the master endpoints (or their cached Zustand/React Query stores). No hard-coded duplicates (e.g., 광산구 spelled twice).

---

## 3. Documentation Expectations (`/home/ubuntu/itdaing-app/docs`)

Existing shared docs:
- `ARCHITECTURE.md` (React ↔ Spring flow, cache strategy)
- `SELLER_GUIDE.md`, `SELLER_DASHBOARD_REBUILD_TODO.md`
- `KAKAO_MAP_INTEGRATION.md`
- `TEST_ACCOUNTS.md`, `DEPLOYMENT_STATUS.md`

Required consumer-focused docs to add/maintain (seller-guide parity):
1. **`CUSTOMER_GUIDE.md`** – mirrors `SELLER_GUIDE.md` for consumer journeys (home, signup, nearby, detail, reviews).
2. **`CONSUMER_DOC_TODO.md`** – running checklist for consumer features/doc gaps (similar to seller rebuild TODO).
3. **`CONSUMER_GAP_REPORT.md`** – living report capturing code vs UX/contract gaps discovered during audits.

All future consumer updates must:
- Live under `/home/ubuntu/itdaing-app/docs`.
- Reference the canonical stack + master data above.
- Link to relevant source files (e.g., `/src/pages/HomePage.jsx`).

---

## 4. Next Actions for Step Completion

1. Use this foundation doc as the reference for subsequent architectural/UX mapping (Plan Step 2).
2. Ensure React Query stores (e.g., `useMasterData`) hydrate from the master endpoints listed.
3. When documenting or auditing flows, update/extend the consumer doc set listed above.


