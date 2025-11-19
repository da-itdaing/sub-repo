## ItDaIng 백엔드 개요 (Spring Boot 3.5, Java 21)

- 기술 스택
  - Spring Boot: Web, Data JPA, Validation, Security, Actuator
  - OpenAPI: springdoc-openapi-starter-webmvc-ui + Gradle 플러그인
  - 인증/인가: JWT (jjwt 0.12.x)
  - DB: PostgreSQL (Prod), H2 (OpenAPI/Local), Flyway 마이그레이션
  - QueryDSL, MapStruct
  - AWS SDK v2 (S3)

- 주요 플러그인/설정
  - Gradle 플러그인: `org.springdoc.openapi-gradle-plugin` (generateOpenApiDocs)
  - Java 21 toolchain
  - OpenAPI 프로필: `application-openapi.yml` (H2, Swagger UI 비활성화, 스펙 생성용)

- 실행/빌드
  - 개발 실행: `./gradlew bootRun` (필요 시 `source prod.env`)
  - 테스트: `./gradlew test`
  - OpenAPI 생성: `./gradlew generateOpenApiDocs`
    - 산출물: `build/openapi/openapi.yaml`

- 프로필
  - `application.yml` + `-dev`, `-prod`, `-openapi` 등
  - OpenAPI 프로필은 문서 생성만을 위해 H2, 제한된 로깅, Swagger UI 비활성화

### 패키지 구조(요약)
```
src/main/java/com/da/itdaing/
├── domain/{boundedContext}/
│   ├── api/         # Controller (REST)
│   ├── dto/         # 요청/응답 DTO
│   ├── entity/      # JPA 엔티티
│   ├── repository/  # Spring Data JPA
│   └── service/     # 비즈니스 로직
├── global/
│   ├── web/ApiResponse.java
│   ├── error/GlobalExceptionHandler.java
│   └── security/... (JWT 등)
```

### 표준 응답/에러 처리
- 모든 API는 `ApiResponse<T>` 래퍼를 사용
- 글로벌 예외 처리기(`GlobalExceptionHandler`)에서 일관된 에러 포맷 반환

예시: 공통 응답
```java
// global/web/ApiResponse.java
public class ApiResponse<T> {
    private boolean success;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private T data;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private ApiError error;
    public static <T> ApiResponse<T> success(T data) { ... }
    public static <T> ApiResponse<T> error(ApiError error) { ... }
}
```

예시: 예외 처리
```java
// global/error/GlobalExceptionHandler.java
@RestControllerAdvice
public class GlobalExceptionHandler {
  @ExceptionHandler(MethodArgumentNotValidException.class)
  protected ResponseEntity<ApiResponse<Void>> handleInvalid(MethodArgumentNotValidException e) { ... }
  @ExceptionHandler(EntityNotFoundException.class)
  protected ResponseEntity<ApiResponse<Void>> handleNotFound(EntityNotFoundException e) { ... }
  @ExceptionHandler(Exception.class)
  protected ResponseEntity<ApiResponse<Void>> handleUnexpected(Exception e) { ... }
}
```

### 컨트롤러/DTO/서비스 예시
```java
// Controller
@RestController
@RequestMapping("/api/popups")
public class PopupQueryController {
  private final PopupQueryService popupQueryService;
  public PopupQueryController(PopupQueryService popupQueryService) { this.popupQueryService = popupQueryService; }

  @GetMapping("/{id}")
  public ApiResponse<PopupSummaryResponse> get(@PathVariable Long id) {
    PopupSummaryResponse dto = popupQueryService.getSummary(id);
    return ApiResponse.success(dto);
  }
}
```

```java
// DTO (Java 17+ record 예시)
public record PopupSummaryResponse(
  Long id,
  String title,
  String description,
  LocalDateTime startDate,
  LocalDateTime endDate,
  List<String> images
) {}
```

```java
// Service
@Service
public class PopupQueryService {
  private final PopupRepository popupRepository;
  public PopupQueryService(PopupRepository popupRepository) { this.popupRepository = popupRepository; }
  public PopupSummaryResponse getSummary(Long id) {
    Popup popup = popupRepository.findById(id)
        .orElseThrow(() -> new EntityNotFoundException(ErrorCode.RESOURCE_NOT_FOUND, "Popup not found: " + id));
    return new PopupSummaryResponse(popup.getId(), popup.getTitle(), popup.getDescription(),
        popup.getStartDate(), popup.getEndDate(), popup.getImageUrls());
  }
}
```

### 보안(JWT) 요약
- 로그인 성공 시 액세스 토큰(필수) + 리프레시 토큰(선택적)이 발급
- 프론트는 토큰을 저장 후, `Authorization: Bearer {token}`을 자동 첨부
- 401 응답 시 프론트 인터셉터가 세션 정리 및 로그인 리다이렉트

### OpenAPI(스웨거) 문서
- 문서 생성
  - CI/CD: GitHub Actions에서 `generateOpenApiDocs` 실행 후 `gh-pages`로 정적 Swagger UI 배포
  - 로컬: `./gradlew generateOpenApiDocs` 실행 후 `build/openapi/openapi.yaml` 확인
- 프로필: `openapi` (H2, Swagger UI 비활성화, 스펙 생성에 최적화)
- Swagger UI(런타임) 확인: `http://localhost:8080/swagger-ui/index.html` (개발/테스트 시)

### 운영/배포 관련
- DB 마이그레이션: Flyway (`src/main/resources/db/migration`)
- 스토리지: AWS S3 (환경변수로 자격 정보 설정)
- 설정 값은 프로필 + 환경변수 조합 사용. 비밀값은 Git에 커밋 금지.


