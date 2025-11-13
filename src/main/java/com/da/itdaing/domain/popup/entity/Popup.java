package com.da.itdaing.domain.popup.entity;

import com.da.itdaing.domain.common.enums.ApprovalStatus;
import com.da.itdaing.domain.geo.entity.ZoneCell;
import com.da.itdaing.domain.user.entity.Users;
import com.da.itdaing.global.jpa.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * 팝업스토어
 */
@Entity
@Table(
    name = "popup",
    indexes = {
        @Index(name = "idx_popup_seller", columnList = "seller_id"),
        @Index(name = "idx_popup_cell", columnList = "zone_cell_id"),
        @Index(name = "idx_popup_status", columnList = "approval_status"),
        @Index(name = "idx_popup_period", columnList = "start_date, end_date")
    }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Popup extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    private Users seller;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "zone_cell_id", nullable = false)
    private ZoneCell zoneCell;

    @Column(name = "name", length = 200, nullable = false)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "operating_time", length = 50)
    private String operatingTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "approval_status", length = 20, nullable = false)
    private ApprovalStatus approvalStatus = ApprovalStatus.PENDING;

    @Column(name = "rejection_reason", length = 500)
    private String rejectionReason;

    @Column(name = "view_count", nullable = false)
    private Long viewCount = 0L;

    @Builder
    public Popup(Users seller, ZoneCell zoneCell, String name, String description,
                 LocalDate startDate, LocalDate endDate, String operatingTime,
                 ApprovalStatus approvalStatus, String rejectionReason, Long viewCount) {
        this.seller = seller;
        this.zoneCell = zoneCell;
        this.name = name;
        this.description = description;
        this.startDate = startDate;
        this.endDate = endDate;
        this.operatingTime = operatingTime;
        this.approvalStatus = approvalStatus != null ? approvalStatus : ApprovalStatus.PENDING;
        this.rejectionReason = rejectionReason;
        this.viewCount = viewCount != null ? viewCount : 0L;
    }
}

