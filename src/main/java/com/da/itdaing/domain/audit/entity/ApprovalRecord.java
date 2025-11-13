package com.da.itdaing.domain.audit.entity;

import com.da.itdaing.domain.common.enums.ApprovalTargetType;
import com.da.itdaing.domain.common.enums.DecisionType;
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
 * 승인 기록
 * - 팝업 등 승인/거부 이력 추적
 */
@Entity
@Table(
    name = "approval_record",
    indexes = @Index(name = "idx_approval_target", columnList = "target_type, target_id, created_at")
)
@EntityListeners(AuditingEntityListener.class)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ApprovalRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_type", length = 20, nullable = false)
    private ApprovalTargetType targetType;

    @Column(name = "target_id", nullable = false)
    private Long targetId;

    @Enumerated(EnumType.STRING)
    @Column(name = "decision", length = 20, nullable = false)
    private DecisionType decision;

    @Column(name = "reason", length = 1000)
    private String reason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id", nullable = false)
    private Users admin;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public ApprovalRecord(ApprovalTargetType targetType, Long targetId, DecisionType decision, String reason, Users admin) {
        this.targetType = targetType;
        this.targetId = targetId;
        this.decision = decision;
        this.reason = reason;
        this.admin = admin;
    }

    public static ApprovalRecord forPopup(Long popupId, DecisionType decision, String reason, Users admin) {
        return ApprovalRecord.builder()
            .targetType(ApprovalTargetType.POPUP)
            .targetId(popupId)
            .decision(decision)
            .reason(reason)
            .admin(admin)
            .build();
    }
}

