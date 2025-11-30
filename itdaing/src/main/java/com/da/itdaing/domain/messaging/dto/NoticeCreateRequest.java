package com.da.itdaing.domain.messaging.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NoticeCreateRequest {

    private Long popupId;  // null이면 전체 공지

    private String audience;  // ALL, SELLER, CONSUMER

    @NotBlank
    private String title;

    private String content;
}
