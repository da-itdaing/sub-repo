// src/main/java/com/da/itdaing/domain/admin/dto/ApprovalDtos.java
package com.da.itdaing.domain.admin.dto;

import com.da.itdaing.domain.common.enums.ApprovalStatus;
import com.da.itdaing.domain.common.enums.ApprovalTargetType;
import com.da.itdaing.domain.common.enums.DecisionType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

public class ApprovalDtos {

    @Getter @Builder @AllArgsConstructor @NoArgsConstructor
    public static class ApprovalItemResponse {
        private Long id;
        private ApprovalTargetType targetType;
        private Long targetId;
        private String targetName;        // 팝업 이름 등
        private ApprovalStatus currentStatus;
        private String requesterLoginId;  // 요청자 로그인 ID
        private Long requesterId;
        private LocalDateTime requestedAt;
        private String description;       // 요청 내용 요약
    }

    @Getter @Builder @AllArgsConstructor @NoArgsConstructor
    public static class ApprovalListResponse {
        private List<ApprovalItemResponse> items;
        private long totalElements;
        private int totalPages;
        private int page;
        private int size;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    @Schema(description = "승인/거부 요청")
    public static class ApprovalDecisionRequest {
        private String reason;  // 거부 시 사유 (선택)
    }

    @Getter @Builder @AllArgsConstructor @NoArgsConstructor
    public static class ApprovalDecisionResponse {
        private Long approvalRecordId;
        private ApprovalTargetType targetType;
        private Long targetId;
        private DecisionType decision;
        private String reason;
        private LocalDateTime processedAt;
    }
}

