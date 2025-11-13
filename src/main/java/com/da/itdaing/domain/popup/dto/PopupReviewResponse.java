package com.da.itdaing.domain.popup.dto;

import java.util.List;

public record PopupReviewResponse(
    Long id,
    Long popupId,
    PopupReviewAuthorResponse author,
    int rating,
    String date,
    String content,
    List<String> images
) {
}

