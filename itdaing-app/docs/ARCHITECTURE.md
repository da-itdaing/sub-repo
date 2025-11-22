# Itdaing App 아키텍처 가이드

> 📐 프론트엔드와 백엔드의 전체 구조 및 데이터 흐름

## 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────┐
│                   Frontend (React)                       │
│                  http://localhost:3000                   │
│                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Pages      │  │  Components  │  │    Hooks     │  │
│  │              │  │              │  │              │  │
│  │  HomePage    │  │  EventCard   │  │  usePopups   │  │
│  │  LoginPage   │  │  Header      │  │  useMaster   │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                 │                 │           │
│         └─────────────────┴─────────────────┘           │
│                           │                              │
│                  ┌────────▼────────┐                     │
│                  │  API Services   │                     │
│                  │  (Axios Client) │                     │
│                  └────────┬────────┘                     │
└───────────────────────────┼──────────────────────────────┘
                            │ HTTP (Proxy: /api → :8080)
                            │
┌───────────────────────────▼──────────────────────────────┐
│              Backend (Spring Boot)                        │
│              http://localhost:8080                        │
│                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Controllers  │  │   Services   │  │  Repository  │  │
│  │              │  │              │  │              │  │
│  │ PopupApi     │─►│ PopupService │─►│ PopupRepo    │  │
│  │ AuthApi      │  │ AuthService  │  │ UserRepo     │  │
│  └──────────────┘  └──────┬───────┘  └──────┬───────┘  │
│                            │                 │           │
│                   ┌────────▼─────────────────▼──────┐   │
│                   │     Redis (Cache)               │   │
│                   │     Port: 6379                  │   │
│                   │  - Session Storage              │   │
│                   │  - API Response Cache           │   │
│                   └─────────────────────────────────┘   │
│                            │                             │
│                   ┌────────▼────────┐                    │
│                   │   PostgreSQL    │                    │
│                   │   Port: 5432    │                    │
│                   │  - 메인 데이터   │                    │
│                   └─────────────────┘                    │
└──────────────────────────────────────────────────────────┘
```

## 백엔드 구성 요소

### 1. Spring Boot Application (Port: 8080)
- **역할**: RESTful API 제공
- **환경**: `local` 또는 `prod` 프로파일
- **실행 방법**: `java -jar app.jar` 또는 `./gradlew bootRun`

### 2. Redis Server (Port: 6379)
- **역할**: 캐싱 및 세션 관리
- **사용 목적**:
  - API 응답 캐싱 (팝업 목록, 카테고리 등)
  - 세션 스토리지 (JWT refresh token)
  - 속도 제한 (Rate Limiting)
- **확인 방법**: `redis-cli ping` → `PONG` 응답
- **상태 확인**: `ps aux | grep redis`

### 3. PostgreSQL Database (Port: 5432)
- **역할**: 메인 데이터베이스
- **스키마**:
  - `users` - 사용자 정보
  - `popups` - 팝업 정보
  - `reviews` - 리뷰
  - `wishlists` - 찜하기
  - `zones`, `cells` - 지리적 위치 정보

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

## 환경별 설정

### Local 개발 환경

```yaml
# Backend: application-local.yml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/itdaing_local
  redis:
    host: localhost
    port: 6379
  profiles:
    active: local
```

```env
# Frontend: .env (선택)
VITE_API_BASE_URL=http://localhost:8080
VITE_KAKAO_MAP_KEY=YOUR_KEY_HERE
```

### Production 환경

```bash
# Backend: prod.env (AWS Parameter Store에서 자동 생성)
SPRING_DATASOURCE_URL=jdbc:postgresql://itdaing-db.xxx.rds.amazonaws.com:5432/itdaing-db
SPRING_DATA_REDIS_HOST=itdaing-redis.xxx.cache.amazonaws.com
SPRING_DATA_REDIS_PORT=6379
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
   cd /home/ubuntu/itdaing
   java -jar app.jar
   # Health Check: http://localhost:8080/actuator/health
   ```

4. **Frontend (Vite)**
   ```bash
   cd /home/ubuntu/itdaing-app
   nvm use
   npm run dev
   # 접속: http://localhost:3000
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

### 4. 이미지 최적화
- S3에 이미지 저장
- CDN을 통한 빠른 전송 (향후 계획)

## 보안 고려사항

### 1. JWT 토큰
- Access Token: 짧은 유효기간 (15분)
- Refresh Token: Redis에 저장 (14일)
- localStorage 사용 (XSS 주의)

### 2. Redis 세션
- Refresh Token을 Redis에 저장
- 로그아웃 시 Redis에서 제거

### 3. CORS 설정
- 프로덕션: 특정 도메인만 허용
- 개발: localhost:3000만 허용

### 4. Rate Limiting
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

## 관련 문서

- [QUICK_START.md](../QUICK_START.md) - 빠른 시작 가이드
- [UBUNTU_DEVELOPMENT_GUIDE.md](../UBUNTU_DEVELOPMENT_GUIDE.md) - Ubuntu 개발 가이드
- [DEPLOYMENT_STATUS.md](./DEPLOYMENT_STATUS.md) - 배포 상태
- [TEST_ACCOUNTS.md](./TEST_ACCOUNTS.md) - 테스트 계정

