package com.da.itdaing.domain.user.api;

import com.da.itdaing.domain.file.dto.ImagePayload;
import com.da.itdaing.domain.user.dto.AuthDto;
import com.da.itdaing.domain.user.dto.UserDashboardDto;
import com.da.itdaing.domain.user.exception.AuthException;
import com.da.itdaing.domain.user.service.AuthService;
import com.da.itdaing.domain.user.service.UserDashboardService;
import com.da.itdaing.global.error.ErrorCode;
import com.da.itdaing.global.web.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * 인증 API 컨트롤러
 */
@Tag(name = "Auth", description = "인증 API")
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserDashboardService userDashboardService;

    @Operation(
            summary = "소비자 회원가입",
            description = """
                    일반 소비자 계정을 생성합니다.

                    가입된 사용자는 CONSUMER 역할이 부여되며, 다음 권한을 가집니다:
                    - 팝업스토어 검색 및 조회
                    - 위시리스트 관리
                    - 리뷰 작성 및 조회
                    - 소비자 선호 정보 설정

                    회원가입 시 선호 정보를 함께 등록합니다:
                    - 관심 카테고리: 1~4개 (필수)
                    - 팝업 스타일: 1~4개 (필수)
                    - 선호 지역: 1~2개 (필수)

                    모든 선호 정보는 마스터 데이터에 존재하는 ID여야 하며, 중복은 자동으로 제거됩니다.

                    로그인 시 JWT 토큰의 role 클레임에는 "ROLE_CONSUMER"가 설정됩니다.
                    """,
            security = {},
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    content = @Content(
                            mediaType = "application/json",
                            examples = @ExampleObject(
                                    name = "소비자 회원가입 요청 예시",
                                    value = """
                                            {
                                                "email": "consumer1@example.com",
                                                "password": "P@ssw0rd1!",
                                                "passwordConfirm": "P@ssw0rd1!",
                                                "loginId": "consumer1",
                                                "name": "김소비",
                                                "nickname": "소비왕",
                                                "ageGroup": 20,
                                                "interestCategoryIds": [101, 105],
                                                "styleIds": [12, 15, 19],
                                                "regionIds": [2]
                                            }
                                            """
                            )
                    )
            )
    )
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "201",
                    description = "회원가입 성공",
                    content = @Content(
                            mediaType = "application/json",
                            examples = @ExampleObject(value = """
                                    {
                                        "success": true,
                                        "data": {
                                            "userId": 1,
                                            "email": "consumer1@example.com",
                                            "role": "CONSUMER"
                                        }
                                    }
                                    """)
                    )
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description = "입력값 검증 실패 (선호 정보 개수 초과 등)",
                    content = @Content(
                            mediaType = "application/json",
                            examples = {
                                    @ExampleObject(
                                            name = "선호 개수 초과",
                                            value = """
                                                    {
                                                        "success": false,
                                                        "error": {
                                                            "status": 400,
                                                            "code": "E001",
                                                            "message": "스타일 개수는 1~4개여야 합니다"
                                                        }
                                                    }
                                                    """
                                    ),
                                    @ExampleObject(
                                            name = "비밀번호 불일치",
                                            value = """
                                                    {
                                                        "success": false,
                                                        "error": {
                                                            "status": 400,
                                                            "code": "E001",
                                                            "message": "입력값이 올바르지 않습니다"
                                                        }
                                                    }
                                                    """
                                    )
                            }
                    )
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "마스터 데이터 ID 불일치",
                    content = @Content(
                            mediaType = "application/json",
                            examples = @ExampleObject(value = """
                                    {
                                        "success": false,
                                        "error": {
                                            "status": 404,
                                            "code": "E101",
                                            "message": "존재하지 않는 스타일이 포함되어 있습니다"
                                        }
                                    }
                                    """)
                    )
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "409",
                    description = "이메일 또는 로그인ID 중복",
                    content = @Content(
                            mediaType = "application/json",
                            examples = @ExampleObject(value = """
                                    {
                                        "success": false,
                                        "error": {
                                            "status": 409,
                                            "code": "E202",
                                            "message": "이미 사용 중인 이메일입니다"
                                        }
                                    }
                                    """)
                    )
            )
    })
    @PostMapping("/auth/signup/consumer")
    public ResponseEntity<ApiResponse<AuthDto.SignupResponse>> signupConsumer(
        @Valid @RequestBody AuthDto.SignupConsumerRequest request) {
        var response = authService.signupConsumer(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @Operation(
            summary = "판매자 회원가입",
            description = """
                    팝업스토어 판매자 계정을 생성합니다.

                    가입된 사용자는 SELLER 역할이 부여되며, 다음 권한을 가집니다:
                    - 팝업스토어 등록 및 관리
                    - 판매자 프로필 관리
                    - 팝업스토어 승인 요청
                    - 고객 리뷰 조회

                    판매자 프로필 정보(활동 지역, SNS URL, 프로필 이미지, 소개)도 함께 등록됩니다.
                    - 활동 지역은 필수 입력 항목입니다.
                    - SNS URL은 선택 항목이며, 입력 시 유효한 URL 형식이어야 합니다.
                    - 프로필 이미지 URL과 소개는 선택 항목입니다.

                    로그인 시 JWT 토큰의 role 클레임에는 "ROLE_SELLER"가 설정됩니다.
                    """,
            security = {}
    )
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "201",
                    description = "회원가입 성공",
                    content = @Content(
                            mediaType = "application/json",
                            examples = @ExampleObject(value = """
                                    {
                                        "success": true,
                                        "data": {
                                            "userId": 12,
                                            "email": "seller1@example.com",
                                            "role": "SELLER",
                                            "profile": {
                                                "activityRegion": "광주/남구",
                                                "snsUrl": "https://instagram.com/popup_seller",
                                                "profileImage": {
                                                    "url": "https://cdn.example.com/profiles/popup_seller.png",
                                                    "key": "uploads/profile.png"
                                                },
                                                "introduction": "팝업 운영 3년차, 굿즈 위주"
                                            }
                                        }
                                    }
                                    """)
                    )
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description = "입력값 검증 실패",
                    content = @Content(
                            mediaType = "application/json",
                            examples = @ExampleObject(value = """
                                    {
                                        "success": false,
                                        "error": {
                                            "status": 400,
                                            "code": "E001",
                                            "message": "입력값이 올바르지 않습니다"
                                        }
                                    }
                                    """)
                    )
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "409",
                    description = "이메일 또는 로그인ID 중복",
                    content = @Content(
                            mediaType = "application/json",
                            examples = @ExampleObject(value = """
                                    {
                                        "success": false,
                                        "error": {
                                            "status": 409,
                                            "code": "E202",
                                            "message": "이미 사용 중인 이메일입니다"
                                        }
                                    }
                                    """)
                    )
            )
    })
    @PostMapping("/auth/signup/seller")
    public ResponseEntity<ApiResponse<AuthDto.SignupResponse>> signupSeller(
        @Valid @RequestBody AuthDto.SignupSellerRequest request) {
        var response = authService.signupSeller(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @Operation(
            summary = "로그인",
            description = """
                    로그인 ID와 비밀번호로 로그인하여 JWT 액세스 토큰을 발급받습니다.

                    JWT 토큰에는 다음 클레임이 포함됩니다:
                    - sub: 사용자 ID
                    - role: ROLE_CONSUMER, ROLE_SELLER, ROLE_ADMIN 중 하나
                    - iss: itdaing-server
                    - iat: 발급 시각 (Unix timestamp)
                    - exp: 만료 시각 (발급 후 24시간)

                    발급받은 토큰은 Authorization 헤더에 "Bearer {token}" 형식으로 포함하여 인증이 필요한 API를 호출할 수 있습니다.

                    예시 토큰 페이로드 (디코딩 후):
                    {
                      "sub": "1",
                      "role": "ROLE_CONSUMER",
                      "iss": "itdaing-server",
                      "iat": 1730419200,
                      "exp": 1730505600
                    }
                    """,
            security = {}
    )
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "로그인 성공",
                    content = @Content(
                            mediaType = "application/json",
                            examples = @ExampleObject(
                                    name = "로그인 성공 응답",
                                    description = "소비자(CONSUMER) 계정으로 로그인한 경우",
                                    value = """
                                    {
                                        "success": true,
                                        "data": {
                                            "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwicm9sZSI6IlJPTEVfQ09OU1VNRVIiLCJpc3MiOiJpdGRhaW5nLXNlcnZlciIsImlhdCI6MTczMDQxOTIwMCwiZXhwIjoxNzMwNTA1NjAwfQ.signature"
                                        }
                                    }
                                    """)
                    )
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "인증 실패",
                    content = @Content(
                            mediaType = "application/json",
                            examples = @ExampleObject(value = """
                                    {
                                        "success": false,
                                        "error": {
                                            "status": 401,
                                            "code": "AUTH-401",
                                            "message": "로그인ID 또는 비밀번호가 올바르지 않습니다"
                                        }
                                    }
                                    """)
                    )
            )
    })
    @PostMapping("/auth/login")
    public ApiResponse<AuthDto.LoginResponse> login(
            @Valid @RequestBody AuthDto.LoginRequest request
    ) {
        AuthDto.LoginResponse response = authService.login(request);
        return ApiResponse.success(response);
    }

    @Operation(
            summary = "내 프로필 조회",
            description = """
                    인증된 사용자의 프로필 정보를 조회합니다.

                    이 API는 JWT 토큰 인증이 필요합니다.
                    Authorization 헤더에 "Bearer {token}" 형식으로 토큰을 포함해야 합니다.

                    응답의 role 필드는 다음 값 중 하나입니다:
                    - CONSUMER: 일반 소비자
                    - SELLER: 팝업스토어 판매자
                    - ADMIN: 시스템 관리자
                    """,
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "조회 성공",
                    content = @Content(
                            mediaType = "application/json",
                            examples = {
                                    @ExampleObject(
                                            name = "소비자 프로필",
                                            description = "CONSUMER 역할의 사용자 프로필",
                                            value = """
                                            {
                                                "success": true,
                                                "data": {
                                                    "id": 1,
                                                    "email": "consumer@example.com",
                                                    "name": "김소비",
                                                    "nickname": "소비왕",
                                                    "role": "CONSUMER"
                                                }
                                            }
                                            """),
                                    @ExampleObject(
                                            name = "판매자 프로필",
                                            description = "SELLER 역할의 사용자 프로필",
                                            value = """
                                            {
                                                "success": true,
                                                "data": {
                                                    "id": 2,
                                                    "email": "seller@example.com",
                                                    "name": "박판매",
                                                    "nickname": "팝업왕",
                                                    "role": "SELLER"
                                                }
                                            }
                                            """)
                            }
                    )
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "인증 실패 - 토큰이 없거나 유효하지 않음",
                    content = @Content(
                            mediaType = "application/json",
                            examples = @ExampleObject(value = """
                                    {
                                        "success": false,
                                        "error": {
                                            "status": 401,
                                            "code": "AUTH-401",
                                            "message": "인증이 필요합니다"
                                        }
                                    }
                                    """)
                    )
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "사용자를 찾을 수 없음",
                    content = @Content(
                            mediaType = "application/json",
                            examples = @ExampleObject(value = """
                                    {
                                        "success": false,
                                        "error": {
                                            "status": 404,
                                            "code": "COMMON-404",
                                            "message": "사용자를 찾을 수 없습니다"
                                        }
                                    }
                                    """)
                    )
            )
    })
    @GetMapping("/users/me")
    public ApiResponse<AuthDto.UserProfileResponse> getMyProfile(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        AuthDto.UserProfileResponse response = authService.getProfile(userId);
        return ApiResponse.success(response);
    }

    @Operation(
        summary = "내 대시보드 데이터 조회",
        description = "위시리스트, 추천, 최근 본 팝업 등 소비자 마이페이지 구성을 위한 정보를 반환합니다.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @GetMapping("/users/me/dashboard")
    public ApiResponse<UserDashboardDto.DashboardResponse> getMyDashboard(
        Authentication authentication
    ) {
        Long userId = (Long) authentication.getPrincipal();
        return ApiResponse.success(userDashboardService.getDashboard(userId));
    }

    @PutMapping(
        value = "/users/me/profile-image",
        consumes = MediaType.APPLICATION_JSON_VALUE,
        produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ApiResponse<AuthDto.UserProfileResponse> updateProfileImage(
        Authentication authentication,
        @Valid @RequestBody ImagePayload payload
    ) {
        Long userId = (Long) authentication.getPrincipal();
        AuthDto.UserProfileResponse response = authService.updateProfileImage(userId, payload);
        return ApiResponse.success(response);
    }

    @Operation(
        summary = "토큰 재발급 (Refresh Rotation)",
        description = "유효한 refreshToken을 보내면 새 accessToken/refreshToken을 발급합니다."
    )
    @PostMapping(
        value = "/auth/refresh",
        consumes = MediaType.APPLICATION_JSON_VALUE,
        produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<ApiResponse<AuthDto.TokenPair>> refresh(
        @io.swagger.v3.oas.annotations.parameters.RequestBody(
            required = true,
            description = "리프레시 토큰을 담아 요청합니다.",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = AuthDto.TokenRefreshRequest.class),
                examples = @ExampleObject(value = "{ \"refreshToken\": \"existing.refresh.jwt.token\" }")
            )
        )
        @Valid @RequestBody AuthDto.TokenRefreshRequest request
    ) {
        var tokens = authService.refresh(request.getRefreshToken());
        return ResponseEntity.ok(ApiResponse.success(tokens));
    }

    @Operation(
        summary = "로그아웃",
        description = """
            현재 로그인 세션을 종료합니다.
            - **Authorization: Bearer {accessToken}** 헤더가 필요합니다.
            - 선택적으로 본문에 **refreshToken**을 함께 전달할 수 있습니다(서버에 저장/블랙리스트 전략에 따라 무효화).
            - 성공 시 본문 없이 **204 No Content**를 반환합니다.
            """,
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "204",
            description = "로그아웃 성공 (본문 없음)"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401",
            description = "인증 실패 - Authorization 헤더 없음/형식 오류/토큰 무효",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(value = """
                    {
                      "success": false,
                      "error": {
                        "status": 401,
                        "code": "AUTH-401",
                        "message": "인증이 필요합니다"
                      }
                    }
                    """)
            )
        )
    })
    @PostMapping("/auth/logout")
    public ResponseEntity<Void> logout(
        @RequestHeader(value = "Authorization", required = false) String authorization,
        @RequestBody(required = false)
        @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "선택적으로 refreshToken을 본문에 포함",
            required = false,
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(value = """
                    { "refreshToken": "existing.refresh.jwt.token" }
                    """)
            )
        )
        AuthDto.LogoutRequest body
    ) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            throw new AuthException(ErrorCode.UNAUTHENTICATED, "인증이 필요합니다");
        }
        String accessToken = authorization.substring("Bearer ".length());
        String refreshToken = (body != null) ? body.getRefreshToken() : null;

        authService.logout(accessToken, refreshToken);
        return ResponseEntity.noContent().build(); // 204
    }
}

