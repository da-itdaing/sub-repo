# 문서 목차

이 디렉토리는 프로젝트의 모든 문서를 체계적으로 관리합니다.

## 📁 문서 구조

### 📋 계획서 (`plan/`)
- [BE-plan.md](plan/BE-plan.md) - 백엔드 개발 계획서
- [FE-plan.md](plan/FE-plan.md) - 프론트엔드 개발 계획서

### ⚙️ 설정 가이드 (`setup/`)
- [IDE_SETUP.md](setup/IDE_SETUP.md) - IDE 설정 가이드 (IntelliJ / Eclipse)

### 🚀 배포 가이드 (`deployment/`)
- [PRIVATE_EC2_ACCESS.md](deployment/PRIVATE_EC2_ACCESS.md) - Private EC2 접근 가이드
- [SETUP_PRIVATE_EC2.md](deployment/SETUP_PRIVATE_EC2.md) - Private EC2 초기 설정
- [PRIVATE_EC2_ENV_SETUP.md](deployment/PRIVATE_EC2_ENV_SETUP.md) - Private EC2 환경 설정 완료 보고서
- [DEPLOY_TO_PRIVATE_EC2.md](deployment/DEPLOY_TO_PRIVATE_EC2.md) - Private EC2 배포 가이드
- [EC2_ARCHITECTURE.md](deployment/EC2_ARCHITECTURE.md) - EC2 아키텍처 설명
- [S3_BUCKET_POLICY.md](deployment/S3_BUCKET_POLICY.md) - S3 버킷 정책 설정 가이드
- [S3_UPLOAD_FLOW.md](deployment/S3_UPLOAD_FLOW.md) - S3 이미지 업로드 및 읽기 흐름

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
1. [Private EC2 접근 가이드](deployment/PRIVATE_EC2_ACCESS.md)
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

