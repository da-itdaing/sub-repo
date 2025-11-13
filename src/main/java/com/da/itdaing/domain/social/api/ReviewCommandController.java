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

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ReviewCommandController {

    private final ReviewCommandService reviewCommandService;
    private final ReviewRepository reviewRepository;
    private final ReviewImageRepository reviewImageRepository;

    @PreAuthorize("hasRole('CONSUMER')")
    @Operation(summary = "리뷰 작성", description = "소비자가 팝업에 리뷰를 작성합니다.")
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
    @Operation(summary = "리뷰 수정", description = "소비자가 자신이 작성한 리뷰를 수정합니다.")
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
    @Operation(summary = "리뷰 삭제", description = "소비자가 자신이 작성한 리뷰를 삭제하거나 관리자가 리뷰를 삭제합니다.")
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
        Review review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> new RuntimeException("리뷰를 찾을 수 없습니다."));
        List<String> imageUrls = reviewImageRepository.findByReviewIdIn(List.of(reviewId)).stream()
            .map(ReviewImage::getImageUrl)
            .toList();
        return new ReviewResponse(
            review.getId(),
            review.getPopup().getId(),
            review.getConsumer().getId(),
            review.getConsumer().getLoginId(),
            review.getRating(),
            review.getContent(),
            imageUrls,
            review.getCreatedAt()
        );
    }
}

