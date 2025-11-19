package com.da.itdaing.domain.social.entity;

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
 * 위시리스트 (찜)
 */
@Entity
@Table(
    name = "wishlist",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_wishlist",
        columnNames = {"user_id", "popup_id"}
    )
)
@EntityListeners(AuditingEntityListener.class)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Wishlist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "popup_id", nullable = false)
    private Popup popup;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public Wishlist(Users user, Popup popup) {
        this.user = user;
        this.popup = popup;
    }
}
