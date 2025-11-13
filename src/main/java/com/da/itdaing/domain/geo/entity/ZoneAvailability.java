package com.da.itdaing.domain.geo.entity;

import com.da.itdaing.global.jpa.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 존 가용성 (Zone Availability)
 * - 특정 셀의 기간별 임대 가능 여부 및 가격
 */
@Entity
@Table(
    name = "zone_availability",
    indexes = @Index(name = "idx_zone_avail_range", columnList = "zone_cell_id, start_date, end_date")
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ZoneAvailability extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "zone_cell_id", nullable = false)
    private ZoneCell zoneCell;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "daily_price", precision = 14, scale = 2, nullable = false)
    private BigDecimal dailyPrice;

    @Column(name = "max_concurrent_slots", nullable = false)
    private Integer maxConcurrentSlots = 1;

    @Column(name = "status", length = 20, nullable = false)
    private String status = "ACTIVE";

    @Builder
    public ZoneAvailability(ZoneCell zoneCell, LocalDate startDate, LocalDate endDate,
                           BigDecimal dailyPrice, Integer maxConcurrentSlots, String status) {
        this.zoneCell = zoneCell;
        this.startDate = startDate;
        this.endDate = endDate;
        this.dailyPrice = dailyPrice;
        this.maxConcurrentSlots = maxConcurrentSlots != null ? maxConcurrentSlots : 1;
        this.status = status != null ? status : "ACTIVE";
    }
}

