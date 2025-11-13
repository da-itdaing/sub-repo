# 개발 워크플로우

이 문서는 Itdaing 프로젝트 개발 시 따라야 할 워크플로우와 체크리스트를 설명합니다.

## 개발 시작 전 체크리스트

### 1. 환경 확인
- [ ] 현재 Private EC2에서 작업 중인지 확인 (SSH 접속 불필요)
- [ ] `prod.env` 파일 존재 확인 및 환경 변수 로드 (`cd ~/itdaing && source prod.env`)
- [ ] PostgreSQL RDS 연결 확인
- [ ] AWS S3 접근 권한 확인
- [ ] Java 21 및 Gradle 설치 확인
- [ ] Node.js 20+ 설치 확인 (프론트엔드 작업 시)

### 2. 코드 동기화
- [ ] 최신 코드 가져오기 (`git pull origin main`)
- [ ] 브랜치 전략 확인 (기능 개발 시 `feature/{description}` 브랜치 사용)

### 3. 데이터베이스 상태 확인
- [ ] 데이터베이스 마이그레이션 상태 확인 (`./gradlew flywayInfo`)
- [ ] Mock 데이터 필요 시 `/mock-db-reset` 실행 (주의: 파괴적 작업)

## 백엔드 개발 워크플로우

### 1. 기능 개발 시작
1. **계획서 확인**: `docs/plan/BE-plan.md`에서 작업 항목 확인
2. **브랜치 생성**: `git checkout -b feature/{description}`
3. **개발 환경 설정**: Private EC2에서 환경 변수 로드

### 2. 개발 단계
1. **엔티티 설계** (필요 시)
   - JPA 엔티티 작성
   - Flyway 마이그레이션 파일 작성 (`V{version}__{description}.sql`)
   - PostgreSQL 문법 사용

2. **Repository 구현**
   - JPA Repository 인터페이스 작성
   - QueryDSL 사용 (복잡한 쿼리 시)

3. **Service 구현**
   - 비즈니스 로직 작성
   - DTO 매핑 (MapStruct 사용)

4. **Controller 구현**
   - REST API 엔드포인트 작성
   - Swagger 어노테이션 추가 (`@Operation`, `@Schema`)
   - 인증/인가 설정 확인

5. **예외 처리**
   - 커스텀 예외 클래스 작성 (필요 시)
   - `GlobalExceptionHandler`에 처리 로직 추가

### 3. 테스트 작성
1. **Repository 테스트**
   - `@DataJpaTest` 사용
   - 도메인별 테스트 태스크 실행 (`./gradlew testMaster`, `testUser` 등)

2. **Service 테스트**
   - Mock 사용
   - 비즈니스 로직 검증

3. **Controller 테스트**
   - `@WebMvcTest` 또는 `@SpringBootTest` 사용
   - API 엔드포인트 검증

### 4. 코드 리뷰 및 커밋
1. **코드 검토**
   - 코딩 규칙 준수 확인 (`docs/.cursor/rules/project-rules.md`)
   - API 문서 업데이트 확인

2. **커밋**
   - gitmoji 사용 (`✨ feat:`, `🐛 fix:`, `🔧 chore:`)
   - 명확한 커밋 메시지 작성

3. **푸시 및 PR**
   - 원격 저장소에 푸시
   - Pull Request 생성 (필요 시)

### 5. 배포 전 확인
- [ ] 모든 테스트 통과
- [ ] Swagger 문서 업데이트 확인
- [ ] `docs/plan/BE-plan.md` 업데이트 (완료된 작업 표시)

## 프론트엔드 개발 워크플로우

### 1. 기능 개발 시작
1. **계획서 확인**: `docs/plan/FE-plan.md`에서 작업 항목 확인
2. **브랜치 생성**: `git checkout -b feature/{description}`
3. **API 문서 확인**: 백엔드 API 엔드포인트 확인

### 2. 개발 단계
1. **컴포넌트 설계**
   - 컴포넌트 구조 설계
   - Props 인터페이스 정의

2. **UI 컴포넌트 구현**
   - Radix UI 컴포넌트 활용
   - Tailwind CSS 스타일링
   - 반응형 디자인 적용

3. **상태 관리**
   - Context API 사용 (AuthContext, UserContext)
   - 로컬 상태는 useState 사용

4. **API 연동**
   - `src/services/` 디렉토리의 서비스 함수 사용
   - 에러 처리 구현
   - 로딩 상태 관리

5. **라우팅**
   - `src/routes/index.tsx`에 라우트 추가
   - Protected Route 적용 (필요 시)

### 3. 테스트 및 검증
1. **브라우저 테스트**
   - 실제 브라우저에서 기능 확인
   - 반응형 디자인 확인 (모바일/태블릿/데스크톱)
   - 브라우저 콘솔 에러 확인

2. **API 연동 테스트**
   - 백엔드 API와 실제 통신 확인
   - 에러 케이스 테스트

3. **사용자 흐름 테스트**
   - 샘플 계정으로 전체 플로우 테스트
   - 소비자: `consumer1` / `pass!1234`
   - 판매자: `seller1` / `pass!1234`
   - 관리자: `admin1` / `pass!1234`

