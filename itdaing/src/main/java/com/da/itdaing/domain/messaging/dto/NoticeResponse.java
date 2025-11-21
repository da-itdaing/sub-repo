// src/main/java/com/da/itdaing/domain/messaging/dto/NoticeResponse.java
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
    private String title;
    private String content;
    private LocalDateTime createdAt;

    public static NoticeResponse from(Announcement announcement) {
        return NoticeResponse.builder()
            .id(announcement.getId())
            .popupId(announcement.getPopup().getId())
            .title(announcement.getTitle())
            .content(announcement.getContent())
            .createdAt(announcement.getCreatedAt())
            .build();
    }
}
