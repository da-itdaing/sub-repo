package com.da.itdaing.domain.social.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.Objects;

public record ReviewUpdateRequest(
    @NotNull(message = "평점은 필수입니다.")
    @Min(value = 1, message = "평점은 1 이상이어야 합니다.")
    @Max(value = 5, message = "평점은 5 이하여야 합니다.")
    Byte rating,
    @Size(max = 150, message = "리뷰 내용은 150자를 초과할 수 없습니다.")
    String content,
    List<String> imageUrls
) {
    public ReviewUpdateRequest {
        Objects.requireNonNull(rating, "평점은 필수입니다.");
        imageUrls = sanitise(imageUrls);
    }

    private static <T> List<T> sanitise(List<T> source) {
        return source == null ? List.of() : List.copyOf(source);
    }
}

