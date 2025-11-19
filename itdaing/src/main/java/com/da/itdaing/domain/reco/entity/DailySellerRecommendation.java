package com.da.itdaing.domain.reco.entity;

import com.da.itdaing.domain.geo.entity.ZoneArea;
import com.da.itdaing.domain.user.entity.Users;
import com.da.itdaing.global.jpa.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 일일 판매자 추천
 * - AI 모델이 생성한 판매자별 지역 추천 결과
 */
@Entity
@Table(
    name = "daily_seller_recommendation",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_dsr_dedup",
        columnNames = {"seller_id", "recommendation_date", "zone_area_id"}
    )
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class DailySellerRecommendation extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    private Users seller;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "zone_area_id", nullable = false)
    private ZoneArea zoneArea;

    @Column(name = "recommendation_date", nullable = false)
    private LocalDate recommendationDate;

    @Column(name = "score", precision = 6, scale = 3, nullable = false)
    private BigDecimal score = BigDecimal.ZERO;

    @Column(name = "model_version", length = 50)
    private String modelVersion;

    @Column(name = "reason_json", columnDefinition = "TEXT")
    private String reasonJson;

    @Builder
    public DailySellerRecommendation(Users seller, ZoneArea zoneArea, LocalDate recommendationDate,
                                     BigDecimal score, String modelVersion, String reasonJson) {
        this.seller = seller;
        this.zoneArea = zoneArea;
        this.recommendationDate = recommendationDate;
        this.score = score != null ? score : BigDecimal.ZERO;
        this.modelVersion = modelVersion;
        this.reasonJson = reasonJson;
    }
}

