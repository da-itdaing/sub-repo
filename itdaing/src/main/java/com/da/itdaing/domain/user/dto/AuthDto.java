package com.da.itdaing.domain.user.dto;

import com.da.itdaing.domain.common.enums.UserRole;
import com.da.itdaing.domain.user.entity.Users;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.*;

import java.util.List;
import java.util.Locale;

public class AuthDto {

    // =========================
    // 소비자 회원가입 요청 DTO
    // =========================
    @Getter @Builder
    @NoArgsConstructor @AllArgsConstructor
    @Schema(description = "소비자 회원가입 요청(기본정보 + 선호 선택을 한 번에 제출)")
    public static class SignupConsumerRequest {

        // 기본 정보
        @Schema(description = "이메일 주소", example = "consumer1@example.com", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank(message = "이메일은 필수입니다")
        @Email(message = "이메일 형식이 올바르지 않습니다")
        private String email;

        @Schema(description = "비밀번호 (8-20자)", example = "P@ssw0rd1!", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank(message = "비밀번호는 필수입니다")
        @Size(min = 8, max = 20, message = "비밀번호는 8자 이상 20자 이하여야 합니다")
        private String password;

        @Schema(description = "비밀번호 확인", example = "P@ssw0rd1!", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank(message = "비밀번호 확인은 필수입니다")
        private String passwordConfirm;

        @Schema(description = "로그인 ID", example = "juchan01", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank(message = "로그인ID는 필수입니다")
        @Size(min = 4, max = 30, message = "로그인ID는 4~30자")
        private String loginId;

        @Schema(description = "이름", example = "김소비", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank(message = "이름은 필수입니다")
        @Size(max = 100, message = "이름은 100자 이하여야 합니다")
        private String name;

        @Schema(description = "닉네임", example = "소비왕")
        @Size(max = 100, message = "닉네임은 100자 이하여야 합니다")
        private String nickname;

        @Schema(
            description = "나이대(10단위 정수)",
            example = "20",
            allowableValues = {"10","20","30","40","50","60","70","80","90"},
            requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull(message = "나이대는 필수입니다")
        @Min(value = 10, message = "나이대는 10 이상이어야 합니다")
        @Max(value = 90, message = "나이대는 90 이하여야 합니다")
        private Integer ageGroup;

        @Schema(description = "MBTI", example = "ENFP")
        @Size(max = 4, message = "mbti는 E/I, S/N, T/F, J/P 조합으로 최대 4자 이하여야 합니다")
        private String mbti;

        // 선호(마스터 ID 리스트로 받는 것을 권장)
        @Schema(description = "관심 카테고리 ID 목록(소비자용, 1~4개)", example = "[101,105]")
        @NotEmpty(message = "관심 카테고리는 최소 1개 이상 선택해야 합니다")
        @Size(min = 1, max = 4, message = "관심 카테고리는 1~4개 선택해야 합니다")
        private List<Long> interestCategoryIds;

        @Schema(description = "스타일 ID 목록(1~4개)", example = "[12,15,19]")
        @NotEmpty(message = "스타일은 최소 1개 이상 선택해야 합니다")
        @Size(min = 1, max = 4, message = "스타일은 1~4개 선택해야 합니다")
        private List<Long> styleIds;

        @Schema(description = "선호 지역 ID 목록(1~4개)", example = "[2]")
        @NotEmpty(message = "지역은 최소 1개 이상 선택해야 합니다")
        @Size(min = 1, max = 4, message = "지역은 1~4개 선택해야 합니다")
        private List<Long> regionIds;

        @Schema(description = "선호 특징 ID 목록(1~4개)", example = "[2]")
        @NotEmpty(message = "특징은 최소 1개 이상 선택해야 합니다") @Size(min = 1, max = 4)
        private List<@NotNull Long> featureIds;

        // 비밀번호 = 확인 일치 검증
        @AssertTrue(message = "비밀번호와 비밀번호 확인이 일치하지 않습니다")
        @Schema(hidden = true)
        public boolean isPasswordConfirmed() {
            return password != null && password.equals(passwordConfirm);
        }

        /** 10의 배수 검증 */
        @AssertTrue(message = "나이대는 10,20,30,... 형식(10의 배수)이어야 합니다")
        public boolean isAgeGroupTens() {
            return ageGroup != null && ageGroup % 10 == 0;
        }


        // 엔티티 변환 (Users에 age 필드가 없다면 .age(age) 부분은 제거하세요)
        public Users toEntity(String encodedPassword) {
            return Users.builder()
                .loginId(loginId.trim())
                .email(email.trim().toLowerCase(Locale.ROOT))
                .password(encodedPassword)
                .name(name)
                .nickname(nickname)
                .ageGroup(ageGroup)
                .mbti(mbti)
                .role(UserRole.CONSUMER)
                .build();
        }
    }

    // =========================
    // 판매자 회원가입 요청 DTO
    // =========================
    @Getter @Builder
    @NoArgsConstructor @AllArgsConstructor
    @Schema(description = "판매자 회원가입 요청")
    public static class SignupSellerRequest {

        @Schema(description = "이메일 주소", example = "seller@example.com", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank(message = "이메일은 필수입니다")
        @Email(message = "이메일 형식이 올바르지 않습니다")
        private String email;

        @Schema(description = "비밀번호 (8-20자)", example = "P@ssw0rd1!", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank(message = "비밀번호는 필수입니다")
        @Size(min = 8, max = 20, message = "비밀번호는 8자 이상 20자 이하여야 합니다")
        private String password;

        @Schema(description = "비밀번호 확인", example = "P@ssw0rd1!", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank(message = "비밀번호 확인은 필수입니다")
        private String passwordConfirm;

        @Schema(description = "로그인 ID(영문 소문자/숫자/하이픈/언더스코어, 4~20자)", example = "seller1", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank(message = "로그인ID는 필수입니다")
        @Size(min = 4, max = 20, message = "로그인ID는 4~20자여야 합니다")
        @Pattern(regexp = "^[a-z0-9_-]+$", message = "로그인ID는 영문 소문자/숫자/하이픈/언더스코어만 허용됩니다")
        private String loginId;

        @Schema(description = "이름", example = "박판매", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank(message = "이름은 필수입니다")
        @Size(max = 100, message = "이름은 100자 이하여야 합니다")
        private String name;

        @Schema(description = "닉네임", example = "팝업왕")
        @Size(max = 100, message = "닉네임은 100자 이하여야 합니다")
        private String nickname;

        // ===== 판매자 프로필 관련 필드 =====

        @Schema(description = "활동 지역 (필수)", example = "광주/남구")
        @NotBlank(message = "활동 지역은 필수입니다")
        @Size(max = 255, message = "활동 지역은 255자 이하여야 합니다")
        private String activityRegion;

        @Schema(description = "SNS URL (선택)", example = "https://instagram.com/popup_seller")
        @Pattern(regexp = "^https?://.+", message = "유효한 URL 형식이어야 합니다")
        private String snsUrl;

        @Schema(description = "프로필 이미지 정보 (선택)")
        private com.da.itdaing.domain.file.dto.ImagePayload profileImage;

        @Schema(description = "소개 (선택)", example = "팝업 운영 3년차, 굿즈 위주")
        @Size(max = 1000, message = "소개는 1000자 이하여야 합니다")
        private String introduction;

        @AssertTrue(message = "비밀번호와 비밀번호 확인이 일치하지 않습니다")
        @Schema(hidden = true)
        public boolean isPasswordConfirmed() {
            return password != null && password.equals(passwordConfirm);
        }

        public Users toEntity(String encodedPassword) {
            return Users.builder()
                .loginId(loginId.trim())
                .email(email.trim().toLowerCase(Locale.ROOT))
                .password(encodedPassword)
                .name(name)
                .nickname(nickname)
                .role(UserRole.SELLER)
                .build();
        }
    }

    // =============
    // 로그인 요청/응답
    // =============
    @Getter @Builder
    @NoArgsConstructor @AllArgsConstructor
    @Schema(description = "로그인 요청")
    public static class LoginRequest {
        @Schema(description = "로그인 ID", example = "juchan01", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank(message = "로그인ID는 필수입니다")
        private String loginId;

        @Schema(description = "비밀번호", example = "P@ssw0rd1", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank(message = "비밀번호는 필수입니다")
        private String password;
    }

    // =============
    // 로그인 응답
    // =============
    @Getter @Builder
    @NoArgsConstructor @AllArgsConstructor
    @Schema(description = "로그인 응답")
    public static class LoginResponse {

        @Schema(description = "사용자 ID", example = "1")
        private Long userId;

        @Schema(description = "사용자 역할", example = "CONSUMER",
            allowableValues = {"CONSUMER","SELLER","ADMIN"})
        private UserRole role;

        @Schema(description = "JWT 액세스 토큰 (Bearer)", example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
        private String accessToken;

        @Schema(description = "JWT 리프레시 토큰", example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
        private String refreshToken;
    }

    // ==========
    // 공통 응답
    // ==========
    @Getter @Builder
    @NoArgsConstructor @AllArgsConstructor
    @Schema(description = "회원가입 응답")
    public static class SignupResponse {
        @Schema(description = "생성된 사용자 ID", example = "1")
        private Long userId;

        @Schema(description = "이메일 주소", example = "consumer@example.com")
        private String email;

        @Schema(description = "사용자 역할", example = "CONSUMER",
            allowableValues = {"CONSUMER", "SELLER", "ADMIN"})
        private UserRole role;

        @Schema(description = "판매자 프로필 정보 (판매자 회원가입 시에만 포함)")
        private SellerProfileInfo profile;
    }

    @Getter @Builder
    @NoArgsConstructor @AllArgsConstructor
    @Schema(description = "판매자 프로필 정보")
    public static class SellerProfileInfo {
        @Schema(description = "활동 지역", example = "광주/남구")
        private String activityRegion;

        @Schema(description = "SNS URL", example = "https://instagram.com/popup_seller")
        private String snsUrl;

        @Schema(description = "프로필 이미지 정보")
        private com.da.itdaing.domain.file.dto.ImagePayload profileImage;

        @Schema(description = "소개", example = "팝업 운영 3년차, 굿즈 위주")
        private String introduction;
    }

    @Getter @Builder
    @NoArgsConstructor @AllArgsConstructor
    @Schema(description = "사용자 프로필 응답")
    public static class UserProfileResponse {
        @Schema(description = "사용자 ID", example = "1")
        private Long id;

        @Schema(description = "이메일 주소", example = "consumer@example.com")
        private String email;

        @Schema(description = "이름", example = "김소비")
        private String name;

        @Schema(description = "닉네임", example = "소비왕")
        private String nickname;

        @Schema(description = "사용자 역할 (CONSUMER/SELLER/ADMIN)", example = "CONSUMER",
            allowableValues = {"CONSUMER", "SELLER", "ADMIN"})
        private UserRole role;

        @Schema(description = "프로필 이미지 정보")
        private com.da.itdaing.domain.file.dto.ImagePayload profileImage;

        public static UserProfileResponse from(Users user) {
            return UserProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .nickname(user.getNickname())
                .role(user.getRole())
                .profileImage(com.da.itdaing.domain.file.dto.ImagePayload.builder()
                    .url(user.getProfileImageUrl())
                    .key(user.getProfileImageKey())
                    .build())
                .build();
        }
    }

    @Getter @Builder @NoArgsConstructor @AllArgsConstructor
    public static class TokenRefreshRequest {
        @NotBlank(message = "리프레시 토큰은 필수입니다")
        private String refreshToken;
    }

    @Getter @Builder @NoArgsConstructor @AllArgsConstructor
    public static class TokenPair {
        private String accessToken;
        private String refreshToken;
    }

    @Getter @Builder @NoArgsConstructor @AllArgsConstructor
    public static class LogoutRequest {
        // 선택: 리프레시 토큰도 함께 무효화하고 싶다면 사용
        private String refreshToken;
    }
}
