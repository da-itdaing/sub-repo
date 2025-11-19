# 다중 개발자 환경 설정 가이드

## 📌 현재 상황

### 프로젝트 구조
```
/home/ubuntu/
├── itdaing/              # 백엔드 (GitHub: da-itdaing/sub-repo)
│   └── src/              # Spring Boot 코드
└── itdaing-web/          # 프론트엔드 (독립 폴더, Git 미연동)
    └── src/              # React + TypeScript 코드
```

### Git 상태
- **백엔드 (itdaing)**: GitHub repo와 연동됨
  - Remote: `https://github.com/da-itdaing/sub-repo.git`
  - 현재 브랜치: `feat/docs-swagger-and-scripts`
  - **중요**: `itdaing-web/` 폴더 삭제로 인해 로컬과 원격이 불일치
  
- **프론트엔드 (itdaing-web)**: Git 미연동 상태
  - 독립 폴더로 분리됨
  - Git 저장소 필요

---

## 🎯 다중 개발자 협업 전략

### 전략 1: 브랜치 + 포트 분리 (권장)

각 개발자가:
1. **독립 브랜치**에서 작업
2. **다른 포트**를 사용하여 충돌 방지
3. **공유 main 브랜치**는 건드리지 않음

---

## 🚀 초기 설정 (한 번만 실행)

### 1단계: Git 상태 정리

#### 백엔드 동기화
```bash
cd /home/ubuntu/itdaing

# 현재 변경사항 확인
git status

# 프론트엔드 삭제 커밋 (이미 분리했으므로)
git add .
git commit -m "refactor: 프론트엔드를 독립 저장소로 분리"

# 원격과 동기화
git pull origin main --rebase
git push origin feat/docs-swagger-and-scripts
```

#### 프론트엔드 Git 초기화
```bash
cd /home/ubuntu/itdaing-web

# Git 저장소 초기화
git init
git add .
git commit -m "Initial commit: 프론트엔드 독립 저장소"

# GitHub에 새 저장소 생성 후 연결 (선택사항)
# git remote add origin https://github.com/da-itdaing/itdaing-web.git
# git branch -M main
# git push -u origin main
```

### 2단계: 개발자별 워크스페이스 설정

#### 자동 설정 스크립트 생성

