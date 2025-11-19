package com.da.itdaing.domain.reco.entity;

import com.da.itdaing.domain.popup.entity.Popup;
import com.da.itdaing.domain.user.entity.Users;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 사용자 추천 무시 기록
 * - 사용자가 특정 날짜의 추천을 무시(dismiss)한 기록
 */
@Entity
@Table(
    name = "user_reco_dismissal",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_reco_dismiss",
        columnNames = {"consumer_id", "date", "popup_id"}
    )
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserRecoDissmissal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "consumer_id", nullable = false)
    private Users consumer;

    @Column(name = "date", nullable = false)
    private LocalDate date;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "popup_id", nullable = false)
    private Popup popup;

    @Column(name = "dismissed_at", nullable = false)
    private LocalDateTime dismissedAt = LocalDateTime.now();

    @Builder
    public UserRecoDissmissal(Users consumer, LocalDate date, Popup popup, LocalDateTime dismissedAt) {
        this.consumer = consumer;
        this.date = date;
        this.popup = popup;
        this.dismissedAt = dismissedAt != null ? dismissedAt : LocalDateTime.now();
    }
}

