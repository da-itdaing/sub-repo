
# itdaing-web (frontend)

[![CI](https://github.com/da-itdaing/final-project/actions/workflows/ci.yml/badge.svg?branch=dev/integration)](https://github.com/da-itdaing/final-project/actions/workflows/ci.yml)

## Quick start

1) Install dependencies

```bash
npm i
```

2) Start dev server

```bash
npm run dev
```

3) Build

```bash
npm run build
```

## CI behavior

- dev/integration 브랜치에 push 또는 PR이 올라오면 GitHub Actions 가 자동으로 프론트엔드/백엔드를 각각 빌드합니다.
- 프론트엔드: Node 20 + Vite 빌드 → `dist/` 산출물 아티팩트 업로드
- 백엔드: JDK 21 + Gradle `bootJar -x test` (테스트는 CI 기본 단계에서 스킵)

## Commit 메시지 (gitmoji)

- 커밋 메시지 맨 앞에 gitmoji를 사용합니다. 예)
  - ✨ feat: 캐러셀 반응형 개선
  - 🐛 fix: 모바일 우측 overflow 수정
  - 🔧 chore: CI 스크립트 정리

간편하게는 gitmoji-cli를 사용할 수 있습니다:

```bash
npx gitmoji -c
```

또는 직접 이모지/코드를 붙여서 커밋해도 됩니다. 예: `git commit -m ":sparkles: feat: add hero carousel breakpoints"`

## PWA 기능

- 설치 가능: manifest(`site.webmanifest`) + service worker(`public/sw.js`) 등록으로 홈 화면 추가 가능
- 오프라인 처리: 네비게이션 실패 시 `offline.html`을 표시
- 캐시 전략: 앱 셸(정적 아이콘/HTML/manifest)은 install 시 선 캐시, 나머지 요청은 Cache First + 네트워크 후 런타임 캐시 저장
- 버전 변경: `sw.js` 내부 `VERSION` 수정 후 다시 빌드/배포하면 오래된 캐시 자동 제거

### 로컬 테스트 방법
1. 개발 모드에서는 service worker가 등록되지 않습니다 (`import.meta.env.PROD` 조건).
2. 프로덕션 빌드 후 로컬 프리뷰:
```bash
npm run build
npm run preview
```
3. 브라우저 DevTools > Application > Service Workers 에서 등록 확인 후
  - Network 탭에서 "Offline" 체크 → 새 탭에서 페이지 이동 시 `offline.html` 응답 확인
4. 홈 화면 추가(Android Chrome): 메뉴 → "앱 설치" (Add to Home screen)

### 캐시 무효화
배포 후 아이콘/코드 변경이 갱신 안 되면:
1) `sw.js`의 VERSION 값을 증가 → 다시 빌드/배포
2) 사용자가 브라우저 DevTools > Application > Service Workers > unregister 후 새로고침

### 향후 확장 아이디어
- Precache 주요 라우트별 코드 스플릿 청크
- 백엔드 API 응답(팝업 목록 등)에 대한 Stale-While-Revalidate 전략 추가
- Push 알림 (FCM) 연계 및 Background Sync

## UX 라우트 맵 (초안)

아래는 현재 UX 흐름을 고려한 URL 기반 라우트 설계입니다. 실제 구현은 `react-router-dom@^6` 기준으로 구성되었습니다.

- `/` : 메인(홈)
  - 히어로 캐러셀, 섹션 목록, 푸터, 하단 바 포함
  - 카드 클릭 시 `/popups/:popupId`
- `/login` : 로그인
  - 로그인 성공 시
    - 소비자: 직전 페이지로 복귀(없으면 `/`), 필요 시 추천 모달 표시
    - 판매자: `/seller/dashboard`
- `/signup` : 회원가입 1단계 (소비자/판매자 선택 및 기본 정보)
- `/signup/consumer/step2` : 회원가입 2단계 (소비자 추가 정보)
- `/nearby` : 주변 탐색(지도)
- `/popups/:popupId` : 팝업 상세 페이지
  - 비로그인 상태에서 리뷰/즐겨찾기 시도 시 로그인 다이얼로그 노출 후 `/login` 이동
- `/me` : 마이페이지 (로그인 필요)
  - 미로그인 시 `/login`으로 리다이렉트
- `/seller/dashboard` : 판매자 대시보드 (판매자 로그인 필요)
  - 미로그인/권한 없으면 `/login`으로 리다이렉트
- `*` : 존재하지 않는 경로는 `/`로 리다이렉트(초기 버전). 필요 시 전용 404 페이지 도입.

### 내비게이션 규칙
- 헤더 로고 클릭: `/` 이동
- 하단 바
  - 메인: `/`
  - 주변탐색: `/nearby`
  - 마이페이지: 로그인 시 `/me`, 미로그인 시 로그인 확인 다이얼로그 → `/login`

### 인증 가드(초안)
- 소비자·판매자 공통: 로그인이 필요한 경로 접근 시 `/login`으로 유도하고, 로그인 성공 후 원래 경로 복귀
- 판매자 대시보드: 판매자 권한 필요(임시로 sellerId 존재 여부로 판정)
