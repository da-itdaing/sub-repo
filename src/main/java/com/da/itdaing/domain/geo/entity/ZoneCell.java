// src/main/java/com/da/itdaing/domain/geo/entity/ZoneCell.java
package com.da.itdaing.domain.geo.entity;

import com.da.itdaing.domain.common.enums.ZoneStatus;
import com.da.itdaing.domain.user.entity.Users;
import com.da.itdaing.global.jpa.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "zone_cell",
    indexes = {
        @Index(name = "idx_zone_cell_area", columnList = "zone_area_id"),
        @Index(name = "idx_zone_cell_owner", columnList = "owner_id")
    })
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Setter(AccessLevel.PRIVATE) // Only for internal updates via update() method
public class ZoneCell extends BaseTimeEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 어떤 구역(폴리곤) 소속인지 (필수) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "zone_area_id", nullable = false)
    private ZoneArea zoneArea;

    /** 이 존을 만든 판매자(소유자) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private Users owner;

    /** 존 이름/라벨(선택) */
    @Column(name = "label", length = 100)
    private String label;

    /** 상세 주소(선택) */
    @Column(name = "detailed_address", length = 255)
    private String detailedAddress;

    /** 마커 좌표(필수) */
    @Column(name = "lat", nullable = false) private Double lat;
    @Column(name = "lng", nullable = false) private Double lng;

    /** 상태/수용/유의사항 */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20, nullable = false)
    private ZoneStatus status = ZoneStatus.PENDING;

    @Column(name = "max_capacity")
    private Integer maxCapacity;

    @Column(name = "notice", length = 1000)
    private String notice;

    @Builder
    public ZoneCell(ZoneArea zoneArea, Users owner,
                    String label, String detailedAddress,
                    Double lat, Double lng,
                    ZoneStatus status, Integer maxCapacity, String notice) {
        this.zoneArea = zoneArea;
        this.owner = owner;
        this.label = label;
        this.detailedAddress = detailedAddress;
        this.lat = lat;
        this.lng = lng;
        this.status = status != null ? status : ZoneStatus.PENDING;
        this.maxCapacity = maxCapacity;
        this.notice = notice;
    }

    /** 운영 중 상태 변경(관리자 승인/반려 등) */
    public void changeStatus(ZoneStatus status) {
        this.status = status;
    }

    /** 셀 정보 업데이트 (관리자용) - null이 아닌 값만 업데이트 */
    public void update(ZoneArea zoneArea, Users owner, String label, String detailedAddress,
                      Double lat, Double lng, ZoneStatus status, Integer maxCapacity, String notice) {
        // zoneArea와 owner는 항상 설정 (null 체크는 서비스에서)
        this.zoneArea = zoneArea;
        this.owner = owner;
        
        // 나머지는 null이 아닐 때만 업데이트
        if (label != null) {
            this.label = label;
        }
        if (detailedAddress != null) {
            this.detailedAddress = detailedAddress;
        }
        if (lat != null) {
            this.lat = lat;
        }
        if (lng != null) {
            this.lng = lng;
        }
        if (status != null) {
            this.status = status;
        }
        if (maxCapacity != null) {
            this.maxCapacity = maxCapacity;
        }
        if (notice != null) {
            this.notice = notice;
        }
    }
}
