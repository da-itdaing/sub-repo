package com.da.itdaing.domain.geo.api;

import com.da.itdaing.domain.geo.dto.ZoneSummaryResponse;
import com.da.itdaing.domain.geo.service.ZoneQueryService;
import com.da.itdaing.global.web.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 존(Zone) 조회 API 컨트롤러
 * 
 * 팝업스토어가 위치할 수 있는 존(공간) 정보를 제공합니다.
 * 존은 특정 지역 내에서 팝업스토어를 운영할 수 있는 물리적 공간을 의미합니다.
 */
@Tag(name = "Zone", description = "존(Zone) 조회 API - 팝업스토어 공간 정보")
@RestController
@RequestMapping("/api/zones")
@RequiredArgsConstructor
public class ZoneQueryController {

    private final ZoneQueryService zoneQueryService;

    @Operation(
        summary = "전체 존 목록 조회",
        description = """
            시스템에 등록된 모든 존(Zone) 목록을 조회합니다.
            
            존은 팝업스토어를 운영할 수 있는 물리적 공간으로, 다음 정보를 포함합니다:
            - id: 존 ID
            - name: 존 이름 (예: "광주 남구 A 존")
            - address: 주소
            - regionName: 지역명
            - totalCells: 전체 셀(부스) 수
            - availableCells: 사용 가능한 셀 수
            - description: 존 설명
            - coordinates: 좌표 정보 (위도, 경도)
            
            판매자는 팝업스토어 등록 시 원하는 존과 셀을 선택할 수 있습니다.
            
            이 API는 인증이 필요하지 않으며, 모든 사용자가 접근할 수 있습니다.
            """,
        security = {}
    )
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "조회 성공",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(value = """
                    {
                        "success": true,
                        "data": [
                            {
                                "id": 1,
                                "name": "광주 남구 A 존",
                                "address": "광주광역시 남구 봉선로 123",
                                "regionName": "광주 남구",
                                "totalCells": 20,
                                "availableCells": 5,
                                "description": "남구의 중심가에 위치한 팝업 전용 공간",
                                "coordinates": {
                                    "latitude": 35.1468,
                                    "longitude": 126.9223
                                }
                            },
                            {
                                "id": 2,
                                "name": "서울 강남 B 존",
                                "address": "서울특별시 강남구 테헤란로 456",
                                "regionName": "서울 강남구",
                                "totalCells": 30,
                                "availableCells": 10,
                                "description": "강남역 인근 대형 팝업 공간",
                                "coordinates": {
                                    "latitude": 37.4979,
                                    "longitude": 127.0276
                                }
                            }
                        ]
                    }
                    """)
            )
        )
    })
    @GetMapping
    public ResponseEntity<ApiResponse<List<ZoneSummaryResponse>>> getZones() {
        return ResponseEntity.ok(ApiResponse.success(zoneQueryService.getZones()));
    }
}


