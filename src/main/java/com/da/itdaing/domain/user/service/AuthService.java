package com.da.itdaing.domain.user.service;

import com.da.itdaing.domain.master.entity.Category;
import com.da.itdaing.domain.master.entity.Feature;
import com.da.itdaing.domain.master.entity.Region;
import com.da.itdaing.domain.master.entity.Style;
import com.da.itdaing.domain.master.repository.CategoryRepository;
import com.da.itdaing.domain.master.repository.FeatureRepository;
import com.da.itdaing.domain.master.repository.RegionRepository;
import com.da.itdaing.domain.master.repository.StyleRepository;
import com.da.itdaing.domain.seller.entity.SellerProfile;
import com.da.itdaing.domain.seller.repository.SellerProfileRepository;
import com.da.itdaing.domain.user.dto.AuthDto;
import com.da.itdaing.domain.user.entity.*;
import com.da.itdaing.domain.user.exception.AuthException;
import com.da.itdaing.domain.user.repository.*;
import com.da.itdaing.global.error.ErrorCode;
import com.da.itdaing.global.error.exception.EntityNotFoundException;
import com.da.itdaing.global.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.Nullable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * 인증 서비스
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final UserRepository userRepository;
    private final SellerProfileRepository sellerProfileRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    // 마스터 데이터 Repository
    private final CategoryRepository categoryRepository;
    private final StyleRepository styleRepository;
    private final RegionRepository regionRepository;
    private final FeatureRepository featureRepository;

    // 사용자 선호 Repository
    private final UserPrefCategoryRepository userPrefCategoryRepository;
    private final UserPrefStyleRepository userPrefStyleRepository;
    private final UserPrefRegionRepository userPrefRegionRepository;
    private final UserPrefFeatureRepository userPrefFeatureRepository;

    /**
     * 소비자 회원가입
     * - 기본 정보 저장 + 선호 정보(카테고리, 스타일, 지역) 저장
     */
    @Transactional
    public AuthDto.SignupResponse signupConsumer(AuthDto.SignupConsumerRequest request) {
        // 이메일 중복 체크
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AuthException(ErrorCode.DUPLICATE_EMAIL);
        }

        // 아이디 중복 체크
        if (userRepository.existsByLoginId(request.getLoginId())) {
            throw new AuthException(ErrorCode.DUPLICATE_LOGIN_ID);
        }

        // 선호 ID 리스트 중복 제거 및 검증
        List<Long> categoryIds = request.getInterestCategoryIds().stream().distinct().toList();
        List<Long> styleIds = request.getStyleIds().stream().distinct().toList();
        List<Long> regionIds = request.getRegionIds().stream().distinct().toList();
        List<Long> featureIds  = request.getFeatureIds().stream().distinct().toList();

        validatePrefCount(categoryIds, 1, 4, "카테고리");
        validatePrefCount(styleIds, 1, 4, "스타일");
        validatePrefCount(regionIds, 1, 4, "지역");
        validatePrefCount(featureIds,  1, 4, "편의사항");

        // 마스터 데이터 존재 여부 검증
        List<Category> categories = categoryRepository.findAllById(categoryIds);
        if (categories.size() != categoryIds.size()) {
            throw new EntityNotFoundException(ErrorCode.ENTITY_NOT_FOUND, "존재하지 않는 카테고리가 포함되어 있습니다");
        }

        List<Style> styles = styleRepository.findAllById(styleIds);
        if (styles.size() != styleIds.size()) {
            throw new EntityNotFoundException(ErrorCode.ENTITY_NOT_FOUND, "존재하지 않는 스타일이 포함되어 있습니다");
        }

        List<Region> regions = regionRepository.findAllById(regionIds);
        if (regions.size() != regionIds.size()) {
            throw new EntityNotFoundException(ErrorCode.ENTITY_NOT_FOUND, "존재하지 않는 지역이 포함되어 있습니다");
        }

        List<Feature> features = featureRepository.findAllById(featureIds); // ← 추가
        if (features.size() != featureIds.size()) {
            throw new EntityNotFoundException(ErrorCode.ENTITY_NOT_FOUND, "존재하지 않는 편의사항이 포함되어 있습니다");
        }

        // 비밀번호 암호화
        String encodedPassword = passwordEncoder.encode(request.getPassword());

        // 사용자 저장
        Users user = userRepository.save(request.toEntity(encodedPassword));

        // 선호 정보 벌크 저장
        List<UserPrefCategory> userPrefCategories = categories.stream()
                .map(category -> UserPrefCategory.builder()
                        .user(user)
                        .category(category)
                        .build())
                .toList();
        userPrefCategoryRepository.saveAll(userPrefCategories);

        List<UserPrefStyle> userPrefStyles = styles.stream()
                .map(style -> UserPrefStyle.builder()
                        .user(user)
                        .style(style)
                        .build())
                .toList();
        userPrefStyleRepository.saveAll(userPrefStyles);

        List<UserPrefRegion> userPrefRegions = regions.stream()
                .map(region -> UserPrefRegion.builder()
                        .user(user)
                        .region(region)
                        .build())
                .toList();
        userPrefRegionRepository.saveAll(userPrefRegions);

        List<UserPrefFeature> userPrefFeatures = features.stream()
            .map(feature -> UserPrefFeature.builder()
                .user(user)
                .feature(feature)
                .build())
            .toList();
        userPrefFeatureRepository.saveAll(userPrefFeatures);

        log.info("Consumer signed up with preferences: userId={}, email={}, categories={}, styles={}, regions={}, features={}",
                user.getId(), user.getEmail(), categoryIds.size(), styleIds.size(), regionIds.size(), features.size());

        return AuthDto.SignupResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    /**
     * 선호 개수 검증
     */
    private void validatePrefCount(List<Long> ids, int min, int max, String fieldName) {
        if (ids == null || ids.isEmpty()) {
            throw new AuthException(ErrorCode.INVALID_INPUT_VALUE, fieldName + " 리스트가 필요합니다");
        }
        int count = ids.size();
        if (count < min || count > max) {
            throw new AuthException(ErrorCode.INVALID_INPUT_VALUE,
                    fieldName + " 개수는 " + min + "~" + max + "개여야 합니다");
        }
    }

    /**
     * 판매자 회원가입
     */
    @Transactional
    public AuthDto.SignupResponse signupSeller(AuthDto.SignupSellerRequest request) {
        // 이메일 중복 체크
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AuthException(ErrorCode.DUPLICATE_EMAIL);
        }

        // 아이디 중복 체크
        if (userRepository.existsByLoginId(request.getLoginId())) {
            throw new AuthException(ErrorCode.DUPLICATE_LOGIN_ID);
        }

        // 비밀번호 암호화
        String encodedPassword = passwordEncoder.encode(request.getPassword());

        // 사용자 저장
        Users user = userRepository.save(request.toEntity(encodedPassword));

        // 판매자 프로필 생성 및 저장
        SellerProfile profile = SellerProfile.builder()
                .user(user)
                .activityRegion(StringUtils.hasText(request.getActivityRegion()) ? request.getActivityRegion().trim() : null)
                .snsUrl(StringUtils.hasText(request.getSnsUrl()) ? request.getSnsUrl().trim() : null)
                .profileImageUrl(StringUtils.hasText(request.getProfileImageUrl()) ? request.getProfileImageUrl().trim() : null)
                .introduction(StringUtils.hasText(request.getIntroduction()) ? request.getIntroduction().trim() : null)
                .build();

        sellerProfileRepository.save(profile);

        log.info("Seller signed up with profile: userId={}, email={}, activityRegion={}",
                user.getId(), user.getEmail(), profile.getActivityRegion());

        // 프로필 정보를 포함한 응답 생성
        AuthDto.SellerProfileInfo profileInfo = AuthDto.SellerProfileInfo.builder()
                .activityRegion(profile.getActivityRegion())
                .snsUrl(profile.getSnsUrl())
                .profileImageUrl(profile.getProfileImageUrl())
                .introduction(profile.getIntroduction())
                .build();

        return AuthDto.SignupResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .role(user.getRole())
                .profile(profileInfo)
                .build();
    }

    /**
     * 로그인
     */
    @Transactional
    public AuthDto.LoginResponse login(AuthDto.LoginRequest request) {
        // 이메일로 사용자 조회
        Users user = userRepository.findByLoginId(request.getLoginId())
                .orElseThrow(() -> new AuthException(ErrorCode.INVALID_CREDENTIALS));

        // 비밀번호 검증
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new AuthException(ErrorCode.INVALID_CREDENTIALS);
        }

        // JWT 토큰 발급 (Access + Refresh)
        AuthDto.TokenPair tokenPair = loginIssueTokens(user, null, null, null);

        log.info("User logged in: userId={}, email={}", user.getId(), user.getEmail());

        return AuthDto.LoginResponse.builder()
                .userId(user.getId())
                .role(user.getRole())
                .accessToken(tokenPair.getAccessToken())
                .refreshToken(tokenPair.getRefreshToken())
                .build();
    }

    /**
     * 토큰 발급 및 Refresh Token 저장
     * @param user 사용자
     * @param deviceId 디바이스 ID (선택)
     * @param userAgent User-Agent (선택)
     * @param ip IP 주소 (선택)
     * @return TokenPair (Access + Refresh)
     */
    private AuthDto.TokenPair loginIssueTokens(Users user, @Nullable String deviceId,
                                                @Nullable String userAgent, @Nullable String ip) {
        // Access Token 발급
        String accessToken = jwtTokenProvider.createAccessToken(
                user.getId(),
                user.getRole().toAuthority()
        );

        // Refresh Token 발급
        String refreshToken = jwtTokenProvider.createRefreshToken(
                user.getId(),
                user.getRole().toAuthority()
        );

        // Refresh Token 해시 및 저장
        String tokenHash = com.da.itdaing.global.util.HashUtils.sha256(refreshToken);
        java.time.Instant issuedAt = jwtTokenProvider.getIssuedAt(refreshToken).toInstant();
        java.time.Instant expiresAt = jwtTokenProvider.getExpiration(refreshToken).toInstant();

        RefreshToken refreshTokenEntity = RefreshToken.builder()
                .user(user)
                .tokenHash(tokenHash)
                .issuedAt(issuedAt)
                .expiresAt(expiresAt)
                .revoked(false)
                .deviceId(deviceId)
                .userAgent(userAgent)
                .ip(ip)
                .build();

        refreshTokenRepository.save(refreshTokenEntity);

        return AuthDto.TokenPair.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    /**
     * 사용자 프로필 조회
     */
    public AuthDto.UserProfileResponse getProfile(Long userId) {
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new AuthException(ErrorCode.USER_NOT_FOUND));

        return AuthDto.UserProfileResponse.from(user);
    }

    /**
     * 토큰 재발급 (Stateful Refresh Token Rotation)
     * - refreshToken을 검증하고 새 access+refresh 발급
     * - 기존 토큰은 revoked=true로 변경하고 replacedBy에 새 토큰 해시 저장
     * - 이미 revoked된 토큰 재사용 시 REFRESH_REUSED 예외
     */
    @Transactional
    public AuthDto.TokenPair refresh(String refreshToken) {
        if (!StringUtils.hasText(refreshToken)) {
            throw new AuthException(ErrorCode.UNAUTHENTICATED, "리프레시 토큰이 없습니다");
        }

        // 1. JWT 형식 검증
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new AuthException(ErrorCode.INVALID_TOKEN, "유효하지 않은 리프레시 토큰입니다");
        }

        // 2. 토큰에서 userId 추출
        Long userId;
        try {
            userId = jwtTokenProvider.getUserId(refreshToken);
        } catch (Exception e) {
            throw new AuthException(ErrorCode.INVALID_TOKEN, "리프레시 토큰 파싱 실패");
        }

        // 3. 토큰 해시로 DB 조회
        String tokenHash = com.da.itdaing.global.util.HashUtils.sha256(refreshToken);
        RefreshToken storedToken = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new AuthException(ErrorCode.REFRESH_NOT_FOUND));

        // 4. 만료 여부 확인
        if (storedToken.isExpired()) {
            throw new AuthException(ErrorCode.REFRESH_NOT_FOUND, "만료된 리프레시 토큰입니다");
        }

        // 5. 재사용 감지 (이미 revoked된 토큰)
        if (storedToken.isRevoked()) {
            log.warn("Refresh token reused detected: userId={}, tokenHash={}", userId, tokenHash);
            throw new AuthException(ErrorCode.REFRESH_REUSED);
        }

        // 6. 사용자 조회
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new AuthException(ErrorCode.USER_NOT_FOUND));

        // 7. 새 토큰 발급
        String newAccessToken = jwtTokenProvider.createAccessToken(user.getId(), user.getRole().toAuthority());
        String newRefreshToken = jwtTokenProvider.createRefreshToken(user.getId(), user.getRole().toAuthority());

        // 8. 새 Refresh Token 저장
        String newTokenHash = com.da.itdaing.global.util.HashUtils.sha256(newRefreshToken);
        java.time.Instant issuedAt = jwtTokenProvider.getIssuedAt(newRefreshToken).toInstant();
        java.time.Instant expiresAt = jwtTokenProvider.getExpiration(newRefreshToken).toInstant();

        RefreshToken newToken = RefreshToken.builder()
                .user(user)
                .tokenHash(newTokenHash)
                .issuedAt(issuedAt)
                .expiresAt(expiresAt)
                .revoked(false)
                .deviceId(storedToken.getDeviceId())
                .userAgent(storedToken.getUserAgent())
                .ip(storedToken.getIp())
                .build();

        refreshTokenRepository.save(newToken);

        // 9. 기존 토큰 무효화 (회전 추적)
        storedToken.revokeAsReplaced(newTokenHash);
        refreshTokenRepository.save(storedToken);

        log.info("Token refreshed: userId={}, oldHash={}, newHash={}",
                 userId, tokenHash.substring(0, 8), newTokenHash.substring(0, 8));

        return AuthDto.TokenPair.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .build();
    }

    /**
     * 로그아웃
     * - Access 토큰 검증
     * - Refresh 토큰이 제공되면 DB에서 revoke 처리
     */
    @Transactional
    public void logout(String accessToken, @Nullable String refreshToken) {
        if (!StringUtils.hasText(accessToken)) {
            throw new AuthException(ErrorCode.UNAUTHENTICATED, "액세스 토큰이 없습니다");
        }

        // Access 토큰 형식/서명 검증
        try {
            jwtTokenProvider.validateToken(accessToken);
        } catch (Exception e) {
            throw new AuthException(ErrorCode.INVALID_TOKEN, "유효하지 않은 액세스 토큰입니다");
        }

        // Refresh Token이 제공되면 무효화
        if (StringUtils.hasText(refreshToken)) {
            try {
                String tokenHash = com.da.itdaing.global.util.HashUtils.sha256(refreshToken);
                refreshTokenRepository.findByTokenHash(tokenHash)
                        .ifPresent(token -> {
                            token.revoke();
                            refreshTokenRepository.save(token);
                            log.info("Refresh token revoked on logout: tokenHash={}", tokenHash.substring(0, 8));
                        });
            } catch (Exception e) {
                // Refresh 토큰 처리 실패는 로그만 남기고 진행 (클라이언트 오류로 간주)
                log.warn("Failed to revoke refresh token on logout: {}", e.getMessage());
            }
        }

        log.info("User logged out successfully");
    }

    /**
     * 전체 로그아웃 (모든 디바이스)
     * - 해당 사용자의 모든 유효한 refresh token을 revoke
     */
    @Transactional
    public void logoutAll(Long userId) {
        int revokedCount = refreshTokenRepository.revokeAllByUserId(userId);
        log.info("All refresh tokens revoked for user: userId={}, count={}", userId, revokedCount);
    }

    /**
     * 토큰 기반 내 프로필(/me)
     * - accessToken에서 userId 추출 → DB 조회 → DTO 변환
     */
    public AuthDto.UserProfileResponse me(String accessToken) {
        if (!StringUtils.hasText(accessToken)) {
            throw new AuthException(ErrorCode.UNAUTHENTICATED, "액세스 토큰이 없습니다");
        }

        Long userId;
        try {
            // 필요시 validateToken 먼저 호출 가능
            jwtTokenProvider.validateToken(accessToken);
            userId = jwtTokenProvider.getUserId(accessToken);
        } catch (Exception e) {
            throw new AuthException(ErrorCode.INVALID_TOKEN, "유효하지 않은 액세스 토큰입니다");
        }

        Users user = userRepository.findById(userId)
            .orElseThrow(() -> new AuthException(ErrorCode.USER_NOT_FOUND));

        return AuthDto.UserProfileResponse.from(user);
    }
}

