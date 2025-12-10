package com.da.itdaing.domain.user.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/**
 * 카카오 OAuth 관련 DTO
 */
public class KakaoOAuthDto {

    /**
     * 카카오 토큰 응답
     */
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class KakaoTokenResponse {
        @JsonProperty("access_token")
        private String accessToken;

        @JsonProperty("token_type")
        private String tokenType;

        @JsonProperty("refresh_token")
        private String refreshToken;

        @JsonProperty("expires_in")
        private Integer expiresIn;

        @JsonProperty("refresh_token_expires_in")
        private Integer refreshTokenExpiresIn;

        private String scope;
    }

    /**
     * 카카오 사용자 정보 응답
     */
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class KakaoUserInfo {
        private Long id;

        @JsonProperty("connected_at")
        private String connectedAt;

        @JsonProperty("kakao_account")
        private KakaoAccount kakaoAccount;

        @Getter
        @Setter
        @NoArgsConstructor
        public static class KakaoAccount {
            private String email;

            @JsonProperty("email_needs_agreement")
            private Boolean emailNeedsAgreement;

            @JsonProperty("is_email_valid")
            private Boolean isEmailValid;

            @JsonProperty("is_email_verified")
            private Boolean isEmailVerified;

            private Profile profile;

            @JsonProperty("profile_needs_agreement")
            private Boolean profileNeedsAgreement;

            @Getter
            @Setter
            @NoArgsConstructor
            public static class Profile {
                private String nickname;

                @JsonProperty("thumbnail_image_url")
                private String thumbnailImageUrl;

                @JsonProperty("profile_image_url")
                private String profileImageUrl;

                @JsonProperty("is_default_image")
                private Boolean isDefaultImage;
            }
        }
    }

    /**
     * 카카오 로그인 요청 (프론트엔드 → 백엔드)
     */
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class KakaoLoginRequest {
        @NotBlank(message = "인가 코드가 필요합니다")
        private String code;

        @NotBlank(message = "역할 정보가 필요합니다 (consumer/seller)")
        private String role;  // consumer 또는 seller
    }

    /**
     * 카카오 로그인 응답
     */
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class KakaoLoginResponse {
        private boolean isNewUser;
        private String tempToken;       // 신규 사용자용 임시 토큰
        private String accessToken;     // 기존 사용자용 JWT
        private String refreshToken;    // 기존 사용자용 JWT
        private Long userId;
        private String email;
        private String nickname;
        private String profileImageUrl;
        private String role;
    }

    /**
     * 소비자 추가 정보 입력 요청 (신규 사용자)
     */
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConsumerCompleteRequest {
        @NotBlank(message = "임시 토큰이 필요합니다")
        private String tempToken;

        @NotNull(message = "연령대를 선택해주세요")
        private Integer ageGroup;

        @NotEmpty(message = "관심 카테고리를 1개 이상 선택해주세요")
        @Size(min = 1, max = 4, message = "관심 카테고리는 1~4개 선택 가능합니다")
        private List<Long> interestCategoryIds;

        @NotEmpty(message = "스타일을 1개 이상 선택해주세요")
        @Size(min = 1, max = 4, message = "스타일은 1~4개 선택 가능합니다")
        private List<Long> styleIds;

        @NotEmpty(message = "선호 지역을 1개 이상 선택해주세요")
        @Size(min = 1, max = 2, message = "선호 지역은 1~2개 선택 가능합니다")
        private List<Long> regionIds;

        private List<Long> featureIds;
    }

    /**
     * 판매자 추가 정보 입력 요청 (신규 사용자)
     */
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SellerCompleteRequest {
        @NotBlank(message = "임시 토큰이 필요합니다")
        private String tempToken;

        @NotBlank(message = "활동 지역을 입력해주세요")
        private String activityRegion;

        private String snsUrl;
        private String introduction;
    }

    /**
     * 카카오 로그인 URL 응답
     */
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class KakaoAuthUrlResponse {
        private String authUrl;
    }
}

