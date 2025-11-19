package com.da.itdaing.domain.social.service;

import com.da.itdaing.domain.common.enums.UserRole;
import com.da.itdaing.domain.popup.entity.Popup;
import com.da.itdaing.domain.popup.repository.PopupRepository;
import com.da.itdaing.domain.social.dto.ReviewCreateRequest;
import com.da.itdaing.domain.social.dto.ReviewUpdateRequest;
import com.da.itdaing.domain.file.dto.ImagePayload;
import com.da.itdaing.domain.social.entity.Review;
import com.da.itdaing.domain.social.entity.ReviewImage;
import com.da.itdaing.domain.social.repository.ReviewImageRepository;
import com.da.itdaing.domain.social.repository.ReviewRepository;
import com.da.itdaing.domain.user.entity.Users;
import com.da.itdaing.domain.user.repository.UserRepository;
import com.da.itdaing.global.error.ErrorCode;
import com.da.itdaing.global.error.exception.BusinessException;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ReviewCommandService {

    private final ReviewRepository reviewRepository;
    private final ReviewImageRepository reviewImageRepository;
    private final UserRepository userRepository;
    private final PopupRepository popupRepository;

    @Transactional
    public Long createReview(Long consumerId, Long popupId, ReviewCreateRequest request) {
        Users consumer = userRepository.findById(consumerId)
            .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        if (consumer.getRole() != UserRole.CONSUMER) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED, "소비자만 리뷰를 작성할 수 있습니다.");
        }

        Popup popup = popupRepository.findById(popupId)
            .orElseThrow(() -> new BusinessException(ErrorCode.POPUP_NOT_FOUND));

        if (reviewRepository.findByPopupId(popupId).stream()
            .anyMatch(r -> Objects.equals(r.getConsumer().getId(), consumerId))) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE, "이미 해당 팝업에 리뷰를 작성하셨습니다.");
        }

        Review review = reviewRepository.save(
            Review.builder()
                .consumer(consumer)
                .popup(popup)
                .rating(request.rating())
                .content(request.content() != null ? request.content().trim() : null)
                .build()
        );

        persistImages(review, request.images());

        return review.getId();
    }

    @Transactional
    public Long updateReview(Long consumerId, Long reviewId, ReviewUpdateRequest request) {
        Review review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> new BusinessException(ErrorCode.ENTITY_NOT_FOUND, "리뷰를 찾을 수 없습니다."));
        if (!Objects.equals(review.getConsumer().getId(), consumerId)) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED, "본인이 작성한 리뷰만 수정할 수 있습니다.");
        }

        review.update(request.rating(), request.content() != null ? request.content().trim() : null);

        reviewImageRepository.deleteByReview(review);
        persistImages(review, request.images());

        return review.getId();
    }

    @Transactional
    public void deleteReview(Long consumerId, Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> new BusinessException(ErrorCode.ENTITY_NOT_FOUND, "리뷰를 찾을 수 없습니다."));
        
        Users user = userRepository.findById(consumerId)
            .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        
        boolean isOwner = Objects.equals(review.getConsumer().getId(), consumerId);
        boolean isAdmin = user.getRole() == UserRole.ADMIN;
        
        if (!isOwner && !isAdmin) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED, "본인이 작성한 리뷰 또는 관리자만 삭제할 수 있습니다.");
        }

        reviewImageRepository.deleteByReview(review);
        reviewRepository.delete(review);
    }

    private void persistImages(Review review, List<ImagePayload> images) {
        if (images == null || images.isEmpty()) {
            return;
        }
        List<ReviewImage> entities = images.stream()
            .filter(payload -> payload != null && payload.url() != null && !payload.url().isBlank())
            .map(payload -> ReviewImage.builder()
                .review(review)
                .imageUrl(payload.url())
                .imageKey(payload.key())
                .build())
            .toList();
        if (!entities.isEmpty()) {
            reviewImageRepository.saveAll(entities);
        }
    }
}

