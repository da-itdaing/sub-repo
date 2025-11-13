package com.da.itdaing.domain.popup.entity;

import com.da.itdaing.domain.master.entity.Feature;
import jakarta.persistence.*;
        import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 팝업-특징 연결 (M:N 조인 테이블)
 */
@Entity
@Table(
        name = "popup_feature",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_popup_feature",
                columnNames = {"popup_id", "feature_id"}
        )
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PopupFeature {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "popup_id", nullable = false)
    private Popup popup;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "feature_id", nullable = false)
    private Feature feature;

    @Builder
    public PopupFeature(Popup popup, Feature feature) {
        this.popup = popup;
        this.feature = feature;
    }
}
