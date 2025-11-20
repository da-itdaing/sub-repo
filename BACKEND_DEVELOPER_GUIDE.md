# 백엔드 개발자 가이드

DA-ITDAING 프로젝트 백엔드 개발을 위한 가이드입니다.

## 🚀 시작하기

### 1. 환경 확인

```bash
# Java 버전 확인 (21 필요)
java -version

# Gradle 확인
cd ~/itdaing
./gradlew --version

# PostgreSQL 연결 확인
source ~/itdaing/prod.env
echo $SPRING_DATASOURCE_URL
```

### 2. 프로젝트 구조

```
~/itdaing/                          # 백엔드 디렉토리
├── src/main/java/com/da/itdaing/
│   ├── domain/                    # 도메인별 비즈니스 로직
│   │   ├── user/                  # 사용자 도메인
│   │   ├── popup/                 # 팝업 도메인
│   │   ├── seller/                # 판매자 도메인
│   │   ├── geo/                   # 지리 정보 도메인
│   │   ├── metric/                # 통계/이벤트 도메인
│   │   └── messaging/             # 메시징 도메인
│   └── global/                    # 전역 설정 및 유틸
├── src/main/resources/
│   ├── application.yml            # 기본 설정
│   ├── application-prod.yml       # 프로덕션 설정
│   └── db/migration/              # Flyway 마이그레이션
├── build.gradle.kts               # Gradle 빌드 설정
└── docs/                          # API 문서
```

---

## 🌿 Git 워크플로우

### 초기 설정 (한 번만)

```bash
# 1. Git 사용자 설정
git config --global user.name "본인이름"
git config --global user.email "본인이메일@example.com"

# 2. Credential helper 설정
git config --global credential.helper store

# 3. GitHub Personal Access Token (PAT) 생성
# https://github.com/settings/tokens/new
# - Note: "Private EC2 - 본인이름"
# - Expiration: 90 days
# - Scopes: repo, workflow
# - Generate token 클릭 후 복사

# 4. 첫 push 시 인증
cd ~/itdaing
git push origin dev/be
# Username: 본인GitHub아이디
# Password: 생성한PAT토큰
```

### 일상적인 작업 흐름

```bash
# 1. 최신 변경사항 받기
cd ~/itdaing
git checkout dev/be
git pull origin dev/be

# 2. 개발 작업
# ... 코드 작성 ...

# 3. 테스트 실행
./gradlew test

# 4. 변경사항 확인
git status
git diff

# 5. 커밋 (Gitmoji 사용 권장)
git add .
git commit -m "✨ :sparkles: 새로운 API 엔드포인트 추가

- EventController 추가
- 팝업 조회수 기록 기능 구현
- 관련 테스트 작성"

# 6. Push
git push origin dev/be

# 7. (선택) GitHub에서 Pull Request 생성
# dev/be → main
```

---

## 🔧 개발 환경

### 백엔드 서버 실행

```bash
cd ~/itdaing

# 환경 변수 로드 (필수)
source prod.env

# 서버 시작
./scripts/start-backend.sh

# 로그 확인
tail -f /tmp/itdaing-boot.log

# 서버 중지
./scripts/stop-backend.sh
```

### API 테스트

```bash
# Swagger UI 접속
# http://[IP]:8080/swagger-ui/index.html

# 샘플 계정
# 소비자: consumer1 / pass!1234
# 판매자: seller1 / pass!1234
# 관리자: admin1 / pass!1234
```

### 데이터베이스

```bash
# PostgreSQL 연결
source ~/itdaing/prod.env
psql -h [RDS_HOST] -U itdaing_admin -d itdaing-db

# Flyway 마이그레이션 실행
./gradlew flywayMigrate

# 마이그레이션 정보 확인
./gradlew flywayInfo
```

---

## 📝 코딩 컨벤션

### 패키지 구조

```java
com.da.itdaing.domain.{도메인}/
├── api/              # Controller
├── dto/              # DTO (Request, Response)
├── entity/           # JPA Entity
├── repository/       # Repository Interface
└── service/          # Service Layer
```

