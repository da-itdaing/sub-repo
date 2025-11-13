# Cursor IDE 설정

이 디렉토리는 Cursor IDE의 프로젝트별 설정과 규칙을 관리합니다.

## 디렉토리 구조

```
.cursor/
├── commands/          # 자주 사용하는 명령어 단축키
│   ├── front-dev.md   # 프론트엔드 개발 서버 실행
│   ├── back-dev.md    # 백엔드 개발 서버 실행
│   ├── start-all.md   # 전체 서버 실행
│   ├── stop-all.md    # 전체 서버 중지
│   └── mock-db-reset.md  # Mock 데이터베이스 초기화
├── rules/             # 개발 규칙 및 가이드
│   ├── project-rules.md              # 프로젝트 전반 규칙
│   ├── commands-rules.md             # 명령어 사용 규칙
│   ├── development-workflow.md       # 개발 워크플로우
│   ├── private-ec2-access.mdc       # Private EC2 접근 및 작업 규칙
│   ├── be-plan.mdc                   # 백엔드 개발 계획 참조 규칙
│   ├── fe-plan.mdc                   # 프론트엔드 개발 계획 참조 규칙
│   ├── frontend-browser-testing.mdc  # 프론트엔드 브라우저 테스트 규칙
│   └── fullstack-integration.mdc     # 풀스택 통합 개발 규칙
└── README.md          # 이 파일
```

## Commands 사용법

Cursor IDE에서 `/` 명령어로 사용할 수 있는 단축키들입니다.

### 사용 가능한 명령어

- `/front-dev` - 프론트엔드 개발 서버 실행
- `/back-dev` - 백엔드 개발 서버 실행
- `/start-all` - 백엔드 서버 실행 (Private EC2)
- `/stop-all` - 백엔드 서버 중지
- `/mock-db-reset` - Mock 데이터베이스 초기화 (RDS 스키마 리셋 및 시딩)

### 명령어 추가 방법

1. `.cursor/commands/` 디렉토리에 새 `.md` 파일 생성
2. 파일명이 명령어 이름이 됩니다 (예: `test.md` → `/test`)
3. 파일 내용에 명령어 설명 작성

## Rules 사용법

Rules는 프로젝트 개발 시 따라야 할 규칙과 가이드라인입니다.

### 주요 규칙 파일

1. **project-rules.md**
   - 프로젝트 개요 및 기술 스택
   - 코딩 규칙 및 네이밍 컨벤션
   - API 규칙 및 보안 규칙
   - Mock 데이터 규칙

2. **commands-rules.md**
   - Gradle 명령어 (백엔드)
   - npm 명령어 (프론트엔드)
   - PostgreSQL RDS 명령어
   - AWS S3 명령어
   - Private EC2 서버 관리
   - 로그 확인 및 프로세스 관리

3. **development-workflow.md**
   - 개발 시작 전 체크리스트
   - 백엔드/프론트엔드 개발 워크플로우
   - 테스트 및 디버깅 방법
   - 배포 전 체크리스트
   - 문제 해결 가이드

4. **private-ec2-access.mdc**
   - Private EC2 접근 방법
   - 환경 변수 로드
   - 백엔드 서버 관리
   - Git 작업
   - S3 및 데이터베이스 작업

5. **be-plan.mdc** / **fe-plan.mdc**
   - 백엔드/프론트엔드 개발 계획서 참조 규칙
   - 각각 `docs/plan/BE-plan.md`, `docs/plan/FE-plan.md`를 항상 참조하도록 설정

6. **frontend-browser-testing.mdc**
   - 프론트엔드 화면 구현 시 브라우저 테스트 필수 규칙
   - 반응형 디자인 확인 가이드

7. **fullstack-integration.mdc**
   - 프론트엔드와 백엔드 동시 고려 개발 규칙
   - API 우선 설계 및 데이터 구조 일관성 유지

## 규칙 파일 업데이트

프로젝트가 발전함에 따라 규칙 파일도 함께 업데이트해야 합니다.

### 업데이트가 필요한 경우

- 새로운 기술 스택 추가 시
- 개발 프로세스 변경 시
- 새로운 명령어 추가 시
- 문제 해결 방법 발견 시

### 업데이트 방법

1. 해당 규칙 파일을 직접 수정
2. 변경사항을 커밋 메시지에 명시
3. 팀원들과 공유

## 참고사항

- 이 설정은 프로젝트별로 관리되며, `.git`에 포함됩니다
- 팀원 모두가 동일한 개발 환경을 유지할 수 있도록 도와줍니다
- Cursor IDE의 AI 어시스턴트가 이 규칙을 참고하여 더 정확한 도움을 제공합니다

