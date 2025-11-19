package com.da.itdaing.domain.mock.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record MockReview(
    long id,
    long popupId,
    MockReviewAuthor author,
    int rating,
    String date,
    String content,
    List<String> images
) {
}

