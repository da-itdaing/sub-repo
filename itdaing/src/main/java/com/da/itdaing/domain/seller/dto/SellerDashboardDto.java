package com.da.itdaing.domain.seller.dto;

import java.time.LocalDate;
import java.util.List;
import lombok.Builder;

public final class SellerDashboardDto {

    private SellerDashboardDto() {
    }

    @Builder
    public record DashboardResponse(
        SellerProfile profile,
        DashboardStats stats,
        List<PopupSummary> popups
    ) {
    }

    @Builder
    public record SellerProfile(
        Long userId,
        String name,
        String email,
        String introduction,
        String activityRegion,
        String snsUrl,
        String category,
        String phone,
        String profileImageUrl,
        boolean profileExists
    ) {
    }

    @Builder
    public record DashboardStats(
        long totalPopups,
        long activePopups,
        long pendingPopups,
        long rejectedPopups,
        long totalViews,
        long totalFavorites
    ) {
    }

    @Builder
    public record PopupSummary(
        Long id,
        String title,
        String status,
        LocalDate startDate,
        LocalDate endDate,
        String cellName,
        long viewCount,
        long favoriteCount,
        String thumbnailUrl
    ) {
    }
}
