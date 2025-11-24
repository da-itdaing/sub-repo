# 브랜치 전략 및 워크플로우

## 🌿 브랜치 전략

### 주요 브랜치

- **main**: 유일한 통합/배포 브랜치. 모든 릴리스는 PR 승인을 거쳐 main에 병합한다.
- **dev/be**: 백엔드 스테이징 (`itdaing/`). main에서 분기해 개발 후 **PR → main**.
- **dev/fe**: 프론트/통합 스테이징 (`itdaing-app/`, `itdaing-web/`). dev/be 변경을 흡수한 뒤 **PR → main**.
- **test/fe**: QA·핫픽스용 임시 브랜치. 향후 `hotfix/fe`로 이름을 바꾸고, main 기반 긴급 패치를 검증하는 트랙으로 재정의한다.
- **gh-pages**: API 문서 자동 배포 브랜치

### 브랜치 간 관계

```
main (통합/프로덕션)
└── dev/be (백엔드 스테이징)
    └── dev/fe (프론트 + 통합 스테이징)
        └── test/fe (QA·실험 핫픽스)
```

### 동기화 및 PR 규칙

1. **main → dev/be**: 배포 직후 main을 dev/be에 fast-forward 하여 백엔드 스테이징을 최신 상태로 유지합니다.
2. **dev/be → dev/fe**: 프론트/통합 작업 전 `git checkout dev/fe && git merge --ff-only dev/be`로 백엔드 변경을 흡수합니다.
3. **dev/be → main PR**: 백엔드 기능이 준비되면 `dev/be`에서 main 대상으로 Pull Request를 열고 코드 리뷰 후 병합합니다.
4. **dev/fe → main PR**: 프론트/통합 기능도 동일하게 `dev/fe`에서 main으로 PR을 열어 리뷰 후 병합합니다. dev/fe는 dev/be가 main에 병합된 뒤 다시 fast-forward 합니다.
5. **test/fe / hotfix/fe**: 긴급 픽스는 main에서 분기한 `test/fe`(=soon `hotfix/fe`)에서 작업하고, 검증 완료 시 `dev/fe`와 main으로 각각 PR을 생성합니다. 적용 후 브랜치를 삭제하거나 `backup/hotfix-yyyymmdd`로 보관합니다.

### 브랜치별 트래킹 파일

| 브랜치 | 트래킹 디렉토리 | 기술 스택 | 목적 |
|--------|----------------|-----------|------|
| **main** | 전체 | - | 통합 |
| **dev/be** | `itdaing/` | Spring Boot | 백엔드 개발 |
| **dev/fe** | `itdaing-app/`, `itdaing-web/` | React 19 + Tailwind v4 | 프론트/통합 스테이징 |
| **test/fe** *(soon `hotfix/fe`)* | `itdaing-app/` | React 19 + Tailwind v4 | QA·긴급 핫픽스 (main 기반) |

> 🔄 **핫픽스 리네이밍 계획**  
> `test/fe` 브랜치는 hotfix 전용 역할로 고정하며, 네이밍도 `hotfix/fe`로 교체 예정이다.  
> - 생성: `git checkout -b hotfix/fe origin/main`  
> - 검증: 필요한 경우 QA 환경에서 빠르게 확인  
> - 병합: main에 PR → dev/fe에도 PR (동일 커밋 유지)  
> - 종료: 머지 후 브랜치 삭제 또는 `backup/hotfix-yyyymmdd` 태깅

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

