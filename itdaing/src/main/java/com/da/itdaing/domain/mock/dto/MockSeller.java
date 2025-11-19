package com.da.itdaing.domain.mock.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record MockSeller(
    long id,
    String name,
    String description,
    String profileImage,
    String mainArea,
    String sns,
    String email,
    String category,
    String phone
) {
}

