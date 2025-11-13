package com.da.itdaing.domain.mock.dto;

import java.util.List;

public record MockPopupReviewSummary(
    double average,
    int total,
    List<Integer> distribution
) {
}

