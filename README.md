# DA-ITDAING 모노레포

팝업스토어 추천 플랫폼 - 풀스택 웹 애플리케이션

## 📁 프로젝트 구조

```
/home/ubuntu/
├── itdaing/              # 백엔드 (Spring Boot + Java 21)
│   ├── src/              # Java 소스 코드
│   ├── docs/             # API 문서
│   ├── scripts/          # 배포 및 관리 스크립트
│   └── build.gradle.kts  # Gradle 빌드 설정
│
├── itdaing-web/          # 프론트엔드 (React + TypeScript + Vite)
│   ├── src/              # React 소스 코드
│   ├── public/           # 정적 파일
│   └── package.json      # NPM 패키지 설정
│
├── .github/workflows/    # GitHub Actions
└── update-openapi-docs.sh # OpenAPI 문서 업데이트 스크립트
```

## 🌿 브랜치 전략

### 주요 브랜치

- **main**: 통합 메인 브랜치 (프로덕션)
- **dev/be**: 백엔드 개발 브랜치 (itdaing/ 중심)
- **dev/fe**: 프론트엔드 개발 브랜치 (itdaing-web/ 중심)
- **gh-pages**: API 문서 자동 배포 브랜치

### 브랜치 간 관계

```
main (통합)
├── dev/be (백엔드)
└── dev/fe (프론트엔드)
```

## 💼 개발 워크플로우

### 백엔드 작업

```bash
# 1. 백엔드 개발 브랜치로 전환
git checkout dev/be

# 2. 최신 변경사항 가져오기
git pull origin dev/be

# 3. 백엔드 디렉토리로 이동
cd ~/itdaing

# 4. 개발 작업 수행
# ... 코드 작성 ...

# 5. 커밋 (Gitmoji 사용 권장)
git add .
git commit -m "✨ feat: 새로운 API 엔드포인트 추가"

# 6. 푸시
git push origin dev/be

# 7. GitHub에서 Pull Request 생성: dev/be → main
```

### 프론트엔드 작업

```bash
# 1. 프론트엔드 개발 브랜치로 전환
git checkout dev/fe

# 2. 최신 변경사항 가져오기
git pull origin dev/fe

# 3. 프론트엔드 디렉토리로 이동
cd ~/itdaing-web

# 4. 개발 작업 수행
# ... 코드 작성 ...

# 5. 커밋 (Gitmoji 사용 권장)
git add .
git commit -m "💄 style: 메인 페이지 UI 개선"

# 6. 푸시
git push origin dev/fe

# 7. GitHub에서 Pull Request 생성: dev/fe → main
```

### 풀스택 작업 (백엔드 + 프론트엔드)

```bash
# main 브랜치에서 직접 작업하거나
# 각각 dev/be, dev/fe에서 작업 후 main으로 머지
```

## 📚 API 문서

### 자동 배포

- **URL**: https://da-itdaing.github.io/sub-repo/
- **자동 배포**: main 브랜치에 push하면 GitHub Actions가 자동으로 배포
- **트리거 경로**:
  - `itdaing/src/**`
  - `itdaing/build.gradle.kts`
  - `itdaing/docs/openapi.json`

### 수동 업데이트

백엔드 API 변경 후 문서를 즉시 업데이트하려면:

```bash
# 루트 디렉토리에서 실행
./update-openapi-docs.sh
```

이 스크립트는:
1. Gradle로 OpenAPI 문서 생성 (`itdaing/docs/openapi.json`)
2. 프론트엔드에 복사 (`itdaing-web/openapi.json`)
3. Git 커밋 및 푸시 가이드 제공

## 🚀 개발 환경

### 백엔드 실행

```bash
cd ~/itdaing

# 환경 변수 로드
source prod.env

# 서버 시작
./scripts/start-backend.sh

# 로그 확인
tail -f /tmp/itdaing-boot.log

# 서버 중지
./scripts/stop-backend.sh
```

### 프론트엔드 실행

```bash
cd ~/itdaing-web

# 의존성 설치 (최초 1회)
npm install

# 개발 서버 시작
npm run dev -- --host 0.0.0.0 --port 3000
```

## 🔧 기술 스택

### 백엔드
- Spring Boot 3.5.7
- Java 21
- PostgreSQL 15 + pgvector (AWS RDS)
- AWS S3
- Gradle (Kotlin DSL)

### 프론트엔드
- React 18.3.1
- TypeScript 5.9.3
- Vite 6.3.5
- Tailwind CSS
- Radix UI

## 🔒 보안

### 민감 정보 관리

다음 파일들은 **절대 Git에 커밋하지 않습니다**:
- `itdaing/prod.env` (프로덕션 환경 변수)
- `itdaing-web/.env.local` (로컬 환경 변수)
- `.ssh/` (SSH 키)
- `*.pem`, `*.key` (인증서)

환경 변수 예시는 다음 파일을 참고하세요:
- `itdaing/env.example`

## 📋 Gitmoji 커밋 컨벤션

커밋 메시지에 Gitmoji를 사용하여 변경 유형을 명확히 표시합니다:

- 🎨 `:art:` - 코드 구조/형식 개선
- ✨ `:sparkles:` - 새로운 기능 추가
- 🐛 `:bug:` - 버그 수정
- 📝 `:memo:` - 문서 추가/수정
- 🚀 `:rocket:` - 배포 관련
- 💄 `:lipstick:` - UI/스타일 수정
- ♻️ `:recycle:` - 코드 리팩터링
- 🔧 `:wrench:` - 설정 파일 수정
- 🙈 `:see_no_evil:` - .gitignore 수정
- 👷 `:construction_worker:` - CI 빌드 시스템 수정

## 📖 추가 문서

- [백엔드 README](itdaing/README.md)
- [백엔드 개발 계획](itdaing/docs/plan/BE-plan.md)
- [프론트엔드 개발 계획](itdaing/docs/plan/FE-plan.md)
- [Private EC2 접근 가이드](itdaing/docs/deployment/PRIVATE_EC2_ACCESS.md)

## 🤝 기여 가이드

1. 적절한 브랜치에서 작업 (dev/be 또는 dev/fe)
2. Gitmoji를 사용한 명확한 커밋 메시지
3. Pull Request 생성 (브랜치 → main)
4. 코드 리뷰 후 머지

## 📄 라이선스

사내 프로젝트

