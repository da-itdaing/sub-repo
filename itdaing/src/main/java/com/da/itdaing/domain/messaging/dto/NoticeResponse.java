package com.da.itdaing.domain.messaging.dto;

import com.da.itdaing.domain.messaging.entity.Announcement;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class NoticeResponse {

    private Long id;
    private Long popupId;
    private String popupName;
    private String audience;
    private String title;
    private String content;
    private Boolean isImportant;
    private LocalDateTime createdAt;

    public static NoticeResponse from(Announcement announcement) {
        return NoticeResponse.builder()
            .id(announcement.getId())
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
