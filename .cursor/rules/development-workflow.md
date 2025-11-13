# 개발 워크플로우 규칙

## 개발 환경

**중요**: 모든 개발 및 테스트는 **Private EC2**에서 수행됩니다. 로컬 개발 환경은 사용하지 않습니다.

## 개발 시작 전 체크리스트

### 1. Private EC2 접속 확인
- [ ] SSH 접속 테스트: `ssh private-ec2`
- [ ] 프로젝트 디렉토리 확인: `ssh private-ec2 "cd ~/itdaing && pwd"`
- [ ] 환경 변수 파일 확인: `ssh private-ec2 "ls -l ~/itdaing/prod.env"`

### 2. 환경 확인
- [ ] Java 21 설치 확인: `ssh private-ec2 "java -version"`
- [ ] Gradle 확인: `ssh private-ec2 "cd ~/itdaing && ./gradlew --version"`
- [ ] Git 확인: `ssh private-ec2 "cd ~/itdaing && git status"`
- [ ] PostgreSQL RDS 연결 확인: `ssh private-ec2 "cd ~/itdaing && source prod.env && PGPASSWORD=\$SPRING_DATASOURCE_PASSWORD psql -h itdaing-db.cl4qagmger70.ap-northeast-2.rds.amazonaws.com -U itdaing_admin -d itdaing-db -c 'SELECT version();'"`

### 3. 서버 시작 순서
1. **백엔드 서버 시작**
   ```bash
   ssh private-ec2 "cd ~/itdaing && source prod.env && nohup ./gradlew bootRun > /tmp/itdaing-boot.log 2>&1 &"
   ```
   - 확인: `ssh private-ec2 "curl http://localhost:8080/actuator/health"`
   - Swagger: Private EC2의 공개 IP를 통해 접근

2. **프론트엔드 빌드 및 배포**
   ```bash
   ssh private-ec2 "cd ~/itdaing/itdaing-web && npm install && npm run build"
   ssh private-ec2 "sudo cp -r ~/itdaing/itdaing-web/dist/* /var/www/itdaing/ && sudo chown -R www-data:www-data /var/www/itdaing"
   ```

## 개발 중 워크플로우

### 백엔드 개발

#### 새 기능 추가 시
1. **도메인 설계**
   - Entity 클래스 작성 (`src/main/java/com/da/itdaing/domain/{domain}/entity/`)
   - Repository 인터페이스 작성 (`.../repository/`)
   - DTO 클래스 작성 (`.../dto/`)

2. **API 개발**
   - Service 클래스 작성 (`.../service/`)
   - Controller 클래스 작성 (`.../api/`)
   - Swagger 어노테이션 추가 (`@Operation`, `@Schema`)

3. **테스트 작성**
   - Repository 테스트 (`.../repository/*RepositoryTest.java`)
   - Service 테스트 (`.../service/*ServiceTest.java`)
   - Controller 테스트 (`.../api/*ControllerTest.java`)

4. **마이그레이션 작성** (필요 시)
   - `src/main/resources/db/migration/V{version}__{description}.sql`

#### 코드 수정 후
```bash
# Private EC2에서 서버 재시작
ssh private-ec2 "kill \$(lsof -ti:8080)"
ssh private-ec2 "cd ~/itdaing && source prod.env && nohup ./gradlew bootRun > /tmp/itdaing-boot.log 2>&1 &"

# 테스트 실행 (로컬에서)
./gradlew test
```

### 프론트엔드 개발

#### 새 페이지/컴포넌트 추가 시
1. **라우트 추가**
   - `itdaing-web/src/router/index.tsx`에 라우트 정의
   - 필요 시 ProtectedRoute 적용

2. **컴포넌트 작성**
   - 페이지 컴포넌트: `itdaing-web/src/pages/`
   - 공통 컴포넌트: `itdaing-web/src/components/`
   - TypeScript 타입 정의 포함

3. **API 연동**
   - `itdaing-web/src/services/api.ts`에 API 함수 추가
   - 컴포넌트에서 `useEffect`, `useState`로 데이터 로딩

4. **스타일링**
   - Tailwind CSS 클래스 사용
   - 반응형 디자인 고려 (모바일 우선)

#### 코드 수정 후
- 변경사항을 Private EC2에 업로드
- 프론트엔드 재빌드 및 배포
- 브라우저에서 확인

## 테스트 워크플로우

### 백엔드 테스트
```bash
# 로컬에서 테스트 실행
./gradlew test

# 특정 도메인 테스트
./gradlew testUser
./gradlew testPopup

# 특정 테스트 클래스
./gradlew test --tests 'AuthControllerTest'

# 테스트 리포트 확인
open build/reports/tests/test/index.html
```

### 프론트엔드 테스트
- 현재 미구현 (추후 Vitest + React Testing Library 예정)

### 통합 테스트
1. **브라우저에서 수동 테스트**
   - Private EC2의 공개 IP를 통해 접근
   - 소비자 플로우: 로그인 → 팝업 탐색 → 리뷰 작성
   - 판매자 플로우: 로그인 → 팝업 관리 → 대시보드 확인
   - 관리자 플로우: 로그인 → 존 관리 → 사용자 관리

