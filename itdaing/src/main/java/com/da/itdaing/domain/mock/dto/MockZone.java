package com.da.itdaing.domain.mock.dto;

import java.util.List;

public record MockZone(
    long id,
    String name,
    int regionId,
    String status,
    Integer maxCapacity,
    String notice,
    MockZoneGeometry geometry,
    List<MockZoneCell> cells
) {
}

