## ItDaIng 프론트엔드 개요 (Vite + React + TypeScript)

- 기술 스택
  - Vite + React + TypeScript
  - Axios 기반 API 클라이언트 또는 Fetch 래퍼 둘 다 제공
  - PWA 자산 및 오프라인 페이지 존재 (`public/offline.html`)
  - 라우팅, 컨텍스트, 서비스 계층으로 기능 분리

- 폴더 구조 요약
  - `itdaing-web/src/api/`: fetch 래퍼(`client.ts`), 인증 API(`auth.ts`)
  - `itdaing-web/src/services/`: Axios 기반 공통 클라이언트(`api.ts`)와 도메인 서비스
  - `itdaing-web/src/pages/`, `components/`, `routes/`: 화면/컴포넌트/라우팅
  - `itdaing-web/src/types/`: 도메인 타입 정의
  - `itdaing-web/src/context/`: 인증/유저 컨텍스트

- 실행/빌드
  - 개발 서버: `cd itdaing-web && npm i && npm run dev`
  - 호스트/포트 지정: `npm run dev -- --host 0.0.0.0 --port 3000`
  - 프로덕션 빌드: `npm run build` → 산출물은 `itdaing-web/dist/`

- 환경변수
  - 기본 API 베이스 URL은 `/api`
  - `VITE_API_BASE_URL` 설정 시 우선 사용
  - 예: `.env.development`에 `VITE_API_BASE_URL=http://localhost:8080/api`

### API 연동 방식

프론트는 두 가지 접근을 동시에 지원합니다. 상황에 맞게 하나를 선택해 일관되게 사용하세요.

1) 경량 Fetch 래퍼 (`src/api/client.ts`)
 - 장점: 번들 의존성 최소, 단순
 - 사용처: `src/api/auth.ts` 등

예시: 로그인/프로필 조회

```typescript
// src/api/auth.ts 사용 예
import { login, getMyProfile } from '@/api/auth';

const res = await login({ loginId, password });
if (res.success && res.data?.accessToken) {
  // 로그인 성공
}

const me = await getMyProfile();
if (me.success && me.data) {
  console.log(me.data.nickname);
}
```

2) Axios 공통 클라이언트 (`src/services/api.ts`)
 - 장점: 인터셉터, 재시도, 에러 정규화 등 고급 기능
 - 사용처: `src/services/*Service.ts`

예시: 공통 클라이언트로 GET 호출

```typescript
// src/services/api.ts
import apiClient, { apiRequestWithRetry, ApiResponse } from '@/services/api';

interface PopupSummary {
  id: number;
  title: string;
  description: string;
}

export async function fetchPopups(): Promise<ApiResponse<PopupSummary[]>> {
  const { data } = await apiRequestWithRetry(() =>
    apiClient.get<ApiResponse<PopupSummary[]>>('/popups')
  );
  return data;
}
```

### 인증(JWT) 처리
- Fetch 래퍼: `localStorage`에 저장된 액세스 토큰을 자동으로 `Authorization: Bearer ...` 헤더에 첨부
- Axios: 요청 인터셉터에서 동일 처리를 수행
- 만료(401) 시 Axios 응답 인터셉터가 로그인 페이지로 리다이렉트

예시: 토큰 세팅/삭제
```typescript
// src/api/client.ts
import { setTokens } from '@/api/client';
setTokens(accessToken, refreshToken); // 로그인 성공 시
setTokens(null, null);                // 로그아웃 시
```

### 에러/로딩 처리 가이드
- 표준 응답 타입
```typescript
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    status: number;
    code: string;
    message: string;
    fieldErrors?: Array<{ field: string; value?: string; reason?: string }>;
  };
}
```
- 성공 시 `res.success === true`, 실패 시 `res.error` 활용
- 폼 검증 에러(`fieldErrors`)는 필드 매핑하여 메시지 표시
- 네트워크 에러/타임아웃은 재시도(서비스 계층) 또는 사용자 메시지 노출

### 실제 연동 예시

1) 로그인
```typescript
import { login } from '@/api/auth';
const res = await login({ loginId: 'user1', password: 'pass!1234' });
if (!res.success) throw new Error(res.error?.message ?? '로그인 실패');
```

2) 내 정보 조회
```typescript
import { api } from '@/api/client';
const me = await api.get<{ id: number; nickname: string }>('/api/users/me');
```

3) 파일 업로드(예시)
```typescript
import apiClient from '@/services/api';
export async function uploadFile(file: File) {
  const form = new FormData();
  form.append('file', file);
  const { data } = await apiClient.post('/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}
```

### 개발 서버 프록시(선택)
Vite `vite.config.ts`에서 dev 프록시를 두면 CORS 이슈 없이 `/api`를 백엔드로 전달할 수 있습니다. 배포 시에는 동일 오리진(리버스 프록시) 구성 또는 `VITE_API_BASE_URL`을 사용하세요.


