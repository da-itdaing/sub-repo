## Chatbot DB 설계 및 연결 정보

챗봇(LangGraph + OpenAI) 기능에서 사용하는 **PostgreSQL / pgvector** 관련 정보를 정리한 문서입니다.  
백엔드(Spring Boot)에서 사용 중인 **기존 RDS PostgreSQL 인스턴스를 공유**하는 것을 전제로 합니다.

---

### 1. 연결 정보 개요

- **DB 종류**: Amazon RDS for PostgreSQL  
- **공유 사용**: 기존 `itdaing` 애플리케이션과 동일 인스턴스 사용  
- **접속 방식**
  - Spring Boot:
    - `SPRING_DATASOURCE_URL`
    - `SPRING_DATASOURCE_USERNAME`
    - `SPRING_DATASOURCE_PASSWORD`
  - Chatbot (Python):
    - `PGVECTOR_CONNECTION` (SQLAlchemy/psycopg DSN)
    - `POSTGRES_HOST`
    - `POSTGRES_PORT`
    - `POSTGRES_DB`
    - `POSTGRES_USER`
    - `POSTGRES_PASSWORD`

이 값들은 운영 환경에서 **AWS SSM Parameter Store + Secrets Manager**로부터 가져와  
`generate-prod-env.sh` / `generate-chatbot-env.sh` 스크립트가 각각의 `.env` 또는 환경변수를 생성합니다.

---

### 2. Parameter Store / Secrets Manager 사용 규칙

- **Parameter Store (SSM)**
  - `/itdaing/prod/db/url` – JDBC PostgreSQL URL
  - `/itdaing/prod/db/username` – DB 사용자명
  - `/itdaing/prod/db/password` – DB 비밀번호
  - `/itdaing/prod/aws/region` – 리전
  - `/itdaing/prod/rds/ca-bundle` – RDS CA 번들 (PEM) 내용

- **Secrets Manager (`itdaing/prod/app-secrets`)**
  - `openai_api_key`
  - `tavily_api_key`
  - `langsmith_api_key`
  - `langsmith_project`
  - `langsmith_tracing`
  - `langchain_api_key`
  - `langchain_tracing_v2`
  - `langchain_endpoint`
  - (백엔드 전용) `jwt_secret`, `kakao_map_app_key` 등

---

### 3. Chatbot용 환경 변수 (Python 관점)

`~/scripts/generate-chatbot-env.sh` 가 생성하는 `chatbot.env` 의 핵심 키:

- **App / 모델 키**
  - `APP_ENV=prod`
  - `OPENAI_API_KEY`
  - `TAVILY_API_KEY`
  - (모델명은 코드에서 설정) `OPENAI_MODEL`, `OPENAI_EMBEDDING_MODEL`

- **PGVector 연결**
  - `PGVECTOR_CONNECTION`  
    - 예: `postgresql+psycopg://<user>:<password>@<host>:<port>/<db>`
  - `VECTOR_COLLECTION=itdaing_popups` (기본 컬렉션명)

- **PostgreSQL 기본 정보**
  - `POSTGRES_USER`
  - `POSTGRES_PASSWORD`
  - `POSTGRES_DB`
  - `POSTGRES_HOST`
  - `POSTGRES_PORT`

- **LangSmith / LangChain**
  - `LANGSMITH_API_KEY`
  - `LANGSMITH_PROJECT`
  - `LANGSMITH_TRACING`
  - `LANGCHAIN_API_KEY`
  - `LANGCHAIN_TRACING_V2`
  - `LANGCHAIN_ENDPOINT`

- **RDS CA**
  - `RDS_CA_BUNDLE_PATH=/home/ubuntu/rds-combined-ca-bundle.pem`

---

### 4. pgvector 확장 및 기본 스키마

#### 4.1. pgvector 확장 설치

RDS에 접속 후, 필요한 데이터베이스에서 한 번만 실행:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

기본적으로 **`chatbot` 스키마**를 만들어 챗봇 관련 테이블을 분리하는 것을 권장합니다.

```sql
CREATE SCHEMA IF NOT EXISTS chatbot;
```

---

### 5. 추천 테이블 스키마

아래 스키마는 **초기 제안안**이며, 실제 운영 시 서비스 요구사항에 맞게 조정 가능합니다.

#### 5.1. 임베딩 테이블 (`chatbot.embeddings`)

팝업/컨텐츠 등의 텍스트를 임베딩한 결과를 저장하는 테이블입니다.

```sql
CREATE TABLE IF NOT EXISTS chatbot.embeddings (
    id           BIGSERIAL PRIMARY KEY,
    collection   TEXT NOT NULL,          -- 예: 'itdaing_popups'
    item_id      TEXT NOT NULL,          -- 연동할 도메인 ID (popup_id 등)
    content      TEXT NOT NULL,          -- 원문 텍스트 (요약/설명)
    embedding    vector(1536) NOT NULL,  -- OpenAI 임베딩 차원 수에 맞춤
    metadata     JSONB,                  -- 추가 메타데이터 (카테고리, 태그 등)
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

벡터 검색 속도를 위한 인덱스:

```sql
-- IVF Flat 인덱스 (RDS pgvector 지원 버전 기준)
CREATE INDEX IF NOT EXISTS idx_embeddings_collection
    ON chatbot.embeddings (collection);

