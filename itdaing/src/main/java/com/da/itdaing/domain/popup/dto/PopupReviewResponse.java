package com.da.itdaing.domain.popup.dto;

import com.da.itdaing.domain.file.dto.ImagePayload;
import java.util.List;

public record PopupReviewResponse(
    Long id,
    Long popupId,
    PopupReviewAuthorResponse author,
    int rating,
    String date,
    String content,
    List<ImagePayload> images
) {
}

