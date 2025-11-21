// src/main/java/com/da/itdaing/domain/reco/dto/RecoPopupCardResponse.java
package com.da.itdaing.domain.reco.dto;

import com.da.itdaing.domain.file.dto.ImagePayload;

public record RecoPopupCardResponse(
    Long id,              // 팝업 ID
    String title,         // 팝업 이름
    String description,   // 한 줄 소개 / 설명
    String startDate,     // 시작일 (yyyy-MM-dd 문자열)
    String endDate,       // 종료일
    String locationName,  // 위치(구/동, 상권 이름 등)
    ImagePayload thumbnail, // 썸네일 (지금은 null 내려가도 괜찮음)
    Long favoriteCount    // 좋아요 수
) {
}
