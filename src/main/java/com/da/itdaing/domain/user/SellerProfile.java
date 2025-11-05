package com.da.itdaing.domain.user;

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
    @JoinColumn(name = "user_id")
    private Users user;

    @Column(name = "profile_image_url", length = 512)
    private String profileImageUrl;

    @Column(name = "introduction", length = 1000)
    private String introduction;

    @Column(name = "activity_region", length = 255)
    private String activityRegion;

    @Column(name = "sns_url", length = 512)
    private String snsUrl;

    @Builder
    public SellerProfile(Users user, String profileImageUrl, String introduction, String activityRegion, String snsUrl) {
        this.user = user;
        this.profileImageUrl = profileImageUrl;
        this.introduction = introduction;
        this.activityRegion = activityRegion;
        this.snsUrl = snsUrl;
    }
}

