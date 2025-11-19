package com.da.itdaing.domain.popup.dto;

import com.da.itdaing.domain.file.dto.ImagePayload;
import java.util.List;

public record PopupSummaryResponse(
    Long id,
    String title,
    Long sellerId,
    String sellerName,
    Long zoneId,
    Long cellId,
    String cellName,
    String locationName,
    String address,
    Double latitude,
    Double longitude,
    String status,
    String startDate,
    String endDate,
    String hours,
    List<PopupOperatingHourResponse> operatingHours,
    String description,
    Long viewCount,
    Long favoriteCount,
    List<Long> categoryIds,
    List<Long> featureIds,
    List<String> styleTags,
    ImagePayload thumbnail,
    List<ImagePayload> gallery,
    PopupReviewSummaryResponse reviewSummary,
    String createdAt,
    String updatedAt
) {
}

