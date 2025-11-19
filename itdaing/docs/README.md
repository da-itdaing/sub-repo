# 문서 목차

이 디렉토리는 프로젝트의 모든 문서를 체계적으로 관리합니다.

## 📁 문서 구조

현재 `docs/` 디렉토리에는 다음 문서가 존재합니다.

### 📋 계획서 (`plan/`)
- [BE-plan.md](plan/BE-plan.md) — 백엔드 개발 계획서
- [FE-plan.md](plan/FE-plan.md) — 프론트엔드 개발 계획서
- [integration-plan.md](plan/integration-plan.md) — 프론트엔드-백엔드 통합 계획서
- [INTEGRATION_WORK_INSTRUCTION.md](plan/INTEGRATION_WORK_INSTRUCTION.md) — 현재 이터레이션 작업 지침
- [SECURITY.md](plan/SECURITY.md) — 보안 가이드 및 정책
- [ROLE_PERMISSIONS.md](plan/ROLE_PERMISSIONS.md) — 역할 및 권한 매핑
- [SESSION_SUMMARY.md](plan/SESSION_SUMMARY.md) — 세션/작업 요약

### 📖 문서 아티팩트
- [index.html](index.html) — 정적 문서/미리보기 진입점(있을 경우)
- [openapi.json](openapi.json) — OpenAPI 산출물(있을 경우)

### 🧰 스크립트 (`scripts/`)
- [check-private-ec2-env.sh](../scripts/check-private-ec2-env.sh) — Private EC2 환경 점검 (로컬 모드 기본)
- [deploy-frontend.sh](../scripts/deploy-frontend.sh) — 프론트엔드 정적 배포
- [start-backend.sh](../scripts/start-backend.sh) — 백엔드 시작 (nohup + 로그)
- [stop-backend.sh](../scripts/stop-backend.sh) — 백엔드 중지
- [tail-backend-log.sh](../scripts/tail-backend-log.sh) — 백엔드 로그 팔로우

## 🔍 빠른 찾기

### 계획/통합 문서
1. [백엔드 계획](plan/BE-plan.md)
2. [프론트엔드 계획](plan/FE-plan.md)
3. [통합 계획](plan/integration-plan.md)

## 📝 문서 작성 가이드

새로운 문서를 추가할 때는 다음 규칙을 따르세요:

1. **카테고리별 분류**: 문서의 성격에 맞는 하위 폴더에 배치
2. **명명 규칙**: 파일명은 대문자로 시작하고 언더스코어로 단어 구분 (예: `LOCAL_DEVELOPMENT.md`)
3. **README 업데이트**: 이 파일에 새 문서 링크 추가
4. **마크다운 형식**: 표준 마크다운 형식 사용

## 🔗 관련 링크

- [프로젝트 메인 README](../README.md)
- [Cursor IDE 설정](../.cursor/README.md)

