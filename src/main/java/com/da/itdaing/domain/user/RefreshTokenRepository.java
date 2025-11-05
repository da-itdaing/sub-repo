// com.da.itdaing.domain.user.RefreshTokenRepository.java
package com.da.itdaing.domain.user;

import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * Refresh Token Repository
 */
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    /**
     * 토큰 해시로 RefreshToken 조회
     * @param tokenHash SHA-256 해시
     * @return RefreshToken Optional
     */
    Optional<RefreshToken> findByTokenHash(String tokenHash);

    /**
     * 특정 사용자의 유효한(revoked=false) 리프레시 토큰 목록 조회
     * @param userId 사용자 ID
     * @return 유효한 토큰 목록
     */
    List<RefreshToken> findAllByUserIdAndRevokedFalse(Long userId);

    /**
     * 특정 사용자의 모든 리프레시 토큰 무효화 (로그아웃 전체)
     * @param userId 사용자 ID
     * @return 무효화된 토큰 개수
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update RefreshToken rt set rt.revoked = true where rt.user.id = :userId and rt.revoked = false")
    int revokeAllByUserId(@Param("userId") Long userId);

    /**
     * 특정 사용자의 모든 리프레시 토큰 삭제
     * @param userId 사용자 ID
     * @return 삭제된 토큰 개수
     */
    @Modifying
    @Query("delete from RefreshToken rt where rt.user.id = :userId")
    long deleteAllByUserId(@Param("userId") Long userId);
}
