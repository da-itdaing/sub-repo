# 백엔드 동기화 가이드

## 📋 개요

`test/fe` 브랜치에서 `dev/be` 브랜치의 백엔드 변경사항만 가져오는 방법

---

## 🔄 백엔드 업데이트 (dev/be → test/fe)

### 방법 1: 특정 폴더만 Checkout (권장)

```bash
# 1. test/fe 브랜치로 이동
cd /home/ubuntu
git checkout test/fe

# 2. dev/be 브랜치 최신화
git fetch origin dev/be

# 3. dev/be의 itdaing 폴더만 가져오기
git checkout origin/dev/be -- itdaing/

# 4. 변경사항 확인
git status

# 5. 커밋
git add itdaing/
git commit -m "🔀 백엔드: dev/be 브랜치 최신 변경사항 동기화"

# 6. 푸시
git push origin test/fe
```

### 방법 2: 특정 파일만 선택적으로 가져오기

```bash
# app.jar만 업데이트
git fetch origin dev/be
git checkout origin/dev/be -- itdaing/app.jar
git add itdaing/app.jar
git commit -m "🔀 백엔드: app.jar 업데이트"
git push origin test/fe

# 특정 파일들만 업데이트
git checkout origin/dev/be -- itdaing/app.jar itdaing/build.gradle.kts
```

---

## 🔍 변경사항 미리보기

커밋 전에 어떤 내용이 변경되는지 확인:

```bash
# 1. dev/be 브랜치와 현재 브랜치의 차이 확인
git diff test/fe origin/dev/be -- itdaing/

# 2. 파일 목록만 확인
git diff --name-only test/fe origin/dev/be -- itdaing/

# 3. 통계 확인
git diff --stat test/fe origin/dev/be -- itdaing/
```

---

## ⚠️ 주의사항

### 1. 백엔드와 프론트엔드 호환성

백엔드 업데이트 시 API 변경사항을 확인하세요:

```bash
# OpenAPI 문서 확인
git diff test/fe origin/dev/be -- itdaing/docs/openapi.json
```

API가 변경되었다면 프론트엔드(itdaing-app)도 수정 필요:
- API 엔드포인트 변경
- 요청/응답 DTO 변경
- 에러 코드 변경

### 2. 충돌 해결

충돌이 발생하면:

```bash
# 충돌 파일 확인
git status

# 수동으로 충돌 해결 후
git add itdaing/
git commit -m "🔀 백엔드: dev/be 동기화 및 충돌 해결"
```

### 3. app.jar 크기 확인

```bash
# app.jar 크기 확인 (GitHub 100MB 제한)
ls -lh itdaing/app.jar

# 50MB 이상이면 경고 발생
```

---

## 📋 동기화 체크리스트

백엔드 업데이트 후:

- [ ] `git fetch origin dev/be` 실행
- [ ] `git diff` 로 변경사항 확인
- [ ] `git checkout origin/dev/be -- itdaing/` 실행
- [ ] 백엔드 Health Check (http://localhost:8080/actuator/health)
- [ ] API 변경사항 확인 (OpenAPI 문서)
- [ ] 프론트엔드 호환성 테스트
- [ ] 커밋 및 푸시

---

## 🔧 자동화 스크립트 (선택)

자주 동기화하는 경우 스크립트 생성:

```bash
#!/bin/bash
# sync-backend.sh

echo "🔄 dev/be 브랜치의 백엔드 가져오기..."

# 최신 dev/be 가져오기
git fetch origin dev/be

# itdaing 폴더만 checkout
git checkout origin/dev/be -- itdaing/

# 상태 확인
git status

echo "✅ 완료! 변경사항을 확인하고 커밋하세요."
```

사용법:
```bash
chmod +x sync-backend.sh
./sync-backend.sh
```

---

## 📚 관련 문서

- [BRANCH_STRATEGY.md](./BRANCH_STRATEGY.md) - 브랜치 전략
- [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) - 개발 환경
- [itdaing/README.md](../itdaing/README.md) - 백엔드 README

