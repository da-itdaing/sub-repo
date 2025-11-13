// src/main/java/com/da/itdaing/domain/geo/entity/ZoneArea.java
package com.da.itdaing.domain.geo.entity;

import com.da.itdaing.domain.common.enums.AreaStatus;
import com.da.itdaing.domain.master.entity.Region;
import com.da.itdaing.global.jpa.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "zone_area",
    indexes = @Index(name = "idx_zone_area_region", columnList = "region_id"))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ZoneArea extends BaseTimeEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 선택: 지역 마스터 연결 유지
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "region_id", nullable = false)
    private Region region;

    @Column(name = "name", length = 100, nullable = false)
    private String name;

    /** 관리자 저장: 폴리곤 GeoJSON (WGS84, lng/lat) */
    @Column(name = "geometry_data", columnDefinition = "TEXT")
    private String polygonGeoJson;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20, nullable = false)
    private AreaStatus status = AreaStatus.AVAILABLE;

    @Column(name = "max_capacity")
    private Integer maxCapacity;

    @Column(name = "notice", length = 1000)
    private String notice;

    @Builder
    public ZoneArea(Region region, String name, String polygonGeoJson,
                    AreaStatus status, Integer maxCapacity, String notice) {
        this.region = region;
        this.name = name;
        this.polygonGeoJson = polygonGeoJson;
        this.status = status != null ? status : AreaStatus.AVAILABLE;
        this.maxCapacity = maxCapacity;
        this.notice = notice;
    }
}
