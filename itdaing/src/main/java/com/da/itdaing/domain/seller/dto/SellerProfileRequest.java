package com.da.itdaing.domain.seller.dto;

import com.da.itdaing.domain.file.dto.ImagePayload;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SellerProfileRequest {

    @Schema(description = "프로필 이미지 정보")
    private ImagePayload profileImage;

    @Schema(description = "소개글", maxLength = 1000, example = "안녕하세요! 팝업 운영자입니다.")
    @Size(max = 1000)
    private String introduction;

    @Schema(description = "활동 지역", maxLength = 255, example = "광주 남구")
    @Size(max = 255)
    private String activityRegion;

    @Schema(description = "SNS URL", maxLength = 512, example = "https://instagram.com/itdaing")
    @Size(max = 512)
    private String snsUrl;
}
