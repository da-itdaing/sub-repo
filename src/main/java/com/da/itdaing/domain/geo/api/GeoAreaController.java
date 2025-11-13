// src/main/java/com/da/itdaing/domain/geo/api/GeoAreaController.java
package com.da.itdaing.domain.geo.api;

import com.da.itdaing.domain.geo.dto.GeoDtos.*;
import com.da.itdaing.domain.geo.service.GeoAreaService;
import com.da.itdaing.global.web.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/geo/areas")
@RequiredArgsConstructor
@Tag(name = "Geo Area (Admin)")
public class GeoAreaController {

    private final GeoAreaService areaService;

    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "구역 생성 (관리자)")
    @PostMapping
    public ApiResponse<AreaResponse> createArea(@RequestBody CreateAreaRequest req) {
        return ApiResponse.success(areaService.createArea(req));
    }

    @Operation(summary = "구역 목록 조회 (관리자/판매자)")
    @GetMapping
    public ApiResponse<AreaListResponse> listAreas(@RequestParam(required = false) String keyword,
                                                   @RequestParam(defaultValue = "0") int page,
                                                   @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.success(areaService.listAreas(keyword, page, size));
    }

    @Operation(summary = "구역 상세 조회 (관리자/판매자)")
    @GetMapping("/{id}")
    public ApiResponse<AreaResponse> getArea(@PathVariable Long id) {
        return ApiResponse.success(areaService.getArea(id));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "구역 수정 (관리자)")
    @PutMapping("/{id}")
    public ApiResponse<AreaResponse> updateArea(@PathVariable Long id,
                                                 @RequestBody UpdateAreaRequest req) {
        return ApiResponse.success(areaService.updateArea(id, req));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "구역 삭제 (관리자)")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteArea(@PathVariable Long id) {
        areaService.deleteArea(id);
        return ApiResponse.success(null);
    }
}