2. **API 테스트**
   - Swagger UI 사용: Private EC2의 Swagger UI 접근
   - Postman/Insomnia 사용

## 디버깅 워크플로우

### 백엔드 디버깅
1. **로그 확인**
   ```bash
   # 실시간 로그
   ssh private-ec2 "tail -f /tmp/itdaing-boot.log"
   ```

2. **브레이크포인트 설정**
   - IDE에서 원격 디버깅 설정 (SSH 터널링)
   - Private EC2의 8080 포트를 로컬로 포워딩

3. **데이터베이스 확인**
   ```bash
   ssh private-ec2 "cd ~/itdaing && source prod.env && PGPASSWORD=\$SPRING_DATASOURCE_PASSWORD psql -h itdaing-db.cl4qagmger70.ap-northeast-2.rds.amazonaws.com -U itdaing_admin -d itdaing-db"
   ```

### 프론트엔드 디버깅
1. **브라우저 DevTools**
   - Console 탭: JavaScript 에러 확인
   - Network 탭: API 요청/응답 확인
   - React DevTools: 컴포넌트 상태 확인

2. **타입 체크**
   ```bash
   cd itdaing-web
   npx tsc --noEmit
   ```

## 데이터 관리 워크플로우

### 초기 데이터 시딩
- Private EC2에서 `DevDataSeed`가 자동 실행됨 (프로덕션 프로파일에서 비활성화 가능)

### 샘플 계정 사용
- **소비자**: `consumer1` ~ `consumer10` / `pass!1234`
- **판매자**: `seller1` ~ `seller50` / `pass!1234`
- **관리자**: `admin1` ~ `admin3` / `pass!1234`

## 배포 전 체크리스트

### 백엔드
- [ ] 모든 테스트 통과: `./gradlew test`
- [ ] 빌드 성공: `./gradlew clean build`
- [ ] Swagger 문서 확인
- [ ] 환경 변수 설정 확인 (`prod.env`)

### 프론트엔드
- [ ] 빌드 성공: `npm run build`
- [ ] 타입 체크 통과: `npx tsc --noEmit`
- [ ] 반응형 디자인 확인 (모바일/태블릿/데스크톱)

## 문제 해결 워크플로우

### 서버가 시작되지 않을 때
1. **포트 확인**
   ```bash
   ssh private-ec2 "lsof -ti:8080"
   ```

2. **프로세스 종료 후 재시작**
   ```bash
   ssh private-ec2 "kill \$(lsof -ti:8080)"
   ssh private-ec2 "cd ~/itdaing && source prod.env && nohup ./gradlew bootRun > /tmp/itdaing-boot.log 2>&1 &"
   ```

3. **로그 확인**
   ```bash
   ssh private-ec2 "tail -n 100 /tmp/itdaing-boot.log"
   ```

### 데이터베이스 연결 실패 시
1. **RDS 연결 상태 확인**
   ```bash
   ssh private-ec2 "cd ~/itdaing && source prod.env && PGPASSWORD=\$SPRING_DATASOURCE_PASSWORD psql -h itdaing-db.cl4qagmger70.ap-northeast-2.rds.amazonaws.com -U itdaing_admin -d itdaing-db -c 'SELECT 1;'"
   ```

2. **환경 변수 확인**
   ```bash
   ssh private-ec2 "cd ~/itdaing && source prod.env && echo \$SPRING_DATASOURCE_URL"
   ```

### 빌드 실패 시
1. **의존성 재설치**
   ```bash
   # 백엔드
   ./gradlew clean
   ./gradlew build --refresh-dependencies
   
   # 프론트엔드
   cd itdaing-web
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **캐시 정리**
   ```bash
   # Gradle 캐시
   ./gradlew clean
   rm -rf .gradle
   
   # npm 캐시
   npm cache clean --force
   ```

## 코드 리뷰 전 체크리스트

- [ ] 코드 포맷팅 확인 (자동 포맷터 적용)
- [ ] 타입 안정성 확인 (TypeScript/Java)
- [ ] 테스트 작성 및 통과 확인
- [ ] Swagger 문서 업데이트 (API 변경 시)
- [ ] 불필요한 주석/코드 제거
- [ ] 커밋 메시지 gitmoji 사용

## 일일 개발 종료 시

1. **변경사항 커밋 및 푸시**
   ```bash
   git add .
   git commit -m "✨ feat: 작업 내용"
   git push origin main
   ```

2. **Private EC2에 변경사항 반영**
   ```bash
   ssh private-ec2 "cd ~/itdaing && git pull origin main"
   ```

3. **서버 재시작** (필요 시)
   ```bash
   ssh private-ec2 "kill \$(lsof -ti:8080)"
   ssh private-ec2 "cd ~/itdaing && source prod.env && nohup ./gradlew bootRun > /tmp/itdaing-boot.log 2>&1 &"
   ```

4. **다음 작업 메모**
   - 진행 중인 작업 내용 기록
   - 다음에 해야 할 작업 정리
