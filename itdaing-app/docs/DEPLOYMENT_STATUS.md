# Itdaing App - 배포 및 실행 상태

## 📋 프로젝트 개요

**프로젝트명**: Itdaing App  
**목적**: React + Vite 기반의 팝업스토어 정보 플랫폼 프론트엔드  
**기술 스택**: React 19, Vite 7, Tailwind CSS 4, React Query, Zustand, Axios

## 🌐 배포 개요

- **Live URL**: [`https://aischool.daitdaing.com`](https://aischool.daitdaing.com) (AWS ACM + Nginx Reverse Proxy)
- **API 문서**: [`https://da-itdaing.github.io/sub-repo/#/`](https://da-itdaing.github.io/sub-repo/#/) – main 브랜치 GitHub Actions로 자동 배포
- **정적 자산 배포**: `npm run build` → `dist/` 산출물 + `public/` PWA 파일을 `/var/www/itdaing-app`으로 복사 후 `sudo systemctl reload nginx`
- **백엔드 실행**: AMI 빌드 시 `itdaing-backend.service`(systemd)가 포함되어 EC2 부팅과 동시에 `app.jar` 기동
- **AI 서버**: LangGraph + FastAPI (포트 9000) – PostgresSaver + pgvector 연동, 현재 실험 환경
- **인프라 요약**: AWS RDS(PostgreSQL), Backend EC2 내 Self-hosted Redis, S3(이미지), Secrets Manager + Parameter Store(IAM Role 연동), Bastion Host를 통한 Private Subnet 접근, 별도 EC2 LangGraph 서버, S3 + CloudFront 정적 배포 계획

## ✅ 완료된 작업

### 1. 개발 환경 설정
- ✅ Node.js v20.19.5 설치 및 구성 (nvm 사용)
- ✅ `.nvmrc` 파일 생성으로 Node 버전 자동 관리
- ✅ Vite 7 및 Tailwind CSS 4 최신 버전 설정
- ✅ PostCSS 설정 (@tailwindcss/postcss 플러그인 사용)

### 2. 프로젝트 구조 설정
```
itdaing-app/
├── src/
│   ├── api/           # API 클라이언트 설정
│   ├── components/    # 재사용 가능한 컴포넌트
│   ├── hooks/         # React Query 커스텀 훅
│   ├── pages/         # 페이지 컴포넌트
│   ├── routes/        # 라우팅 설정
│   ├── services/      # API 서비스 함수
│   ├── store/         # Zustand 상태 관리
│   └── utils/         # 유틸리티 함수
├── .nvmrc
├── package.json
├── vite.config.js
└── tailwind.config.js
```

### 3. 핵심 기능 구현

#### API 통합 (`src/api/client.js`)
- ✅ Axios 인스턴스 설정 (baseURL: `/api`)
- ✅ Vite Proxy 설정 (`/api` -> `http://localhost:8080`)
- ✅ Request Interceptor: JWT 토큰 자동 추가
- ✅ Response Interceptor:
  - 응답 데이터 언래핑 (`{ success: true, data: ... }` → `data`)
  - 401 에러 처리 (Silent Token Refresh)
  - 에러 메시지 표준화

#### 상태 관리
- ✅ Zustand Store (`authStore.js`): 인증 상태 관리
- ✅ React Query: 서버 상태 관리 및 캐싱
- ✅ Token Storage: localStorage 기반 JWT 관리

#### 라우팅 (`src/routes/`)
- ✅ React Router v7 설정
- ✅ Protected Routes 구현
- ✅ 경로 상수 관리 (`paths.js`)

#### 서비스 레이어
- ✅ `popupService.js`: 팝업 CRUD 및 검색
- ✅ `authService.js`: 인증 (로그인, 회원가입, 프로필 조회)
- ✅ `masterService.js`: 마스터 데이터 (카테고리, 지역, 스타일)

#### React Query 훅
- ✅ `usePopups`: 팝업 목록 조회
- ✅ `usePopupById`: 팝업 상세 조회
- ✅ `usePopupReviews`: 리뷰 목록 조회
- ✅ `useMasterData`: 마스터 데이터 조회

#### 페이지 구현
- ✅ `HomePage`: 메인 페이지 (히어로 캐러셀, 팝업 목록)
- ✅ `LoginPage`: 로그인 페이지
- ✅ `SignupStep1`: 회원가입 1단계 (기본 정보)
- ✅ `SignupStep2`: 회원가입 2단계 (선호도 설정)
- ✅ `MyPage`: 마이페이지

#### 유틸리티
- ✅ `tokenStorage.js`: JWT 토큰 관리
- ✅ `imageUtils.js`: 이미지 URL 처리 (S3 URL, ImagePayload 지원)
- ✅ `kakaoMapLoader.js`: 카카오맵 SDK 동적 로딩

### 4. 스타일링
- ✅ Tailwind CSS v4 설정 (`@theme` 문법)
- ✅ 커스텀 테마 색상 (`--color-primary: #eb0000`)
- ✅ 반응형 디자인 (Mobile-First)
- ✅ Safe Area 지원 (`tailwindcss-safe-area`)

## 🚀 실행 중인 서버

### 백엔드 서버
- **상태**: ✅ 실행 중 (systemd 서비스)
- **포트**: 8080
- **프로파일**: `prod` (RDS)
- **서비스명**: `itdaing-backend.service` (AMI 이미지에 내장, 부팅 시 자동 실행)
- **로그 확인**: `sudo journalctl -u itdaing-backend -f`
- **시작/중지**:
  ```bash
  sudo systemctl start itdaing-backend
  sudo systemctl stop itdaing-backend
  sudo systemctl status itdaing-backend
  ```
- **수동 실행(유지보수용)**:
  ```bash
  cd /home/ubuntu/itdaing
  java -jar app.jar --spring.profiles.active=prod
  ```
- **상태 확인**:
  ```bash
  curl http://localhost:8080/actuator/health
  curl http://localhost:8080/api/popups
  ```

### Nginx Reverse Proxy / 정적 호스팅
- **상태**: ✅ 실행 중 (`nginx.service`)
- **역할**:
  - `/` : `/var/www/itdaing-app` 정적 자산(PWA 포함) 서빙
  - `/api` : `http://localhost:8080` Spring Boot로 프록시
  - HTTPS: AWS ACM 인증서가 부착된 ALB에서 종료 후 Nginx로 전달
- **정적 파일 갱신**
  ```bash
  npm run build
  sudo rm -rf /var/www/itdaing-app/*
  sudo cp -R dist/* /var/www/itdaing-app/
  sudo cp public/offline.html /var/www/itdaing-app/
  sudo systemctl reload nginx
  ```
- **향후 계획**: S3 + CloudFront 도입 후 Nginx는 API 프록시 전용으로 경량화

## 🔧 백엔드 API 응답 구조

```json
{
  "success": true,
  "data": {
    // 실제 데이터
    "id": 1,
    "title": "팝업 제목",
    "address": "주소",
    "startDate": "2025-11-13",
    "endDate": "2025-11-28",
    "thumbnail": {
      "url": "https://...",
      "key": "..."
    },
    "reviewSummary": {
      "average": 4.5,
      "total": 10
    }
  }
}
```

프론트엔드 Axios Interceptor가 자동으로 `response.data.data`를 반환하여  
서비스 레이어에서는 바로 데이터를 사용할 수 있습니다.

## ⚠️ 알려진 이슈

### Redis 연결 경고
- **현상**: 백엔드 로그에 Redis 연결 실패 경고 (`Connection refused: localhost:6379`)
- **영향**: Health Check는 DOWN 상태이지만, 메인 기능은 정상 작동
- **원인**: 로컬 환경에 Redis가 설치되지 않음
- **해결 방법** (선택):
  1. Redis 설치: `sudo apt install redis-server`
  2. Redis 비활성화: `application-local.yml`에 설정 추가

## 📝 다음 작업 (TODO)

### 필수 구현
1. **카카오맵 통합**
   - [ ] `/api/config/map-key` 엔드포인트 백엔드 구현
   - [ ] `KakaoMap` 컴포넌트 테스트
   - [ ] `NearbyExplorePage` 지도 기반 검색 기능 완성

2. **나머지 페이지 구현**
   - [ ] `PopupDetailPage`: 팝업 상세 정보 표시
   - [ ] `NearbyExplorePage`: 지도 기반 검색
   - [ ] `FavoritesPage`: 찜한 팝업 목록
   - [ ] `MyReviewsPage`: 내가 작성한 리뷰

3. **이미지 에셋**
   - [ ] Placeholder 이미지 추가 (`/public/placeholder-popup.png`)
   - [ ] 로고 파일 추가

4. **폼 검증**
   - [ ] `react-hook-form` + `zod` 스키마 완성
   - [ ] 에러 메시지 표시 개선

### 선택적 개선
- [ ] Loading Skeleton UI 추가
- [ ] Toast 알림 시스템 (`react-hot-toast`)
- [ ] 무한 스크롤 (React Query `useInfiniteQuery`)
- [ ] PWA 설정 (서비스 워커, 매니페스트)
- [ ] LangGraph 챗봇 API 연동 (FastAPI 9000 → Backend Gateway → Frontend)

## 🔄 2025-11-23 운영 체크리스트

- ✅ `./gradlew clean build` / `./gradlew test` 전 구간 회귀 완료 (Spring Boot + H2 + Flyway)
- ✅ `./gradlew generateOpenApiDocs` 실행 → `docs/openapi.json`, `build/openapi/openapi.yaml` 최신화 (GitHub Pages 워크플로 대상 산출물)
- ✅ GitHub Actions `publish-openapi.yml` 점검: JDK 21 + Gradle + gh-pages 배포 플로우 정상, deploy key/GITHUB_TOKEN 이중 플랜 유지
- ⏳ 프론트엔드 배포물은 차기 변경분 확정 후 `npm run build && npm run preview` → `/var/www/itdaing-app` 복사 + `systemctl reload nginx` 순서로 진행
- 📋 배포 직전 체크리스트
  1. `sudo systemctl status itdaing-backend` (재시작 필요 시 `restart`)
  2. `sudo systemctl status langgraph-chatbot` (9000 포트 FastAPI)
  3. `redis-cli ping` (Self-hosted Redis 헬스 확인)
  4. `aws s3 sync` 또는 `cp` 절차로 정적 자산 교체 후 Slack/Notion 공유
  5. `gh workflow run publish-openapi.yml` (필요 시 수동 트리거)

## 🛠 유용한 명령어

### 서버 관리
```bash
# systemd 서비스
sudo systemctl restart itdaing-backend
sudo systemctl restart langgraph-chatbot
sudo systemctl reload nginx
sudo systemctl status itdaing-backend

# 백엔드 수동 실행(유지보수용)
cd /home/ubuntu/itdaing
java -jar app.jar --spring.profiles.active=prod > /tmp/backend-startup.log 2>&1 &
```

### 로그 확인
```bash
# 백엔드 로그 (systemd)
sudo journalctl -u itdaing-backend -f

# 챗봇 로그
sudo journalctl -u langgraph-chatbot -f

# Nginx 액세스/에러 로그
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# API 테스트
curl -s http://localhost:8080/api/popups | jq '.'
```

### 빌드 및 배포
```bash
# 프론트엔드 빌드
cd /home/ubuntu/itdaing-app
npm run build

# 빌드 결과물 확인
ls -lh dist/

# 빌드 미리보기
npm run preview
```

## ☁️ 인프라 요약

| 계층 | 사용 서비스 | 비고 |
|------|-------------|------|
| Reverse Proxy | AWS ACM + ALB + Nginx | HTTPS 종단, 정적 파일/PWA 서빙, `/api` 프록시 |
| Compute | AWS EC2 (AMI) | `itdaing-backend.service`, `langgraph-chatbot.service` systemd 유닛 |
| Bastion | AWS EC2 (Public) | Private 서브넷으로의 SSH 게이트웨이 |
| Database | Amazon RDS PostgreSQL 15 + pgvector | 트랜잭션/임베딩 저장 |
| Cache | Self-hosted Redis 7.x (Backend EC2) | 세션/캐시/Rate Limit |
| Storage | Amazon S3 | 이미지 업로드, 향후 정적 자산 배포 |
| Secrets | AWS Secrets Manager + Parameter Store | EC2 IAM Role을 통해 환경 변수 주입 |
| AI | LangGraph + FastAPI (9000, 별도 EC2) | PostgresSaver + pgvector, Gateway 통해 통합 예정 |
| CDN (Plan) | S3 + CloudFront | 정적 자산 글로벌 캐싱 예정 |

## 📚 참고 문서

- Vite 공식 문서: https://vite.dev/
- React Query 공식 문서: https://tanstack.com/query/latest
- Tailwind CSS v4 문서: https://tailwindcss.com/docs
- Zustand 공식 문서: https://zustand-demo.pmnd.rs/

## 👤 작성자

**Senior Frontend Architect**  
작성일: 2025-11-22

