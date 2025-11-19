package com.da.itdaing.domain.seller.entity;

import com.da.itdaing.domain.user.entity.Users;
import com.da.itdaing.global.jpa.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 판매자 프로필
 * - 1:1 관계로 users 테이블과 매핑
 */
@Entity
@Table(name = "seller_profile")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SellerProfile extends BaseTimeEntity {

    @Id
    @Column(name = "user_id")
    private Long userId;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true, nullable = false)  // unique 보장
    private Users user;

    @Column(name = "profile_image_url", length = 500)
    private String profileImageUrl;

    @Column(name = "introduction", length = 500)
    private String introduction;

    @Column(name = "activity_region", length = 100)
    private String activityRegion;

    @Column(name = "sns_url", length = 200)
    private String snsUrl;

    @Column(name = "category", length = 100)
    private String category;

    @Column(name = "contact_phone", length = 50)
    private String contactPhone;

    @Column(name = "profile_image_key", length = 255)
    private String profileImageKey;

    @Builder
    public SellerProfile(Users user, String profileImageUrl, String profileImageKey,
                         String introduction, String activityRegion, String snsUrl,
                         String category, String contactPhone) {
        this.user = user;
        this.profileImageUrl = profileImageUrl;
        this.profileImageKey = profileImageKey;
        this.introduction = introduction;
        this.activityRegion = activityRegion;
        this.snsUrl = snsUrl;
        this.category = category;
        this.contactPhone = contactPhone;
    }

    public void update(String profileImageUrl, String profileImageKey,
                       String introduction, String activityRegion, String snsUrl,
                       String category, String contactPhone) {
        this.profileImageUrl = profileImageUrl;
        this.profileImageKey = profileImageKey;
        this.introduction = introduction;
        this.activityRegion = activityRegion;
        this.snsUrl = snsUrl;
        this.category = category;
        this.contactPhone = contactPhone;
    }
}

