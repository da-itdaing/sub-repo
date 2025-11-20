# Main 브랜치 관리자 가이드

DA-ITDAING 프로젝트의 main 브랜치 관리 및 통합을 위한 가이드입니다.

## 🎯 역할과 책임

### Main 브랜치 관리자의 역할
- ✅ dev/be, dev/fe의 변경사항을 main에 통합
- ✅ 코드 품질 검토 및 승인
- ✅ 배포 관리 (GitHub Pages)
- ✅ 충돌 해결 및 조정
- ✅ 팀원 Git 권한 관리
- ✅ Repository 설정 관리

---

## 📋 일상적인 작업

### 1. 개발 브랜치 변경사항 확인

```bash
cd /home/ubuntu

# dev/be 확인
git fetch origin dev/be
git log --oneline origin/dev/be ^origin/main
# 또는
git log --oneline main..origin/dev/be

# dev/fe 확인
git fetch origin dev/fe
git log --oneline main..origin/dev/fe
```

### 2. dev/be → main 반영

#### 방법 A: 새 파일만 추가 (안전)

```bash
git checkout main
git pull origin main

# dev/be에서 새로 추가된 파일 확인
git fetch origin dev/be
git diff --name-status main origin/dev/be | grep "^A"

# 새 파일들만 가져오기
git checkout origin/dev/be -- itdaing/src/main/java/com/da/itdaing/domain/새폴더/

# 커밋
git add itdaing/
git commit -m "✨ :sparkles: Add [기능명] from dev/be

- 기능 설명
- 추가된 파일 목록

Co-authored-by: 팀원이름 <팀원이메일>"

# Push
git push origin main
```

#### 방법 B: Pull Request 사용 (권장)

1. **GitHub에서 PR 생성**
   - https://github.com/da-itdaing/sub-repo/compare
   - base: `main` ← compare: `dev/be`
   - "Create pull request" 클릭

2. **코드 리뷰**
   - Files changed 탭에서 변경사항 확인
   - 댓글로 피드백
   - 수정 요청 또는 승인

3. **Merge**
   - "Merge pull request" 클릭
   - Merge 방식 선택:
     - **Create a merge commit** (권장) - 히스토리 보존
     - Squash and merge - 커밋을 하나로 합침
     - Rebase and merge - 선형 히스토리

### 3. dev/fe → main 반영

dev/be와 동일한 방식으로 진행

---

## 🔀 충돌 해결

### Merge Conflict 발생 시

```bash
# 1. Merge 시작
git checkout main
git merge origin/dev/be

# 2. 충돌 파일 확인
git status | grep "both modified"

# 3. 충돌 해결
# Cursor/VSCode에서 충돌 마커 확인:
# <<<<<<< HEAD
# (현재 main의 내용)
# =======
# (dev/be의 내용)
# >>>>>>> origin/dev/be

# 4. 해결 후 커밋
git add .
git commit -m "🔀 :twisted_rightwards_arrows: Merge dev/be into main

Resolved conflicts in:
- 파일1
- 파일2"

# 5. Push
git push origin main
```

### 충돌 회피 방법

1. **작은 단위로 자주 통합**
   - 일주일에 1회보다 매일 1회가 더 안전

2. **팀원 간 작업 영역 분리**
   - 백엔드: `itdaing/` 디렉토리
   - 프론트: `itdaing-web/` 디렉토리
   - 충돌 가능성 ↓

3. **새 파일 위주 개발**
   - 기존 파일 수정보다 새 파일 생성 권장

---

## 📚 OpenAPI 문서 관리

### 백엔드 API 변경 시 문서 업데이트

```bash
# 1. 백엔드 변경사항을 main에 반영

# 2. OpenAPI 문서 재생성
cd ~/itdaing
source prod.env
./gradlew generateOpenApiDocs

# 또는 스크립트 사용
cd ~
./update-openapi-docs.sh

# 3. 변경사항 커밋
git add itdaing/docs/openapi.json itdaing-web/openapi.json
git commit -m "📚 :books: Update OpenAPI documentation

- API 변경사항 반영
- 새 엔드포인트 추가"

# 4. Push (자동으로 GitHub Pages 배포됨)
git push origin main
```

