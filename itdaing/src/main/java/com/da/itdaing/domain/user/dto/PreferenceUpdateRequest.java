package com.da.itdaing.domain.user.dto;

import java.util.List;

public record PreferenceUpdateRequest(
    List<Long> interestCategoryIds,
    List<Long> styleIds,
    List<Long> regionIds,
    List<Long> featureIds
) {}
