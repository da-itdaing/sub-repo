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
    @Operation(
        summary = "구역 생성 (관리자 전용)",
        description = """
            새로운 지리적 구역(ZoneArea)을 생성합니다.
            
            구역은 팝업스토어가 운영될 수 있는 지리적 영역을 나타내며, 다음 정보를 포함합니다:
            - name: 구역명 (예: "광주 남구 센터")
            - regionId: 마스터 데이터의 지역 ID 참조
            - address: 주소 (예: "광주광역시 남구 봉선로 123")
            - latitude, longitude: 중심 좌표
            - geojson: GeoJSON 형식의 경계 데이터 (MultiPolygon)
            
            권한: ADMIN 역할 필요
            """
    )
    @PostMapping
    public ApiResponse<AreaResponse> createArea(@RequestBody CreateAreaRequest req) {
        return ApiResponse.success(areaService.createArea(req));
    }

    @Operation(
        summary = "구역 목록 조회",
        description = """
            등록된 구역 목록을 조회합니다.
            
            검색 기능:
            - keyword: 구역명 또는 주소로 검색 (부분 일치)
            - 페이지네이션 지원 (page, size)
            
            반환되는 구역은 모든 상태의 구역을 포함하며,
            각 구역에는 다음 정보가 포함됩니다:
            - 기본 정보 (ID, 이름, 주소, 좌표)
            - 지역 정보 (regionId, regionName)
            - 존 수 (totalZones, activeZones)
            - 셀 수 (totalCells, availableCells)
            
            권한: 누구나 접근 가능 (공개 API)
            """,
        security = {}
    )
    @GetMapping
    public ApiResponse<AreaListResponse> listAreas(@RequestParam(required = false) String keyword,
                                                   @RequestParam(defaultValue = "0") int page,
                                                   @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.success(areaService.listAreas(keyword, page, size));
    }

    @Operation(
        summary = "구역 상세 조회",
        description = """
            특정 구역의 상세 정보를 조회합니다.
            
            반환되는 정보:
            - 구역 기본 정보 (ID, 이름, 주소, 좌표)
            - 지역 정보
            - GeoJSON 경계 데이터
            - 포함된 존 목록
            - 포함된 셀 목록
            - 통계 정보 (총 존 수, 활성 존 수, 총 셀 수, 사용 가능한 셀 수)
            
            권한: 누구나 접근 가능 (공개 API)
            """,
        security = {}
    )
    @GetMapping("/{id}")
    public ApiResponse<AreaResponse> getArea(@PathVariable Long id) {
        return ApiResponse.success(areaService.getArea(id));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
        summary = "구역 수정 (관리자 전용)",
        description = """
            기존 구역의 정보를 수정합니다.
            
            수정 가능한 정보:
            - name: 구역명
            - address: 주소
            - latitude, longitude: 중심 좌표
            - geojson: GeoJSON 형식의 경계 데이터
            - regionId: 소속 지역 변경
            
            주의: 구역에 활성화된 존이 있는 경우 일부 정보는 수정이 제한될 수 있습니다.
            권한: ADMIN 역할 필요
            """
    )
    @PutMapping("/{id}")
    public ApiResponse<AreaResponse> updateArea(@PathVariable Long id,
                                                 @RequestBody UpdateAreaRequest req) {
        return ApiResponse.success(areaService.updateArea(id, req));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
        summary = "구역 삭제 (관리자 전용)",
        description = """
            구역을 삭제합니다.
            
            삭제 조건:
            - 구역에 존이 없어야 합니다
            - 구역에 셀이 없어야 합니다
            
            조건을 만족하지 않으면 삭제가 거부됩니다.
            권한: ADMIN 역할 필요
            """
    )
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteArea(@PathVariable Long id) {
        areaService.deleteArea(id);
        return ApiResponse.success(null);
    }
}
