// src/main/java/com/da/itdaing/domain/geo/entity/ZoneCommercialInfo.java
package com.da.itdaing.domain.geo.entity;

import com.da.itdaing.global.jpa.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.*;

/**
 * 존(Zone)의 상권 정보 엔티티
 * 
 * 플리마켓 존의 상권 분석 정보를 저장합니다.
 * - 상권 등급 (A/B/C)
 * - 유동인구 점수
 * - 경쟁도/잠재력 점수
 * - 추천 상품 카테고리
 * - 대여료 및 예상 매출
 */
@Entity
@Table(name = "zone_commercial_info",
    indexes = @Index(name = "idx_zone_commercial_zone_id", columnList = "zone_id"))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ZoneCommercialInfo extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "zone_id", nullable = false)
    private Long zoneId;

    /** 상권 등급 (A/B/C) */
    @Column(name = "commercial_grade", length = 10)
    private String commercialGrade;

    /** 유동인구 점수 (0-100) */
    @Column(name = "traffic_score")
    private Integer trafficScore;

    /** 경쟁도 점수 (0-100, 낮을수록 경쟁 적음) */
    @Column(name = "competition_score")
    private Integer competitionScore;

    /** 성장 잠재력 점수 (0-100) */
    @Column(name = "potential_score")
    private Integer potentialScore;

    /** 평일 유동인구 특성 */
    @Column(name = "weekday_traffic", length = 200)
    private String weekdayTraffic;

    /** 주말 유동인구 특성 */
    @Column(name = "weekend_traffic", length = 200)
    private String weekendTraffic;

    /** 추천 상품 카테고리 */
    @Column(name = "best_products", columnDefinition = "TEXT")
    private String bestProducts;

    /** 일일 대여료 (원) */
    @Column(name = "rent_per_day")
    private Integer rentPerDay;

    /** 평균 일매출 (원) */
    @Column(name = "avg_sales")
    private Integer avgSales;

    /** 상세 주소 */
    @Column(name = "detailed_address", length = 500)
    private String detailedAddress;

    /** 동네 이름 */
    @Column(name = "neighborhood", length = 100)
    private String neighborhood;

    @Builder
    public ZoneCommercialInfo(Long zoneId, String commercialGrade, Integer trafficScore,
                              Integer competitionScore, Integer potentialScore,
                              String weekdayTraffic, String weekendTraffic,
                              String bestProducts, Integer rentPerDay, Integer avgSales,
                              String detailedAddress, String neighborhood) {
        this.zoneId = zoneId;
        this.commercialGrade = commercialGrade;
        this.trafficScore = trafficScore;
        this.competitionScore = competitionScore;
        this.potentialScore = potentialScore;
        this.weekdayTraffic = weekdayTraffic;
        this.weekendTraffic = weekendTraffic;
        this.bestProducts = bestProducts;
        this.rentPerDay = rentPerDay;
        this.avgSales = avgSales;
        this.detailedAddress = detailedAddress;
        this.neighborhood = neighborhood;
    }
}

