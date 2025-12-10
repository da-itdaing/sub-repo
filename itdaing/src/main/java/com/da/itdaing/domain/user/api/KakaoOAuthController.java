package com.da.itdaing.domain.user.api;

import com.da.itdaing.domain.user.dto.KakaoOAuthDto;
import com.da.itdaing.domain.user.service.KakaoOAuthService;
import com.da.itdaing.global.web.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

/**
 * 카카오 OAuth 컨트롤러
 */
@Slf4j
@Tag(name = "Kakao OAuth", description = "카카오 소셜 로그인 API")
@RestController
@RequestMapping("/api/auth/kakao")
@RequiredArgsConstructor
public class KakaoOAuthController {

    private final KakaoOAuthService kakaoOAuthService;

    @Operation(
        summary = "카카오 로그인 URL 조회",
        description = """
            카카오 인증 페이지로 리다이렉트할 URL을 반환합니다.
            
            - role: consumer (소비자) 또는 seller (판매자)
            """
    )
    @GetMapping("/login-url")
    public ApiResponse<KakaoOAuthDto.KakaoAuthUrlResponse> getKakaoLoginUrl(
        @Parameter(description = "사용자 역할 (consumer/seller)")
        @RequestParam(defaultValue = "consumer") String role
    ) {
        return ApiResponse.success(kakaoOAuthService.getKakaoAuthUrl(role));
    }

    @Operation(
        summary = "카카오 로그인 콜백",
        description = """
            카카오 인증 후 콜백을 처리합니다.
            
            - 기존 사용자: JWT 토큰 발급
            - 신규 사용자: 임시 토큰 발급 (추가 정보 입력 필요)
            """
    )
    @GetMapping("/callback")
    public ResponseEntity<ApiResponse<KakaoOAuthDto.KakaoLoginResponse>> kakaoCallback(
        @Parameter(description = "카카오 인가 코드") @RequestParam String code,
        @Parameter(description = "사용자 역할") @RequestParam(required = false, defaultValue = "consumer") String state
    ) {
        log.info("카카오 로그인 콜백: code={}, state={}", code.substring(0, Math.min(10, code.length())) + "...", state);
        KakaoOAuthDto.KakaoLoginResponse response = kakaoOAuthService.processKakaoLogin(code, state);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(
        summary = "카카오 로그인 처리 (프론트엔드용)",
        description = """
            프론트엔드에서 카카오 인가 코드를 직접 전달하여 로그인을 처리합니다.
            
            - code: 카카오에서 발급받은 인가 코드
            - role: consumer (소비자) 또는 seller (판매자)
            """
    )
    @PostMapping("/login")
    public ApiResponse<KakaoOAuthDto.KakaoLoginResponse> kakaoLogin(
        @Valid @RequestBody KakaoOAuthDto.KakaoLoginRequest request
    ) {
        log.info("카카오 로그인 요청: role={}", request.getRole());
        return ApiResponse.success(kakaoOAuthService.processKakaoLogin(request.getCode(), request.getRole()));
    }

    @Operation(
        summary = "소비자 카카오 회원가입 완료",
        description = """
            카카오 로그인 후 신규 소비자의 추가 정보를 입력하여 회원가입을 완료합니다.
            
            필수 정보:
            - 연령대
            - 관심 카테고리 (1~4개)
            - 스타일 (1~4개)
            - 선호 지역 (1~2개)
            """
    )
    @PostMapping("/complete/consumer")
    public ResponseEntity<ApiResponse<KakaoOAuthDto.KakaoLoginResponse>> completeConsumerSignup(
        @Valid @RequestBody KakaoOAuthDto.ConsumerCompleteRequest request
    ) {
        KakaoOAuthDto.KakaoLoginResponse response = kakaoOAuthService.completeConsumerSignup(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @Operation(
        summary = "판매자 카카오 회원가입 완료",
        description = """
            카카오 로그인 후 신규 판매자의 추가 정보를 입력하여 회원가입을 완료합니다.
            
            필수 정보:
            - 활동 지역
            
            선택 정보:
            - SNS URL
            - 소개
            """
    )
    @PostMapping("/complete/seller")
    public ResponseEntity<ApiResponse<KakaoOAuthDto.KakaoLoginResponse>> completeSellerSignup(
        @Valid @RequestBody KakaoOAuthDto.SellerCompleteRequest request
    ) {
        KakaoOAuthDto.KakaoLoginResponse response = kakaoOAuthService.completeSellerSignup(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }
}

