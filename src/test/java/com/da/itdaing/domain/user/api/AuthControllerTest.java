package com.da.itdaing.domain.user.api;

import com.da.itdaing.domain.common.enums.UserRole;
import com.da.itdaing.domain.user.dto.AuthDto;
import com.da.itdaing.domain.user.exception.AuthException;
import com.da.itdaing.domain.user.service.AuthService;
import com.da.itdaing.global.error.ErrorCode;
import com.da.itdaing.global.error.GlobalExceptionHandler;
import com.da.itdaing.global.security.JwtAuthFilter;
import com.da.itdaing.global.security.JwtTokenProvider;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.ImportAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * AuthController 테스트 (Web slice)
 * - Security 필터 비활성화(addFilters=false)로 컨트롤러 슬라이스만 검증
 * - 에러 응답은 GlobalExceptionHandler 포맷을 사용
 */
@WebMvcTest(AuthController.class)
@Import(GlobalExceptionHandler.class)
@AutoConfigureMockMvc(addFilters = false)
@ImportAutoConfiguration(exclude = {
    SecurityAutoConfiguration.class,
    SecurityFilterAutoConfiguration.class
})
class AuthControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    @MockitoBean private AuthService authService;

    @Test
    @DisplayName("로그인 성공 - 올바른 loginId/비밀번호로 JWT 토큰을 받는다")
    void login_Success() throws Exception {
        // given
        AuthDto.LoginRequest request = AuthDto.LoginRequest.builder()
            .loginId("juchan01")
            .password("password123")
            .build();

        AuthDto.LoginResponse response = AuthDto.LoginResponse.builder()
            .accessToken("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token")
            .build();

        given(authService.login(any(AuthDto.LoginRequest.class))).willReturn(response);

        // when & then
        mockMvc.perform(post("/api/auth/login")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andDo(print())
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.accessToken").exists())
            .andExpect(jsonPath("$.data.accessToken").isNotEmpty());
    }

    @Test
    @DisplayName("로그인 실패 - 자격 증명 오류")
    void login_Failure_InvalidCredentials() throws Exception {
        // given
        AuthDto.LoginRequest request = AuthDto.LoginRequest.builder()
            .loginId("wrongId")
            .password("wrongpassword")
            .build();

        given(authService.login(any(AuthDto.LoginRequest.class)))
            .willThrow(new AuthException(ErrorCode.INVALID_CREDENTIALS));

        // when & then
        mockMvc.perform(post("/api/auth/login")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andDo(print())
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.error.status").value(401))
            .andExpect(jsonPath("$.error.code").value(ErrorCode.INVALID_CREDENTIALS.getCode()));
    }

    @Test
    @DisplayName("소비자 회원가입 성공 (loginId, ageGroup 포함)")
    void signupConsumer_Success() throws Exception {
        // given
        AuthDto.SignupConsumerRequest request = AuthDto.SignupConsumerRequest.builder()
            .loginId("juchan01")
            .email("newconsumer@example.com")
            .password("password123")
            .passwordConfirm("password123")
            .name("김소비")
            .nickname("소비왕")
            .ageGroup(20)
            .interestCategoryIds(List.of(1L))
            .styleIds(List.of(1L))
            .regionIds(List.of(1L))
            .featureIds(List.of(1L))
            .build();

        AuthDto.SignupResponse response = AuthDto.SignupResponse.builder()
            .userId(1L)
            .email("newconsumer@example.com")
            .role(UserRole.CONSUMER)
            .build();

        given(authService.signupConsumer(any(AuthDto.SignupConsumerRequest.class))).willReturn(response);

        // when & then
        mockMvc.perform(post("/api/auth/signup/consumer")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andDo(print())
            .andExpect(status().isOk()) // 컨트롤러에서 201로 바꾸면 isCreated()로 변경
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.userId").value(1))
            .andExpect(jsonPath("$.data.email").value("newconsumer@example.com"))
            .andExpect(jsonPath("$.data.role").value("CONSUMER"));
    }

    @Test
    @DisplayName("판매자 회원가입 성공 (loginId 포함)")
    void signupSeller_Success() throws Exception {
        // given
        AuthDto.SignupSellerRequest request = AuthDto.SignupSellerRequest.builder()
            .loginId("seller01")
            .email("newseller@example.com")
            .password("password123")
            .passwordConfirm("password123")
            .name("박판매")
            .nickname("팝업왕")
            .build();

        AuthDto.SignupResponse response = AuthDto.SignupResponse.builder()
            .userId(2L)
            .email("newseller@example.com")
            .role(UserRole.SELLER)
            .build();

        given(authService.signupSeller(any(AuthDto.SignupSellerRequest.class))).willReturn(response);

        // when & then
        mockMvc.perform(post("/api/auth/signup/seller")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andDo(print())
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.userId").value(2))
            .andExpect(jsonPath("$.data.email").value("newseller@example.com"))
            .andExpect(jsonPath("$.data.role").value("SELLER"));
    }

    @Test
    @DisplayName("회원가입 실패 - 이메일 중복(409, 코드 매칭)")
    void signup_Failure_DuplicateEmail() throws Exception {
        // given
        AuthDto.SignupConsumerRequest request = AuthDto.SignupConsumerRequest.builder()
            .loginId("dup01")
            .email("existing@example.com")
            .password("password123")
            .passwordConfirm("password123")
            .name("테스트")
            .nickname("중복테스트")
            .ageGroup(30)
            .interestCategoryIds(List.of(1L))
            .styleIds(List.of(1L))
            .regionIds(List.of(1L))
            .featureIds(List.of(1L))
            .build();

        given(authService.signupConsumer(any(AuthDto.SignupConsumerRequest.class)))
            .willThrow(new AuthException(ErrorCode.DUPLICATE_EMAIL));

        // when & then
        mockMvc.perform(post("/api/auth/signup/consumer")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andDo(print())
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.error.status").value(409))
            .andExpect(jsonPath("$.error.code").value(ErrorCode.DUPLICATE_EMAIL.getCode()));
    }

    @Test
    @DisplayName("회원가입 실패 - 이메일 형식 오류로 400")
    void signup_Failure_InvalidEmail() throws Exception {
        // given (다른 필수값은 정상으로 채워 이메일 검증만 트리거)
        AuthDto.SignupConsumerRequest request = AuthDto.SignupConsumerRequest.builder()
            .loginId("validId")
            .email("invalid-email")
            .password("password123")
            .passwordConfirm("password123")
            .name("테스트")
            .nickname("유효성검증")
            .ageGroup(20)
            .interestCategoryIds(List.of(1L))
            .styleIds(List.of(1L))
            .regionIds(List.of(1L))
            .featureIds(List.of(1L))
            .build();

        // when & then
        mockMvc.perform(post("/api/auth/signup/consumer")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andDo(print())
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.error.status").value(400));
    }

    @Test
    @DisplayName("회원가입 실패 - 나이대가 10의 배수가 아니면 400")
    void signup_Failure_InvalidAgeGroup_NotTens() throws Exception {
        AuthDto.SignupConsumerRequest request = AuthDto.SignupConsumerRequest.builder()
            .loginId("ageBad01")
            .email("a@b.com")
            .password("password123")
            .passwordConfirm("password123")
            .name("홍길동")
            .nickname("길동이")
            .ageGroup(25) // 잘못된 값
            .interestCategoryIds(List.of(1L))
            .styleIds(List.of(1L))
            .regionIds(List.of(1L))
            .featureIds(List.of(1L))
            .build();

        mockMvc.perform(post("/api/auth/signup/consumer")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andDo(print())
            .andExpect(status().isBadRequest());
    }
}
