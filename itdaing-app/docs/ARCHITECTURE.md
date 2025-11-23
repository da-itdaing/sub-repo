# Itdaing App 아키텍처 가이드

> FE + BE + AI의 전체 구조 및 데이터 흐름

## 시스템 아키텍처

```
External Access

Users (React PWA)
   │  HTTPS
   ▼
Route 53 (CNAME)
   │  HTTPS
   ▼
CloudFront (Static Cache)
   │  HTTPS
   ▼
ALB (HTTPS, ACM)
   │  HTTP (VPC)
   ▼
┌──────────────────────────────────────────── AWS VPC ───────────────────────────────────────────┐
│                                                                                                │
│  Public Subnet                                                                                 │
│     └─ Bastion Host  (SSH → Private Subnet)                                                    │
│                                                                                                │
│  Private Subnet                                                                                │
│     ┌─────────────────────────────┐        /chat        ┌──────────────────────────────┐       │
│     │ App EC2 (Spring Boot)       │────────────────────>│ Chatbot EC2 (FastAPI)        │       │
│     │  - Nginx (/ , /api)         │                     │  - LangGraph Flow            │       │
│     │  - Redis (Local)            │ <─────── SSH ───────│  - systemd service           │       │
│     │  - systemd: app.jar         │                     └────────────┬─────────────────┘       │
│     └──────────────┬──────────────┘                                  │                         │
│                    │ Upload (Presigned URL)                          │ Vector Search           │
│                    ▼                                                 ▼                         │
│             S3 Bucket (Assets)                             RDS PostgreSQL + pgvector           │
│                    ▲                                                 ▲                         │
│                    │                                                 │                         │
│                    └───────── Spring Boot (JPA/DAO) ─────────────────┘                         │
│                                                                                                │
└────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**트래픽 흐름**
1. 사용자는 `https://aischool.daitdaing.com`으로 접속하면 Route53 → CloudFront → ALB(ACM) → Nginx 순으로 전달됩니다.
2. Nginx는 `/` 요청은 `/var/www/itdaing-app`의 React PWA 정적 파일을 서빙하고, `/api`는 Spring Boot로 프록시합니다.
3. Spring Boot는 로컬 Redis를 이용해 세션·캐시·레이트리밋을 처리하고, 데이터는 RDS PostgreSQL(pgvector)에서 조회합니다.
4. 이미지/파일 업로드는 S3 Presigned URL을 통해 이루어집니다.
5. 챗봇 기능은 API Gateway(또는 Spring Gateway)를 통해 별도 EC2에서 운영 중인 LangGraph FastAPI 서버(`/chat`)로 전달되며, 해당 서버도 RDS와 S3를 공유합니다.
6. 모든 Private Subnet 자산(App EC2, Redis, Chatbot EC2)은 Bastion Host를 통해서만 SSH 접근 가능합니다.


## 백엔드 구성 요소

### 1. Spring Boot Application (Port: 8080)
- **역할**: RESTful API 제공
- **환경**: `local` 또는 `prod` 프로파일
- **실행 방법**: `java -jar app.jar` 또는 `./gradlew bootRun`

### 2. Redis Server (Port: 6379)
- **위치**: 백엔드 Spring Boot 인스턴스(EC2) 내부에 직접 설치
- **역할**: 캐싱 및 세션 관리
- **사용 목적**:
  - API 응답 캐싱 (팝업 목록, 카테고리 등)
  - 세션 스토리지 (JWT refresh token)
  - 속도 제한 (Rate Limiting)
- **확인 방법**: `redis-cli ping` → `PONG` 응답
- **상태 확인**: `ps aux | grep redis`

### 3. PostgreSQL Database (Port: 5432)
- **위치**: AWS RDS (전용 서브넷, Security Group으로 제어)
- **역할**: 메인 데이터베이스
- **스키마**:
  - `users` - 사용자 정보
  - `popups` - 팝업 정보
  - `reviews` - 리뷰
  - `wishlists` - 찜하기
  - `zones`, `cells` - 지리적 위치 정보
- **확장**: `pgvector`를 활성화하여 AI 임베딩 저장

### 4. LangGraph 챗봇 서버 (Port: 9000)
- **위치**: 별도 EC2 인스턴스에서 FastAPI + LangGraph 스택 운영
- **역할**: LangGraph + FastAPI로 구성된 챗봇/AI 어시스턴트
- **구성 요소**:
  - FastAPI 서버가 9000 포트에서 REST/WebSocket API 제공
  - LangGraph 플로우가 LLM 호출, 도메인 액션, 툴 실행 관리
  - `PostgresSaver`와 `pgvector`를 통해 대화/문서 임베딩 저장
- **테스트 상태**: 현재는 별도 EC2 인스턴스(또는 동일 인스턴스)에서 실험적으로 기동하고 있으며, API Gateway와 연동하여 통합 예정
- **상태 확인**:
  ```bash
  curl http://localhost:9000/health
  ```

