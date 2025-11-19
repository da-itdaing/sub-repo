package com.da.itdaing.domain.mock.dto;

import java.util.List;

public record MockConsumerProfile(
    String userType,
    String username,
    String name,
    String nickname,
    String email,
    String ageGroup,
    String mbti,
    List<String> interests,
    List<String> moods,
    List<String> regions,
    List<String> conveniences,
    List<Integer> favorites,
    List<Integer> recentViewed,
    List<Integer> recommendations
) {
}

