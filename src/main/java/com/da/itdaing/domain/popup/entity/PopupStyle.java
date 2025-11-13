package com.da.itdaing.domain.popup.entity;

import com.da.itdaing.domain.master.entity.Style;
import jakarta.persistence.*;
import lombok.*;

/** 팝업 스타일 태그 (M:N) */
@Entity
@Table(
    name = "popup_style",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_popup_style",
        columnNames = {"popup_id", "style_id"}
    )
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PopupStyle {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "popup_id", nullable = false)
    private Popup popup;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "style_id", nullable = false)
    private Style style;

    @Builder
    public PopupStyle(Popup popup, Style style) {
        this.popup = popup;
        this.style = style;
    }
}