**/home/ubuntu/root_scripts/setup-dev-env.sh**
```bash
#!/usr/bin/env bash
set -euo pipefail

DEVELOPER_NAME=${1:-}
BACKEND_PORT_OFFSET=${2:-}

if [[ -z "$DEVELOPER_NAME" || -z "$BACKEND_PORT_OFFSET" ]]; then
  echo "사용법: $0 <개발자명> <포트오프셋>"
  echo "예시: $0 user1 0"
  echo "      $0 user2 1"
  echo "      $0 user3 2"
  exit 1
fi

BACKEND_PORT=$((8080 + BACKEND_PORT_OFFSET))
FRONTEND_PORT=$((3000 + BACKEND_PORT_OFFSET))

echo "=========================================="
echo "개발자: $DEVELOPER_NAME"
echo "백엔드 포트: $BACKEND_PORT"
echo "프론트엔드 포트: $FRONTEND_PORT"
echo "=========================================="

# 1. 백엔드 브랜치 생성
cd /home/ubuntu/itdaing
git fetch origin
BRANCH_NAME="dev/$DEVELOPER_NAME"

if git show-ref --verify --quiet refs/heads/"$BRANCH_NAME"; then
  echo "[INFO] 브랜치 '$BRANCH_NAME' 이미 존재"
  git checkout "$BRANCH_NAME"
else
  echo "[INFO] 새 브랜치 생성: $BRANCH_NAME"
  git checkout -b "$BRANCH_NAME"
fi

# 2. 프론트엔드 브랜치 생성
cd /home/ubuntu/itdaing-web

# Git 초기화 확인
if [[ ! -d .git ]]; then
  echo "[INFO] 프론트엔드 Git 초기화"
  git init
  git add .
  git commit -m "Initial commit for $DEVELOPER_NAME"
fi

if git show-ref --verify --quiet refs/heads/"$BRANCH_NAME"; then
  echo "[INFO] 브랜치 '$BRANCH_NAME' 이미 존재"
  git checkout "$BRANCH_NAME"
else
  echo "[INFO] 새 브랜치 생성: $BRANCH_NAME"
  git checkout -b "$BRANCH_NAME"
fi

# 3. 환경 설정 파일 생성
ENV_FILE="/home/ubuntu/itdaing/prod-$DEVELOPER_NAME.env"
cp /home/ubuntu/itdaing/prod.env "$ENV_FILE"

# 포트 변경 (백엔드)
sed -i "s/SERVER_PORT=8080/SERVER_PORT=$BACKEND_PORT/g" "$ENV_FILE"

echo "[INFO] 환경 파일 생성: $ENV_FILE"

# 4. 개발자별 시작 스크립트 생성
START_SCRIPT="/home/ubuntu/root_scripts/start-$DEVELOPER_NAME.sh"
cat > "$START_SCRIPT" << EOF
#!/usr/bin/env bash
set -euo pipefail

echo "[INFO] $DEVELOPER_NAME 개발 환경 시작"
echo "[INFO] 백엔드: :$BACKEND_PORT, 프론트엔드: :$FRONTEND_PORT"

# 백엔드 시작
cd /home/ubuntu/itdaing
git checkout dev/$DEVELOPER_NAME
ENV_FILE=prod-$DEVELOPER_NAME.env SERVER_PORT=$BACKEND_PORT ./scripts/start-backend.sh

# 프론트엔드 시작
cd /home/ubuntu/itdaing-web
git checkout dev/$DEVELOPER_NAME

LOG_FILE="/tmp/itdaing-web-$DEVELOPER_NAME.log"
PID_FILE="/tmp/itdaing-web-$DEVELOPER_NAME.pid"

if lsof -ti:$FRONTEND_PORT >/dev/null 2>&1; then
  echo "[INFO] 프론트엔드 이미 실행 중 (:$FRONTEND_PORT)"
else
  echo "[INFO] Vite 서버 시작 (:$FRONTEND_PORT)"
  nohup npm run dev -- --port $FRONTEND_PORT > "\$LOG_FILE" 2>&1 &
  echo \$! > "\$PID_FILE"
  sleep 3
  
  if lsof -ti:$FRONTEND_PORT >/dev/null 2>&1; then
    echo "[DONE] 프론트엔드 시작 완료"
  else
    echo "[ERROR] 프론트엔드 시작 실패. 로그 확인: \$LOG_FILE"
  fi
fi

echo ""
echo "=========================================="
echo "백엔드: http://localhost:$BACKEND_PORT"
echo "프론트엔드: http://localhost:$FRONTEND_PORT"
echo "=========================================="
EOF

chmod +x "$START_SCRIPT"

# 5. 중지 스크립트 생성
STOP_SCRIPT="/home/ubuntu/root_scripts/stop-$DEVELOPER_NAME.sh"
cat > "$STOP_SCRIPT" << EOF
#!/usr/bin/env bash
set -euo pipefail

echo "[INFO] $DEVELOPER_NAME 개발 환경 종료"

# 백엔드 중지
if lsof -ti:$BACKEND_PORT >/dev/null 2>&1; then
  echo "[INFO] 백엔드 종료 중 (:$BACKEND_PORT)"
  lsof -ti:$BACKEND_PORT | xargs kill -9
  echo "[DONE] 백엔드 종료 완료"
else
  echo "[INFO] 백엔드 실행 중 아님"
fi

# 프론트엔드 중지
if lsof -ti:$FRONTEND_PORT >/dev/null 2>&1; then
  echo "[INFO] 프론트엔드 종료 중 (:$FRONTEND_PORT)"
  lsof -ti:$FRONTEND_PORT | xargs kill -9
  echo "[DONE] 프론트엔드 종료 완료"
else
  echo "[INFO] 프론트엔드 실행 중 아님"
fi

rm -f /tmp/itdaing-web-$DEVELOPER_NAME.pid
EOF

chmod +x "$STOP_SCRIPT"

echo ""
echo "=========================================="
echo "✅ 설정 완료!"
echo ""
echo "시작: ~/root_scripts/start-$DEVELOPER_NAME.sh"
echo "중지: ~/root_scripts/stop-$DEVELOPER_NAME.sh"
echo ""
echo "백엔드 브랜치: dev/$DEVELOPER_NAME"
echo "프론트엔드 브랜치: dev/$DEVELOPER_NAME"
echo "=========================================="
```

---

## 👥 개발자별 사용 방법

### 개발자 1 (user1) 설정
```bash
cd /home/ubuntu/root_scripts
./setup-dev-env.sh user1 0

# 서버 시작
./start-user1.sh

# 접속
# 백엔드: http://localhost:8080
# 프론트엔드: http://localhost:3000
```

### 개발자 2 (user2) 설정
```bash
cd /home/ubuntu/root_scripts
./setup-dev-env.sh user2 1

# 서버 시작
./start-user2.sh

# 접속
# 백엔드: http://localhost:8081
# 프론트엔드: http://localhost:3001
```

### 개발자 3 (user3) 설정
```bash
cd /home/ubuntu/root_scripts
./setup-dev-env.sh user3 2

# 서버 시작
./start-user3.sh

# 접속
# 백엔드: http://localhost:8082
# 프론트엔드: http://localhost:3002
```

---

## 🔄 일반적인 개발 워크플로우

### 1. 작업 시작
```bash
# 1. 최신 코드 받기
cd /home/ubuntu/itdaing
git checkout dev/user1
git pull origin main --rebase

cd /home/ubuntu/itdaing-web
git checkout dev/user1

# 2. 서버 시작
~/root_scripts/start-user1.sh

# 3. 개발 진행
# 코드 수정...
```

