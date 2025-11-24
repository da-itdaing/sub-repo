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
- ⚠️ **Status Logic**: "Ended" filtering logic needs to be strictly enforced in QueryDSL.

## 4. Database & AI (Pending Setup)
- 🛑 **DB Connection**: PostgreSQL connection setup is NOT complete.
- 🛑 **Chatbot**: Integration with LLM and `MemorySaver` logic is pending.
- 🛑 **Vector Embeddings**: `popup_embedding` table and ingestion pipeline are planned but not active.

## 5. Reviews & Wishlist
- ✅ **Entities**: Tables exist.
- ⚠️ **API**: Endpoints defined but need rigorous testing with frontend.
- ⚠️ **Image Upload**: S3 integration for Review Images needs verification.

## 6. Documentation
- ✅ **Swagger**: Available at `/swagger-ui/index.html`.
- ⚠️ **Sync**: OpenAPI spec needs to be regenerated after recent DTO changes.
