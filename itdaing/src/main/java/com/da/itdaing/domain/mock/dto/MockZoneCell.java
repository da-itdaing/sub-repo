package com.da.itdaing.domain.mock.dto;

import java.util.List;

public record MockZoneCell(
    long id,
    String label,
    double lat,
    double lng,
    Integer maxCapacity,
    String status,
    List<Integer> features,
    String notice,
    Long reservedBy
) {
}