### 2. 변경사항 커밋
```bash
# 백엔드
cd /home/ubuntu/itdaing
git add .
git commit -m "feat: 새로운 기능 추가"
git push origin dev/user1

# 프론트엔드
cd /home/ubuntu/itdaing-web
git add .
git commit -m "feat: UI 개선"
git push origin dev/user1  # (원격 저장소 설정 후)
```

### 3. Pull Request 생성
```bash
# GitHub에서:
# 1. dev/user1 → main으로 PR 생성
# 2. 코드 리뷰 요청
# 3. 승인 후 merge
```

### 4. 작업 종료
```bash
~/root_scripts/stop-user1.sh
```

---

## 🔍 포트 사용 현황 확인

```bash
# 모든 사용 중인 포트 확인
lsof -i :8080 -i :8081 -i :8082 -i :3000 -i :3001 -i :3002 | grep LISTEN

# 특정 포트 확인
lsof -ti:8080
```

---

## 🛠️ 문제 해결

### 포트 충돌
```bash
# 강제 종료
lsof -ti:8080 | xargs kill -9
lsof -ti:3000 | xargs kill -9
```

### Git 충돌 해결
```bash
cd /home/ubuntu/itdaing

# 최신 코드 받기
git fetch origin

# 현재 변경사항 stash
git stash

# main 브랜치 최신화
git checkout main
git pull origin main

# 작업 브랜치로 돌아가서 rebase
git checkout dev/user1
git rebase main

# 충돌 해결 후
git add .
git rebase --continue

# stash 복구
git stash pop
```

### 환경 변수 확인
```bash
# 개발자별 환경 파일 확인
cat /home/ubuntu/itdaing/prod-user1.env
cat /home/ubuntu/itdaing/prod-user2.env
cat /home/ubuntu/itdaing/prod-user3.env
```

---

## 📋 체크리스트

### 초기 설정 (한 번만)
- [ ] 백엔드 Git 동기화
- [ ] 프론트엔드 Git 초기화
- [ ] setup-dev-env.sh 스크립트 생성
- [ ] 개발자별 환경 설정 실행

### 매일 작업 전
- [ ] 최신 코드 pull
- [ ] 작업 브랜치 checkout
- [ ] 서버 시작 확인

### 작업 완료 후
- [ ] 변경사항 커밋
- [ ] 원격 저장소에 push
- [ ] 서버 종료

---

## 🔐 Bastion 호스트 접속 설정

### SSH Config 설정 (로컬 머신)

**~/.ssh/config**
```
Host bastion
  HostName <bastion-public-ip>
  User ubuntu
  IdentityFile ~/.ssh/bastion-key.pem

# 개발자 1
Host itdaing-user1
  HostName 10.0.133.168
  User ubuntu
  ProxyJump bastion
  IdentityFile ~/.ssh/private-key.pem
  LocalForward 8080 localhost:8080
  LocalForward 3000 localhost:3000

# 개발자 2
Host itdaing-user2
  HostName 10.0.133.168
  User ubuntu
  ProxyJump bastion
  IdentityFile ~/.ssh/private-key.pem
  LocalForward 8081 localhost:8081
  LocalForward 3001 localhost:3001

# 개발자 3
Host itdaing-user3
  HostName 10.0.133.168
  User ubuntu
  ProxyJump bastion
  IdentityFile ~/.ssh/private-key.pem
  LocalForward 8082 localhost:8082
  LocalForward 3002 localhost:3002
```

### 접속 방법
```bash
# 개발자 1
ssh itdaing-user1

# 개발자 2
ssh itdaing-user2

# 개발자 3
ssh itdaing-user3
```

---

## 📊 현재 설정 요약

| 개발자 | 백엔드 포트 | 프론트엔드 포트 | 브랜치 | 환경 파일 |
|--------|------------|----------------|--------|-----------|
| user1  | 8080       | 3000           | dev/user1 | prod-user1.env |
| user2  | 8081       | 3001           | dev/user2 | prod-user2.env |
| user3  | 8082       | 3002           | dev/user3 | prod-user3.env |

---

## 🚨 주의사항

1. **main 브랜치는 직접 수정 금지**
   - 항상 개인 브랜치에서 작업
   - PR을 통한 merge만 허용

2. **포트 충돌 방지**
   - 각자 할당된 포트만 사용
   - 작업 종료 시 반드시 서버 중지

3. **환경 변수 관리**
   - prod-*.env 파일은 Git에 커밋하지 않음
   - 민감한 정보 포함 시 별도 관리

4. **정기적인 코드 동기화**
   - 매일 작업 시작 전 main 브랜치에서 pull
   - 충돌 최소화를 위해 자주 커밋

---

## 📚 추가 참고 자료

- [백엔드 문서](/home/ubuntu/itdaing/docs/backend.md)
- [프론트엔드 문서](/home/ubuntu/itdaing/docs/frontend.md)
- [빠른 시작 가이드](/home/ubuntu/root_scripts/QUICK_START.md)
- [스크립트 가이드](/home/ubuntu/root_scripts/script.md)
