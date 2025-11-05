package com.da.itdaing.global.security;

import com.da.itdaing.domain.common.enums.UserRole;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
// import org.springframework.test.util.ReflectionTestUtils; // <- 사용 안 하므로 제거
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.*;

class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider(
            "itdaing-secret-key-for-hs256-minimum-256-bits-required-for-security-purposes",
            "itdaing-server",
            86400000L,      // access: 24h
            1209600000L     // refresh: 14d (추가된 4번째 인자)
        );
    }

    @Test
    @DisplayName("CONSUMER 역할로 토큰을 생성하고 검증한다")
    void createAndValidateToken_Consumer() {
        Long userId = 1L;
        String role = UserRole.CONSUMER.toAuthority();

        String token = jwtTokenProvider.createAccessToken(userId, role);
        assertThat(token).isNotBlank();

        Claims claims = jwtTokenProvider.validateAndGetClaims(token);
        assertThat(claims.getSubject()).isEqualTo(String.valueOf(userId));
        assertThat(claims.get("role", String.class)).isEqualTo("ROLE_CONSUMER");
        assertThat(claims.getIssuer()).isEqualTo("itdaing-server");
    }

    @Test
    @DisplayName("SELLER 역할로 토큰을 생성하고 검증한다")
    void createAndValidateToken_Seller() {
        Long userId = 2L;
        String role = UserRole.SELLER.toAuthority();

        String token = jwtTokenProvider.createAccessToken(userId, role);
        assertThat(token).isNotBlank();

        Long extractedUserId = jwtTokenProvider.getUserIdFromToken(token);
        String extractedRole = jwtTokenProvider.getRoleFromToken(token);

        assertThat(extractedUserId).isEqualTo(userId);
        assertThat(extractedRole).isEqualTo("ROLE_SELLER");
    }

    @Test
    @DisplayName("ADMIN 역할로 토큰을 생성하고 검증한다")
    void createAndValidateToken_Admin() {
        Long userId = 3L;
        String role = UserRole.ADMIN.toAuthority();

        String token = jwtTokenProvider.createAccessToken(userId, role);

        Long extractedUserId = jwtTokenProvider.getUserIdFromToken(token);
        String extractedRole = jwtTokenProvider.getRoleFromToken(token);

        assertThat(extractedUserId).isEqualTo(userId);
        assertThat(extractedRole).isEqualTo("ROLE_ADMIN");
    }

    @Test
    @DisplayName("만료된 토큰은 ExpiredJwtException을 발생시킨다")
    void validateExpiredToken() {
        JwtTokenProvider expiredTokenProvider = new JwtTokenProvider(
            "itdaing-secret-key-for-hs256-minimum-256-bits-required-for-security-purposes",
            "itdaing-server",
            -1000L,         // access 만료
            1209600000L     // refresh 기본값 (아무 값이나 OK)
        );

        String expiredToken = expiredTokenProvider.createAccessToken(1L, UserRole.CONSUMER.toAuthority());
        assertThatThrownBy(() -> jwtTokenProvider.validateAndGetClaims(expiredToken))
            .isInstanceOf(ExpiredJwtException.class);
    }

    @Test
    @DisplayName("잘못된 형식의 토큰은 MalformedJwtException을 발생시킨다")
    void validateMalformedToken() {
        String malformedToken = "invalid.jwt.token";
        assertThatThrownBy(() -> jwtTokenProvider.validateAndGetClaims(malformedToken))
            .isInstanceOf(MalformedJwtException.class);
    }
}
