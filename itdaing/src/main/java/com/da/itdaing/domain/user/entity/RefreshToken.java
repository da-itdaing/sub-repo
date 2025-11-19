package com.da.itdaing.domain.user.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

/**
 * Stateful Refresh Token 엔티티
 * - 토큰의 SHA-256 해시를 저장하여 안전하게 관리
 * - 토큰 회전(rotation) 지원: 재발급 시 기존 토큰을 revoke하고 새 토큰 발급
 */
@Entity
@Table(name = "refresh_tokens",
    indexes = {
        @Index(name = "idx_rt_token_hash", columnList = "token_hash", unique = true),
        @Index(name = "idx_rt_user_revoked", columnList = "user_id, revoked")
    }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;

    /**
     * 토큰의 SHA-256 해시 (64자 hex string)
     * - 실제 토큰은 저장하지 않고 해시만 저장하여 보안 강화
     */
    @Column(name = "token_hash", nullable = false, unique = true, length = 128)
    private String tokenHash;

    @Column(name = "issued_at", nullable = false)
    private Instant issuedAt;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(nullable = false)
    private boolean revoked;

    /**
     * 토큰 회전 시, 새로 발급된 토큰의 해시를 저장
     * - 재사용 감지 및 추적에 활용
     */
    @Column(name = "replaced_by", length = 128)
    private String replacedBy;

    /**
     * 디바이스 식별자 (선택)
     * - 여러 디바이스 세션 관리에 활용 가능
     */
    @Column(name = "device_id", length = 255)
    private String deviceId;

    /**
     * User-Agent (선택)
     * - 로그인 기기 정보 추적
     */
    @Column(name = "user_agent", length = 512)
    private String userAgent;

    /**
     * IP 주소 (선택)
     * - 보안 로그 및 이상 행위 탐지에 활용
     */
    @Column(length = 45)
    private String ip;

    /**
     * 토큰 무효화
     */
    public void revoke() {
        this.revoked = true;
    }

    /**
     * 토큰 회전 시 무효화 및 새 토큰 해시 기록
     * @param newTokenHash 새로 발급된 토큰의 해시
     */
    public void revokeAsReplaced(String newTokenHash) {
        this.revoked = true;
        this.replacedBy = newTokenHash;
    }

    /**
     * 토큰 만료 여부 확인
     * @return 만료되었으면 true
     */
    public boolean isExpired() {
        return Instant.now().isAfter(this.expiresAt);
    }
}
