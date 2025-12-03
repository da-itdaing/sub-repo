# 브랜치 전략 및 워크플로우

## 브랜치 전략

### 주요 브랜치

| 브랜치 | 담당 폴더 | 담당자 | 배포 대상 |
|--------|----------|--------|----------|
| `main` | 전체 | - | 통합 브랜치 |
| `dev/fe` | `itdaing-app/` | 황채리 | S3 + CloudFront |
| `dev/be` | `itdaing/` | 장주찬 | Spring ASG |
| `dev/ai` | `chatbot/` | 김종하, 도형준 | Chatbot ASG |
| `gh-pages` | API 문서 | 자동 | GitHub Pages |
| `archive/itdaing-web` | 레거시 | - | 보관용 |

### 브랜치 간 관계

```
main (통합/프로덕션)
├── dev/be (백엔드)
├── dev/fe (프론트엔드)
├── dev/ai (AI 챗봇)
├── gh-pages (API 문서)
└── archive/itdaing-web (레거시)
```

### 동기화 규칙

각 dev 브랜치에서 작업 후 main으로 PR을 생성합니다.

```bash
# 1. 브랜치에서 작업
git checkout dev/fe  # 또는 dev/be, dev/ai
# ... 작업 ...
git commit -m "✨ feat: 새 기능"
git push origin dev/fe

# 2. main과 동기화 (정기적으로)
git checkout dev/fe
git merge main --no-edit
git push origin dev/fe
```

### 배포 흐름

| 브랜치 | 배포 대상 | 배포 방법 |
|--------|----------|----------|
| `dev/fe` → S3 | CloudFront | `npm run build && aws s3 sync` |
| `dev/be` → Spring | private-tg | AMI + ASG |
| `dev/ai` → Chatbot | chatbot-tg | AMI + ASG |

---

## 💼 개발 워크플로우

### 프론트엔드 QA/핫픽스 트랙 (test/fe → hotfix/fe)

```bash
# 1. main에서 핫픽스 브랜치 생성 (향후 명칭: hotfix/fe)
git checkout main
git pull origin main
git checkout -b test/fe   # rename 예정: hotfix/fe

# 3. 프론트엔드 디렉토리로 이동
cd ~/itdaing-app

# 4. 개발 작업 수행
# 현재: Consumer App 페이지 구현 중
# 향후: Seller/Admin Dashboard 순차적 추가 예정

# 5. 커밋 (Gitmoji 사용 - 한글 권장)
git add .
git commit -m "✨ 기능: 팝업 상세 페이지 구현"

# 6. QA 종료 후 dev/fe 및 main에 각각 PR 생성
#    - test/fe → dev/fe  (긴급 픽스 동기화)
#    - test/fe → main    (배포)
#    머지 후 브랜치는 삭제하거나 backup/* 으로 보관
```

### 백엔드 작업 (dev/be → main PR)

```bash
# 1. 백엔드 개발 브랜치로 전환
git checkout dev/be

# 2. 최신 변경사항 가져오기
git pull origin dev/be

# 3. 백엔드 디렉토리로 이동
cd ~/itdaing

# 4. 개발 작업 수행
# ... 코드 작성 ...

# 5. 커밋 (Gitmoji 사용 - 한글 권장)
git add .
git commit -m "✨ 기능: 팝업 추천 API 엔드포인트 추가"

# 6. 푸시 및 Pull Request
git push origin dev/be
# GitHub에서 Pull Request 생성 (dev/be → main)

# 7. dev/fe 최신화
git checkout dev/fe
git merge --ff-only dev/be
git push origin dev/fe
```

### 프론트/통합 스테이징 작업 (dev/fe → main PR)

```bash
# 1. dev/be 변경 흡수
git checkout dev/fe
git pull origin dev/fe
git merge --ff-only dev/be

# 2. 프론트엔드 디렉토리로 이동
cd ~/itdaing-app   # 필요 시 ~/itdaing-web 병행

# 3. 개발 작업 수행
# React 19 + Tailwind v4 기반 Consumer/Seller/Admin 구현

# 4. 커밋 (Gitmoji 사용 - 한글 권장)
git add .
git commit -m "💄 스타일: Seller Dashboard UI 개선"

# 5. 푸시 & Pull Request
git push origin dev/fe
# GitHub에서 Pull Request 생성 (dev/fe → main)
```

---

## 🤝 기여 가이드

### 1. 브랜치 선택
- **Backend**: `dev/be` 브랜치
- **Front/Seller/Admin 통합**: `dev/fe` 브랜치
- **QA·실험/핫픽스**: `test/fe` 브랜치 (항상 dev/fe 기반으로 재생성)

### 2. 커밋 규칙
- Gitmoji 사용 필수
- 한글 커밋 메시지 (주요 키워드만 영어)
- 구체적이고 명확한 설명

### 3. Pull Request
- 작업 브랜치 → `main` 브랜치
- 코드 리뷰 후 머지

### 4. 문서 업데이트
- 새 기능 추가 시 관련 문서 업데이트
- API 변경 시 OpenAPI 문서 갱신

