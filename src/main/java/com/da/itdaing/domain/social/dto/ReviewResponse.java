package com.da.itdaing.domain.social.dto;

import java.time.LocalDateTime;
import java.util.List;

public record ReviewResponse(
    Long id,
    Long popupId,
    Long consumerId,
    String consumerName,
    Byte rating,
    String content,
    List<String> imageUrls,
    LocalDateTime createdAt
) {
}