## 데이터 흐름

### 1. 팝업 목록 조회 (홈페이지)

```
[Frontend]
  │
  ├─ 1. usePopups() Hook 호출
  │     └─ React Query로 데이터 요청
  │
  ├─ 2. GET /api/popups
  │     └─ Axios Client → Vite Proxy
  │
  ▼
[Backend]
  │
  ├─ 3. PopupController.getPopups()
  │     └─ @GetMapping("/api/popups")
  │
  ├─ 4. PopupService.getPopups()
  │     │
  │     ├─ Redis 캐시 확인
  │     │   └─ 캐시 있으면 즉시 반환
  │     │
  │     └─ 캐시 없으면 DB 조회
  │         └─ PostgreSQL Query
  │             └─ Redis에 캐시 저장 (TTL: 5분)
  │
  ├─ 5. Response 반환
  │     └─ ApiResponse<List<PopupDto>>
  │
  ▼
[Frontend]
  │
  └─ 6. React Query 캐싱
        └─ 컴포넌트 렌더링
```

### 2. 로그인 과정

```
[Frontend]
  │
  ├─ 1. LoginPage에서 폼 제출
  │     └─ loginId, password
  │
  ├─ 2. POST /api/auth/login
  │     └─ { loginId, password }
  │
  ▼
[Backend]
  │
  ├─ 3. AuthController.login()
  │     │
  │     ├─ 4. 비밀번호 검증
  │     │     └─ BCryptPasswordEncoder
  │     │
  │     ├─ 5. JWT 토큰 생성
  │     │     ├─ Access Token (15분)
  │     │     └─ Refresh Token (14일)
  │     │
  │     └─ 6. Redis에 Refresh Token 저장
  │           └─ Key: "refresh:{userId}"
  │
  ├─ 7. Response 반환
  │     └─ { accessToken, refreshToken, user }
  │
  ▼
[Frontend]
  │
  ├─ 8. localStorage에 토큰 저장
  │     ├─ accessToken
  │     └─ refreshToken
  │
  └─ 9. Zustand Store 업데이트
        └─ authStore.login()
```

### 3. API 호출 (인증 필요)

```
[Frontend]
  │
  ├─ 1. GET /api/users/me
  │     └─ Header: Authorization: Bearer <accessToken>
  │
  ▼
[Backend]
  │
  ├─ 2. JWT 검증
  │     │
  │     ├─ Access Token 유효 → 계속
  │     │
  │     └─ Access Token 만료 → 401 Unauthorized
  │
  ▼
[Frontend]
  │
  ├─ 3. Axios Interceptor (401 에러 감지)
  │     │
  │     ├─ 4. POST /api/auth/refresh
  │     │     └─ { refreshToken }
  │     │
  │     ▼
  │  [Backend]
  │     │
  │     ├─ 5. Redis에서 Refresh Token 확인
  │     │     └─ Key: "refresh:{userId}"
  │     │
  │     ├─ 6. 새 Access Token 발급
  │     │     └─ 새 Refresh Token 발급 (선택)
  │     │
  │     └─ 7. Response 반환
  │           └─ { accessToken, refreshToken }
  │
  ├─ 8. localStorage 업데이트
  │     └─ 새 토큰 저장
  │
  └─ 9. 원래 요청 재시도
        └─ GET /api/users/me (새 토큰 사용)
```

### 3. 챗봇 질의 (실험 환경)

```
[Frontend]
  │
  ├─ 1. POST /api/chatbot/query
  │     └─ { question, scope, metadata }
  │
  ▼
[Backend Gateway]
  │
  ├─ 2. 인증/감사 로깅
  ├─ 3. LangGraph FastAPI 호출
  │     └─ POST http://localhost:9000/query
  │
  ▼
[LangGraph Server]
  │
  ├─ 4. PostgresSaver + pgvector에서 유사도 검색
  ├─ 5. LLM 호출 및 응답 생성
  └─ 6. 답변 + 인용 문서 반환
```

## 캐싱 전략

### Redis 캐시 사용 패턴

| 데이터 타입 | 캐시 키 | TTL | 이유 |
|------------|---------|-----|------|
| 팝업 목록 | `popups:list:{filters}` | 5분 | 자주 조회되지만 실시간성 불필요 |
| 팝업 상세 | `popup:{id}` | 10분 | 상세 정보는 덜 자주 변경됨 |
| 카테고리 | `categories:all` | 1시간 | 거의 변경되지 않음 |
| 사용자 세션 | `refresh:{userId}` | 14일 | Refresh Token 유지 |
| Rate Limit | `rate:{ip}:{endpoint}` | 1분 | API 과용 방지 |

### React Query 캐싱

```javascript
// usePopups.js
export const usePopups = (filters) => {
  return useQuery({
    queryKey: ['popups', filters],
    queryFn: () => fetchPopups(filters),
    staleTime: 5 * 60 * 1000,  // 5분
    cacheTime: 30 * 60 * 1000, // 30분
  });
};
```

