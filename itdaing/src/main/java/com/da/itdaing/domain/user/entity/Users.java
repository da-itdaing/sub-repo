package com.da.itdaing.domain.user.entity;

import com.da.itdaing.domain.common.enums.UserRole;
import com.da.itdaing.global.jpa.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 사용자 기본 정보
 */
@Entity
@Table(
    name = "users",
    indexes = @Index(name = "idx_users_role", columnList = "role")
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Users extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "login_id", length = 100, nullable = false, unique = true)
    private String loginId;

    @Column(name = "password", length = 255, nullable = false)
    private String password;

    @Column(name = "name", length = 100)
    private String name;

    @Column(name = "nickname", length = 100)
    private String nickname;

    @Column(name = "email", length = 255, nullable = false, unique = true)
    private String email;

    @Column(name = "age_group")        // 10,20,30,... (정수, 10단위)
    private Integer ageGroup;

    @Column(name = "mbti")
    private String mbti;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", length = 20, nullable = false)
    private UserRole role;

    @Column(name = "profile_image_url", length = 500)
    private String profileImageUrl;

    @Column(name = "profile_image_key", length = 255)
    private String profileImageKey;

    @Builder
    public Users(String loginId, Integer ageGroup, String password, String name, String nickname,
                 String email, String mbti, UserRole role,
                 String profileImageUrl, String profileImageKey) {
        this.loginId = loginId;
        this.ageGroup = ageGroup;
        this.password = password;
        this.name = name;
        this.nickname = nickname;
        this.email = email;
        this.mbti = mbti;
        this.role = role;
        this.profileImageUrl = profileImageUrl;
        this.profileImageKey = profileImageKey;
    }

    /**
     * 비밀번호 업데이트 (테스트용)
     */
    public void updatePassword(String newPasswordHash) {
        this.password = newPasswordHash;
    }

    public void updateProfileImage(String url, String key) {
        this.profileImageUrl = url;
        this.profileImageKey = key;
    }
}