### GitHub Pages 확인

- **URL**: https://da-itdaing.github.io/sub-repo/
- **배포 상태**: https://github.com/da-itdaing/sub-repo/actions
- **설정**: https://github.com/da-itdaing/sub-repo/settings/pages

---

## 👥 팀원 관리

### 새 팀원 추가

```bash
# 1. GitHub Collaborator 추가
# https://github.com/da-itdaing/sub-repo/settings/access
# - "Add people" 클릭
# - GitHub username 입력
# - Role: Write 선택

# 2. 팀원에게 안내
# - BACKEND_DEVELOPER_GUIDE.md 또는 FRONTEND_DEVELOPER_GUIDE.md 참조
# - PAT 생성 및 Git 설정
# - 브랜치 전략 설명
```

### 팀원 권한 확인

```bash
# GitHub Settings에서 확인
# https://github.com/da-itdaing/sub-repo/settings/access

# 각 팀원:
# - Write 이상 권한 필요
# - dev/be 또는 dev/fe에 push 가능해야 함
```

---

## 🚀 배포 관리

### GitHub Actions 워크플로우

#### 현재 자동 배포:
- **OpenAPI Docs** → GitHub Pages
- **트리거**: `itdaing/docs/openapi.json` 변경 시

#### 워크플로우 확인:
```bash
# .github/workflows/ 확인
ls -la /home/ubuntu/.github/workflows/

# 워크플로우 로그
# https://github.com/da-itdaing/sub-repo/actions
```

### 수동 배포 트리거

```bash
# GitHub에서 Actions 탭
# → "Publish OpenAPI to GitHub Pages"
# → "Run workflow" 클릭
# → Branch: main 선택
# → "Run workflow" 실행
```

---

## 📊 브랜치 전략

### 브랜치 구조

```
main                    ← 프로덕션 (본인 관리)
├── dev/be             ← 백엔드 개발 (팀원들 push)
└── dev/fe             ← 프론트엔드 개발 (팀원들 push)
```

### 브랜치 동기화

```bash
# main의 변경사항을 dev 브랜치에 반영
git checkout main
git pull origin main

# dev/be 업데이트
git checkout dev/be
git merge main
git push origin dev/be

# dev/fe 업데이트
git checkout dev/fe  
git merge main
git push origin dev/fe

# main으로 복귀
git checkout main
```

### 브랜치 상태 확인

```bash
# 모든 브랜치 상태
git branch -a

# 브랜치 간 차이
git log --oneline --graph --all -20

# 브랜치별 최신 커밋
git for-each-ref --sort=-committerdate refs/heads/ --format='%(refname:short) - %(committerdate:relative) - %(authorname)'
```

---

## 🔧 저장소 유지보수

### 불필요한 브랜치 정리

```bash
# 원격 브랜치 목록
git branch -r

# 불필요한 브랜치 삭제
git push origin --delete 브랜치명
```

### 대용량 파일 관리

현재 `itdaing/app.jar` (82MB)가 포함됨

```bash
# Git LFS 사용 권장 (선택사항)
git lfs track "*.jar"
git add .gitattributes
git commit -m "🔧 Add Git LFS for JAR files"
```

### .gitignore 업데이트

```bash
# 루트 .gitignore 수정
vim /home/ubuntu/.gitignore

# 변경사항 커밋
git add .gitignore
git commit -m "🙈 :see_no_evil: Update .gitignore

- 새 제외 항목 추가"
git push origin main
```

---

## 📝 릴리즈 관리

### 버전 태그 생성

```bash
# 안정 버전일 때 태그 생성
git checkout main
git tag -a v1.0.0 -m "Release v1.0.0

- 초기 릴리즈
- 팝업 조회, 등록 기능
- 소비자/판매자/관리자 기능"

# 태그 push
git push origin v1.0.0

# 모든 태그 push
git push origin --tags
```

### GitHub Release 생성

1. https://github.com/da-itdaing/sub-repo/releases/new
2. Tag 선택 또는 생성
3. Release notes 작성
4. "Publish release" 클릭

---

## 🛡️ 보안 관리

