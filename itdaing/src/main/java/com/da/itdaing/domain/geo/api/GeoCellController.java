// src/main/java/com/da/itdaing/domain/geo/api/GeoCellController.java
package com.da.itdaing.domain.geo.api;

import com.da.itdaing.domain.common.enums.ZoneStatus;
import com.da.itdaing.domain.geo.dto.GeoDtos.*;
import com.da.itdaing.domain.geo.service.GeoCellService;
import com.da.itdaing.global.web.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/geo/cells")
@RequiredArgsConstructor
@Tag(name = "Geo Cell (Admin)")
public class GeoCellController {

    private final GeoCellService cellService;

    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "셀 생성 (관리자)")
    @PostMapping
    public ApiResponse<CellResponse> createCell(@RequestBody CreateCellRequest req) {
        return ApiResponse.success(cellService.createCell(req));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "셀 수정 (관리자)")
    @PutMapping("/{id}")
    public ApiResponse<CellResponse> updateCell(@PathVariable Long id,
                                                @RequestBody UpdateCellRequest req) {
        return ApiResponse.success(cellService.updateCell(id, req));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "셀 삭제 (관리자)")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteCell(@PathVariable Long id) {
        cellService.deleteCell(id);
        return ApiResponse.success(null);
    }

    @Operation(summary = "셀 목록 조회 (관리자/판매자, 필터링 지원)")
    @GetMapping
    public ApiResponse<CellListResponse> listCells(
            @RequestParam(required = false) Long areaId,
            @RequestParam(required = false) Long ownerId,
            @RequestParam(required = false) ZoneStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.success(cellService.listCells(areaId, ownerId, status, page, size));
    }

    @Operation(summary = "셀 상세 조회 (관리자/판매자)")
    @GetMapping("/{id}")
    public ApiResponse<CellResponse> getCell(@PathVariable Long id) {
        return ApiResponse.success(cellService.getCell(id));
    }
}

