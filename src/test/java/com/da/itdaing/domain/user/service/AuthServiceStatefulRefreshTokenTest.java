package com.da.itdaing.domain.user.service;

import com.da.itdaing.domain.common.enums.UserRole;
import com.da.itdaing.domain.user.entity.RefreshToken;
import com.da.itdaing.domain.user.repository.RefreshTokenRepository;
import com.da.itdaing.domain.user.repository.UserRepository;
import com.da.itdaing.domain.user.entity.Users;
import com.da.itdaing.domain.user.dto.AuthDto;
import com.da.itdaing.domain.user.exception.AuthException;
import com.da.itdaing.global.error.ErrorCode;
import com.da.itdaing.global.security.JwtTokenProvider;
import com.da.itdaing.global.util.HashUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.Date;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * AuthService Stateful Refresh Token 테스트
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService - Stateful Refresh Token 테스트")
class AuthServiceStatefulRefreshTokenTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private AuthService authService;

    private Users testUser;

    @BeforeEach
    void setUp() {
        testUser = Users.builder()
                .loginId("testuser")
                .email("test@example.com")
                .password("encoded_password")
                .name("Test User")
                .role(UserRole.CONSUMER)
                .build();
        // Reflection으로 ID 설정 (실제로는 영속화 후 자동 생성)
        setUserId(testUser, 1L);
    }

    @Test
    @DisplayName("로그인 시 RefreshToken이 DB에 저장된다")
    void login_savesRefreshToken() {
        // given
        AuthDto.LoginRequest request = AuthDto.LoginRequest.builder()
                .loginId("testuser")
                .password("password123")
                .build();

        when(userRepository.findByLoginId("testuser")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("password123", "encoded_password")).thenReturn(true);
        when(jwtTokenProvider.createAccessToken(anyLong(), anyString())).thenReturn("access.token.jwt");
        when(jwtTokenProvider.createRefreshToken(anyLong(), anyString())).thenReturn("refresh.token.jwt");
        when(jwtTokenProvider.getIssuedAt("refresh.token.jwt")).thenReturn(new Date());
        when(jwtTokenProvider.getExpiration("refresh.token.jwt")).thenReturn(new Date(System.currentTimeMillis() + 1209600000));

        // when
        AuthDto.LoginResponse response = authService.login(request);

        // then
        assertThat(response.getAccessToken()).isEqualTo("access.token.jwt");
        assertThat(response.getRefreshToken()).isEqualTo("refresh.token.jwt");

        // RefreshToken 저장 검증
        ArgumentCaptor<RefreshToken> tokenCaptor = ArgumentCaptor.forClass(RefreshToken.class);
        verify(refreshTokenRepository, times(1)).save(tokenCaptor.capture());

        RefreshToken savedToken = tokenCaptor.getValue();
        assertThat(savedToken.getUser()).isEqualTo(testUser);
        assertThat(savedToken.getTokenHash()).isEqualTo(HashUtils.sha256("refresh.token.jwt"));
        assertThat(savedToken.isRevoked()).isFalse();
    }

    @Test
    @DisplayName("토큰 재발급 시 기존 토큰이 revoke되고 새 토큰이 발급된다")
    void refresh_rotatesToken_success() {
        // given
        String oldRefreshToken = "old.refresh.token.jwt";
        String oldTokenHash = HashUtils.sha256(oldRefreshToken);

        RefreshToken storedToken = RefreshToken.builder()
                .id(1L)
                .user(testUser)
                .tokenHash(oldTokenHash)
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(1209600))
                .revoked(false)
                .build();

        when(jwtTokenProvider.validateToken(oldRefreshToken)).thenReturn(true);
        when(jwtTokenProvider.getUserId(oldRefreshToken)).thenReturn(1L);
        when(refreshTokenRepository.findByTokenHash(oldTokenHash)).thenReturn(Optional.of(storedToken));
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(jwtTokenProvider.createAccessToken(anyLong(), anyString())).thenReturn("new.access.token.jwt");
        when(jwtTokenProvider.createRefreshToken(anyLong(), anyString())).thenReturn("new.refresh.token.jwt");
        when(jwtTokenProvider.getIssuedAt("new.refresh.token.jwt")).thenReturn(new Date());
        when(jwtTokenProvider.getExpiration("new.refresh.token.jwt")).thenReturn(new Date(System.currentTimeMillis() + 1209600000));

        // when
        AuthDto.TokenPair result = authService.refresh(oldRefreshToken);

        // then
        assertThat(result.getAccessToken()).isEqualTo("new.access.token.jwt");
        assertThat(result.getRefreshToken()).isEqualTo("new.refresh.token.jwt");

        // 기존 토큰 revoke 확인
        assertThat(storedToken.isRevoked()).isTrue();
        assertThat(storedToken.getReplacedBy()).isEqualTo(HashUtils.sha256("new.refresh.token.jwt"));

        // 저장 호출 확인 (기존 토큰 + 새 토큰)
        verify(refreshTokenRepository, times(2)).save(any(RefreshToken.class));
    }

    @Test
    @DisplayName("이미 revoke된 토큰 재사용 시 REFRESH_REUSED 예외 발생")
    void refresh_alreadyRevoked_throwsRefreshReused() {
        // given
        String revokedRefreshToken = "revoked.refresh.token.jwt";
        String tokenHash = HashUtils.sha256(revokedRefreshToken);

        RefreshToken revokedToken = RefreshToken.builder()
                .id(1L)
                .user(testUser)
                .tokenHash(tokenHash)
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(1209600))
                .revoked(true) // 이미 무효화됨
                .build();

        when(jwtTokenProvider.validateToken(revokedRefreshToken)).thenReturn(true);
        when(jwtTokenProvider.getUserId(revokedRefreshToken)).thenReturn(1L);
        when(refreshTokenRepository.findByTokenHash(tokenHash)).thenReturn(Optional.of(revokedToken));

        // when & then
        assertThatThrownBy(() -> authService.refresh(revokedRefreshToken))
                .isInstanceOf(AuthException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.REFRESH_REUSED);

        // 새 토큰 발급이 없어야 함
        verify(jwtTokenProvider, never()).createAccessToken(anyLong(), anyString());
        verify(jwtTokenProvider, never()).createRefreshToken(anyLong(), anyString());
    }

    @Test
    @DisplayName("존재하지 않는 토큰으로 재발급 시 REFRESH_NOT_FOUND 예외 발생")
    void refresh_tokenNotFound_throwsRefreshNotFound() {
        // given
        String nonExistentToken = "nonexistent.refresh.token.jwt";
        String tokenHash = HashUtils.sha256(nonExistentToken);

        when(jwtTokenProvider.validateToken(nonExistentToken)).thenReturn(true);
        when(jwtTokenProvider.getUserId(nonExistentToken)).thenReturn(1L);
        when(refreshTokenRepository.findByTokenHash(tokenHash)).thenReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> authService.refresh(nonExistentToken))
                .isInstanceOf(AuthException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.REFRESH_NOT_FOUND);
    }

    @Test
    @DisplayName("만료된 토큰으로 재발급 시 REFRESH_NOT_FOUND 예외 발생")
    void refresh_expiredToken_throwsRefreshNotFound() {
        // given
        String expiredToken = "expired.refresh.token.jwt";
        String tokenHash = HashUtils.sha256(expiredToken);

        RefreshToken expiredRefreshToken = RefreshToken.builder()
                .id(1L)
                .user(testUser)
                .tokenHash(tokenHash)
                .issuedAt(Instant.now().minusSeconds(1209600))
                .expiresAt(Instant.now().minusSeconds(1)) // 이미 만료
                .revoked(false)
                .build();

        when(jwtTokenProvider.validateToken(expiredToken)).thenReturn(true);
        when(jwtTokenProvider.getUserId(expiredToken)).thenReturn(1L);
        when(refreshTokenRepository.findByTokenHash(tokenHash)).thenReturn(Optional.of(expiredRefreshToken));

        // when & then
        assertThatThrownBy(() -> authService.refresh(expiredToken))
                .isInstanceOf(AuthException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.REFRESH_NOT_FOUND)
                .hasMessageContaining("만료된");
    }

    @Test
    @DisplayName("로그아웃 시 refreshToken이 제공되면 해당 토큰을 revoke한다")
    void logout_withRefreshToken_revokesToken() {
        // given
        String accessToken = "access.token.jwt";
        String refreshToken = "refresh.token.jwt";
        String tokenHash = HashUtils.sha256(refreshToken);

        RefreshToken storedToken = RefreshToken.builder()
                .id(1L)
                .user(testUser)
                .tokenHash(tokenHash)
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(1209600))
                .revoked(false)
                .build();

        when(jwtTokenProvider.validateToken(accessToken)).thenReturn(true);
        when(refreshTokenRepository.findByTokenHash(tokenHash)).thenReturn(Optional.of(storedToken));

        // when
        authService.logout(accessToken, refreshToken);

        // then
        assertThat(storedToken.isRevoked()).isTrue();
        verify(refreshTokenRepository, times(1)).save(storedToken);
    }

    @Test
    @DisplayName("로그아웃 시 refreshToken이 없으면 revoke 없이 성공")
    void logout_withoutRefreshToken_success() {
        // given
        String accessToken = "access.token.jwt";

        when(jwtTokenProvider.validateToken(accessToken)).thenReturn(true);

        // when
        authService.logout(accessToken, null);

        // then
        verify(refreshTokenRepository, never()).findByTokenHash(anyString());
        verify(refreshTokenRepository, never()).save(any(RefreshToken.class));
    }

    @Test
    @DisplayName("전체 로그아웃 시 해당 사용자의 모든 유효한 토큰이 revoke된다")
    void logoutAll_revokesAllUserTokens() {
        // given
        Long userId = 1L;
        when(refreshTokenRepository.revokeAllByUserId(userId)).thenReturn(3);

        // when
        authService.logoutAll(userId);

        // then
        verify(refreshTokenRepository, times(1)).revokeAllByUserId(userId);
    }

    // ========== Helper Methods ==========

    private void setUserId(Users user, Long id) {
        try {
            var field = Users.class.getDeclaredField("id");
            field.setAccessible(true);
            field.set(user, id);
        } catch (Exception e) {
            throw new RuntimeException("Failed to set user ID", e);
        }
    }
}

