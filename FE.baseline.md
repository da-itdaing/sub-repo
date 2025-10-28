다음 순서와 체크리스트로 베이스라인 코드 리뷰를 진행하세요. 실행·사용 흐름 기준 → 라우팅/데이터/화면 순으로 보면 빠르게 리스크를 줄일 수 있습니다.

1) 준비(로컬 구동/빌드 확인)
- dev: cd frontend && npm install && npm run dev
- 타입/빌드: npm run build
- Docker: docker build -t final-frontend:latest . && docker run --rm -p 8080:80 final-frontend:latest
- 목적: 실행 불가, 타입/빌드 에러, Docker 빌드 에러를 1차로 걸러냄

2) 상위 구조와 진입점 파악
- 라우팅/레이아웃
  - src/routes/AppRoutes.tsx
  - src/common/components/Header.tsx, Footer(푸터 정렬/반응형 확인)
  - src/common/components/RequireRole.tsx(역할 가드)
- 도메인 라우트
  - 소비자: src/consumer/ConsumerRoutes.tsx
  - 판매자: src/seller/SellerRoutes.tsx, src/seller/SellerLayout.tsx
  - 관리자: src/manager/ManagerRoutes.tsx
- 데이터/유틸
  - src/common/services/api.ts, src/common/data/dummy.ts
  - src/types/index.ts
  - 전역 스타일: src/styles.css

3) 기능 시나리오 기반 리뷰 우선순위
A. 홈(비로그인도 노출, 카드 클릭 가능)
- 파일: src/screens/Home.tsx
- 확인
  - 팝업/이벤트 카드 클릭 시 상세 이동
  - “로그인 여부와 무관한 목록/상세 노출” 충족
  - 반응형(모바일 1열/데스크탑 그리드), 이미지 lazy, 푸터 중앙 정렬

B. 소비자 핵심 흐름(상세 페이지 필수)
- 목록/탐색
  - src/consumer/pages/Popups.tsx, DiscoverMap.tsx
  - 카드 링크 정상 동작, 지도 카드도 상세 이동
- 상세(필수 탭 3종)
  - 레이아웃: PopupDetailLayout.tsx(캐러셀/헤더 정보/탭)
  - 설명: PopupAbout.tsx(명/기간/주소/카테고리/설명/소스 링크)
  - 지도: PopupMap.tsx(지오맵 임베드, 주소 복사)
  - 후기: PopupReviews.tsx(평균/정렬/썸네일)
  - 후기 작성: PopupReviewWrite.tsx
    - 비로그인: “로그인하고 후기 작성하기”로 로그인 후 원래 경로 복귀
    - 로그인: 곧바로 작성 이동
- 즐겨찾기/CTA
  - 카드 하트 클릭 시 상세로 튀지 않음(stopPropagation)
  - 상세 상단 관심 토글(로그인 유도 처리 확인)

C. 판매자 흐름(등록→상세 연동이 소비자 상세에 반영)
- 리스트/등록/편집
  - PopupList.tsx(검색/공지 버튼/상세 이동)
  - PopupRegister.tsx(이미지 다중 업로드, sourceUrl, 수정 모드)
  - LocationMap.tsx(존/주소 입력 UX)
- 상세
  - src/seller/pages/PopupDetail.tsx(캐러셀/편집/공유)
- 대시보드/리뷰/일정/메시지/공지
  - ReviewsDashboard.tsx, Schedule.tsx, messages/*, notices/*(플랫폼/고객)
  - 최소 내비 동작/폼 유효성/목업 저장 확인

D. 관리자(QnA 예시)
- QnA 리스트/보기/답변 편집(services/api 연동)
- 타입/모듈 익스포트 정상 여부(지난 빌드 이슈 회귀 방지)

4) 데이터 계층/타입 안정성 리뷰
- src/common/services/api.ts
  - 팝업 저장소(localStorage) 일관성: list/create/update/get, 키 네임스페이스, 오류 처리
  - 이미지 저장 방식(data URL) 한계와 경고 문구 필요 여부
  - 이벤트 getEvent(id) 등 단일 조회 로직
- 타입 정의(src/types/index.ts)
  - Popup의 images[], sourceUrl, description, dateRange 정합성
  - 폼 입력값→도메인 타입 변환(파싱/검증) 누락 여부
  - 제안: Zod 등으로 스키마 검증 추가

5) 라우팅/가드/딥링크
- 잘못된 경로 404 처리, 초기 진입 시 기본 탭(/about)로 포워딩
- 작성 페이지 가드: 로그인 후 원래 목적지로 복귀(search state 유지)
- Nginx SPA 라우팅(nginx.conf try_files) 재검

6) 스타일/반응형/접근성
- styles.css 브레이크포인트: 768/1024 기준 동작 확인
- 모바일 안전영역(safe-area-inset-bottom)과 하단 탭 겹침 방지
- 키보드 열림 시 입력 필드 가림 여부(iOS/Android)
- 접근성: 버튼 역할/aria-label, 포커스 링, 명도 대비, 링크 외부 열기 rel="noopener"

7) 품질 게이트
- 타입/ESLint/포맷팅
  - npm run build에서 tsc -b 통과
  - ESLint/Prettier 설정 존재 및 적용 여부
- 번들/성능
  - 라우트 레벨 코드 스플리팅, 이미지 용량, 캐시 헤더(nginx.conf)
- 보안
  - 사용자 입력 렌더링(XSS 방지), 외부 링크 target/_blank + rel
  - 환경변수(VITE_*) 사용 범위 점검, 비밀정보 노출 금지
- 오류 처리
  - ErrorBoundary, 토스트/다이얼로그 메시지 일관성
  - API 실패/빈 상태/로딩 상태 처리

8) 실행 시나리오 테스트 체크리스트
- 비로그인
  - 홈 카드 클릭 → 상세 노출 OK
  - 후기 탭 → “로그인하고 후기 작성하기” → 로그인 후 작성 화면 복귀
- 로그인(consumer)
  - 즐겨찾기 토글/유지, 후기 작성/이미지 업로드, 리뷰 정렬
- 판매자
  - 팝업 새로 등록(이미지 여러 장+sourceUrl) → 소비자 상세에 반영
  - 기존 팝업 편집 → 변경사항 반영
  - 메시지 작성/수신, 공지 등록/상세, 일정 캘린더 네비
- Docker
  - 이미지 빌드/실행 후 SPA 라우팅 정상, 새로고침 시 404 없음

9) 코드 리뷰 산출물 템플릿(권장)
- 요약: 좋았던 점, 주요 리스크, 개선 우선순위 Top 5
- 상세 이슈 목록
  - 파일 경로 / 문제 유형(버그·성능·접근성·리팩터링) / 재현 방법 / 스크린샷
  - 제안 패치(간단 코드 스니펫)와 테스트 방법
- 체크 결과
  - 타입/빌드/Docker/반응형/접근성/보안/성능

10) 단기 개선 우선순위 제안
- 작성·등록 폼 유효성 검증 강화(Zod)
- 공통 토스트/다이얼로그 컴포넌트로 UX 통일
- 이미지 업로드 제한/압축, 썸네일 생성
- API 에러/빈 상태 공통 처리 훅(useFetch/useMutation 래핑)
- vitest로 핵심 유닛 테스트(Home 카드 링크, 가드, 후기 CTA 조건)

이 순서로 진행하면 “실행 가능성 → 라우팅/데이터 정합 → 핵심 사용자 경로 → 비기능 요구(반응형/보안/성능)”까지 한 번에 커버됩니다.