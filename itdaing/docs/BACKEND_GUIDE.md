# Backend Architecture Guide

> Companion to `BACKEND_FOUNDATION.md`. Defines the "How" of the Spring Boot backend.

---

## 🏗️ API Architecture Flow

Every Request follows this path:

1.  **Client (React/Axios)**
    - Sends `GET /api/popups` with `Authorization: Bearer {token}`
2.  **Nginx (Reverse Proxy)**
    - Forwards `/api` → `localhost:8080`
3.  **Spring Security Filter Chain**
    - `JwtAuthFilter`: Extracts token, validates signature, loads `UserDetails`.
    - `SecurityConfig`: Checks URL access rules (e.g., `/api/admin/**` needs `ADMIN` role).
4.  **Controller Layer (`domain/{name}/api`)**
    - Accepts `RequestDto`.
    - Calls Service.
    - Returns `ApiResponse<ResponseDto>`.
5.  **GlobalExceptionHandler (`global/error`)**
    - Catches `BusinessException` or `MethodArgumentNotValidException`.
    - Returns JSON error body `{ success: false, error: { ... } }`.

---

## 🔐 Security & Auth Flow

### 1. Login
- **Endpoint**: `POST /api/auth/login`
- **Logic**:
  - Verify ID/Password.
  - Generate **Access Token** (15m) & **Refresh Token** (14d).
  - Store Refresh Token in Redis (`RT:{userId}`).
  - Return both tokens.

### 2. Token Refresh (Silent)
- **Endpoint**: `POST /api/auth/refresh`
- **Logic**:
  - Validate Refresh Token from request body.
  - Check Redis for match.
  - Issue **new Access Token** & **Rotate Refresh Token**.

### 3. Access Control
- **@PreAuthorize**: Use method-level security for fine-grained control.
  ```java
  @PreAuthorize("hasRole('SELLER') and #sellerId == principal.id")
  public void updateShop(...)
  ```

---

## 🗄️ Database & AI Strategy (Planned)

> ⚠️ **Status**: DB setup is currently in progress. The following describes the target architecture.

### Core Tables (PostgreSQL)
- `users`: All accounts (Consumer, Seller, Admin).
- `popups`: Main entity. Linked to `users` (owner).
- `reviews`: Linked to `users` (writer) & `popups`.
- `wishlist`: Many-to-Many (`user_id`, `popup_id`).

### AI & Chatbot Integration
- **Vector Search**: 
  - Tool: `pgvector` extension on PostgreSQL.
  - Use Case: Storing popup description embeddings for semantic search (RAG).
- **Conversation History**:
  - Tool: **MemorySaver** (LangGraph/LangChain).
  - Use Case: Persisting user chat sessions to maintain context across messages.
  - Implementation: Likely storing serialized graph state or conversation checkpoints in Postgres.

### Spatial Data (PostGIS)
- Table: `zone_area` / `zone_cell`.
- Column: `geometry(MultiPolygon, 4326)`.
- Queries: `ST_Contains`, `ST_DWithin` used for "Nearby" search.

---

## 🧪 Testing Strategy

- **Unit Tests**: Service layer logic. Mock Repository.
- **Integration Tests**: `@SpringBootTest`. Use H2 or Testcontainers (Postgres).
- **Commands**:
  - `./gradlew test`: Run all.
  - `./gradlew testPopup`: Run only Popup domain tests.
