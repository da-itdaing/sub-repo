package com.da.itdaing.domain.seller.dto;

public record SellerSummaryResponse(
    Long id,
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

