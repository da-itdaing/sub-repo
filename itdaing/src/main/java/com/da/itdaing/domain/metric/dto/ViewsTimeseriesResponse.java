// ViewsTimeseriesResponse.java
package com.da.itdaing.domain.metric.dto;

import java.time.LocalDate;
import java.util.List;

public record ViewsTimeseriesResponse(
    Long popupId,
    String granularity,   // "daily" | "total"
    LocalDate from,
    LocalDate to,
    List<Point> series,   // daily일 때만 채움
    long total            // total 합계(둘 다에서 리턴)
) {
    public record Point(LocalDate date, long views) {}
}
