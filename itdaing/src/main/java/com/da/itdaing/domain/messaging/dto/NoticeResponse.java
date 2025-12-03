package com.da.itdaing.domain.messaging.dto;

import com.da.itdaing.domain.messaging.entity.Announcement;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class NoticeResponse {

    private Long id;
    private Long authorId;
    private String authorName;
    private Long popupId;
    private String popupName;
    private String audience;
    private String title;
    private String content;
    private Boolean isImportant;
    private LocalDateTime createdAt;

    public static NoticeResponse from(Announcement announcement) {
        String authorDisplayName = "관리자";
        if (announcement.getAuthor() != null) {
            if (announcement.getAuthor().getNickname() != null && !announcement.getAuthor().getNickname().isBlank()) {
                authorDisplayName = announcement.getAuthor().getNickname();
            } else if (announcement.getAuthor().getName() != null && !announcement.getAuthor().getName().isBlank()) {
                authorDisplayName = announcement.getAuthor().getName();
            } else {
                authorDisplayName = announcement.getAuthor().getLoginId();
            }
        }

        return NoticeResponse.builder()
            .id(announcement.getId())
            .authorId(announcement.getAuthor() != null ? announcement.getAuthor().getId() : null)
            .authorName(authorDisplayName)
            .popupId(announcement.getPopup() != null ? announcement.getPopup().getId() : null)
            .popupName(announcement.getPopup() != null ? announcement.getPopup().getName() : "전체")
            .audience(announcement.getAudience() != null ? announcement.getAudience().name() : "ALL")
            .title(announcement.getTitle())
            .content(announcement.getContent())
            .isImportant(announcement.getAudience() != null && 
                         announcement.getAudience().name().equals("ALL") && 
                         announcement.getPopup() == null)
            .createdAt(announcement.getCreatedAt())
            .build();
    }
}
