package com.da.itdaing.domain.mock.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record MockPopup(
    long id,
    String title,
    long sellerId,
    long zoneId,
    long cellId,
    String cellName,
    String locationName,
    String address,
    String hours,
    List<Integer> categoryIds,
    List<Integer> featureIds,
    List<String> styleTags,
    String thumbnail,
    List<String> gallery,
    String status,
    String startDate,
    String endDate,
    List<MockPopupOperatingHour> operatingHours,
    String description,
    int viewCount,
    int favoriteCount,
    MockPopupReviewSummary reviewSummary,
    String createdAt,
    String updatedAt
) {
}

