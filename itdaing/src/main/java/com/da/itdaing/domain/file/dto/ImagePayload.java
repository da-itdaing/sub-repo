package com.da.itdaing.domain.file.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

/**
 * 간단한 이미지 메타데이터(업로드 결과를 다른 도메인에 전달할 때 사용)
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
@Builder
public record ImagePayload(
    @Schema(description = "공개 접근 URL", example = "https://daitdaing-static-files.s3.ap-northeast-2.amazonaws.com/uploads/sample.png")
    @NotBlank(message = "이미지 URL은 필수입니다.")
    String url,

    @Schema(description = "저장소의 원본 key (S3 object key 등)", example = "uploads/sample.png")
    String key
) {
    public ImagePayload {
        if (url != null) {
            url = url.trim();
        }
        if (key != null) {
            key = key.trim();
            if (key.isEmpty()) {
                key = null;
            }
        }
    }
}

