// src/main/java/com/da/itdaing/domain/social/service/ReviewQueryService.java
package com.da.itdaing.domain.social.service;

import com.da.itdaing.domain.file.dto.ImagePayload;
import com.da.itdaing.domain.social.dto.ReviewResponse;
import com.da.itdaing.domain.social.entity.Review;
import com.da.itdaing.domain.social.repository.ReviewImageRepository;
import com.da.itdaing.domain.social.repository.ReviewRepository;
import com.da.itdaing.global.error.ErrorCode;
import com.da.itdaing.global.error.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewQueryService {

    private final ReviewRepository reviewRepository;
    private final ReviewImageRepository reviewImageRepository;

    @Transactional(readOnly = true)
    public ReviewResponse getReviewResponse(Long reviewId) {
        Review review = reviewRepository.findByIdWithRelations(reviewId)
            .orElseThrow(() -> new BusinessException(ErrorCode.ENTITY_NOT_FOUND, "리뷰를 찾을 수 없습니다."));

        List<ImagePayload> images =
            reviewImageRepository.findByReviewIdIn(List.of(reviewId)).stream()
                .map(img -> ImagePayload.builder()
                    .url(img.getImageUrl())
                    .key(img.getImageKey())
                    .build())
                .toList();

        // ✅ 여기서 JPA 컬렉션 -> 깨끗한 List<String> 으로 변환
        List<String> keywords = review.getKeywords() == null
            ? List.of()
            : List.copyOf(review.getKeywords()); // PersistentBag → 불변 리스트

        return new ReviewResponse(
            review.getId(),
            review.getPopup().getId(),
            review.getConsumer().getId(),
            review.getConsumer().getLoginId(),
            review.getRating(),
            review.getContent(),
            images,
            review.getCreatedAt(),
            keywords
        );
    }
}
