package com.da.itdaing.domain.popup.dto;

import java.util.List;

public record PopupReviewSummaryResponse(
    double average,
    int total,
    List<Integer> distribution
) {
}

