// src/main/java/com/da/itdaing/domain/messaging/dto/NoticeCreateRequest.java
package com.da.itdaing.domain.messaging.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NoticeCreateRequest {

    @NotNull
    private Long popupId;

    @NotBlank
    private String title;

    @NotBlank
    private String content;
}
