package com.da.itdaing.domain.social.api;

import com.da.itdaing.domain.social.dto.ReviewCreateRequest;
import com.da.itdaing.domain.social.dto.ReviewResponse;
import com.da.itdaing.domain.social.dto.ReviewUpdateRequest;
import com.da.itdaing.domain.social.entity.Review;
import com.da.itdaing.domain.social.entity.ReviewImage;
import com.da.itdaing.domain.social.repository.ReviewImageRepository;
import com.da.itdaing.domain.social.repository.ReviewRepository;
import com.da.itdaing.domain.social.service.ReviewCommandService;
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
import java.util.List;
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
 * 리뷰 명령 API 컨트롤러 (생성, 수정, 삭제)
 */
@Tag(name = "Review Command", description = "리뷰 생성/수정/삭제 API")
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ReviewCommandController {

    private final ReviewCommandService reviewCommandService;
    private final ReviewRepository reviewRepository;
    private final ReviewImageRepository reviewImageRepository;

    @PreAuthorize("hasRole('CONSUMER')")
    @Operation(
        summary = "리뷰 작성",
        description = """
            소비자가 팝업에 리뷰를 작성합니다.
            
            리뷰 작성 시 다음 정보를 입력해야 합니다:
            - rating: 평점 (1~5, 필수)
            - content: 리뷰 내용 (최대 150자, 선택)
            - images: 리뷰 이미지 목록 (선택)
            
            이 API는 JWT 토큰 인증이 필요하며, CONSUMER 역할을 가진 사용자만 접근할 수 있습니다.
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
                    name = "리뷰 작성 요청 예시",
                    value = """
                        {
                            "rating": 5,
                            "content": "정말 좋은 팝업이었습니다!",
                            "images": [
                                {
                                    "url": "https://example.com/review1.jpg",
                                    "key": "uploads/review1.jpg"
                                }
                            ]
                        }
                        """
                )
            )
        )
    )
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "201",
            description = "리뷰 작성 성공",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(value = """
                    {
                        "success": true,
                        "data": {
                            "id": 1,
                            "popupId": 1,
                            "consumerId": 1,
                            "consumerName": "consumer1",
                            "rating": 5,
                            "content": "정말 좋은 팝업이었습니다!",
                            "images": [],
                            "createdAt": "2024-01-15T10:00:00"
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
                                    "field": "rating",
                                    "message": "평점은 1 이상이어야 합니다"
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
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "403",
            description = "권한 없음 - CONSUMER 역할이 아님",
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
    @PostMapping("/popups/{popupId}/reviews")
    public ResponseEntity<ApiResponse<ReviewResponse>> createReview(
        Principal principal,
        @PathVariable Long popupId,
        @Valid @RequestBody ReviewCreateRequest request
    ) {
        Long consumerId = Long.valueOf(principal.getName());
        Long reviewId = reviewCommandService.createReview(consumerId, popupId, request);
        ReviewResponse response = getReviewResponse(reviewId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @PreAuthorize("hasRole('CONSUMER')")
    @Operation(
        summary = "리뷰 수정",
        description = """
            소비자가 자신이 작성한 리뷰를 수정합니다.
            
            리뷰 ID를 경로 파라미터로 받아 해당 리뷰의 정보를 수정합니다.
            수정 가능한 필드:
            - rating: 평점 (1~5, 필수)
            - content: 리뷰 내용 (최대 150자, 선택)
            - images: 리뷰 이미지 목록 (선택)
            
            이 API는 JWT 토큰 인증이 필요하며, CONSUMER 역할을 가진 사용자만 접근할 수 있습니다.
            자신이 작성한 리뷰만 수정할 수 있습니다.
            """,
        security = @SecurityRequirement(name = "bearerAuth"),
        parameters = {
            @Parameter(name = "reviewId", description = "리뷰 ID", required = true, example = "1")
        },
        requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
            required = true,
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    name = "리뷰 수정 요청 예시",
                    value = """
                        {
                            "rating": 4,
                            "content": "수정된 리뷰 내용",
                            "images": []
                        }
                        """
                )
            )
        )
    )
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "리뷰 수정 성공",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(value = """
                    {
                        "success": true,
                        "data": {
                            "id": 1,
                            "popupId": 1,
                            "consumerId": 1,
                            "consumerName": "consumer1",
                            "rating": 4,
                            "content": "수정된 리뷰 내용",
                            "images": [],
                            "createdAt": "2024-01-15T10:00:00"
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
            description = "권한 없음 - 자신이 작성한 리뷰가 아님",
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
            description = "리뷰를 찾을 수 없음",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(value = """
                    {
                        "success": false,
                        "error": {
                            "status": 404,
                            "code": "COMMON-404",
                            "message": "리뷰를 찾을 수 없습니다"
                        }
                    }
                    """)
            )
        )
    })
    @PutMapping("/reviews/{reviewId}")
    public ResponseEntity<ApiResponse<ReviewResponse>> updateReview(
        Principal principal,
        @PathVariable Long reviewId,
        @Valid @RequestBody ReviewUpdateRequest request
    ) {
        Long consumerId = Long.valueOf(principal.getName());
        Long updatedId = reviewCommandService.updateReview(consumerId, reviewId, request);
        ReviewResponse response = getReviewResponse(updatedId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PreAuthorize("hasAnyRole('CONSUMER', 'ADMIN')")
    @Operation(
        summary = "리뷰 삭제",
        description = """
            소비자가 자신이 작성한 리뷰를 삭제하거나 관리자가 리뷰를 삭제합니다.
            
            리뷰 ID를 경로 파라미터로 받아 해당 리뷰를 삭제합니다.
            삭제된 리뷰는 복구할 수 없습니다.
            
            권한:
            - CONSUMER: 자신이 작성한 리뷰만 삭제 가능
            - ADMIN: 모든 리뷰 삭제 가능
            
            이 API는 JWT 토큰 인증이 필요하며, CONSUMER 또는 ADMIN 역할을 가진 사용자만 접근할 수 있습니다.
            """,
        security = @SecurityRequirement(name = "bearerAuth"),
        parameters = {
            @Parameter(name = "reviewId", description = "리뷰 ID", required = true, example = "1")
        }
    )
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "리뷰 삭제 성공",
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
            description = "권한 없음 - 자신이 작성한 리뷰가 아니고 ADMIN도 아님",
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
            description = "리뷰를 찾을 수 없음",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(value = """
                    {
                        "success": false,
                        "error": {
                            "status": 404,
                            "code": "COMMON-404",
                            "message": "리뷰를 찾을 수 없습니다"
                        }
                    }
                    """)
            )
        )
    })
    @DeleteMapping("/reviews/{reviewId}")
    public ResponseEntity<ApiResponse<Void>> deleteReview(
        Principal principal,
        @PathVariable Long reviewId
    ) {
        Long userId = Long.valueOf(principal.getName());
        reviewCommandService.deleteReview(userId, reviewId);
        return ResponseEntity.ok(ApiResponse.success());
    }

    private ReviewResponse getReviewResponse(Long reviewId) {
        Review review = reviewRepository.findByIdWithRelations(reviewId)
            .orElseThrow(() -> new RuntimeException("리뷰를 찾을 수 없습니다."));
        List<com.da.itdaing.domain.file.dto.ImagePayload> images = reviewImageRepository.findByReviewIdIn(List.of(reviewId)).stream()
            .map(img -> com.da.itdaing.domain.file.dto.ImagePayload.builder()
                .url(img.getImageUrl())
                .key(img.getImageKey())
                .build())
            .toList();
        return new ReviewResponse(
            review.getId(),
            review.getPopup().getId(),
            review.getConsumer().getId(),
            review.getConsumer().getLoginId(),
            review.getRating(),
            review.getContent(),
            images,
            review.getCreatedAt()
        );
    }
}

