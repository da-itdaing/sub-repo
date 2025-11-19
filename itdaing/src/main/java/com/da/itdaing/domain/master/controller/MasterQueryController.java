// src/main/java/com/da/itdaing/domain/master/controller/MasterQueryController.java
package com.da.itdaing.domain.master.controller;

import com.da.itdaing.domain.master.dto.CategoryResponse;
import com.da.itdaing.domain.master.dto.FeatureResponse;
import com.da.itdaing.domain.master.dto.RegionResponse;
import com.da.itdaing.domain.master.dto.StyleResponse;
import com.da.itdaing.domain.master.service.MasterQueryService;
import com.da.itdaing.global.web.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 마스터 데이터 조회 API 컨트롤러
 * 
 * 시스템 전반에서 사용되는 마스터 데이터(지역, 스타일, 특징, 카테고리)를 제공합니다.
 * 이 API는 인증이 필요하지 않으며, 모든 사용자가 접근할 수 있습니다.
 */
@Tag(name = "Master Data", description = "마스터 데이터 조회 API (지역, 스타일, 특징, 카테고리)")
@RestController
@RequestMapping("/api/master")
@RequiredArgsConstructor
public class MasterQueryController {

    private final MasterQueryService masterQueryService;

    @Operation(
        summary = "지역 목록 조회",
        description = """
            시스템에서 사용 가능한 모든 지역 목록을 조회합니다.
            
            지역은 팝업스토어의 위치를 나타내며, 다음과 같은 구조를 가집니다:
            - id: 지역 ID (회원가입, 팝업 등록 시 참조)
            - name: 지역명 (예: "서울특별시/강남구")
            - displayName: 표시명 (예: "서울 강남구")
            
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
                                "name": "서울특별시/강남구",
                                "displayName": "서울 강남구"
                            },
                            {
                                "id": 2,
                                "name": "서울특별시/강북구",
                                "displayName": "서울 강북구"
                            },
                            {
                                "id": 3,
                                "name": "광주광역시/남구",
                                "displayName": "광주 남구"
                            }
                        ]
                    }
                    """)
            )
        )
    })
    @GetMapping(value = "/regions", produces = "application/json")
    public ResponseEntity<ApiResponse<List<RegionResponse>>> getRegions() {
        return ResponseEntity.ok(ApiResponse.success(masterQueryService.getAllRegions()));
    }

    @Operation(
        summary = "스타일 목록 조회",
        description = """
            시스템에서 사용 가능한 모든 팝업 스타일 목록을 조회합니다.
            
            스타일은 팝업스토어의 분위기나 컨셉을 나타내며, 다음과 같은 속성을 가집니다:
            - id: 스타일 ID (회원가입, 팝업 등록 시 참조)
            - name: 스타일명 (예: "트렌디", "모던", "빈티지")
            - description: 스타일 설명
            
            소비자 회원가입 시 관심 스타일을 1~4개 선택할 수 있습니다.
            
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
                                "id": 12,
                                "name": "트렌디",
                                "description": "최신 트렌드를 반영한 현대적인 스타일"
                            },
                            {
                                "id": 13,
                                "name": "모던",
                                "description": "깔끔하고 세련된 현대적 디자인"
                            },
                            {
                                "id": 14,
                                "name": "빈티지",
                                "description": "레트로하고 클래식한 감성"
                            }
                        ]
                    }
                    """)
            )
        )
    })
    @GetMapping(value = "/styles", produces = "application/json")
    public ResponseEntity<ApiResponse<List<StyleResponse>>> getStyles() {
        return ResponseEntity.ok(ApiResponse.success(masterQueryService.getAllStyles()));
    }

    @Operation(
        summary = "특징 목록 조회",
        description = """
            시스템에서 사용 가능한 모든 팝업스토어 특징 목록을 조회합니다.
            
            특징은 팝업스토어가 제공하는 서비스나 편의시설을 나타내며, 다음과 같은 속성을 가집니다:
            - id: 특징 ID (팝업 등록 시 참조)
            - name: 특징명 (예: "주차 가능", "포토존", "체험 가능")
            - description: 특징 설명
            - icon: 아이콘 이름 (UI에서 사용)
            
            팝업스토어 등록 시 해당 팝업의 특징을 선택할 수 있습니다.
            
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
                                "name": "주차 가능",
                                "description": "주차 공간이 제공됩니다",
                                "icon": "parking"
                            },
                            {
                                "id": 2,
                                "name": "포토존",
                                "description": "사진 촬영을 위한 공간이 마련되어 있습니다",
                                "icon": "camera"
                            },
                            {
                                "id": 3,
                                "name": "체험 가능",
                                "description": "제품이나 서비스를 직접 체험할 수 있습니다",
                                "icon": "hands"
                            }
                        ]
                    }
                    """)
            )
        )
    })
    @GetMapping(value = "/features", produces = "application/json")
    public ResponseEntity<ApiResponse<List<FeatureResponse>>> getFeatures() {
        return ResponseEntity.ok(ApiResponse.success(masterQueryService.getAllFeatures()));
    }

    @Operation(
        summary = "카테고리 목록 조회",
        description = """
            시스템에서 사용 가능한 모든 팝업스토어 카테고리 목록을 조회합니다.
            
            카테고리는 팝업스토어의 주요 판매 품목이나 테마를 나타내며, 다음과 같은 속성을 가집니다:
            - id: 카테고리 ID (회원가입, 팝업 등록 시 참조)
            - name: 카테고리명 (예: "패션", "뷰티", "F&B", "아트")
            - description: 카테고리 설명
            
            소비자 회원가입 시 관심 카테고리를 1~4개 선택할 수 있으며,
            팝업스토어 등록 시 해당 팝업의 카테고리를 선택할 수 있습니다.
            
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
                                "id": 101,
                                "name": "패션",
                                "description": "의류, 신발, 액세서리 등 패션 아이템"
                            },
                            {
                                "id": 102,
                                "name": "뷰티",
                                "description": "화장품, 스킨케어, 향수 등 뷰티 제품"
                            },
                            {
                                "id": 103,
                                "name": "F&B",
                                "description": "식음료, 디저트, 카페 등"
                            },
                            {
                                "id": 104,
                                "name": "아트",
                                "description": "미술, 공예, 전시 등 문화예술"
                            }
                        ]
                    }
                    """)
            )
        )
    })
    @GetMapping(value = "/categories", produces = "application/json")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getCategories() {
        return ResponseEntity.ok(ApiResponse.success(masterQueryService.getAllCategories()));
    }
}
