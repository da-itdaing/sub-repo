package com.da.itdaing.domain.reco.entity;

import com.da.itdaing.domain.popup.entity.Popup;
import com.da.itdaing.domain.user.entity.Users;
import com.da.itdaing.global.jpa.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 일일 소비자 추천
 * - AI 모델이 생성한 소비자별 팝업 추천 결과
 */
@Entity
@Table(
    name = "daily_consumer_recommendation",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_dcr_dedup",
        columnNames = {"consumer_id", "recommendation_date", "popup_id"}
    )
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class DailyConsumerRecommendation extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "consumer_id", nullable = false)
    private Users consumer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "popup_id", nullable = false)
    private Popup popup;

    @Column(name = "recommendation_date", nullable = false)
    private LocalDate recommendationDate;

    @Column(name = "score", precision = 6, scale = 3, nullable = false)
    private BigDecimal score = BigDecimal.ZERO;

    @Column(name = "model_version", length = 50)
    private String modelVersion;

    @Column(name = "reason_json", columnDefinition = "TEXT")
    private String reasonJson;

    @Builder
    public DailyConsumerRecommendation(Users consumer, Popup popup, LocalDate recommendationDate,
                                       BigDecimal score, String modelVersion, String reasonJson) {
        this.consumer = consumer;
        this.popup = popup;
        this.recommendationDate = recommendationDate;
        this.score = score != null ? score : BigDecimal.ZERO;
        this.modelVersion = modelVersion;
        this.reasonJson = reasonJson;
    }
}
