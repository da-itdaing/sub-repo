# 개발 워크플로우 규칙

## 개발 시작 전 체크리스트

### 1. 환경 확인
- [ ] Java 21 설치 확인: `java -version`
- [ ] Node.js 20+ 설치 확인: `node -v`
- [ ] Docker 설치 확인: `docker --version`
- [ ] 프로젝트 루트 디렉토리 확인

### 2. 서버 시작 순서
1. **MySQL 컨테이너 시작**
   ```bash
   docker-compose up -d mysql
   docker ps | grep itdaing-mysql  # 상태 확인
   ```

2. **백엔드 서버 시작**
   ```bash
   ./gradlew bootRun
   # 또는 백그라운드: ./gradlew bootRun > /tmp/itdaing-boot.log 2>&1 &
   ```
   - 확인: http://localhost:8080/actuator/health
   - Swagger: http://localhost:8080/swagger-ui/index.html

3. **프론트엔드 서버 시작**
   ```bash
   cd itdaing-web
   npm run dev -- --host
   # 또는 백그라운드: npm run dev -- --host > /tmp/itdaing-web-dev.log 2>&1 &
   ```
   - 확인: http://localhost:5173

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
# 자동 재시작 (Spring Boot DevTools 사용 시)
# 또는 수동 재시작: Ctrl+C 후 ./gradlew bootRun

# 테스트 실행
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
- Vite HMR(Hot Module Replacement)로 자동 반영
- 브라우저에서 즉시 확인 가능

## 테스트 워크플로우

### 백엔드 테스트
```bash
# 전체 테스트
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
   - 소비자 플로우: 로그인 → 팝업 탐색 → 리뷰 작성
   - 판매자 플로우: 로그인 → 팝업 관리 → 대시보드 확인
   - 관리자 플로우: 로그인 → 존 관리 → 사용자 관리

2. **API 테스트**
   - Swagger UI 사용: http://localhost:8080/swagger-ui/index.html
   - Postman/Insomnia 사용

## 디버깅 워크플로우

### 백엔드 디버깅
1. **로그 확인**
   ```bash
   # 실시간 로그
   tail -f /tmp/itdaing-boot.log
   
   # 또는 IDE에서 콘솔 확인
   ```

2. **브레이크포인트 설정**
   - IntelliJ/Eclipse에서 디버그 모드로 실행
   - 원격 디버깅 설정 (필요 시)

3. **데이터베이스 확인**
   ```bash
   docker exec -it itdaing-mysql mysql -u root -p
   USE itdaing;
   SELECT * FROM users WHERE username = 'consumer1';
   ```

### 프론트엔드 디버깅
1. **브라우저 DevTools**
   - Console 탭: JavaScript 에러 확인
   - Network 탭: API 요청/응답 확인
   - React DevTools: 컴포넌트 상태 확인

2. **로그 확인**
   ```bash
   # 실시간 로그
   tail -f /tmp/itdaing-web-dev.log
   ```

3. **타입 체크**
   ```bash
   cd itdaing-web
   npx tsc --noEmit
   ```

## 데이터 관리 워크플로우

### 초기 데이터 시딩
```bash
# DevDataSeed가 local 프로파일에서 자동 실행됨
# 또는 수동 실행 (필요 시)
# ApplicationRunner로 구현되어 있음
```

### 샘플 계정 사용
- **소비자**: `consumer1` ~ `consumer10` / `pass!1234`
- **판매자**: `seller1` ~ `seller50` / `pass!1234`
- **관리자**: `admin1` ~ `admin3` / `pass!1234`

### 데이터베이스 리셋
```bash
# MySQL 컨테이너 재시작 (데이터 유지)
docker-compose restart mysql

# 완전 초기화 (데이터 삭제)
docker-compose down -v
docker-compose up -d mysql
# 백엔드 재시작 시 Flyway 마이그레이션 자동 실행
```

## 배포 전 체크리스트

### 백엔드
- [ ] 모든 테스트 통과: `./gradlew test`
- [ ] 빌드 성공: `./gradlew clean build`
- [ ] Swagger 문서 확인
- [ ] 환경 변수 설정 확인 (`prod.env`)

### 프론트엔드
- [ ] 빌드 성공: `npm run build`
- [ ] 빌드 결과 미리보기: `npm run preview`
- [ ] 타입 체크 통과: `npx tsc --noEmit`
- [ ] 반응형 디자인 확인 (모바일/태블릿/데스크톱)

## 문제 해결 워크플로우

### 서버가 시작되지 않을 때
1. **포트 확인**
   ```bash
   lsof -i :8080  # 백엔드
   lsof -i :5173  # 프론트엔드
   lsof -i :3306  # MySQL
   ```

2. **프로세스 종료 후 재시작**
   ```bash
   pkill -f "gradlew bootRun"
   pkill -f "vite"
   docker-compose restart mysql
   ```

3. **로그 확인**
   ```bash
   tail -n 100 /tmp/itdaing-boot.log
   tail -n 100 /tmp/itdaing-web-dev.log
   docker logs itdaing-mysql
   ```

### 데이터베이스 연결 실패 시
1. **MySQL 컨테이너 상태 확인**
   ```bash
   docker ps | grep itdaing-mysql
   ```

2. **컨테이너 재시작**
   ```bash
   docker-compose restart mysql
   ```

3. **연결 테스트**
   ```bash
   docker exec -it itdaing-mysql mysql -u root -p
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

1. **변경사항 커밋**
   ```bash
   git add .
   git commit -m "✨ feat: 작업 내용"
   ```

2. **서버 중지** (선택사항)
   ```bash
   pkill -f "gradlew bootRun"
   pkill -f "vite"
   # MySQL은 계속 실행해도 됨
   ```

3. **다음 작업 메모**
   - 진행 중인 작업 내용 기록
   - 다음에 해야 할 작업 정리

