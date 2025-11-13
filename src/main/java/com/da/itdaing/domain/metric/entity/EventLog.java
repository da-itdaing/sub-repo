package com.da.itdaing.domain.metric.entity;

import com.da.itdaing.domain.common.enums.EventAction;
import com.da.itdaing.domain.geo.entity.ZoneCell;
import com.da.itdaing.domain.popup.entity.Popup;
import com.da.itdaing.domain.user.entity.Users;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * 이벤트 로그
 * - 사용자 행동 추적 (팝업 조회, 찜, 리뷰 등)
 */
@Entity
@Table(
    name = "event_log",
    indexes = {
        @Index(name = "idx_evt_popup_time", columnList = "popup_id, created_at"),
        @Index(name = "idx_evt_zone_time", columnList = "zone_cell_id, created_at"),
        @Index(name = "idx_evt_user_time", columnList = "user_id, created_at")
    }
)
@EntityListeners(AuditingEntityListener.class)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class EventLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private Users user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "popup_id")
    private Popup popup;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "zone_cell_id")
    private ZoneCell zoneCell;

    @Enumerated(EnumType.STRING)
    @Column(name = "action_type", length = 20, nullable = false)
    private EventAction actionType;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public EventLog(Users user, Popup popup, ZoneCell zoneCell, EventAction actionType) {
        this.user = user;
        this.popup = popup;
        this.zoneCell = zoneCell;
        this.actionType = actionType;
    }
}

