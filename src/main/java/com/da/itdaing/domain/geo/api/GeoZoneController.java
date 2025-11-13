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

    @PreAuthorize("hasRole('SELLER')")
    @Operation(summary = "존 생성 (판매자)")
    @PostMapping
    public ApiResponse<ZoneResponse> createZone(Principal principal,
                                                @RequestBody CreateZoneRequest req) {
        Long sellerId = Long.valueOf(principal.getName()); // 기존 패턴 유지
        return ApiResponse.success(zoneService.createZone(sellerId, req));
    }

    @PreAuthorize("hasRole('SELLER')")
    @Operation(summary = "내가 만든 존 목록 (판매자)")
    @GetMapping("/me")
    public ApiResponse<ZoneListResponse> listMyZones(Principal principal,
                                                     @RequestParam(defaultValue = "0") int page,
                                                     @RequestParam(defaultValue = "20") int size) {
        Long sellerId = Long.valueOf(principal.getName());
        return ApiResponse.success(zoneService.listMyZones(sellerId, page, size));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "특정 구역의 존 목록 (관리자)")
    @GetMapping
    public ApiResponse<ZoneListResponse> listZonesByArea(
        @RequestParam Long areaId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        return ApiResponse.success(zoneService.listZonesByArea(areaId, page, size));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "존 상태 변경 (관리자)")
    @PatchMapping("/{zoneId}/status")
    public ApiResponse<Void> changeZoneStatus(@PathVariable Long zoneId,
                                              @RequestBody UpdateZoneStatusRequest req) {
        zoneService.changeZoneStatus(zoneId, req.getStatus() != null ? req.getStatus() : ZoneStatus.APPROVED);
        return ApiResponse.success(null);
    }
}