## 환경 설정

### Production

```bash
# Backend: prod.env (AWS Parameter Store에서 자동 생성)
SPRING_DATASOURCE_URL=jdbc:postgresql://itdaing-db.xxx.rds.amazonaws.com:5432/itdaing-db
SPRING_DATA_REDIS_HOST=itdaing-redis.xxx.cache.amazonaws.com
SPRING_DATA_REDIS_PORT=6379
CHATBOT_BASE_URL=http://localhost:9000
```

## 서비스 시작 순서

### 필수 실행 순서

1. **PostgreSQL** (항상 실행 중)
   ```bash
   # 로컬: Docker 또는 네이티브 설치
   # AWS: RDS 자동 관리
   ```

2. **Redis** (항상 실행 중)
   ```bash
   # 로컬 확인
   ps aux | grep redis
   redis-cli ping  # PONG 응답 확인
   ```

3. **Backend (Spring Boot)**
   ```bash
   # 프로덕션: systemd 서비스 (AMI 빌드 시 자동 등록)
   sudo systemctl start itdaing-backend.service
   sudo systemctl status itdaing-backend.service
   # Health Check: http://localhost:8080/actuator/health

   # 로컬/수동 실행
   cd /home/ubuntu/itdaing
   java -jar app.jar
   ```

4. **LangGraph 챗봇 (FastAPI 9000)**
   ```bash
   sudo systemctl start langgraph-chatbot.service   # (또는 docker compose up)
   curl http://localhost:9000/health
   ```

5. **Nginx Reverse Proxy**
   ```bash
   sudo systemctl restart nginx
   sudo nginx -t
   # /etc/nginx/conf.d/itdaing.conf 에서 정적 파일(root)과 /api 프록시를 동시에 처리
   ```

## API 응답 형식

### 성공 응답

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "팝업 제목",
    "description": "설명"
  }
}
```

### 에러 응답

```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "입력값이 올바르지 않습니다",
    "fieldErrors": [
      {
        "field": "email",
        "message": "이메일 형식이 올바르지 않습니다"
      }
    ]
  }
}
```

## 성능 최적화

### 1. Redis 캐싱
- 자주 조회되는 데이터는 Redis에 캐싱
- 캐시 히트율: 평균 80% 이상 목표

### 2. React Query 캐싱
- 서버 상태를 클라이언트에서 캐싱
- 불필요한 API 호출 방지

### 3. Vite Proxy
- CORS 문제 해결
- 개발 환경에서 원활한 API 호출

### 4. 이미지/정적 자산
- S3에 이미지 저장, presigned URL을 통해 업로드/조회
- 현재 Nginx + EBS로 정적 파일 제공, S3 + CloudFront 도입 준비 중

## 보안 고려사항

### 1. JWT 토큰
- Access Token: 짧은 유효기간 (15분)
- Refresh Token: Redis에 저장 (14일)
- localStorage 사용 (XSS 주의)

### 2. Redis 세션
- Refresh Token을 Redis에 저장
- 로그아웃 시 Redis에서 제거
- Rate Limiting 키(`rate:{ip}:{endpoint}`) 관리

### 3. 인프라 접근 제어
- Bastion Host를 통해서만 Private 서브넷(Backend/Redis)에 SSH 가능
- 시스템 서비스/배포 스크립트는 Bastion 접속 후 수행
- Secrets Manager + Parameter Store + EC2 IAM Role 조합으로 민감 정보를 systemd EnvironmentFile/프로세스에 주입

### 4. CORS & HTTPS
- 프로덕션: `https://aischool.daitdaing.com` 만 허용
- ACM(ALB)에서 HTTPS 종료 후 Nginx → Spring Boot/H2로 프록시

### 5. Rate Limiting
- Redis를 이용한 API 호출 제한
- IP 기반 제한 (1분에 100회)

## 모니터링

### Backend Health Check
```bash
curl http://localhost:8080/actuator/health
```

### Redis 상태 확인
```bash
redis-cli ping
redis-cli info stats
```

### PostgreSQL 연결 확인
```bash
psql -h localhost -U itdaing_user -d itdaing_local -c "SELECT 1;"
```

### systemd 서비스 로그
```bash
sudo journalctl -u itdaing-backend -f
sudo journalctl -u langgraph-chatbot -f
sudo journalctl -u nginx -f
```

## 관련 문서

- [QUICK_START.md](../QUICK_START.md) - 빠른 시작 가이드
- [UBUNTU_DEVELOPMENT_GUIDE.md](../UBUNTU_DEVELOPMENT_GUIDE.md) - Ubuntu 개발 가이드
- [DEPLOYMENT_STATUS.md](./DEPLOYMENT_STATUS.md) - 배포 상태
- [TEST_ACCOUNTS.md](./TEST_ACCOUNTS.md) - 테스트 계정

