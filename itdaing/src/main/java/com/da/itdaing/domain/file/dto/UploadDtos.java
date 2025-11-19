// src/main/java/com/da/itdaing/domain/file/dto/UploadDtos.java
package com.da.itdaing.domain.file.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.util.List;

public class UploadDtos {

    @Getter @Builder @NoArgsConstructor @AllArgsConstructor
    @Schema(description = "단일 업로드 응답")
    public static class UploadImageResponse {
        private String id;              // 필요 없으면 null로 둬도 OK (하위호환)
        private String key;             // ✅ 저장소상의 식별자(로컬=상대경로, S3=key)
        private String url;             // 공개 접근 URL(로컬=정적서빙, S3/CloudFront)
        private String originalName;
        private String contentType;
        private long size;
        private Integer width;          // 있으면 세팅, 아니면 null
        private Integer height;         // 있으면 세팅, 아니면 null
    }

    @Getter @Builder @NoArgsConstructor @AllArgsConstructor
    @Schema(description = "복수 업로드 응답")
    public static class UploadImagesResponse {
        private List<UploadImageResponse> files;
    }
}
