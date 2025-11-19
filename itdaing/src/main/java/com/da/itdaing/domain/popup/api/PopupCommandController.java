package com.da.itdaing.domain.popup.api;

import com.da.itdaing.domain.popup.dto.PopupCreateRequest;
import com.da.itdaing.domain.popup.dto.PopupSummaryResponse;
import com.da.itdaing.domain.popup.service.PopupCommandService;
import com.da.itdaing.domain.popup.service.PopupQueryService;
import com.da.itdaing.global.web.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.security.Principal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 팝업 명령 API 컨트롤러 (생성, 수정, 삭제)
 */
@Tag(name = "Popup Command", description = "팝업 생성/수정/삭제 API")
@RestController
@RequestMapping("/api/popups")
@RequiredArgsConstructor
public class PopupCommandController {

    private final PopupCommandService popupCommandService;
    private final PopupQueryService popupQueryService;

    @PreAuthorize("hasRole('SELLER')")
    @Operation(
        summary = "팝업 등록",
        description = """
            판매자가 셀을 선택해 신규 팝업을 등록합니다.
            
            팝업 등록 시 다음 정보를 입력해야 합니다:
            - 팝업 제목, 설명
            - 시작일, 종료일
            - 운영 시간
            - 셀 ID (존 내 셀 선택)
            - 카테고리, 스타일 태그
            - 이미지 (썸네일, 갤러리)
            
            등록된 팝업은 관리자 승인 후 공개됩니다.
            이 API는 JWT 토큰 인증이 필요하며, SELLER 역할을 가진 사용자만 접근할 수 있습니다.
            """,
        security = @SecurityRequirement(name = "bearerAuth"),
        requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
            required = true,
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    name = "팝업 등록 요청 예시",
                    value = """
                        {
                            "title": "팝업스토어 제목",
                            "description": "팝업스토어 설명",
                            "startDate": "2024-01-01",
                            "endDate": "2024-01-31",
                            "operatingTime": "10:00-22:00",
                            "zoneCellId": 1,
                            "categoryIds": [1, 2],
                            "targetCategoryIds": [1],
                            "featureIds": [1],
                            "styleIds": [1, 2],
                            "thumbnailImage": {
                                "url": "https://example.com/thumbnail.jpg",
                                "key": "uploads/thumbnail.jpg"
                            },
                            "images": []
                        }
                        """
                )
            )
        )
    )
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "201",
            description = "팝업 등록 성공",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(value = """
                    {
                        "success": true,
                        "data": {
                            "id": 1,
                            "title": "팝업스토어 제목",
                            "status": "PENDING",
                            "startDate": "2024-01-01",
                            "endDate": "2024-01-31"
                        }
                    }
                    """)
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400",
            description = "입력값 검증 실패",
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
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401",
            description = "인증 실패",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(value = """
                    {
                        "success": false,
                        "error": {
                            "status": 401,
                            "code": "AUTH-401",
                            "message": "인증이 필요합니다"
                        }
                    }
                    """)
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "403",
            description = "권한 없음 - SELLER 역할이 아님",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(value = """
                    {
                        "success": false,
                        "error": {
                            "status": 403,
                            "code": "AUTH-403",
                            "message": "접근 권한이 없습니다"
                        }
                    }
                    """)
            )
        )
    })
    @PostMapping
    public ResponseEntity<ApiResponse<PopupSummaryResponse>> createPopup(
        Principal principal,
        @Valid @RequestBody PopupCreateRequest request
    ) {
        Long sellerId = Long.valueOf(principal.getName());
        Long popupId = popupCommandService.createPopup(sellerId, request);
        PopupSummaryResponse response = popupQueryService.getPopup(popupId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @PreAuthorize("hasRole('SELLER')")
    @Operation(
        summary = "팝업 수정",
        description = """
            판매자가 자신의 팝업 정보를 수정합니다.
            
            팝업 ID를 경로 파라미터로 받아 해당 팝업의 정보를 수정합니다.
            수정된 팝업은 관리자 재승인이 필요할 수 있습니다.
            이 API는 JWT 토큰 인증이 필요하며, SELLER 역할을 가진 사용자만 접근할 수 있습니다.
            자신이 등록한 팝업만 수정할 수 있습니다.
            """,
        security = @SecurityRequirement(name = "bearerAuth"),
        parameters = {
            @Parameter(name = "popupId", description = "팝업 ID", required = true, example = "1")
        },
        requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
            required = true,
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    name = "팝업 수정 요청 예시",
                    value = """
                        {
                            "title": "수정된 팝업스토어 제목",
                            "description": "수정된 설명",
                            "startDate": "2024-02-01",
                            "endDate": "2024-02-28",
                            "operatingTime": "10:00-22:00",
                            "zoneCellId": 1,
                            "categoryIds": [1, 2],
                            "targetCategoryIds": [1],
                            "featureIds": [1],
                            "styleIds": [1]
                        }
                        """
                )
            )
        )
    )
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "팝업 수정 성공",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(value = """
                    {
                        "success": true,
                        "data": {
                            "id": 1,
                            "title": "수정된 팝업스토어 제목",
                            "status": "PENDING",
                            "startDate": "2024-02-01",
                            "endDate": "2024-02-28"
                        }
                    }
                    """)
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400",
            description = "입력값 검증 실패",
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
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401",
            description = "인증 실패",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(value = """
                    {
                        "success": false,
                        "error": {
                            "status": 401,
                            "code": "AUTH-401",
                            "message": "인증이 필요합니다"
                        }
                    }
                    """)
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "403",
            description = "권한 없음 - 자신이 등록한 팝업이 아님",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(value = """
                    {
                        "success": false,
                        "error": {
                            "status": 403,
                            "code": "AUTH-403",
                            "message": "접근 권한이 없습니다"
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
    @PutMapping("/{popupId}")
    public ResponseEntity<ApiResponse<PopupSummaryResponse>> updatePopup(
        Principal principal,
        @PathVariable Long popupId,
        @Valid @RequestBody PopupCreateRequest request
    ) {
        Long sellerId = Long.valueOf(principal.getName());
        Long updatedId = popupCommandService.updatePopup(sellerId, popupId, request);
        PopupSummaryResponse response = popupQueryService.getPopup(updatedId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PreAuthorize("hasRole('SELLER')")
    @Operation(
        summary = "팝업 삭제",
        description = """
            판매자가 자신의 팝업을 삭제합니다.
            
            팝업 ID를 경로 파라미터로 받아 해당 팝업을 삭제합니다.
            삭제된 팝업은 복구할 수 없습니다.
            이 API는 JWT 토큰 인증이 필요하며, SELLER 역할을 가진 사용자만 접근할 수 있습니다.
            자신이 등록한 팝업만 삭제할 수 있습니다.
            """,
        security = @SecurityRequirement(name = "bearerAuth"),
        parameters = {
            @Parameter(name = "popupId", description = "팝업 ID", required = true, example = "1")
        }
    )
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "팝업 삭제 성공",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(value = """
                    {
                        "success": true,
                        "data": null
                    }
                    """)
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401",
            description = "인증 실패",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(value = """
                    {
                        "success": false,
                        "error": {
                            "status": 401,
                            "code": "AUTH-401",
                            "message": "인증이 필요합니다"
                        }
                    }
                    """)
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "403",
            description = "권한 없음 - 자신이 등록한 팝업이 아님",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(value = """
                    {
                        "success": false,
                        "error": {
                            "status": 403,
                            "code": "AUTH-403",
                            "message": "접근 권한이 없습니다"
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
    @DeleteMapping("/{popupId}")
    public ResponseEntity<ApiResponse<Void>> deletePopup(
        Principal principal,
        @PathVariable Long popupId
    ) {
        Long sellerId = Long.valueOf(principal.getName());
        popupCommandService.deletePopup(sellerId, popupId);
        return ResponseEntity.ok(ApiResponse.success());
    }
}
