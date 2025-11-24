# Backend Foundation & Master Data
> Source of Truth for the Spring Boot Backend (`/home/ubuntu/itdaing`)

---

## 1. Active Tech Stack (from `docs/TECH_STACK.md`)

- **Framework**: Spring Boot 3.5.7 (Java 21)
- **Build Tool**: Gradle (Kotlin DSL)
- **Database (Planned)**: PostgreSQL 15 + pgvector (AWS RDS) - *Setup In Progress*
- **AI & Chatbot (Planned)**: 
  - LangChain Integration
  - **MemorySaver**: For conversation history persistence
  - **Vector Search**: `pgvector` for RAG
- **Cache**: Redis 7.x (Self-hosted on EC2)
- **Storage**: AWS S3
- **Security**: Spring Security + JJWT (Access/Refresh Token)
- **Documentation**: Swagger/OpenAPI (`/swagger-ui/index.html`)

---

## 2. Master Data & Enum Truths

### 🌍 Regions (Zones)
- **Source**: `ZoneArea` / `ZoneZone` entities.
- **Scope**: Currently limited to **Gwangju (5 Districts)**:
  - Dong-gu, Seo-gu, Nam-gu, Buk-gu, Gwangsan-gu.
- **Usage**: Used for Popup location filtering and "Nearby" queries.

### 🏷️ Categories & Features
- **Categories**: Defined in `Category` entity. Segments Popups (e.g., Fashion, Food, Art).
- **Features**: Defined in `Feature` entity. Popup attributes (e.g., Parking, Pet-friendly, No-kids).
- **Styles**: Defined in `Style` entity. Visual vibe tags (e.g., Modern, Retro).

### 🔐 User Roles
- **CONSUMER**: General B2C user.
- **SELLER**: B2B user, manages popups.
- **ADMIN**: System operator, approves popups/sellers.

---

## 3. Package Structure (DDD Strict)

All code MUST follow this Domain-Driven Design structure:

```
com.da.itdaing.domain.{domainName}
├── api          // Controllers (Web Layer)
├── dto          // Data Transfer Objects (Records)
├── entity       // JPA Entities
├── repository   // JPA Repositories
└── service      // Business Logic
```

### Global Shared Resources
- `com.da.itdaing.global.api` → `ApiResponse`
- `com.da.itdaing.global.error` → `GlobalExceptionHandler`
- `com.da.itdaing.global.security` → JWT Filters
