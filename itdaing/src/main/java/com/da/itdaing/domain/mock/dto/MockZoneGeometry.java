package com.da.itdaing.domain.mock.dto;

import java.util.List;

public record MockZoneGeometry(
    String type,
    List<List<List<Double>>> coordinates
) {
}

