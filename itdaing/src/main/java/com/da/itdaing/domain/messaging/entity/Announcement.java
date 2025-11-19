package com.da.itdaing.domain.messaging.entity;

import com.da.itdaing.domain.common.enums.AnnouncementAudience;
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
 * 공지사항
 * - popupId가 null이면 일반 공지, 있으면 특정 팝업 관련 고객 공지
 */
@Entity
@Table(
    name = "announcement",
    indexes = @Index(name = "idx_announce_scope", columnList = "audience, popup_id, created_at")
)
@EntityListeners(AuditingEntityListener.class)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Announcement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private Users author;

    @Enumerated(EnumType.STRING)
    @Column(name = "audience", length = 20, nullable = false)
    private AnnouncementAudience audience;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "popup_id")
    private Popup popup;

    @Column(name = "title", length = 200, nullable = false)
    private String title;

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public Announcement(Users author, AnnouncementAudience audience, Popup popup, String title, String content) {
        this.author = author;
        this.audience = audience;
        this.popup = popup;
        this.title = title;
        this.content = content;
    }
}