### 민감 정보 체크

```bash
# 커밋 전 확인
git status
git diff --cached

# prod.env, .ssh/, *.pem 등이 staged 되면 안 됨!
```

### Secret Scanning

GitHub에서 자동으로 감지:
- AWS Access Key
- JWT Secret
- API Keys

발견 시:
1. 커밋에서 제거
2. `.gitignore`에 추가
3. 키 재발급

---

## 📞 팀원 지원

### 팀원이 Push 실패 시

```bash
# 팀원 인스턴스에 접속 (필요 시)
ssh itdaing-jc  # 또는 itdaing-hj

# Credential 초기화
rm -f ~/.git-credentials
git config --global credential.helper store

# 팀원 정보 설정 확인
git config user.name
git config user.email

# 팀원이 직접 PAT 입력하도록 안내
exit
```

### 공통 문서 공유

- 백엔드 팀원: `BACKEND_DEVELOPER_GUIDE.md`
- 프론트엔드 팀원: `FRONTEND_DEVELOPER_GUIDE.md`

---

## 📈 모니터링

### 정기 확인 사항

**매일:**
- [ ] dev/be, dev/fe의 새 커밋 확인
- [ ] GitHub Actions 워크플로우 상태
- [ ] GitHub Pages 배포 상태

**매주:**
- [ ] 브랜치 동기화 (main → dev/be, dev/fe)
- [ ] 미사용 브랜치 정리
- [ ] 코드 리뷰 및 PR 처리

**매월:**
- [ ] Repository 용량 확인
- [ ] 팀원 권한 검토
- [ ] PAT 만료일 확인

---

## 🔄 긴급 상황 대응

### Hotfix (긴급 수정)

```bash
# 1. main에서 직접 수정
git checkout main
git pull origin main

# 2. 수정 작업
# ... 긴급 버그 수정 ...

# 3. 커밋
git add .
git commit -m "🚑 :ambulance: Critical hotfix

- 긴급 버그 수정 내용"

# 4. Push
git push origin main

# 5. dev 브랜치에도 반영
git checkout dev/be
git merge main
git push origin dev/be

git checkout dev/fe
git merge main
git push origin dev/fe
```

### Force Push 복구

팀원이 실수로 force push 한 경우:

```bash
# 1. Reflog 확인
git reflog

# 2. 이전 상태로 복구
git reset --hard HEAD@{n}

# 3. Force push로 복구
git push origin main --force
```

---

## 🎛️ Repository 설정

### GitHub Settings 관리

#### General
- Default branch: `main`
- Allow merge commits: ✅
- Allow squash merging: ✅
- Allow rebase merging: ✅

#### Branches
- Branch protection rule for `main`:
  - ✅ Require pull request reviews (선택)
  - ✅ Require status checks (CI 통과 필요)

#### Pages
- Source: `gh-pages` branch
- Custom domain (선택사항)

#### Secrets
- Repository secrets 관리
- PAT는 개인이 각자 관리

---

## 📚 문서 업데이트

### README.md 수정

```bash
vim /home/ubuntu/README.md

# 변경사항 커밋
git add README.md
git commit -m "📝 :memo: Update README

- 새 기능 추가
- 브랜치 전략 업데이트"
git push origin main
```

### 개발 가이드 수정

```bash
# 백엔드 가이드
vim /home/ubuntu/BACKEND_DEVELOPER_GUIDE.md

# 프론트엔드 가이드
vim /home/ubuntu/FRONTEND_DEVELOPER_GUIDE.md

# 관리자 가이드 (이 문서)
vim /home/ubuntu/MAIN_BRANCH_MANAGER_GUIDE.md

# 커밋
git add *.md
git commit -m "📝 :memo: Update developer guides"
git push origin main
```

---

## 🔐 보안 체크리스트

### 커밋 전 확인

```bash
# Staged 파일 중 민감 정보 확인
git diff --cached | grep -i "password\|secret\|token\|key"

# 절대 커밋하면 안 되는 파일
git status | grep -E "prod.env|.ssh|.pem|.key"
```

### 정기 보안 점검

