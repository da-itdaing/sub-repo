package com.da.itdaing.domain.geo.dto;

import java.util.List;

/**
 * 존(Zone) 요약 정보 응답 DTO
 * 
 * 팝업 등록 시 존 선택 화면에서 사용됩니다.
 * 상권 정보(commercialInfo)를 포함하여 판매자가 존 선택 시 참고할 수 있습니다.
 */
public record ZoneSummaryResponse(
    Long id,
    String name,
    Long regionId,
    String status,
    Integer maxCapacity,
    String notice,
    String geometry,
    List<ZoneCellSummaryResponse> cells,
    ZoneCommercialInfoResponse commercialInfo  // 상권 정보 추가
) {
    
    /**
     * 상권 정보 없이 생성 (하위 호환성 유지)
     */
    public ZoneSummaryResponse(Long id, String name, Long regionId, String status,
                               Integer maxCapacity, String notice, String geometry,
                               List<ZoneCellSummaryResponse> cells) {
        this(id, name, regionId, status, maxCapacity, notice, geometry, cells, null);
    }
}


