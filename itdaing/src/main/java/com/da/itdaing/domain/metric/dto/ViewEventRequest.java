// ViewEventRequest.java
package com.da.itdaing.domain.metric.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ViewEventRequest(
    @NotNull Long popupId,
    @Size(max = 100) String source,      // page/section 등
    @Size(max = 64)  String sessionId    // 선택: 클라이언트 세션 식별용
) {}
