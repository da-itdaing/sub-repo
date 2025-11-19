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
    @Operation(
        summary = "셀 생성 (관리자 전용)",
        description = """
            새로운 팝업 운영 셀을 생성합니다.
            
            셀(Cell)은 존(Zone) 내에서 실제 팝업스토어가 운영되는 최소 단위 공간입니다.
            
            필수 정보:
            - zoneId: 소속 존 ID
            - name: 셀 이름 (예: "A1", "B2")
            - geojson: GeoJSON 형식의 셀 경계 (Polygon 또는 MultiPolygon)
            - latitude, longitude: 셀 중심 좌표
            - capacity: 수용 인원
            - area: 면적 (제곱미터)
            
            생성된 셀은 자동으로 AVAILABLE 상태로 설정됩니다.
            권한: ADMIN 역할 필요
            """
    )
    @PostMapping
    public ApiResponse<CellResponse> createCell(@RequestBody CreateCellRequest req) {
        return ApiResponse.success(cellService.createCell(req));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
        summary = "셀 수정 (관리자 전용)",
        description = """
            기존 셀의 정보를 수정합니다.
            
            수정 가능한 정보:
            - name: 셀 이름
            - geojson: 경계 데이터
            - latitude, longitude: 중심 좌표
            - capacity: 수용 인원
            - area: 면적
            
            주의: 셀에 예약된 팝업이 있는 경우 위치나 크기 변경은 신중해야 합니다.
            권한: ADMIN 역할 필요
            """
    )
    @PutMapping("/{id}")
    public ApiResponse<CellResponse> updateCell(@PathVariable Long id,
                                                @RequestBody UpdateCellRequest req) {
        return ApiResponse.success(cellService.updateCell(id, req));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
        summary = "셀 삭제 (관리자 전용)",
        description = """
            셀을 삭제합니다.
            
            삭제 조건:
            - 셀에 예약된 팝업이 없어야 합니다
            - 셀이 활성 상태가 아니어야 합니다
            
            조건을 만족하지 않으면 삭제가 거부됩니다.
            권한: ADMIN 역할 필요
            """
    )
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteCell(@PathVariable Long id) {
        cellService.deleteCell(id);
        return ApiResponse.success(null);
    }

    @Operation(
        summary = "셀 목록 조회 (필터링 지원)",
        description = """
            셀 목록을 필터링하여 조회합니다.
            
            필터 옵션:
            - areaId: 특정 구역의 셀만 조회
            - ownerId: 특정 소유자(판매자)의 셀만 조회
            - status: 셀 상태 필터 (AVAILABLE, OCCUPIED, UNAVAILABLE)
            - page, size: 페이지네이션
            
            반환되는 정보:
            - 셀 기본 정보 (ID, 이름, 위치, 크기)
            - 소속 존 정보
            - 가용성 정보
            - 현재 예약 상태
            
            권한: 누구나 접근 가능 (공개 API)
            """,
        security = {}
    )
    @GetMapping
    public ApiResponse<CellListResponse> listCells(
            @RequestParam(required = false) Long areaId,
            @RequestParam(required = false) Long ownerId,
            @RequestParam(required = false) ZoneStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.success(cellService.listCells(areaId, ownerId, status, page, size));
    }

    @Operation(
        summary = "셀 상세 조회",
        description = """
            특정 셀의 상세 정보를 조회합니다.
            
            반환되는 정보:
            - 셀 기본 정보 (ID, 이름, 위치, 크기)
            - GeoJSON 경계 데이터
            - 소속 존 및 구역 정보
            - 가용성 정보 (시작일, 종료일, 상태)
            - 현재 예약 정보 (팝업 ID, 기간)
            - 수용 인원 및 면적
            
            권한: 누구나 접근 가능 (공개 API)
            """,
        security = {}
    )
    @GetMapping("/{id}")
    public ApiResponse<CellResponse> getCell(@PathVariable Long id) {
        return ApiResponse.success(cellService.getCell(id));
    }
}

