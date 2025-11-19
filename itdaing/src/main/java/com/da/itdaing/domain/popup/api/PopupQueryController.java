package com.da.itdaing.domain.popup.api;

import com.da.itdaing.domain.popup.dto.PopupReviewResponse;
import com.da.itdaing.domain.popup.dto.PopupSearchRequest;
import com.da.itdaing.domain.popup.dto.PopupSummaryResponse;
import com.da.itdaing.domain.popup.service.PopupQueryService;
import com.da.itdaing.global.web.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 팝업 조회 API 컨트롤러
 */
@Tag(name = "Popup Query", description = "팝업 조회 API")
@RestController
@RequestMapping("/api/popups")
@RequiredArgsConstructor
public class PopupQueryController {

    private final PopupQueryService popupQueryService;

    @Operation(
        summary = "전체 팝업 목록 조회",
        description = """
            승인된 모든 팝업 목록을 조회합니다.
            
            이 API는 인증이 필요하지 않으며, 모든 사용자가 접근할 수 있습니다.
            반환되는 팝업은 승인 상태가 APPROVED인 것들만 포함됩니다.
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
                                "title": "팝업스토어 제목",
                                "sellerId": 1,
                                "sellerName": "판매자",
                                "zoneId": 1,
                                "cellId": 1,
                                "cellName": "A1",
                                "locationName": "광주 남구",
                                "address": "광주광역시 남구 봉선로 123",
                                "status": "APPROVED",
                                "startDate": "2024-01-01",
                                "endDate": "2024-01-31",
                                "hours": "10:00-22:00",
                                "description": "팝업스토어 설명",
                                "viewCount": 100,
                                "favoriteCount": 10,
                                "categoryIds": [1, 2],
                                "featureIds": [1],
                                "styleTags": ["트렌디", "모던"],
                                "thumbnail": {
                                    "url": "https://example.com/thumbnail.jpg",
                                    "key": "uploads/thumbnail.jpg"
                                },
                                "gallery": [],
                                "reviewSummary": {
                                    "averageRating": 4.5,
                                    "totalCount": 10
                                }
                            }
                        ]
                    }
                    """)
            )
        )
    })
    @GetMapping
    public ResponseEntity<ApiResponse<List<PopupSummaryResponse>>> getPopups() {
        return ResponseEntity.ok(ApiResponse.success(popupQueryService.getPopups()));
    }

    @Operation(
        summary = "팝업 상세 조회",
        description = """
            특정 팝업의 상세 정보를 조회합니다.
            
            팝업 ID를 경로 파라미터로 받아 해당 팝업의 상세 정보를 반환합니다.
            이 API는 인증이 필요하지 않으며, 모든 사용자가 접근할 수 있습니다.
            """,
        security = {},
        parameters = {
            @Parameter(
                name = "popupId",
                description = "팝업 ID",
                required = true,
                example = "1"
            )
        }
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
                        "data": {
                            "id": 1,
                            "title": "팝업스토어 제목",
                            "sellerId": 1,
                            "sellerName": "판매자",
                            "zoneId": 1,
                            "cellId": 1,
                            "cellName": "A1",
                            "locationName": "광주 남구",
                            "address": "광주광역시 남구 봉선로 123",
                            "status": "APPROVED",
                            "startDate": "2024-01-01",
                            "endDate": "2024-01-31",
                            "hours": "10:00-22:00",
                            "description": "팝업스토어 설명",
                            "viewCount": 100,
                            "favoriteCount": 10,
                            "categoryIds": [1, 2],
                            "featureIds": [1],
                            "styleTags": ["트렌디", "모던"],
                            "thumbnail": {
                                "url": "https://example.com/thumbnail.jpg",
                                "key": "uploads/thumbnail.jpg"
                            },
                            "gallery": [],
                            "reviewSummary": {
                                "averageRating": 4.5,
                                "totalCount": 10
                            }
                        }
                    }
                    """)
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "404",
            description = "팝업을 찾을 수 없음",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(value = """
                    {
                        "success": false,
                        "error": {
                            "status": 404,
                            "code": "COMMON-404",
                            "message": "팝업을 찾을 수 없습니다"
                        }
                    }
                    """)
            )
        )
    })
    @GetMapping("/{popupId}")
    public ResponseEntity<ApiResponse<PopupSummaryResponse>> getPopup(@PathVariable Long popupId) {
        return ResponseEntity.ok(ApiResponse.success(popupQueryService.getPopup(popupId)));
    }

    @Operation(
        summary = "전체 리뷰 목록 조회",
        description = """
            모든 팝업의 리뷰 목록을 조회합니다.
            
            이 API는 인증이 필요하지 않으며, 모든 사용자가 접근할 수 있습니다.
            리뷰는 최신순으로 정렬되어 반환됩니다.
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
                                "popupId": 1,
                                "author": {
                                    "id": 1,
                                    "nickname": "리뷰어",
                                    "profileImageUrl": "https://example.com/profile.jpg"
                                },
                                "rating": 5,
                                "date": "2024-01-15",
                                "content": "정말 좋은 팝업이었습니다!",
                                "images": []
                            }
                        ]
                    }
                    """)
            )
        )
    })
    @GetMapping("/reviews")
    public ResponseEntity<ApiResponse<List<PopupReviewResponse>>> getAllReviews() {
        return ResponseEntity.ok(ApiResponse.success(popupQueryService.getAllReviews()));
    }

    @Operation(
        summary = "특정 팝업의 리뷰 목록 조회",
        description = """
            특정 팝업에 대한 리뷰 목록을 조회합니다.
            
            팝업 ID를 경로 파라미터로 받아 해당 팝업의 리뷰만 필터링하여 반환합니다.
            이 API는 인증이 필요하지 않으며, 모든 사용자가 접근할 수 있습니다.
            리뷰는 최신순으로 정렬되어 반환됩니다.
            """,
        security = {},
        parameters = {
            @Parameter(
                name = "popupId",
                description = "팝업 ID",
                required = true,
                example = "1"
            )
        }
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
                                "popupId": 1,
                                "author": {
                                    "id": 1,
                                    "nickname": "리뷰어",
                                    "profileImageUrl": "https://example.com/profile.jpg"
                                },
                                "rating": 5,
                                "date": "2024-01-15",
                                "content": "정말 좋은 팝업이었습니다!",
                                "images": []
                            }
                        ]
                    }
                    """)
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "404",
            description = "팝업을 찾을 수 없음",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(value = """
                    {
                        "success": false,
                        "error": {
                            "status": 404,
                            "code": "COMMON-404",
                            "message": "팝업을 찾을 수 없습니다"
                        }
                    }
                    """)
            )
        )
    })
    @GetMapping("/{popupId}/reviews")
    public ResponseEntity<ApiResponse<List<PopupReviewResponse>>> getReviewsByPopup(@PathVariable Long popupId) {
        return ResponseEntity.ok(ApiResponse.success(popupQueryService.getReviewsByPopup(popupId)));
    }

    @Operation(
        summary = "팝업 검색",
        description = """
            다양한 조건으로 팝업을 검색합니다.
            
            다음 조건들을 조합하여 검색할 수 있습니다:
            - keyword: 제목/설명 키워드 검색
            - regionId: 지역 필터
            - categoryIds: 카테고리 필터 (다중 선택 가능)
            - startDate: 시작일 필터 (YYYY-MM-DD 형식)
            - endDate: 종료일 필터 (YYYY-MM-DD 형식)
            - approvalStatus: 승인 상태 필터 (APPROVED, PENDING, REJECTED)
            - page: 페이지 번호 (기본값: 0)
            - size: 페이지 크기 (기본값: 20)
            
            이 API는 인증이 필요하지 않으며, 모든 사용자가 접근할 수 있습니다.
            결과는 페이징 처리되어 반환됩니다.
            """,
        security = {},
        parameters = {
            @Parameter(name = "keyword", description = "검색 키워드 (제목/설명)", example = "팝업"),
            @Parameter(name = "regionId", description = "지역 ID", example = "1"),
            @Parameter(name = "categoryIds", description = "카테고리 ID 목록", example = "[1, 2]"),
            @Parameter(name = "startDate", description = "시작일 (YYYY-MM-DD)", example = "2024-01-01"),
            @Parameter(name = "endDate", description = "종료일 (YYYY-MM-DD)", example = "2024-01-31"),
            @Parameter(name = "approvalStatus", description = "승인 상태 (APPROVED, PENDING, REJECTED)", example = "APPROVED"),
            @Parameter(name = "page", description = "페이지 번호 (0부터 시작)", example = "0"),
            @Parameter(name = "size", description = "페이지 크기", example = "20")
        }
    )
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "검색 성공",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(value = """
                    {
                        "success": true,
                        "data": {
                            "content": [
                                {
                                    "id": 1,
                                    "title": "팝업스토어 제목",
                                    "sellerId": 1,
                                    "sellerName": "판매자",
                                    "status": "APPROVED",
                                    "startDate": "2024-01-01",
                                    "endDate": "2024-01-31"
                                }
                            ],
                            "pageable": {
                                "pageNumber": 0,
                                "pageSize": 20
                            },
                            "totalElements": 1,
                            "totalPages": 1
                        }
                    }
                    """)
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400",
            description = "잘못된 요청 파라미터",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(value = """
                    {
                        "success": false,
                        "error": {
                            "status": 400,
                            "code": "E001",
                            "message": "입력값이 올바르지 않습니다"
                        }
                    }
                    """)
            )
        )
    })
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<PopupSummaryResponse>>> searchPopups(
        @RequestParam(required = false) String keyword,
        @RequestParam(required = false) Long regionId,
        @RequestParam(required = false) List<Long> categoryIds,
        @RequestParam(required = false) String startDate,
        @RequestParam(required = false) String endDate,
        @RequestParam(required = false) String approvalStatus,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        PopupSearchRequest request = PopupSearchRequest.builder()
            .keyword(keyword)
            .regionId(regionId)
            .categoryIds(categoryIds)
            .startDate(startDate != null ? java.time.LocalDate.parse(startDate) : null)
            .endDate(endDate != null ? java.time.LocalDate.parse(endDate) : null)
            .approvalStatus(approvalStatus != null ? com.da.itdaing.domain.common.enums.ApprovalStatus.valueOf(approvalStatus) : null)
            .page(page)
            .size(size)
            .build();
        
        Page<PopupSummaryResponse> result = popupQueryService.searchPopups(request);
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}