### 4. 코드 리뷰 및 커밋
1. **코드 검토**
   - TypeScript 타입 체크 (`npx tsc --noEmit`)
   - 컴포넌트 구조 확인

2. **커밋**
   - gitmoji 사용
   - 명확한 커밋 메시지 작성

3. **빌드 확인**
   - 프로덕션 빌드 성공 확인 (`npm run build`)

### 5. 배포 전 확인
- [ ] 브라우저 테스트 완료
- [ ] 반응형 디자인 확인
- [ ] `docs/plan/FE-plan.md` 업데이트 (완료된 작업 표시)

## 통합 개발 워크플로우

### 프론트엔드와 백엔드 동시 개발 시

1. **API 우선 설계**
   - 백엔드 API 엔드포인트 먼저 설계
   - Swagger 문서 작성
   - 프론트엔드에서 API 스펙 확인

2. **데이터 구조 일관성**
   - DTO와 프론트엔드 타입 일치 확인
   - API 응답 형식 통일 (`ApiResponse<T>`)

3. **Mock 데이터 활용**
   - 백엔드 개발 중 프론트엔드는 Mock 데이터 사용
   - 백엔드 완료 후 실제 API로 전환

## 테스트 방법

### 백엔드 테스트

#### 도메인별 테스트 실행
```bash
./gradlew testMaster      # 마스터 데이터
./gradlew testUser        # 사용자 도메인
./gradlew testGeo         # 지리 정보
./gradlew testPopup       # 팝업 도메인
./gradlew testSocial      # 소셜 기능
./gradlew testMsg         # 메시지
```

#### 전체 테스트 실행
```bash
./gradlew test
```

#### 특정 클래스 테스트
```bash
./gradlew test --tests '*RepositoryTest'
./gradlew test --tests 'AuthControllerTest'
```

### 프론트엔드 테스트

#### TypeScript 타입 체크
```bash
cd itdaing-web
npx tsc --noEmit
```

#### 브라우저 테스트
- 개발 서버 실행: `npm run dev`
- 실제 브라우저에서 기능 확인
- 브라우저 개발자 도구 콘솔 확인

## 디버깅 방법

### 백엔드 디버깅
1. **로그 확인**
   ```bash
   tail -f /tmp/itdaing-boot.log
   ```

2. **에러 로그 필터링**
   ```bash
   grep -i error /tmp/itdaing-boot.log | tail -20
   ```

3. **데이터베이스 쿼리 확인**
   - `application.yml`에서 `logging.level.org.hibernate.SQL=DEBUG` 설정
   - 또는 `DataSourceLogConfig` 확인

### 프론트엔드 디버깅
1. **브라우저 개발자 도구**
   - 콘솔 탭: JavaScript 에러 확인
   - Network 탭: API 요청/응답 확인
   - React DevTools: 컴포넌트 상태 확인

2. **API 에러 확인**
   - Network 탭에서 실패한 요청 확인
   - 응답 본문 확인
   - 백엔드 로그 확인

## 문제 해결 가이드

### 백엔드 서버가 시작되지 않을 때
1. 포트 8080 사용 확인: `lsof -ti:8080`
2. 환경 변수 로드 확인: `cd ~/itdaing && source prod.env`
3. 데이터베이스 연결 확인
4. 로그 확인: `tail -f /tmp/itdaing-boot.log`

### 데이터베이스 마이그레이션 실패 시
1. 마이그레이션 상태 확인: `./gradlew flywayInfo`
2. 마이그레이션 파일 문법 확인 (PostgreSQL 문법)
3. 필요 시 수동으로 SQL 실행

### 프론트엔드 빌드 실패 시
1. `node_modules` 삭제 후 재설치: `rm -rf node_modules && npm install`
2. TypeScript 타입 에러 확인: `npx tsc --noEmit`
3. 의존성 버전 확인: `package.json`

### API 연동 실패 시
1. 백엔드 서버 실행 확인
2. CORS 설정 확인
3. 인증 토큰 확인
4. Network 탭에서 요청/응답 확인

## 배포 전 체크리스트

### 백엔드
- [ ] 모든 테스트 통과
- [ ] Swagger 문서 업데이트
- [ ] 환경 변수 확인 (`prod.env`)
- [ ] 데이터베이스 마이그레이션 확인
- [ ] 로그 레벨 확인

### 프론트엔드
- [ ] 프로덕션 빌드 성공 (`npm run build`)
- [ ] 브라우저 테스트 완료
- [ ] 반응형 디자인 확인
- [ ] API 연동 확인
- [ ] 환경 변수 확인 (`.env`)

### 통합
- [ ] 프론트엔드와 백엔드 통합 테스트
- [ ] 샘플 계정으로 전체 플로우 테스트
- [ ] 성능 확인 (로딩 시간, 응답 시간)

## 관련 문서

- [프로젝트 규칙](project-rules.md)
- [명령어 규칙](commands-rules.md)
- [백엔드 개발 계획](../docs/plan/BE-plan.md)
- [프론트엔드 개발 계획](../docs/plan/FE-plan.md)
- [Private EC2 접근 가이드](private-ec2-access.mdc)

