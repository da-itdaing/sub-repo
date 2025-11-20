package com.da.itdaing.domain.metric.entity;

import com.da.itdaing.domain.popup.entity.Popup;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * 팝업별 일일 메트릭
 * - 일별 조회수, 유니크 사용자, 찜, 리뷰 집계
 */
@Entity
@Table(
    name = "metric_daily_popup",
    uniqueConstraints = @UniqueConstraint(name = "uk_metric_popup_date", columnNames = {"popup_id", "date"})
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MetricDailyPopup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "popup_id", nullable = false)
    private Popup popup;

    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Column(name = "views", nullable = false)
    private Integer views = 0;

    @Column(name = "unique_users", nullable = false)
    private Integer uniqueUsers = 0;

    @Column(name = "favorites", nullable = false)
    private Integer favorites = 0;

    @Column(name = "reviews", nullable = false)
    private Integer reviews = 0;

    @Builder
    public MetricDailyPopup(Popup popup, LocalDate date, Integer views, Integer uniqueUsers, Integer favorites, Integer reviews) {
        this.popup = popup;
        this.date = date;
        this.views = views != null ? views : 0;
        this.uniqueUsers = uniqueUsers != null ? uniqueUsers : 0;
        this.favorites = favorites != null ? favorites : 0;
        this.reviews = reviews != null ? reviews : 0;
    }

    public static MetricDailyPopup create(Popup popup, LocalDate date) {
        MetricDailyPopup m = new MetricDailyPopup();
        // 같은 클래스 내부이므로 private 필드에 직접 접근 가능
        m.popup = popup;
        m.date = date;
        m.views = 0;      // Integer 타입이므로 0 (long 리터럴 0L 금지)
        return m;
    }

    public void increaseViews(int delta) {
        if (this.views == null) this.views = 0;
        this.views += delta;   // views가 Integer이므로 delta도 int로
    }
}

