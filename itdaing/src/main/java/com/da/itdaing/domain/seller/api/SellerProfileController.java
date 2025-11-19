package com.da.itdaing.domain.seller.api;

import com.da.itdaing.domain.seller.dto.SellerDashboardDto;
import com.da.itdaing.domain.seller.dto.SellerProfileRequest;
import com.da.itdaing.domain.seller.dto.SellerProfileResponse;
import com.da.itdaing.domain.seller.service.SellerDashboardService;
import com.da.itdaing.domain.seller.service.SellerProfileService;
import com.da.itdaing.global.web.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.security.Principal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 판매자 프로필 및 대시보드 API 컨트롤러
 */
@Tag(name = "Seller Profile", description = "판매자 프로필 및 대시보드 API")
@RestController
@RequestMapping("/api/sellers/me")
@RequiredArgsConstructor
public class SellerProfileController {

    private final SellerProfileService sellerProfileService;
    private final SellerDashboardService sellerDashboardService;

    @Operation(
        summary = "내 판매자 프로필 조회",
        description = """
            인증된 판매자의 프로필 정보를 조회합니다.
            
            이 API는 JWT 토큰 인증이 필요하며, SELLER 역할을 가진 사용자만 접근할 수 있습니다.
            프로필이 존재하지 않는 경우 exists 필드가 false로 반환됩니다.
            """,
        security = @SecurityRequirement(name = "bearerAuth")
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
                            "userId": 1,
                            "exists": true,
                            "profileImage": {
                                "url": "https://example.com/profile.jpg",
                                "key": "uploads/profile.jpg"
                            },
                            "introduction": "안녕하세요! 팝업 운영자입니다.",
                            "activityRegion": "광주 남구",
                            "snsUrl": "https://instagram.com/itdaing",
                            "email": "seller@example.com"
                        }
                    }
                    """)
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401",
            description = "인증 실패 - 토큰이 없거나 유효하지 않음",
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
        )
    })
    @GetMapping(value = "/profile", produces = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponse<SellerProfileResponse> getMyProfile(Principal principal) {
        Long userId = Long.valueOf(principal.getName());
        SellerProfileResponse resp = sellerProfileService.getMyProfile(userId);
        return ApiResponse.success(resp);
    }

    @Operation(
        summary = "내 판매자 대시보드 조회",
        description = """
            인증된 판매자의 대시보드 정보를 조회합니다.
            
            대시보드에는 다음 정보가 포함됩니다:
            - 판매자 프로필 정보
            - 통계 정보 (전체 팝업 수, 활성 팝업 수, 대기 중인 팝업 수, 거부된 팝업 수, 총 조회수, 총 좋아요 수)
            - 팝업 목록 (최근 등록순)
            
            이 API는 JWT 토큰 인증이 필요하며, SELLER 역할을 가진 사용자만 접근할 수 있습니다.
            """,
        security = @SecurityRequirement(name = "bearerAuth")
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
                            "profile": {
                                "userId": 1,
                                "name": "판매자",
                                "email": "seller@example.com",
                                "introduction": "안녕하세요!",
                                "activityRegion": "광주 남구",
                                "snsUrl": "https://instagram.com/itdaing",
                                "category": "패션",
                                "phone": "010-1234-5678",
                                "profileImageUrl": "https://example.com/profile.jpg",
                                "profileExists": true
                            },
                            "stats": {
                                "totalPopups": 10,
                                "activePopups": 5,
                                "pendingPopups": 2,
                                "rejectedPopups": 1,
                                "totalViews": 1000,
                                "totalFavorites": 50
                            },
                            "popups": [
                                {
                                    "id": 1,
                                    "title": "팝업스토어 제목",
                                    "status": "APPROVED",
                                    "startDate": "2024-01-01",
                                    "endDate": "2024-01-31",
                                    "cellName": "A1",
                                    "viewCount": 100,
                                    "favoriteCount": 10,
                                    "thumbnailUrl": "https://example.com/thumbnail.jpg"
                                }
                            ]
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
        )
    })
    @GetMapping(value = "/dashboard", produces = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponse<SellerDashboardDto.DashboardResponse> getMyDashboard(Principal principal) {
        Long userId = Long.valueOf(principal.getName());
        return ApiResponse.success(sellerDashboardService.getDashboard(userId));
    }

    @Operation(
        summary = "내 판매자 프로필 생성/수정",
        description = """
            인증된 판매자의 프로필을 생성하거나 수정합니다.
            
            프로필이 존재하지 않으면 생성되고, 존재하면 수정됩니다.
            모든 필드는 선택사항이며, 전송된 필드만 업데이트됩니다.
            
            - profileImage: 프로필 이미지 정보 (ImagePayload 객체)
            - introduction: 소개글 (최대 1000자)
            - activityRegion: 활동 지역 (최대 255자)
            - snsUrl: SNS URL (최대 512자)
            
            이 API는 JWT 토큰 인증이 필요하며, SELLER 역할을 가진 사용자만 접근할 수 있습니다.
            """,
        security = @SecurityRequirement(name = "bearerAuth"),
        requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
            required = true,
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    name = "프로필 수정 요청 예시",
                    value = """
                        {
                            "profileImage": {
                                "url": "https://example.com/profile.jpg",
                                "key": "uploads/profile.jpg"
                            },
                            "introduction": "안녕하세요! 팝업 운영자입니다.",
                            "activityRegion": "광주 남구",
                            "snsUrl": "https://instagram.com/itdaing"
                        }
                        """
                )
            )
        )
    )
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "프로필 생성/수정 성공",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(value = """
                    {
                        "success": true,
                        "data": {
                            "userId": 1,
                            "exists": true,
                            "profileImage": {
                                "url": "https://example.com/profile.jpg",
                                "key": "uploads/profile.jpg"
                            },
                            "introduction": "안녕하세요! 팝업 운영자입니다.",
                            "activityRegion": "광주 남구",
                            "snsUrl": "https://instagram.com/itdaing",
                            "email": "seller@example.com"
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
                            "message": "입력값이 올바르지 않습니다",
                            "fieldErrors": [
                                {
                                    "field": "introduction",
                                    "message": "소개글은 1000자 이하여야 합니다"
                                }
                            ]
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
        )
    })
    @PutMapping(
        value = "/profile",
        consumes = MediaType.APPLICATION_JSON_VALUE,
        produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ApiResponse<SellerProfileResponse> upsertMyProfile(
        Principal principal,
        @Valid @RequestBody SellerProfileRequest req
    ) {
        Long userId = Long.valueOf(principal.getName());
        SellerProfileResponse resp = sellerProfileService.upsertMyProfile(userId, req);
        return ApiResponse.success(resp);
    }
}
