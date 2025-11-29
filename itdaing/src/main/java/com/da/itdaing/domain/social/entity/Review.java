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
import java.util.ArrayList;
import java.util.List;

/**
 * 리뷰
 */
@Entity
@Table(
    name = "review",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_review_once",
        columnNames = {"consumer_id", "popup_id"}
    ),
    indexes = {
        @Index(name = "idx_review_popup", columnList = "popup_id"),
        @Index(name = "idx_review_consumer", columnList = "consumer_id"),
        @Index(name = "idx_review_sort", columnList = "popup_id, rating, created_at")
    }
)
@EntityListeners(AuditingEntityListener.class)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "consumer_id", nullable = false)
    private Users consumer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "popup_id", nullable = false)
    private Popup popup;

    @Column(name = "rating", nullable = false)
    private Byte rating;

    @Column(name = "content", length = 150)
    private String content;

    @ElementCollection
    @CollectionTable(
        name = "review_keyword",
        joinColumns = @JoinColumn(name = "review_id")
    )
    @Column(name = "keyword", length = 50)
    private List<String> keywords = new ArrayList<>();

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public Review(Users consumer,
                  Popup popup,
                  Byte rating,
                  String content,
                  List<String> keywords) {
        this.consumer = consumer;
        this.popup = popup;
        this.rating = rating;
        this.content = content;
        if (keywords != null) {
            this.keywords.addAll(keywords);
        }
    }

    public void update(Byte rating, String content, List<String> keywords) {
        this.rating = rating;
        this.content = content;
        this.keywords.clear();
        if (keywords != null) {
            this.keywords.addAll(keywords);
        }
    }
}

