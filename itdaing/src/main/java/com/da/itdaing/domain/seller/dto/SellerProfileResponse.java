// src/main/java/com/da/itdaing/domain/seller/dto/SellerProfileResponse.java
package com.da.itdaing.domain.seller.dto;

import com.da.itdaing.domain.file.dto.ImagePayload;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SellerProfileResponse {

    @Schema(description = "사용자 ID")
    private Long userId;

    private boolean exists;

    @Schema(description = "프로필 이미지 정보")
    private ImagePayload profileImage;

    @Schema(description = "소개")
    private String introduction;

    @Schema(description = "활동 지역")
    private String activityRegion;

    @Schema(description = "SNS URL")
    private String snsUrl;

    @Schema(description = "email")
    private String email;
}
