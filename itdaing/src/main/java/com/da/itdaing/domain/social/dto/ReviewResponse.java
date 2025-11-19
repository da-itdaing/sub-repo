package com.da.itdaing.domain.social.dto;

import com.da.itdaing.domain.file.dto.ImagePayload;
import java.time.LocalDateTime;
import java.util.List;

public record ReviewResponse(
    Long id,
    Long popupId,
    Long consumerId,
    String consumerName,
    Byte rating,
    String content,
    List<ImagePayload> images,
    LocalDateTime createdAt
) {
}

