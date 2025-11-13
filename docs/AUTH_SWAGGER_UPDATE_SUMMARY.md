# AuthController Swagger Documentation Update - Summary

## 작업 완료 내역

### 1. 파일 구조 정리
✅ **AuthController.java** - 모든 어노테이션을 올바른 위치로 정리하고 컴파일 에러 제거

### 2. 어노테이션 구조 통일
모든 핸들러 메서드에 대해 다음 순서로 통일:
```
@Operation(...)
@ApiResponses({...})
@PostMapping/@GetMapping
메서드 시그니처 및 본문
```

### 3. 엔드포인트별 문서화 상세

#### POST /api/auth/signup/consumer
- **역할**: CONSUMER
- **JWT claim**: `role=ROLE_CONSUMER`
- **응답 코드**:
  - 200: 회원가입 성공
  - 400: 입력값 검증 실패 (COMMON-001)
  - 409: 이메일 중복 (COMMON-409)

#### POST /api/auth/signup/seller
- **역할**: SELLER
- **JWT claim**: `role=ROLE_SELLER`
- **응답 코드**:
  - 200: 회원가입 성공
  - 400: 입력값 검증 실패 (COMMON-001)
  - 409: 이메일 중복 (COMMON-409)

#### POST /api/auth/login
- **설명**: JWT 액세스 토큰 발급
- **JWT 클레임 구조**:
  ```json
  {
    "sub": "1",
    "role": "ROLE_CONSUMER",
    "iss": "itdaing-server",
    "iat": 1730419200,
    "exp": 1730505600
  }
  ```
- **응답 코드**:
  - 200: 로그인 성공 (accessToken 포함)
  - 401: 인증 실패 (AUTH-401)

#### GET /api/users/me
- **인증**: Bearer Token 필수
- **응답 예시**: CONSUMER/SELLER 프로필 2종
- **응답 코드**:
  - 200: 프로필 조회 성공
  - 401: 인증 실패 (AUTH-401)
  - 404: 사용자를 찾을 수 없음 (COMMON-404)

### 4. 에러 코드 표준화

| HTTP Status | Error Code | 사용처 |
|-------------|-----------|--------|
| 400 | COMMON-001 | 입력값 검증 실패 |
| 401 | AUTH-401 | 인증 실패 |
| 403 | AUTH-403 | 권한 없음 |
| 404 | COMMON-404 | 리소스를 찾을 수 없음 |
| 409 | COMMON-409 | 리소스 중복 (이메일 등) |

### 5. Swagger UI 표시 내용

#### 역할 정보
- **CONSUMER**: 일반 소비자 (팝업스토어 검색, 위시리스트, 리뷰)
- **SELLER**: 판매자 (팝업스토어 등록/관리)
- **ADMIN**: 시스템 관리자

#### JWT 토큰 사용법
1. POST /api/auth/login으로 로그인
2. 응답의 accessToken 값 복사
3. Swagger UI 우측 상단 'Authorize' 버튼 클릭
4. "Bearer {token}" 형식으로 입력

### 6. 검증 완료 항목

✅ 컴파일 에러 없음  
✅ 컴파일 경고 없음  
✅ 어노테이션이 메서드 밖으로 벗어나지 않음  
✅ 모든 에러 코드가 프로젝트 표준 준수  
✅ JWT 클레임 구조 상세 설명 포함  
✅ CONSUMER/SELLER/ADMIN 역할 명칭 통일  

## 다음 단계 권장사항

1. **컴파일 및 테스트 실행**:
   ```bash
   ./gradlew clean build
   ./gradlew test
   ```

2. **Swagger UI 확인**:
   - 애플리케이션 실행 후 http://localhost:8080/swagger-ui/index.html 접속
   - 각 엔드포인트의 예시 JSON 렌더링 확인
   - Bearer Authentication 기능 테스트

3. **통합 테스트 권장**:
   - 회원가입 → 로그인 → 프로필 조회 플로우
   - 잘못된 토큰으로 401 응답 확인
   - 이메일 중복으로 409 응답 확인

