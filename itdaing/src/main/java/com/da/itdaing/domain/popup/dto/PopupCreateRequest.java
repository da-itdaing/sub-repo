package com.da.itdaing.domain.popup.dto;

import com.da.itdaing.domain.file.dto.ImagePayload;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;
import java.util.Objects;

public record PopupCreateRequest(
    @NotBlank(message = "팝업 제목은 필수입니다.")
    String title,
    @Size(max = 3000, message = "설명은 3000자를 초과할 수 없습니다.")
    String description,
    @JsonFormat(pattern = "yyyy-MM-dd")
    LocalDate startDate,
    @JsonFormat(pattern = "yyyy-MM-dd")
    LocalDate endDate,
    String operatingTime,
    @NotNull(message = "셀 ID는 필수입니다.")
    Long zoneCellId,
    List<Long> categoryIds,
    List<Long> targetCategoryIds,
    List<Long> featureIds,
    List<Long> styleIds,
    ImagePayload thumbnailImage,
    List<ImagePayload> images
) {
    public PopupCreateRequest {
        Objects.requireNonNull(title, "팝업 제목은 필수입니다.");
        Objects.requireNonNull(zoneCellId, "셀 ID는 필수입니다.");
        categoryIds = sanitise(categoryIds);
        targetCategoryIds = sanitise(targetCategoryIds);
        featureIds = sanitise(featureIds);
        styleIds = sanitise(styleIds);
        images = sanitise(images);
    }

    private static <T> List<T> sanitise(List<T> source) {
        return source == null ? List.of() : List.copyOf(source);
    }
}