CREATE INDEX IF NOT EXISTS idx_embeddings_item_id
    ON chatbot.embeddings (item_id);

CREATE INDEX IF NOT EXISTS idx_embeddings_vector_ivfflat
    ON chatbot.embeddings
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);
```

> `lists` 파라미터는 데이터 양에 따라 조정 (초기에는 100, 이후 트래픽/데이터 보고 튜닝).

---

#### 5.2. 대화 세션 테이블 (`chatbot.chat_sessions`)

사용자별 챗봇 대화 세션(대화방)을 관리하는 테이블입니다.  
세션 생성/목록 조회 등은 Spring Boot 또는 Python 중 한쪽에서 일관되게 책임지도록 결정합니다.

```sql
CREATE TABLE IF NOT EXISTS chatbot.chat_sessions (
    id              UUID PRIMARY KEY,          -- session_id
    user_id         BIGINT NOT NULL,          -- itdaing 사용자 PK (타입은 실제 User PK에 맞춤)
    bot_type        TEXT NOT NULL,            -- 'CONSUMER' | 'SELLER' 등
    title           TEXT,                     -- 세션 제목 (첫 질문 요약 등)
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata        JSONB                      -- 기타 정보 (client, locale 등)
);
```

인덱스:

```sql
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user
    ON chatbot.chat_sessions (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_last_message
    ON chatbot.chat_sessions (last_message_at DESC);
```

---

#### 5.3. 대화 메시지 테이블 (`chatbot.chat_messages`)

각 세션에 속한 사용자/챗봇 메시지를 저장하는 테이블입니다.

```sql
CREATE TABLE IF NOT EXISTS chatbot.chat_messages (
    id             BIGSERIAL PRIMARY KEY,
    session_id     UUID NOT NULL REFERENCES chatbot.chat_sessions(id) ON DELETE CASCADE,
    role           TEXT NOT NULL,        -- 'USER' | 'ASSISTANT' | 'SYSTEM'
    message_index  INT NOT NULL,         -- 세션 내 순번
    content        TEXT NOT NULL,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    meta           JSONB                 -- 모델, 토큰 수, trace_id 등
);
```

인덱스:

```sql
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_order
    ON chatbot.chat_messages (session_id, message_index);

CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at
    ON chatbot.chat_messages (created_at);
```

---

### 6. Spring Boot ↔ Chatbot 서비스에서 사용하는 키

**요청 시 공통으로 사용하는 식별자/필드:**

- `bot_type` : `"CONSUMER"` / `"SELLER"` / 향후 확장 가능한 문자열
- `user_id` : 인증된 사용자 ID (Spring Security 기준)
- `session_id` : `chatbot.chat_sessions.id` 와 매핑되는 UUID

**권장 플로우 (요약)**:

1. 프론트 → Spring Boot `/api/chat` 요청
2. Spring Boot:
   - 인증/권한 확인
   - `chat_sessions` / `chat_messages` 조회 및 필요 시 생성
   - `user_id`, `session_id`, `bot_type`, `message`, (옵션) `history` 를 Python `/chat` 으로 전달
3. Python(Chatbot):
   - `PGVECTOR_CONNECTION`을 사용하여 `chatbot.embeddings` 및 필요 시 세션/메시지 테이블 접근
   - LangGraph + OpenAI로 답변 생성
4. Spring Boot:
   - 응답 저장 (`chat_messages` 업데이트, `last_message_at` 갱신)
   - 프론트에 반환

---

### 7. 운영 시 주의사항

- **스키마 변경 시**
  - 이 문서(`CHATBOT_DB.md`)를 함께 업데이트
  - 관련 마이그레이션 스크립트(예: Flyway, Liquibase, 수동 SQL)를 별도 관리

- **타입 일관성**
  - `user_id` 타입은 기존 `users` 테이블의 PK 타입과 맞출 것 (`BIGINT` / `UUID` 등)
  - `bot_type`, `role` 컬럼은 enum 대신 TEXT로 시작하되, 애플리케이션 레벨에서 enum으로 관리 가능

- **보안**
  - DB 접속 정보는 항상 SSM/Secrets를 통해 관리하고, `.env` 파일은 Git에 커밋하지 않음
  - 운영 서버의 `.env` / `chatbot.env` 는 `chmod 600` 이상 권한으로 제한

이 문서는 **챗봇 관련 DB/pgvector 설계의 단일 기준(Single Source of Truth)** 으로 사용하며,  
향후 스키마 변경이나 인덱스 튜닝이 있을 때마다 여기서 함께 관리합니다.


