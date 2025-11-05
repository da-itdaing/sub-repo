package com.da.itdaing.domain.user;

import com.da.itdaing.domain.common.enums.UserRole;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * RefreshTokenRepository 테스트
 */
@DataJpaTest
@ActiveProfiles("test")
@DisplayName("RefreshToken Repository 테스트")
class RefreshTokenRepositoryTest {

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private TestEntityManager entityManager;

    @Test
    @DisplayName("토큰 해시로 RefreshToken 조회 성공")
    void findByTokenHash_success() {
        // given
        Users user = createAndSaveUser("test@example.com", "testuser");
        String tokenHash = "abcd1234efgh5678ijkl9012mnop3456qrst7890uvwx1234yzab5678cdef9012";
        RefreshToken token = createAndSaveRefreshToken(user, tokenHash, false);

        // when
        Optional<RefreshToken> found = refreshTokenRepository.findByTokenHash(tokenHash);

        // then
        assertThat(found).isPresent();
        assertThat(found.get().getTokenHash()).isEqualTo(tokenHash);
        assertThat(found.get().getUser().getId()).isEqualTo(user.getId());
    }

    @Test
    @DisplayName("토큰 해시가 존재하지 않으면 빈 Optional 반환")
    void findByTokenHash_notFound() {
        // given
        String nonExistentHash = "nonexistent1234567890abcdefghijklmnopqrstuvwxyz1234567890abcdef";

        // when
        Optional<RefreshToken> found = refreshTokenRepository.findByTokenHash(nonExistentHash);

        // then
        assertThat(found).isEmpty();
    }

    @Test
    @DisplayName("사용자의 유효한 토큰 목록 조회")
    void findAllByUserIdAndRevokedFalse_success() {
        // given
        Users user = createAndSaveUser("user@example.com", "user1");
        createAndSaveRefreshToken(user, "hash1_" + "a".repeat(59), false);
        createAndSaveRefreshToken(user, "hash2_" + "b".repeat(59), false);
        createAndSaveRefreshToken(user, "hash3_" + "c".repeat(59), true); // revoked

        // when
        List<RefreshToken> tokens = refreshTokenRepository.findAllByUserIdAndRevokedFalse(user.getId());

        // then
        assertThat(tokens).hasSize(2);
        assertThat(tokens).allMatch(t -> !t.isRevoked());
    }

    @Test
    @DisplayName("토큰 무효화 메서드 테스트")
    void revoke_success() {
        // given
        Users user = createAndSaveUser("revoke@example.com", "revokeuser");
        String tokenHash = "revoke_hash_" + "d".repeat(52);
        RefreshToken token = createAndSaveRefreshToken(user, tokenHash, false);

        // when
        token.revoke();
        entityManager.flush();
        entityManager.clear();

        // then
        RefreshToken updated = refreshTokenRepository.findByTokenHash(tokenHash).orElseThrow();
        assertThat(updated.isRevoked()).isTrue();
    }

    @Test
    @DisplayName("토큰 회전 시 무효화 및 새 토큰 해시 기록")
    void revokeAsReplaced_success() {
        // given
        Users user = createAndSaveUser("rotate@example.com", "rotateuser");
        String oldHash = "old_hash_" + "e".repeat(55);
        String newHash = "new_hash_" + "f".repeat(55);
        RefreshToken token = createAndSaveRefreshToken(user, oldHash, false);

        // when
        token.revokeAsReplaced(newHash);
        entityManager.flush();
        entityManager.clear();

        // then
        RefreshToken updated = refreshTokenRepository.findByTokenHash(oldHash).orElseThrow();
        assertThat(updated.isRevoked()).isTrue();
        assertThat(updated.getReplacedBy()).isEqualTo(newHash);
    }

    @Test
    @DisplayName("토큰 만료 여부 확인")
    void isExpired_test() {
        // given
        Users user = createAndSaveUser("expire@example.com", "expireuser");

        // 만료된 토큰
        RefreshToken expiredToken = RefreshToken.builder()
                .user(user)
                .tokenHash("expired_hash_" + "g".repeat(51))
                .issuedAt(Instant.now().minusSeconds(3600))
                .expiresAt(Instant.now().minusSeconds(1)) // 이미 만료
                .revoked(false)
                .build();
        refreshTokenRepository.save(expiredToken);

        // 유효한 토큰
        RefreshToken validToken = RefreshToken.builder()
                .user(user)
                .tokenHash("valid_hash_" + "h".repeat(53))
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(3600)) // 1시간 후 만료
                .revoked(false)
                .build();
        refreshTokenRepository.save(validToken);

        // when & then
        assertThat(expiredToken.isExpired()).isTrue();
        assertThat(validToken.isExpired()).isFalse();
    }

    @Test
    @DisplayName("특정 사용자의 모든 토큰 무효화")
    void revokeAllByUserId_success() {
        // given
        Users user = createAndSaveUser("revokeall@example.com", "revokealluser");
        createAndSaveRefreshToken(user, "hash_a_" + "1".repeat(58), false);
        createAndSaveRefreshToken(user, "hash_b_" + "2".repeat(58), false);
        createAndSaveRefreshToken(user, "hash_c_" + "3".repeat(58), false);

        // when
        int revokedCount = refreshTokenRepository.revokeAllByUserId(user.getId());
        entityManager.flush();
        entityManager.clear();

        // then
        assertThat(revokedCount).isEqualTo(3);
        List<RefreshToken> tokens = refreshTokenRepository.findAllByUserIdAndRevokedFalse(user.getId());
        assertThat(tokens).isEmpty();
    }

    @Test
    @DisplayName("특정 사용자의 모든 토큰 삭제")
    void deleteAllByUserId_success() {
        // given
        Users user = createAndSaveUser("delete@example.com", "deleteuser");
        createAndSaveRefreshToken(user, "del_hash_a_" + "4".repeat(55), false);
        createAndSaveRefreshToken(user, "del_hash_b_" + "5".repeat(55), true);

        // when
        long deletedCount = refreshTokenRepository.deleteAllByUserId(user.getId());
        entityManager.flush();
        entityManager.clear();

        // then
        assertThat(deletedCount).isEqualTo(2);
        List<RefreshToken> tokens = refreshTokenRepository.findAllByUserIdAndRevokedFalse(user.getId());
        assertThat(tokens).isEmpty();
    }

    // ========== Helper Methods ==========

    private Users createAndSaveUser(String email, String loginId) {
        Users user = Users.builder()
                .email(email)
                .loginId(loginId)
                .password("encoded_password")
                .name("Test User")
                .role(UserRole.CONSUMER)
                .build();
        return entityManager.persistAndFlush(user);
    }

    private RefreshToken createAndSaveRefreshToken(Users user, String tokenHash, boolean revoked) {
        RefreshToken token = RefreshToken.builder()
                .user(user)
                .tokenHash(tokenHash)
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(1209600)) // 14일
                .revoked(revoked)
                .build();
        return entityManager.persistAndFlush(token);
    }
}

