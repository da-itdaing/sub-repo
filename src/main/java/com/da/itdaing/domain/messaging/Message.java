package com.da.itdaing.domain.messaging;

import com.da.itdaing.domain.user.entity.Users;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 메시지 (1:1 메시지)
 */
@Entity
@Table(
    name = "message",
    indexes = @Index(name = "idx_msg_inbox", columnList = "receiver_id, read_at")
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private Users sender;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_id", nullable = false)
    private Users receiver;

    @Column(name = "title", length = 200, nullable = false)
    private String title;

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Column(name = "sent_at", nullable = false)
    private LocalDateTime sentAt = LocalDateTime.now();

    @Column(name = "read_at")
    private LocalDateTime readAt;

    @Builder
    public Message(Users sender, Users receiver, String title, String content, LocalDateTime sentAt, LocalDateTime readAt) {
        this.sender = sender;
        this.receiver = receiver;
        this.title = title;
        this.content = content;
        this.sentAt = sentAt != null ? sentAt : LocalDateTime.now();
        this.readAt = readAt;
    }
}