### API 문서화 (OpenAPI)

모든 API에 다음 어노테이션 추가:

```java
@Tag(name = "도메인명", description = "도메인 설명")
@RestController
@RequestMapping("/api/...")
public class MyController {

    @Operation(
        summary = "API 요약",
        description = """
            상세한 설명
            
            권한: ROLE_XXX 필요
            
            파라미터:
            - xxx: 설명
            
            반환값:
            - yyy: 설명
            """,
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @GetMapping
    public ApiResponse<MyDto> getMyData() {
        // ...
    }
}
```

### Gitmoji 커밋 컨벤션

```bash
✨ :sparkles:    # 새 기능 추가
🐛 :bug:         # 버그 수정
📝 :memo:        # 문서 수정
♻️ :recycle:     # 리팩터링
✅ :white_check_mark:  # 테스트 추가
🔧 :wrench:      # 설정 파일 수정
🚀 :rocket:      # 배포 관련
```

---

## 🧪 테스트

### 단위 테스트

```bash
# 전체 테스트
./gradlew test

# 특정 도메인 테스트
./gradlew test --tests '*PopupServiceTest'

# 테스트 리포트
# build/reports/tests/test/index.html
```

### API 통합 테스트

```bash
# Controller 테스트
./gradlew test --tests '*ControllerTest'
```

---

## 📚 참고 문서

- **백엔드 개발 계획**: `itdaing/docs/plan/BE-plan.md`
- **API 문서**: https://da-itdaing.github.io/sub-repo/
- **통합 개발 가이드**: `itdaing/docs/plan/INTEGRATION_WORK_INSTRUCTION.md`

---

## ⚠️ 주의사항

### 절대 커밋하지 말 것
- `prod.env` (프로덕션 환경 변수)
- `application-local.yml` (로컬 설정)
- `*.log` (로그 파일)
- `build/`, `bin/` (빌드 산출물)

### 커밋 전 확인
```bash
# 민감 정보 체크
git status
git diff

# prod.env가 staged 되어 있으면 안 됨!
git reset HEAD prod.env
```

### 환경 변수 사용

```java
// ❌ 하드코딩 금지
String apiKey = "95c50c02952121a082de072da2530448";

// ✅ 환경 변수 사용
@Value("${kakao.map-app-key}")
private String apiKey;
```

---

## 🆘 문제 해결

### Push 실패 (403 에러)

```bash
# Credential 초기화
rm -f ~/.git-credentials
git config --global credential.helper store

# Remote URL 확인
cd ~/itdaing
git remote -v

# Push 재시도
git push origin dev/be
# Username, Password(PAT) 입력
```

### 서버 시작 실패

```bash
# 환경 변수 확인
source ~/itdaing/prod.env
env | grep SPRING

# 포트 확인
lsof -ti:8080

# 기존 프로세스 종료
kill $(lsof -ti:8080)
```

### 빌드 오류

```bash
# Clean build
./gradlew clean build

# 캐시 삭제
rm -rf ~/.gradle/caches/
./gradlew build --refresh-dependencies
```

---

## 💬 협업 팁

1. **작업 전 항상 pull**
   ```bash
   git pull origin dev/be
   ```

2. **작은 단위로 자주 커밋**
   - 하나의 기능 = 하나의 커밋
   - 의미 있는 커밋 메시지

3. **코드 리뷰 요청**
   - PR 생성 후 팀원에게 리뷰 요청
   - 리뷰 후 머지

4. **충돌 발생 시**
   ```bash
   git pull origin dev/be
   # 충돌 해결
   git add .
   git commit -m "🔀 Merge conflict resolved"
   git push origin dev/be
   ```

---

## 📞 문의

- **main 브랜치 관리자**: 형준님
- **API 문서**: https://da-itdaing.github.io/sub-repo/
- **이슈 등록**: https://github.com/da-itdaing/sub-repo/issues

Happy Coding! 🚀

