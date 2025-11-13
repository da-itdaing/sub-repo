package com.da.itdaing.domain.popup.entity;

import com.da.itdaing.domain.master.entity.Category;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 팝업-카테고리 연결 (M:N 조인 테이블)
 * - categoryRole: POPUP(팝업 자체 카테고리) 또는 TARGET(타겟 소비자 카테고리)
 */
@Entity
@Table(
    name = "popup_category",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_popup_category",
        columnNames = {"popup_id", "category_id", "category_role"}
    )
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PopupCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "popup_id", nullable = false)
    private Popup popup;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(name = "category_role", length = 20, nullable = false)
    private String categoryRole;

    @Builder
    public PopupCategory(Popup popup, Category category, String categoryRole) {
        this.popup = popup;
        this.category = category;
        this.categoryRole = categoryRole;
    }
}
