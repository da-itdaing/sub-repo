package com.da.itdaing.domain.geo.dto;

import java.util.List;

public record ZoneSummaryResponse(
    Long id,
    String name,
    Long regionId,
    String status,
    Integer maxCapacity,
    String notice,
    String geometry,
    List<ZoneCellSummaryResponse> cells
) {
}