```bash
# 최근 커밋 중 민감 정보 검사
git log --all --source -S "password" --pretty=format:"%h %an %s"
git log --all --source -S "AKIA" --pretty=format:"%h %an %s"  # AWS Key
```

---

## 📊 통계 및 리포트

### Repository 통계

```bash
# 전체 커밋 수
git rev-list --count main

# 기여자별 커밋 수
git shortlog -sn --all

# 파일 변경 통계
git diff --stat main~10..main

# 코드 라인 수
find itdaing/src itdaing-web/src -name "*.java" -o -name "*.jsx" -o -name "*.js" | xargs wc -l
```

### 브랜치 활동

```bash
# 최근 활동
git for-each-ref --sort=-committerdate refs/remotes/ --format='%(refname:short) - %(committerdate:relative)'

# 브랜치 간 차이
git log --oneline --graph --all --decorate
```

---

## 🆘 문제 해결

### 팀원 Push 실패

**원인 1: 권한 없음**
```bash
# GitHub Settings → Access → Collaborators에 팀원 추가 확인
# https://github.com/da-itdaing/sub-repo/settings/access
```

**원인 2: 인증 실패**
```bash
# 팀원에게 BACKEND/FRONTEND_DEVELOPER_GUIDE.md 안내
# PAT 재생성 또는 Credential 초기화
```

**원인 3: 잘못된 브랜치**
```bash
# 팀원이 main에 push 시도 (금지)
# dev/be 또는 dev/fe에 push하도록 안내
```

### GitHub Actions 실패

```bash
# 1. Actions 탭에서 로그 확인
# https://github.com/da-itdaing/sub-repo/actions

# 2. 실패 원인 파악 후 수정

# 3. 재실행 또는 수정 후 재 push
```

---

## 📋 정기 작업 체크리스트

### 매일
- [ ] dev/be, dev/fe 새 커밋 확인
- [ ] 필요 시 main에 통합
- [ ] GitHub Actions 상태 확인

### 매주
- [ ] 브랜치 동기화 (main → dev/be, dev/fe)
- [ ] 코드 리뷰 및 PR 처리
- [ ] OpenAPI 문서 업데이트 확인

### 매월
- [ ] Repository 용량 확인
- [ ] 팀원 PAT 만료일 확인 (필요 시 갱신 안내)
- [ ] 불필요한 브랜치 정리
- [ ] 보안 검토

---

## 🎯 베스트 프랙티스

1. **명확한 커밋 메시지**
   - Gitmoji 사용
   - 무엇을, 왜 변경했는지 명시

2. **작은 단위로 통합**
   - 하루 1회 dev → main 통합 권장

3. **문서화**
   - 중요한 변경사항은 README 업데이트
   - API 변경 시 OpenAPI 문서 재생성

4. **코드 리뷰**
   - PR을 통한 코드 리뷰 권장
   - 최소 1명 이상의 승인

5. **백업**
   - 중요한 변경 전 태그 생성
   - 정기적으로 로컬 백업

---

## 📞 유용한 링크

- **Repository**: https://github.com/da-itdaing/sub-repo
- **API 문서**: https://da-itdaing.github.io/sub-repo/
- **Actions**: https://github.com/da-itdaing/sub-repo/actions
- **Settings**: https://github.com/da-itdaing/sub-repo/settings
- **New Issue**: https://github.com/da-itdaing/sub-repo/issues/new

---

## 💡 Tip: 자동화 스크립트

### 일일 동기화 스크립트

`~/sync-branches.sh`:
```bash
#!/bin/bash
cd /home/ubuntu
git checkout main
git pull origin main
git checkout dev/be
git merge main
git push origin dev/be
git checkout dev/fe
git merge main
git push origin dev/fe
git checkout main
echo "✅ 브랜치 동기화 완료"
```

### 팀원 작업 확인 스크립트

`~/check-dev-branches.sh`:
```bash
#!/bin/bash
echo "=== dev/be 새 커밋 ==="
git log --oneline main..origin/dev/be

echo ""
echo "=== dev/fe 새 커밋 ==="
git log --oneline main..origin/dev/fe
```

---

**Main 브랜치를 안전하고 효율적으로 관리하세요!** 🎯

