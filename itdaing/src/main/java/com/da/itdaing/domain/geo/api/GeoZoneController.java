// src/main/java/com/da/itdaing/domain/geo/api/GeoZoneController.java
package com.da.itdaing.domain.geo.api;

import com.da.itdaing.domain.common.enums.ZoneStatus;
import com.da.itdaing.domain.geo.dto.GeoDtos.*;
import com.da.itdaing.domain.geo.service.GeoZoneService;
import com.da.itdaing.global.web.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/geo/zones")
@RequiredArgsConstructor
@Tag(name = "Geo Zone (Seller/Admin)")
public class GeoZoneController {

    private final GeoZoneService zoneService;

    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
        summary = "존 생성 (관리자 전용)",
        description = """
            새로운 존(Zone)을 생성합니다.
            
            존은 판매자에게 할당된 팝업 운영 공간의 묶음으로, 여러 개의 셀을 포함합니다.
            
            필수 정보:
            - areaId: 소속 구역 ID
            - ownerId: 소유자(판매자) ID (필수)
            - name: 존 이름
            - description: 존 설명
            - startDate: 운영 시작일
            - endDate: 운영 종료일
            
            생성 후 자동으로 PENDING 상태로 설정되며,
            관리자의 승인을 거쳐 APPROVED 상태가 되어야 사용할 수 있습니다.
            
            권한: ADMIN 역할 필요
            """
    )
    @PostMapping
    public ApiResponse<ZoneResponse> createZone(@RequestBody CreateZoneRequest req) {
        // 관리자가 판매자 ID를 요청 본문에서 받아서 Zone 생성
        if (req.getOwnerId() == null) {
            throw new IllegalArgumentException("소유자 ID(ownerId)는 필수입니다.");
        }
        return ApiResponse.success(zoneService.createZone(req.getOwnerId(), req));
    }

    @PreAuthorize("hasRole('SELLER')")
    @Operation(
        summary = "내가 소유한 존 목록 조회 (판매자 전용)",
        description = """
            인증된 판매자가 소유한 존 목록을 조회합니다.
            
            반환되는 정보:
            - 존 기본 정보 (ID, 이름, 설명)
            - 운영 기간 (시작일, 종료일)
            - 상태 (PENDING, APPROVED, REJECTED)
            - 소속 구역 정보
            - 포함된 셀 목록
            - 통계 (총 셀 수, 사용 중인 셀 수, 사용 가능한 셀 수)
            
            페이지네이션 지원 (page, size)
            권한: SELLER 역할 필요
            """
    )
    @GetMapping("/me")
    public ApiResponse<ZoneListResponse> listMyZones(Principal principal,
                                                     @RequestParam(defaultValue = "0") int page,
                                                     @RequestParam(defaultValue = "20") int size) {
        Long sellerId = Long.valueOf(principal.getName());
        return ApiResponse.success(zoneService.listMyZones(sellerId, page, size));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
        summary = "구역별 존 목록 조회 (관리자 전용)",
        description = """
            특정 구역에 속한 모든 존 목록을 조회합니다.
            
            쿼리 파라미터:
            - areaId: 구역 ID (필수)
            - page, size: 페이지네이션
            
            반환되는 정보:
            - 존 기본 정보
            - 소유자 정보
            - 운영 기간
            - 승인 상태
            - 포함된 셀 통계
            
            관리자가 특정 구역의 모든 존을 관리하기 위해 사용합니다.
            권한: ADMIN 역할 필요
            """
    )
    @GetMapping
    public ApiResponse<ZoneListResponse> listZonesByArea(
        @RequestParam Long areaId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        return ApiResponse.success(zoneService.listZonesByArea(areaId, page, size));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
        summary = "존 상태 변경 (관리자 전용)",
        description = """
            존의 승인 상태를 변경합니다.
            
            가능한 상태:
            - PENDING: 승인 대기 (기본값)
            - APPROVED: 승인됨 (사용 가능)
            - REJECTED: 거부됨
            
            상태 변경 시나리오:
            1. PENDING → APPROVED: 판매자가 존을 사용할 수 있게 됨
            2. PENDING → REJECTED: 판매자의 요청 거부
            3. APPROVED → REJECTED: 운영 중단
            
            APPROVED 상태에서만 셀을 생성하고 팝업을 등록할 수 있습니다.
            권한: ADMIN 역할 필요
            """
    )
    @PatchMapping("/{zoneId}/status")
    public ApiResponse<Void> changeZoneStatus(@PathVariable Long zoneId,
                                              @RequestBody UpdateZoneStatusRequest req) {
        zoneService.changeZoneStatus(zoneId, req.getStatus() != null ? req.getStatus() : ZoneStatus.APPROVED);
        return ApiResponse.success(null);
    }
}
