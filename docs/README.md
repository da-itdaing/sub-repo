# 문서 목차

이 디렉토리는 프로젝트의 모든 문서를 체계적으로 관리합니다.

## 📁 문서 구조

### 📋 계획서 (`plan/`)
- [BE-plan.md](plan/BE-plan.md) - 백엔드 개발 계획서
- [FE-plan.md](plan/FE-plan.md) - 프론트엔드 개발 계획서

### ⚙️ 설정 가이드 (`setup/`)
- [IDE_SETUP.md](setup/IDE_SETUP.md) - IDE 설정 가이드 (IntelliJ / Eclipse)
- [LOCAL_DEVELOPMENT.md](setup/LOCAL_DEVELOPMENT.md) - 로컬 개발 환경 설정 가이드
- [AWS_LOCALSTACK_SETUP.md](setup/AWS_LOCALSTACK_SETUP.md) - AWS LocalStack 로컬 개발 환경 설정

### 🚀 배포 가이드 (`deployment/`)
- [DEPLOY_EC2.md](deployment/DEPLOY_EC2.md) - AWS EC2 배포 가이드

### 💻 개발 가이드 (`development/`)
- (향후 추가 예정)

### 🗄️ 데이터베이스 (`database/`)
- [DATABASE_MIGRATION.md](database/DATABASE_MIGRATION.md) - 데이터베이스 마이그레이션 가이드

### 🌐 API 문서 (`api/`)
- [REST_API_문서.md](api/REST_API_문서.md) - REST API 문서
- [REST_API_문서_Frontend.md](api/REST_API_문서_Frontend.md) - 프론트엔드 API 문서

### 🎨 프론트엔드 (`frontend/`)
- [README.md](frontend/README.md) - 프론트엔드 프로젝트 개요
- [ROUTING.md](frontend/ROUTING.md) - 라우팅 구조 문서

### 📊 리포트 (`reports/`)
- [AUTH_SWAGGER_UPDATE_SUMMARY.md](reports/AUTH_SWAGGER_UPDATE_SUMMARY.md) - 인증 Swagger 업데이트 요약
- [AUTHCONTROLLER_RECOVERY_REPORT.md](reports/AUTHCONTROLLER_RECOVERY_REPORT.md) - AuthController 복구 리포트
- [CONTROLLER_AUDIT_EMPTY_BODY_REPORT.md](reports/CONTROLLER_AUDIT_EMPTY_BODY_REPORT.md) - Controller 빈 바디 감사 리포트
- [JWT_AUTH_IMPLEMENTATION_SUMMARY.md](reports/JWT_AUTH_IMPLEMENTATION_SUMMARY.md) - JWT 인증 구현 요약
- [DOMAIN_TESTS.md](reports/DOMAIN_TESTS.md) - 도메인별 테스트 실행 가이드

## 🔍 빠른 찾기

### 개발 시작하기
1. [로컬 개발 환경 설정](setup/LOCAL_DEVELOPMENT.md)
2. [IDE 설정](setup/IDE_SETUP.md)
3. [프론트엔드 README](frontend/README.md)

### 배포하기
1. [EC2 배포 가이드](deployment/DEPLOY_EC2.md)

### API 개발
1. [REST API 문서](api/REST_API_문서.md)
2. [프론트엔드 라우팅](frontend/ROUTING.md)

### 데이터베이스
1. [데이터베이스 마이그레이션](database/DATABASE_MIGRATION.md)

## 📝 문서 작성 가이드

새로운 문서를 추가할 때는 다음 규칙을 따르세요:

1. **카테고리별 분류**: 문서의 성격에 맞는 하위 폴더에 배치
2. **명명 규칙**: 파일명은 대문자로 시작하고 언더스코어로 단어 구분 (예: `LOCAL_DEVELOPMENT.md`)
3. **README 업데이트**: 이 파일에 새 문서 링크 추가
4. **마크다운 형식**: 표준 마크다운 형식 사용

## 🔗 관련 링크

- [프로젝트 메인 README](../README.md)
- [Cursor IDE 설정](../.cursor/README.md)

