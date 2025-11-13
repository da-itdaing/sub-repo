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
@PreAuthorize("hasRole('ADMIN')")
public class GeoAreaController {

    private final GeoAreaService areaService;

    @Operation(summary = "구역 생성 (관리자)")
    @PostMapping
    public ApiResponse<AreaResponse> createArea(@RequestBody CreateAreaRequest req) {
        return ApiResponse.success(areaService.createArea(req));
    }

    @Operation(summary = "구역 목록 조회 (관리자)")
    @GetMapping
    public ApiResponse<AreaListResponse> listAreas(@RequestParam(required = false) String keyword,
                                                   @RequestParam(defaultValue = "0") int page,
                                                   @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.success(areaService.listAreas(keyword, page, size));
    }
}
