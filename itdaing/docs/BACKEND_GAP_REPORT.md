# Backend Gap Report

> Audit of `itdaing` (Spring Boot) against `itdaing-app` (React) expectations.

_Last Updated: 2025-11-24_

---

## 1. Authentication
- ✅ **Login (`/auth/login`)**: Implemented. Returns Access/Refresh tokens.
- ✅ **Refresh (`/auth/refresh`)**: Implemented. Rotates tokens.
- ⚠️ **Logout (`/auth/logout`)**: Needs to verify Redis deletion logic.
- ⚠️ **Social Login**: Pending Kakao integration.

## 2. Master Data
- ✅ **Regions**: Fixed to Gwangju 5 districts.
- ✅ **Categories/Styles**: Seed data present (`DevDataSeed`).
- ⚠️ **Sync**: Ensure frontend enum IDs match backend DB IDs exactly.

## 3. Popups
- ✅ **CRUD**: Basic operations implemented.
- ✅ **Search**: Spatial query (`ST_DWithin`) working.
- ⚠️ **Vector Search**: `pgvector` integration is planned but not fully exposed to API.
- ✅ **Status Logic**: `/api/popups` 기본 응답에서 종료된 팝업을 제외하고 `includeEnded=true` 플래그로 과거 데이터를 명시적으로 조회하도록 정비 완료.

## 4. Database & AI (Pending Setup)
- 🛑 **DB Connection**: PostgreSQL connection setup is NOT complete.
- 🛑 **Chatbot**: Integration with LLM and `MemorySaver` logic is pending.
- 🛑 **Vector Embeddings**: `popup_embedding` table and ingestion pipeline are planned but not active.

## 5. Reviews & Wishlist
- ✅ **Entities**: Tables exist.
- ✅ **API**: Wishlist 컨트롤러가 `Long` principal을 직접 주입하도록 수정되어 POST/DELETE/GET 호출 시 인증 오류가 제거되었다.
- ✅ **Image Upload**: `/api/uploads/images` 재점검 완료 (S3 업로드, 10MB/10개 제한, MIME 검증, 에러 메시지 일원화).

## 6. Documentation
- ✅ **Swagger**: Available at `/swagger-ui/index.html`.
- ⚠️ **Sync**: OpenAPI spec needs to be regenerated after recent DTO changes.
