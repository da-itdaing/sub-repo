package com.da.itdaing.domain.metric.entity;

import com.da.itdaing.domain.common.enums.EventAction;
import com.da.itdaing.domain.master.entity.Category;
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
 * 카테고리별 이벤트 로그
 * - 카테고리 클릭 등 추적
 */
@Entity
@Table(
    name = "event_log_category",
    indexes = @Index(name = "idx_evt_cat_time", columnList = "category_id, created_at")
)
@EntityListeners(AuditingEntityListener.class)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class EventLogCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private Users user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Enumerated(EnumType.STRING)
    @Column(name = "action_type", length = 20, nullable = false)
    private EventAction actionType;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public EventLogCategory(Users user, Category category, EventAction actionType) {
        this.user = user;
        this.category = category;
        this.actionType = actionType;
    }
}

