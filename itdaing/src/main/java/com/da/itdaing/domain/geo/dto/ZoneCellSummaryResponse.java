package com.da.itdaing.domain.geo.dto;

import java.util.List;

public record ZoneCellSummaryResponse(
    Long id,
    String label,
    String geometry,
    Integer maxCapacity,
    String status,
    List<Integer> features,
    String notice,
    Long reservedBy
) {
}


