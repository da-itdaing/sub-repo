package com.da.itdaing.global.security;

import com.da.itdaing.global.error.ApiError;
import com.da.itdaing.global.error.ErrorCode;
import com.da.itdaing.global.web.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

/**
 * Spring Security 인증/인가 예외 처리
 */
@Slf4j
@RequiredArgsConstructor
public class JwtAuthenticationHandler implements AuthenticationEntryPoint, AccessDeniedHandler {

    private final ObjectMapper objectMapper;

    /**
     * 인증 실패 처리 (401)
     */
    @Override
    public void commence(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException authException
    ) throws IOException {
        log.warn("Authentication failed: {}", authException.getMessage());

        ApiError error = ApiError.of(ErrorCode.UNAUTHENTICATED);
        ApiResponse<Void> apiResponse = ApiResponse.error(error);

        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.getWriter().write(objectMapper.writeValueAsString(apiResponse));
    }

    /**
     * 인가 실패 처리 (403)
     */
    @Override
    public void handle(
            HttpServletRequest request,
            HttpServletResponse response,
            AccessDeniedException accessDeniedException
    ) throws IOException {
        log.warn("Access denied: {}", accessDeniedException.getMessage());

        ApiError error = ApiError.of(ErrorCode.ACCESS_DENIED);
        ApiResponse<Void> apiResponse = ApiResponse.error(error);

        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.getWriter().write(objectMapper.writeValueAsString(apiResponse));
    }
}

