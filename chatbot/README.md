# 🤖 Itdaing AI Chatbot

> **마켓버디 & 셀러버디** - LangGraph 기반 RAG 챗봇 서비스

## 📋 개요

**Itdaing AI Chatbot**은 FastAPI + LangGraph 기반의 AI 챗봇 서비스입니다.

- **마켓버디** (Consumer): 소비자를 위한 플리마켓/팝업스토어 추천
- **셀러버디** (Seller): 판매자를 위한 존/상권 추천

## 🛠️ 기술 스택

| 분류 | 기술 | 버전 |
|------|------|------|
| **Framework** | FastAPI | 0.110+ |
| **Runtime** | Python | 3.12+ |
| **LLM Orchestration** | LangGraph | 1.0.3 |
| **LLM Framework** | LangChain | 1.0.5 |
| **Observability** | LangSmith | 0.4.42+ |
| **LLM Provider** | OpenAI (GPT-4o-mini) | - |
| **Embedding** | OpenAI (text-embedding-3-small) | - |
| **Vector Store** | PGVector | 0.3.6 |
| **Database** | PostgreSQL | 15+ |
| **DB Driver** | psycopg3 + asyncpg | 3.2.12 |
| **Validation** | Pydantic | 2.12.4 |
| **Encryption** | PyCryptodome | 3.21.0 |

## 📁 프로젝트 구조

```
chatbot/
├── app/
│   ├── config.py              # 환경변수 설정 (Pydantic Settings)
│   ├── main.py                # FastAPI 앱, LangGraph 초기화
│   ├── chains/
│   │   ├── consumer/rag.py    # 소비자 RAG 체인
│   │   ├── seller/rag.py      # 판매자 RAG 체인
│   │   └── shared/prompts.py  # 시스템 프롬프트
│   ├── db/postgres.py         # PGVector, AsyncPostgresSaver 헬퍼
│   ├── graphs/
│   │   ├── consumer/          # 소비자 LangGraph 노드 & 빌더
│   │   ├── seller/            # 판매자 LangGraph 노드 & 빌더
│   │   └── shared/            # 공통 유틸 (intent, guardrails)
│   ├── routers/
│   │   ├── chat_consumer.py   # /api/chat/consumer/*
│   │   └── chat_seller.py     # /api/chat/seller/*
│   ├── tools/
│   │   ├── retrieval.py       # consumer_retrieve, seller_retrieve
│   │   └── web_search.py      # DuckDuckGo fallback
│   ├── data/
│   │   ├── markets_loader.py  # 마켓 데이터 → PGVector
│   │   └── zones_loader.py    # 존 데이터 → PGVector
│   ├── utils/
│   │   └── key_rotation.py    # OpenAI API 키 로테이션
│   └── workers/               # 임베딩 워커 (자동화)
├── data/                      # 상권 분석 데이터 (JSON)
├── docs/                      # 문서
├── scripts/                   # 운영 스크립트
├── requirements.txt           # Python 의존성
└── langgraph.json             # LangGraph 설정
```

## 🚀 실행 방법

### 환경 설정

```bash
cd /home/ubuntu/chatbot
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### RAG 데이터 로딩 (최초 1회)

```bash
# 마켓 데이터 (itdaing_popups 컬렉션)
python -m app.data.markets_loader --reset

# 존 데이터 (itdaing_zone 컬렉션)
python -m app.data.zones_loader --reset
```

### 서버 실행

```bash
uvicorn app.main:app --host 0.0.0.0 --port 9001
```

### systemd 서비스

```bash
sudo systemctl start chatbot
sudo systemctl status chatbot
```

## 📝 API 엔드포인트

### Consumer (소비자) API

| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/api/chat/consumer` | 동기 완료 응답 |
| POST | `/api/chat/consumer/stream` | 동기 스트림 |
| POST | `/api/chat/consumer/async` | 비동기 완료 응답 |
| POST | `/api/chat/consumer/async/stream` | 비동기 diff 스트림 |

### Seller (판매자) API

| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/api/chat/seller` | 동기 완료 응답 |
| POST | `/api/chat/seller/stream` | 동기 스트림 |
| POST | `/api/chat/seller/async` | 비동기 완료 응답 |
| POST | `/api/chat/seller/async/stream` | 비동기 diff 스트림 |

### 요청 스키마

```json
{
  "user_id": "string",        // 필수: 사용자 ID
  "session_id": "string",     // 선택: 세션 ID (기본: "default")
  "message": "string",        // 필수: 사용자 메시지
  "thread_id": "string|null", // 선택: 이전 응답의 thread_id
  "restart_thread": false     // 선택: true면 새 대화 시작
}
```

### 응답 스키마

```json
{
  "answer": "string",          // 챗봇 응답
  "thread_id": "string",       // 대화 ID (다음 요청에 재사용)
  "recommendations": [...]     // 추천 항목 (판매자: 존 정보)
}
```

## 🔧 환경 변수

| 변수 | 설명 |
|------|------|
| `OPENAI_API_KEY` | OpenAI API 키 |
| `OPENAI_API_KEY2` | 백업 API 키 (키 로테이션용) |
| `OPENAI_MODEL` | LLM 모델 (기본: gpt-4o-mini) |
| `OPENAI_EMBEDDING_MODEL` | 임베딩 모델 |
| `PGVECTOR_CONNECTION` | PGVector 연결 문자열 |
| `VECTOR_COLLECTION` | 소비자 컬렉션 (itdaing_popups) |
| `PGVECTOR_ZONE_COLLECTION` | 판매자 컬렉션 (itdaing_zone) |
| `LANGSMITH_API_KEY` | LangSmith API 키 |
| `LANGSMITH_PROJECT` | LangSmith 프로젝트명 |
| `LANGGRAPH_AES_KEY` | 체크포인트 암호화 키 |

> ⚠️ 실제 값은 AWS Secrets Manager 또는 `chatbot.env`에서 관리

## 🔄 LangGraph 구조

### 노드 흐름 (Consumer/Seller 공통)

```
START → extract_query → classify_intent → assess_feasibility
      → (rag_answer) case_classification → plan_structured_search
      → schedule_tool → tool_executor → consume_tool
      → generate → check_hallucination → format_answer
      → summarize_messages → truncate_messages → END
```

### Thread ID 전략

- **Consumer**: `consumer:{user_id}:{session_id}`
- **Seller**: `seller:{user_id}:{session_id}`
- `restart_thread=true` → 새 UUID suffix 추가

### 체크포인트

- **저장소**: PostgreSQL (AsyncPostgresSaver)
- **암호화**: AES (LANGGRAPH_AES_KEY)

## 📊 성능 지표

| 지표 | 값 |
|------|-----|
| **싱글턴 Latency** | ~3.9초 |
| **멀티턴 Latency** | ~4.7초 |
| **Error Rate** | 0% |
| **Quality Score** | 4.29/5.0 |

### 최적화 내역

- LLM 호출: 6회 → 2회
- RAG 컨텍스트: 3000자 → 2000자
- 응답 토큰: 256 제한
- 휴리스틱 빠른 경로 (인사/범위외)

## 📚 문서

| 문서 | 설명 |
|------|------|
| [CHATBOT_EVALUATION.md](docs/CHATBOT_EVALUATION.md) | 평가 방법론 |
| [QUALITY_TESTING.md](docs/QUALITY_TESTING.md) | 품질 테스트 |
| [NGINX_STREAMING_CONFIG.md](docs/NGINX_STREAMING_CONFIG.md) | Nginx 스트리밍 설정 |
| [INFRASTRUCTURE_CAPACITY.md](docs/INFRASTRUCTURE_CAPACITY.md) | 인프라 용량 |

## 🧪 테스트

```bash
# LangSmith 테스트 실행
python langsmith-test/run_experiment.py \
  --dataset consumer-single-1202-v1 \
  --experiment test-run
```

## 🚢 배포

### 프로덕션 구성

```
사용자 → CloudFront → ALB → chatbot-tg → FastAPI (9001)
                                          ↓
                            Nginx (9000) → uvicorn (9001)
```

### ASG 설정

- **Min/Max/Desired**: 1 / 3 / 1
- **발표일 권장**: desired=2

## 📄 라이선스

인공지능 사관학교 6기 프로젝트
