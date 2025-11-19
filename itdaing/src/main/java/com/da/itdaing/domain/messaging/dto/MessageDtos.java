// src/main/java/com/da/itdaing/domain/messaging/dto/MessageDtos.java
package com.da.itdaing.domain.messaging.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

public class MessageDtos {

    /* ---------- 공통 첨부 DTO ---------- */
    @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
    @Schema(description = "메시지 첨부")
    public static class AttachmentDto {
        private String url;          // 공개 URL
        private String mimeType;
        private String fileKey;      // S3/로컬 key (선택)
        private String originalName; // 원본 파일명 (선택)
        private Long sizeBytes;      // 크기 (선택)
    }

    /* ---------- 작성 ---------- */
    @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
    @Schema(description = "문의(스레드) 생성 요청")
    public static class CreateInquiryRequest {
        @NotNull private Long receiverId;              // 담당 관리자 사용자ID
        @NotBlank private String subject;
        @NotBlank private String content;
        private List<AttachmentDto> attachments;       // 업로드 선행 후 key/url 전달
    }

    @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
    public static class CreateInquiryResponse {
        private Long threadId;
        private Long messageId;
    }

    @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
    @Schema(description = "답장 요청")
    public static class ReplyRequest {
        @NotBlank private String content;
        private String title;                // 선택
        private List<AttachmentDto> attachments;
    }

    /* ---------- 조회(목록) ---------- */
    @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ThreadSummary {
        private Long threadId;
        private String subject;
        private String lastSnippet;      // 최근 메시지 일부
        private LocalDateTime updatedAt;
        private int unreadForMe;         // 나 기준 안읽음
        private ThreadParticipantSummary counterpart;
    }

    @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ThreadListResponse {
        private List<ThreadSummary> items;
        private long totalElements;
        private int totalPages;
        private int page;
        private int size;
    }

    @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ThreadParticipantSummary {
        private Long id;
        private String name;
        private String role;
    }

    /* ---------- 조회(상세) ---------- */
    @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
    public static class MessageItem {
        private Long id;
        private Long senderId;
        private Long receiverId;
        private String title;
        private String content;
        private LocalDateTime sentAt;
        private LocalDateTime readAt;
        private List<AttachmentDto> attachments;
    }

    @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ThreadDetailResponse {
        private Long threadId;
        private String subject;
        private List<MessageItem> messages;

        private int page;
        private int size;
        private long totalElements;
        private int totalPages;
    }

    @Getter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class IdResponse {
        private Long id;
    }
}
