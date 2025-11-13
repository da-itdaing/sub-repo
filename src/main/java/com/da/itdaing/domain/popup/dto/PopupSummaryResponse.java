package com.da.itdaing.domain.popup.dto;

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
    String thumbnail,
    List<String> gallery,
    PopupReviewSummaryResponse reviewSummary,
    String createdAt,
    String updatedAt
) {
}

