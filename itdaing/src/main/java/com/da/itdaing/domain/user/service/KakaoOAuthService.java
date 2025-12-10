package com.da.itdaing.domain.user.service;

import com.da.itdaing.domain.common.enums.UserRole;
import com.da.itdaing.domain.common.enums.UserStatus;
import com.da.itdaing.domain.seller.entity.SellerProfile;
import com.da.itdaing.domain.seller.repository.SellerProfileRepository;
import com.da.itdaing.domain.user.dto.KakaoOAuthDto;
import com.da.itdaing.domain.user.entity.Users;
import com.da.itdaing.domain.user.exception.AuthException;
import com.da.itdaing.domain.user.repository.UserRepository;
import com.da.itdaing.global.error.ErrorCode;
import com.da.itdaing.global.security.JwtTokenProvider;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 카카오 OAuth 서비스
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class KakaoOAuthService {

    private final UserRepository userRepository;
    private final SellerProfileRepository sellerProfileRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PreferenceService preferenceService;
    private final ObjectMapper objectMapper;

    @Value("${external.kakao.rest-api-key:}")
    private String kakaoRestApiKey;

    @Value("${external.kakao.client-secret:}")
    private String kakaoClientSecret;

    @Value("${external.kakao.redirect-uri:}")
    private String kakaoRedirectUri;

    private static final String KAKAO_AUTH_URL = "https://kauth.kakao.com";
    private static final String KAKAO_API_URL = "https://kapi.kakao.com";

    // 임시 토큰 저장소 (실제 서비스에서는 Redis 사용 권장)
    private final ConcurrentHashMap<String, TempUserInfo> tempUserStore = new ConcurrentHashMap<>();

    /**
     * 카카오 인증 URL 생성
     */
    public KakaoOAuthDto.KakaoAuthUrlResponse getKakaoAuthUrl(String role) {
        String state = role;  // consumer 또는 seller
        String authUrl = String.format(
            "%s/oauth/authorize?client_id=%s&redirect_uri=%s&response_type=code&state=%s",
            KAKAO_AUTH_URL,
            kakaoRestApiKey,
            URLEncoder.encode(kakaoRedirectUri, StandardCharsets.UTF_8),
            state
        );
        return KakaoOAuthDto.KakaoAuthUrlResponse.builder()
            .authUrl(authUrl)
            .build();
    }

    /**
     * 카카오 로그인 처리
     */
    @Transactional
    public KakaoOAuthDto.KakaoLoginResponse processKakaoLogin(String code, String role) {
        // 1. 카카오 토큰 발급
        KakaoOAuthDto.KakaoTokenResponse tokenResponse = getKakaoToken(code);
        
        // 2. 카카오 사용자 정보 조회
        KakaoOAuthDto.KakaoUserInfo userInfo = getKakaoUserInfo(tokenResponse.getAccessToken());
        
        String kakaoId = String.valueOf(userInfo.getId());
        String email = userInfo.getKakaoAccount() != null ? userInfo.getKakaoAccount().getEmail() : null;
        String nickname = null;
        String profileImageUrl = null;
        
        if (userInfo.getKakaoAccount() != null && userInfo.getKakaoAccount().getProfile() != null) {
            nickname = userInfo.getKakaoAccount().getProfile().getNickname();
            profileImageUrl = userInfo.getKakaoAccount().getProfile().getProfileImageUrl();
        }

        // 이메일이 없으면 카카오 ID로 대체
        if (!StringUtils.hasText(email)) {
            email = "kakao_" + kakaoId + "@kakao.local";
        }

        // 3. 기존 사용자 확인 (providerId로 조회)
        Optional<Users> existingUser = userRepository.findByProviderAndProviderId("KAKAO", kakaoId);
        
        if (existingUser.isPresent()) {
            // 기존 사용자: JWT 발급
            Users user = existingUser.get();
            String accessToken = jwtTokenProvider.createAccessToken(user.getId(), user.getRole().toAuthority());
            String refreshToken = jwtTokenProvider.createRefreshToken(user.getId(), user.getRole().toAuthority());
            
            return KakaoOAuthDto.KakaoLoginResponse.builder()
                .isNewUser(false)
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .userId(user.getId())
                .email(user.getEmail())
                .nickname(user.getNickname())
                .profileImageUrl(user.getProfileImageUrl())
                .role(user.getRole().name())
                .build();
        }

        // 4. 신규 사용자: 임시 토큰 발급
        String tempToken = UUID.randomUUID().toString();
        TempUserInfo tempUserInfo = new TempUserInfo(
            kakaoId, email, nickname, profileImageUrl, role
        );
        tempUserStore.put(tempToken, tempUserInfo);
        
        // 10분 후 자동 삭제 (간단한 구현, 실제는 TTL 설정)
        scheduleTokenCleanup(tempToken);

        return KakaoOAuthDto.KakaoLoginResponse.builder()
            .isNewUser(true)
            .tempToken(tempToken)
            .email(email)
            .nickname(nickname)
            .profileImageUrl(profileImageUrl)
            .role(role)
            .build();
    }

    /**
     * 소비자 회원가입 완료 (추가 정보 입력)
     */
    @Transactional
    public KakaoOAuthDto.KakaoLoginResponse completeConsumerSignup(KakaoOAuthDto.ConsumerCompleteRequest request) {
        TempUserInfo tempUserInfo = tempUserStore.remove(request.getTempToken());
        if (tempUserInfo == null) {
            throw new AuthException(ErrorCode.INVALID_TOKEN, "유효하지 않거나 만료된 토큰입니다");
        }

        // 중복 체크
        if (userRepository.existsByEmail(tempUserInfo.email)) {
            throw new AuthException(ErrorCode.DUPLICATE_EMAIL, "이미 사용 중인 이메일입니다");
        }

        // 사용자 생성
        Users user = Users.builder()
            .loginId("kakao_" + tempUserInfo.kakaoId)
            .email(tempUserInfo.email)
            .password("")  // 소셜 로그인은 비밀번호 없음
            .name(tempUserInfo.nickname)
            .nickname(tempUserInfo.nickname)
            .ageGroup(request.getAgeGroup())
            .role(UserRole.CONSUMER)
            .status(UserStatus.ACTIVE)
            .profileImageUrl(tempUserInfo.profileImageUrl)
            .provider("KAKAO")
            .providerId(tempUserInfo.kakaoId)
            .build();

        Users savedUser = userRepository.save(user);

        // 선호 정보 저장
        preferenceService.updateConsumerPreferences(
            savedUser.getId(),
            request.getInterestCategoryIds(),
            request.getStyleIds(),
            request.getRegionIds(),
            request.getFeatureIds()
        );

        // JWT 발급
        String accessToken = jwtTokenProvider.createAccessToken(savedUser.getId(), savedUser.getRole().toAuthority());
        String refreshToken = jwtTokenProvider.createRefreshToken(savedUser.getId(), savedUser.getRole().toAuthority());

        return KakaoOAuthDto.KakaoLoginResponse.builder()
            .isNewUser(false)
            .accessToken(accessToken)
            .refreshToken(refreshToken)
            .userId(savedUser.getId())
            .email(savedUser.getEmail())
            .nickname(savedUser.getNickname())
            .profileImageUrl(savedUser.getProfileImageUrl())
            .role(savedUser.getRole().name())
            .build();
    }

    /**
     * 판매자 회원가입 완료 (추가 정보 입력)
     */
    @Transactional
    public KakaoOAuthDto.KakaoLoginResponse completeSellerSignup(KakaoOAuthDto.SellerCompleteRequest request) {
        TempUserInfo tempUserInfo = tempUserStore.remove(request.getTempToken());
        if (tempUserInfo == null) {
            throw new AuthException(ErrorCode.INVALID_TOKEN, "유효하지 않거나 만료된 토큰입니다");
        }

        // 중복 체크
        if (userRepository.existsByEmail(tempUserInfo.email)) {
            throw new AuthException(ErrorCode.DUPLICATE_EMAIL, "이미 사용 중인 이메일입니다");
        }

        // 사용자 생성
        Users user = Users.builder()
            .loginId("kakao_" + tempUserInfo.kakaoId)
            .email(tempUserInfo.email)
            .password("")  // 소셜 로그인은 비밀번호 없음
            .name(tempUserInfo.nickname)
            .nickname(tempUserInfo.nickname)
            .role(UserRole.SELLER)
            .status(UserStatus.ACTIVE)
            .profileImageUrl(tempUserInfo.profileImageUrl)
            .provider("KAKAO")
            .providerId(tempUserInfo.kakaoId)
            .build();

        Users savedUser = userRepository.save(user);

        // 판매자 프로필 생성
        SellerProfile sellerProfile = SellerProfile.builder()
            .user(savedUser)
            .activityRegion(request.getActivityRegion())
            .snsUrl(request.getSnsUrl())
            .introduction(request.getIntroduction())
            .build();

        sellerProfileRepository.save(sellerProfile);

        // JWT 발급
        String accessToken = jwtTokenProvider.createAccessToken(savedUser.getId(), savedUser.getRole().toAuthority());
        String refreshToken = jwtTokenProvider.createRefreshToken(savedUser.getId(), savedUser.getRole().toAuthority());

        return KakaoOAuthDto.KakaoLoginResponse.builder()
            .isNewUser(false)
            .accessToken(accessToken)
            .refreshToken(refreshToken)
            .userId(savedUser.getId())
            .email(savedUser.getEmail())
            .nickname(savedUser.getNickname())
            .profileImageUrl(savedUser.getProfileImageUrl())
            .role(savedUser.getRole().name())
            .build();
    }

    /**
     * 카카오 토큰 발급
     */
    private KakaoOAuthDto.KakaoTokenResponse getKakaoToken(String code) {
        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "authorization_code");
        params.add("client_id", kakaoRestApiKey);
        params.add("redirect_uri", kakaoRedirectUri);
        params.add("code", code);
        if (StringUtils.hasText(kakaoClientSecret)) {
            params.add("client_secret", kakaoClientSecret);
        }

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);

        try {
            ResponseEntity<KakaoOAuthDto.KakaoTokenResponse> response = restTemplate.exchange(
                KAKAO_AUTH_URL + "/oauth/token",
                HttpMethod.POST,
                request,
                KakaoOAuthDto.KakaoTokenResponse.class
            );
            return response.getBody();
        } catch (Exception e) {
            log.error("카카오 토큰 발급 실패: {}", e.getMessage());
            throw new AuthException(ErrorCode.OAUTH_FAILED, "카카오 로그인에 실패했습니다");
        }
    }

    /**
     * 카카오 사용자 정보 조회
     */
    private KakaoOAuthDto.KakaoUserInfo getKakaoUserInfo(String accessToken) {
        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        HttpEntity<String> request = new HttpEntity<>(headers);

        try {
            ResponseEntity<KakaoOAuthDto.KakaoUserInfo> response = restTemplate.exchange(
                KAKAO_API_URL + "/v2/user/me",
                HttpMethod.GET,
                request,
                KakaoOAuthDto.KakaoUserInfo.class
            );
            return response.getBody();
        } catch (Exception e) {
            log.error("카카오 사용자 정보 조회 실패: {}", e.getMessage());
            throw new AuthException(ErrorCode.OAUTH_FAILED, "카카오 사용자 정보를 가져오는데 실패했습니다");
        }
    }

    /**
     * 임시 토큰 자동 삭제 스케줄링 (10분)
     */
    private void scheduleTokenCleanup(String tempToken) {
        new Thread(() -> {
            try {
                Thread.sleep(10 * 60 * 1000);  // 10분
                tempUserStore.remove(tempToken);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }).start();
    }

    /**
     * 임시 사용자 정보 저장용 내부 클래스
     */
    private record TempUserInfo(
        String kakaoId,
        String email,
        String nickname,
        String profileImageUrl,
        String role
    ) {}
}

