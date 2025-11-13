# 보안 가이드

## 🔒 Git 보안 정책

### 절대 커밋하지 말아야 할 파일들

다음 파일들은 **절대 Git에 커밋하지 마세요**:

1. **환경 변수 파일**
   - `prod.env` - 프로덕션 환경 변수
   - `.env` - 로컬 환경 변수
   - `.env.*` - 모든 환경 변수 파일
   - `env.local`, `env.production` 등

2. **인증서 및 키 파일**
   - `*.pem`, `*.key`, `*.crt` - SSL/TLS 인증서
   - `*.keystore`, `*.jks`, `*.p12` - Java 키스토어
   - `*.p8` - 개인 키 파일

3. **자격 증명 파일**
   - `.aws/credentials` - AWS 자격 증명
   - `aws-credentials`, `aws-keys.txt` - AWS 키 파일
   - `service-account.json` - 서비스 계정 키
   - `credentials.json` - 기타 자격 증명

4. **로컬 설정 파일**
   - `src/main/resources/application-local.yml` - 로컬 개발 설정 (비밀값 포함 가능)

### .gitignore 확인

`.gitignore` 파일에 다음이 포함되어 있는지 확인하세요:

```gitignore
# 환경 변수 파일
prod.env
.env
.env.*
.env.local
.env.production

# 인증서 및 키
**/*.pem
**/*.key
**/*.crt
**/*.keystore
**/*.jks
**/*.p12

# AWS 자격 증명
.aws/
aws-credentials
aws-keys.txt

# 로컬 설정
src/main/resources/application-local.yml
```

## ✅ 커밋 전 확인 사항

### 1. Git 상태 확인

```bash
# 커밋할 파일 목록 확인
git status

# 보안 관련 파일이 포함되어 있는지 확인
git status | grep -E "(prod\.env|\.env|\.pem|\.key|credentials)"
```

### 2. 실수로 커밋한 경우

```bash
# 파일을 Git에서 제거 (파일은 유지)
git rm --cached prod.env
git rm --cached .env
git rm --cached src/main/resources/application-local.yml

# 커밋
git commit -m "chore: remove sensitive files from git"

# 비밀번호 변경 (커밋된 비밀번호는 히스토리에 남아있음)
# RDS 비밀번호, AWS 키 등을 모두 변경해야 함
```

### 3. Git 히스토리에서 완전히 제거

```bash
# git-filter-repo 사용 (권장)
git filter-repo --path prod.env --invert-paths

# 또는 BFG Repo-Cleaner 사용
bfg --delete-files prod.env
```

## 🔐 환경 변수 관리

### 로컬 개발

- `.env` 파일 사용 (Git에 커밋하지 않음)
- `env.example` 파일로 템플릿 제공

### 프로덕션

- `prod.env` 파일 사용 (Git에 커밋하지 않음)
- Private EC2에만 존재
- 파일 권한: `chmod 600`

### 환경 변수 예시 파일

`env.example` 파일은 커밋 가능하지만, 실제 비밀값은 제외:

```bash
# env.example (커밋 가능)
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/itdaing
SPRING_DATASOURCE_USERNAME=itdaing
SPRING_DATASOURCE_PASSWORD=[실제 비밀번호는 여기에 입력]

# .env (커밋 불가)
SPRING_DATASOURCE_PASSWORD=actual_password_here
```

## 🐳 Docker 설정 보안

### docker-compose.yml

로컬 개발용이므로 기본 비밀번호 사용 가능:

```yaml
postgres:
  environment:
    POSTGRES_PASSWORD: password  # 로컬 개발용
```

**주의**: 프로덕션에서는 절대 기본 비밀번호 사용하지 마세요.

### 환경 변수로 주입 (권장)

```yaml
postgres:
  environment:
    POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-password}
```

`.env` 파일에서:

```bash
POSTGRES_PASSWORD=your_secure_password
```

## ☁️ AWS 자격 증명 관리

### 프로덕션

- 환경 변수로 주입: `prod.env` 파일 사용
- EC2 Instance Profile 사용 권장 (환경 변수보다 안전)
- 절대 코드에 하드코딩하지 않음

## 📝 체크리스트

커밋 전 확인:

- [ ] `prod.env` 파일이 커밋 목록에 없는가?
- [ ] `.env` 파일이 커밋 목록에 없는가?
- [ ] 인증서/키 파일이 커밋 목록에 없는가?
- [ ] AWS 자격 증명이 코드에 하드코딩되지 않았는가?
- [ ] `application-local.yml`이 커밋 목록에 없는가?
- [ ] 비밀번호가 주석이나 로그에 포함되지 않았는가?

## 🚨 비밀번호 노출 시 대응

1. **즉시 비밀번호 변경**
   - RDS 비밀번호 변경
   - AWS 키 교체
   - JWT Secret 변경

2. **Git 히스토리 정리**
   - `git filter-repo` 또는 `BFG` 사용
   - 또는 새 저장소로 마이그레이션

3. **보안 감사**
   - 누가 저장소에 접근했는지 확인
   - 로그 모니터링

## 📚 관련 문서

- [.gitignore 파일](../.gitignore)
- [환경 변수 설정 가이드](deployment/PROD_ENV_SETUP.md)
- [로컬 개발 환경 설정](setup/LOCAL_DEVELOPMENT.md)

