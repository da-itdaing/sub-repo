package com.da.itdaing.domain.user.api;

import com.da.itdaing.domain.common.enums.UserRole;
import com.da.itdaing.domain.user.dto.AuthDto;
import com.da.itdaing.domain.user.exception.AuthException;
import com.da.itdaing.domain.user.service.AuthService;
import com.da.itdaing.global.error.ErrorCode;
import com.da.itdaing.global.error.GlobalExceptionHandler;
import com.da.itdaing.global.security.JwtAuthFilter;
import com.da.itdaing.global.security.JwtTokenProvider;
import com.da.itdaing.support.MvcNoSecurityTest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@Import(GlobalExceptionHandler.class)
@AutoConfigureMockMvc(addFilters = false)
@ImportAutoConfiguration(exclude = {
    SecurityAutoConfiguration.class,
    SecurityFilterAutoConfiguration.class
})
class AuthControllerLoginTest extends MvcNoSecurityTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @MockitoBean
    AuthService authService;

    private AuthDto.LoginRequest loginReq(String loginId, String password) {
        return AuthDto.LoginRequest.builder()
            .loginId(loginId)
            .password(password)
            .build();
    }

    private AuthDto.LoginResponse loginRes(Long userId, UserRole role) {
        return AuthDto.LoginResponse.builder()
            .userId(userId)
            .role(role)
            .accessToken("access.jwt.token.sample")
            .refreshToken("refresh.jwt.token.sample")
            .build();
    }

    // =========================
    // 성공 케이스 (역할별)
    // =========================

    @Test
    @DisplayName("소비자 로그인 성공 - 200 OK, 토큰과 역할 반환")
    void login_consumer_success_200() throws Exception {
        var req = loginReq("consumer1", "P@ssw0rd1!");
        var res = loginRes(1L, UserRole.CONSUMER);
        given(authService.login(any(AuthDto.LoginRequest.class))).willReturn(res);

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
            .andDo(print())
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.userId").value(1))
            .andExpect(jsonPath("$.data.role").value("CONSUMER"))
            .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
            .andExpect(jsonPath("$.data.refreshToken").isNotEmpty());
    }

    @Test
    @DisplayName("판매자 로그인 성공 - 200 OK, 토큰과 역할 반환")
    void login_seller_success_200() throws Exception {
        var req = loginReq("seller1", "P@ssw0rd1!");
        var res = loginRes(10L, UserRole.SELLER);
        given(authService.login(any(AuthDto.LoginRequest.class))).willReturn(res);

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
            .andDo(print())
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.userId").value(10))
            .andExpect(jsonPath("$.data.role").value("SELLER"))
            .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
            .andExpect(jsonPath("$.data.refreshToken").isNotEmpty());
    }

    @Test
    @DisplayName("관리자 로그인 성공 - 200 OK, 토큰과 역할 반환")
    void login_admin_success_200() throws Exception {
        var req = loginReq("admin", "Admin!234");
        var res = loginRes(100L, UserRole.ADMIN);
        given(authService.login(any(AuthDto.LoginRequest.class))).willReturn(res);

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
            .andDo(print())
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.userId").value(100))
            .andExpect(jsonPath("$.data.role").value("ADMIN"))
            .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
            .andExpect(jsonPath("$.data.refreshToken").isNotEmpty());
    }

    // =========================
    // 검증 실패 (400)
    // =========================

    @Nested
    class ValidationFails {

        @Test
        @DisplayName("요청 검증 실패 - loginId 누락 400")
        void login_validation_400_missingLoginId() throws Exception {
            var req = AuthDto.LoginRequest.builder()
                // .loginId("missing")
                .password("P@ssw0rd1!")
                .build();

            mockMvc.perform(post("/api/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(req)))
                .andDo(print())
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.status").value(400))
                .andExpect(jsonPath("$.error.code").value("E001"));
        }

        @Test
        @DisplayName("요청 검증 실패 - password 누락 400")
        void login_validation_400_missingPassword() throws Exception {
            var req = AuthDto.LoginRequest.builder()
                .loginId("user1")
                // .password("missing")
                .build();

            mockMvc.perform(post("/api/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(req)))
                .andDo(print())
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.status").value(400))
                .andExpect(jsonPath("$.error.code").value("E001"));
        }
    }

    // =========================
    // 인증 실패 (401 등)
    // =========================

    @Test
    @DisplayName("로그인 실패 - 잘못된 자격증명(아이디/비번 불일치) 401")
    void login_fail_401_invalidCredentials() throws Exception {
        var req = loginReq("user1", "wrong-password");

        // 401: 자격 증명 불일치
        given(authService.login(any(AuthDto.LoginRequest.class)))
            .willThrow(new AuthException(
                ErrorCode.INVALID_CREDENTIALS,
                "아이디 또는 비밀번호가 올바르지 않습니다"
            ));

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
            .andDo(print())
            .andExpect(status().isUnauthorized()) // 401
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.error.status").value(401));
        // .andExpect(jsonPath("$.error.code").value("E4xx")) // 필요시 코드도 검증
        // .andExpect(jsonPath("$.error.message").value("아이디 또는 비밀번호가 올바르지 않습니다"));
    }

    @Test
    @DisplayName("로그인 실패 - 비활성/잠금 계정 403")
    void login_fail_403_inactiveOrLocked() throws Exception {
        var req = loginReq("lockedUser", "P@ssw0rd1!");

        // 403: 비활성/잠금 등
        given(authService.login(any(AuthDto.LoginRequest.class)))
            .willThrow(new AuthException(
                ErrorCode.ACCESS_DENIED,
                "계정이 잠겨있거나 비활성화되었습니다"
            ));

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
            .andDo(print())
            .andExpect(status().isForbidden()) // 403
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.error.status").value(403));
    }
}
