package com.da.itdaing.domain.user.dto;

import java.util.List;
import lombok.Builder;

public final class UserDashboardDto {

    private UserDashboardDto() {
    }

    @Builder
    public record DashboardResponse(
        Long userId,
        String loginId,
        String name,
        String nickname,
        String email,
        String role,
        String profileImageUrl,
        String mbti,
        List<String> interests,
        List<String> styles,
        List<String> features,
        List<String> regions,
        List<Long> favorites,
        List<Long> recommendations,
        List<Long> recentViewed,
        DashboardStats stats
    ) {
    }

    @Builder
    public record DashboardStats(
        int favoriteCount,
        int reviewCount,
        int recommendationCount
    ) {
    }
}


