package com.da.itdaing.global.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SecurityException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * JWT 토큰 발급 및 검증 Provider
 */
@Slf4j
@Component
public class JwtTokenProvider {

    private final SecretKey secretKey;
    private final String issuer;
    private final long accessTokenExpiration;
    private final long refreshTokenExpiration;

    public JwtTokenProvider(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.issuer}") String issuer,
            @Value("${jwt.access-token-expiration}") long accessTokenExpiration,
            @Value("${jwt.refresh-token-expiration:1209600000}") long refreshTokenExpiration
    ) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.issuer = issuer;
        this.accessTokenExpiration = accessTokenExpiration;
        this.refreshTokenExpiration = refreshTokenExpiration;
    }

    /**
     * Access Token 생성
     * @param userId 사용자 ID
     * @param role 사용자 역할 (ROLE_ 접두사 포함)
     * @return JWT Access Token
     */
    public String createAccessToken(Long userId, String role) {
        return buildToken(userId, role, accessTokenExpiration);
    }

    public String createRefreshToken(Long userId, String role) {
        return buildToken(userId, role, refreshTokenExpiration);
    }

    public boolean validateToken(String token) {
        try {
            validateAndGetClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public Long getUserId(String token) {
        return getUserIdFromToken(token);
    }

    public String getRole(String token) {
        return getRoleFromToken(token);
    }

    /**
     * 토큰에서 발급 시각 추출
     */
    public Date getIssuedAt(String token) {
        Claims claims = validateAndGetClaims(token);
        return claims.getIssuedAt();
    }

    /**
     * 토큰에서 만료 시각 추출
     */
    public Date getExpiration(String token) {
        Claims claims = validateAndGetClaims(token);
        return claims.getExpiration();
    }

    private String buildToken(Long userId, String role, long ttlMillis) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + ttlMillis);
        return Jwts.builder()
            .subject(String.valueOf(userId))
            .claim("role", role)
            .issuer(issuer)
            .issuedAt(now)
            .expiration(exp)
            .signWith(secretKey, Jwts.SIG.HS256)
            .compact();
    }

    /**
     * 토큰 검증 및 파싱
     * @param token JWT 토큰
     * @return Claims
     * @throws JwtException 토큰 검증 실패 시
     */
    public Claims validateAndGetClaims(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (SecurityException | MalformedJwtException e) {
            log.warn("Invalid JWT signature: {}", e.getMessage());
            throw e;
        } catch (ExpiredJwtException e) {
            log.warn("Expired JWT token: {}", e.getMessage());
            throw e;
        } catch (UnsupportedJwtException e) {
            log.warn("Unsupported JWT token: {}", e.getMessage());
            throw e;
        } catch (IllegalArgumentException e) {
            log.warn("JWT claims string is empty: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * 토큰에서 사용자 ID 추출
     */
    public Long getUserIdFromToken(String token) {
        Claims claims = validateAndGetClaims(token);
        return Long.valueOf(claims.getSubject());
    }

    /**
     * 토큰에서 역할 추출
     */
    public String getRoleFromToken(String token) {
        Claims claims = validateAndGetClaims(token);
        return claims.get("role", String.class);
    }
}

