package com.da.itdaing.domain.metric.entity;

import com.da.itdaing.domain.master.entity.Category;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * 카테고리별 일일 메트릭
 * - 일별 카테고리 클릭 수 집계
 */
@Entity
@Table(
    name = "metric_daily_category",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_mdc_cat_date",
        columnNames = {"category_id", "date"}
    )
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MetricDailyCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Column(name = "clicks", nullable = false)
    private Integer clicks = 0;

    @Builder
    public MetricDailyCategory(Category category, LocalDate date, Integer clicks) {
        this.category = category;
        this.date = date;
        this.clicks = clicks != null ? clicks : 0;
    }
}

