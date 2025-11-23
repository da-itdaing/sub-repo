# 브랜치 전략 및 워크플로우

## 🌿 브랜치 전략

### 주요 브랜치

- **main**: 통합 메인 브랜치 (프로덕션)
- **dev/be**: 백엔드 스테이징 (`itdaing/`), main에서 분기되어 main으로 역머지
- **dev/fe**: 프론트/통합 스테이징 (`itdaing-app/`, `itdaing-web/`), dev/be를 주기적으로 흡수
- **test/fe**: QA/실험용 단기 브랜치, dev/fe 기반 기능 검증 및 핫픽스
- **gh-pages**: API 문서 자동 배포 브랜치

### 브랜치 간 관계

```
main (통합/프로덕션)
└── dev/be (백엔드 스테이징)
    └── dev/fe (프론트 + 통합 스테이징)
        └── test/fe (QA·실험 핫픽스)
```

### 동기화 규칙

1. **main → dev/be**: 배포 이후 main을 dev/be에 fast-forward 하여 백엔드 스테이징을 최신 상태로 유지합니다.
2. **dev/be → dev/fe**: 프론트 스테이징 시작 전 `git checkout dev/fe && git merge --ff-only dev/be`로 백엔드 변경을 흡수합니다.
3. **test/fe → dev/fe → main**: QA가 끝난 변경은 test/fe에서 dev/fe로 fast-forward 승격 후, dev/fe를 검증하여 main으로 PR을 생성합니다.
4. **긴급 대응**: test/fe에서 임시 패치를 검증한 뒤, dev/fe를 거쳐 main에 머지합니다. 필요한 경우 `backup/test-fe-yyyymmdd` 형태로 스냅샷 브랜치를 남깁니다.

### 브랜치별 트래킹 파일

| 브랜치 | 트래킹 디렉토리 | 기술 스택 | 목적 |
|--------|----------------|-----------|------|
| **main** | 전체 | - | 통합 |
| **dev/be** | `itdaing/` | Spring Boot | 백엔드 개발 |
| **dev/fe** | `itdaing-app/`, `itdaing-web/` | React 19 + Tailwind v4 | 프론트/통합 스테이징 |
| **test/fe** | `itdaing-app/` | React 19 + Tailwind v4 | QA/POC, 핫픽스 샌드박스 |

---

## 💼 개발 워크플로우

### 프론트엔드 v2 작업 (test/fe - QA/실험 트랙)

```bash
# 1. dev/fe 최신화 후 QA 브랜치 생성/전환
git checkout dev/fe
git pull origin dev/fe
git checkout -B test/fe

# 3. 프론트엔드 디렉토리로 이동
cd ~/itdaing-app

# 4. 개발 작업 수행
# 현재: Consumer App 페이지 구현 중
# 향후: Seller/Admin Dashboard 순차적 추가 예정

# 5. 커밋 (Gitmoji 사용 - 한글 권장)
git add .
git commit -m "✨ 기능: 팝업 상세 페이지 구현"

# 6. QA 종료 후 dev/fe 승격
git checkout dev/fe
git merge --ff-only test/fe
git push origin dev/fe
```

### 백엔드 작업 (dev/be)

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

# 6. 푸시
git push origin dev/be

# 7. dev/fe 최신화
git checkout dev/fe
git merge --ff-only dev/be
git push origin dev/fe

# 8. GitHub에서 Pull Request 생성: dev/be → main
```

### 프론트/통합 스테이징 작업 (dev/fe)

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

# 5. 푸시
git push origin dev/fe

# 6. GitHub에서 Pull Request 생성: dev/fe → main
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

