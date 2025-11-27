package com.da.itdaing.domain.metric.dto;

import java.time.LocalDate;
import java.util.List;

public record TopPopupViewsResponse(
    LocalDate date,              // 기준 날짜(오늘)
    List<Item> topByTotal,       // 총 누적 조회수 TOP 5
    List<Item> topByToday        // 오늘 조회수 TOP 5
) {
    public record Item(
        Long popupId,
        String title,
        long totalViews,
        long todayViews
    ) {}
}
