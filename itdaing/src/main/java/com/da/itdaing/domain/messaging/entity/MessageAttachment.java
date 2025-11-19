package com.da.itdaing.domain.messaging.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 메시지 첨부파일
 */
@Entity
@Table(name = "message_attachment")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MessageAttachment {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "message_id", nullable = false)
    private Message message;

    // 기존
    @Column(name = "file_url", length = 500, nullable = false)
    private String fileUrl;

    @Column(name = "mime_type", length = 100)
    private String mimeType;

    @Column(name = "file_key", length = 500)    private String fileKey;       // S3/local key
    @Column(name = "original_name", length = 255) private String originalName;
    @Column(name = "size_bytes")                  private Long sizeBytes;

    @Builder
    public MessageAttachment(Message message, String fileUrl, String mimeType,
                             String fileKey, String originalName, Long sizeBytes) {
        this.message = message;
        this.fileUrl = fileUrl;
        this.mimeType = mimeType;
        this.fileKey = fileKey;
        this.originalName = originalName;
        this.sizeBytes = sizeBytes;
    }
}

