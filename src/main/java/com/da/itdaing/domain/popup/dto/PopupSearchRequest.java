package com.da.itdaing.domain.popup.dto;

import com.da.itdaing.domain.common.enums.ApprovalStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PopupSearchRequest {
    private String keyword;                    // 제목/설명 키워드 검색
    private Long regionId;                     // 지역 필터
    private List<Long> categoryIds;            // 카테고리 필터 (다중)
    private LocalDate startDate;               // 시작일 필터
    private LocalDate endDate;                 // 종료일 필터
    private ApprovalStatus approvalStatus;     // 승인 상태 필터
    @Builder.Default
    private int page = 0;
    @Builder.Default
    private int size = 20;
}

