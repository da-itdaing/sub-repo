package com.da.itdaing.domain.geo.dto;

import java.util.List;

public record ZoneCellSummaryResponse(
    Long id,
    String label,
    Double lat,
    Double lng,
    Integer maxCapacity,
    String status,
    List<Integer> features,
    String notice,
    Long reservedBy
) {
}


