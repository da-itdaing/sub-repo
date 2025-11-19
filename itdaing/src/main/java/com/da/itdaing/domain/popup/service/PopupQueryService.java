package com.da.itdaing.domain.popup.service;

import com.da.itdaing.domain.file.dto.ImagePayload;
import com.da.itdaing.domain.popup.dto.PopupOperatingHourResponse;
import com.da.itdaing.domain.popup.dto.PopupReviewAuthorResponse;
import com.da.itdaing.domain.popup.dto.PopupReviewResponse;
import com.da.itdaing.domain.popup.dto.PopupReviewSummaryResponse;
import com.da.itdaing.domain.popup.dto.PopupSearchRequest;
import com.da.itdaing.domain.popup.dto.PopupSummaryResponse;
import com.da.itdaing.domain.popup.entity.Popup;
import com.da.itdaing.domain.popup.entity.PopupCategory;
import com.da.itdaing.domain.popup.entity.PopupFeature;
import com.da.itdaing.domain.popup.entity.PopupImage;
import com.da.itdaing.domain.popup.entity.PopupStyle;
import com.da.itdaing.domain.popup.entity.QPopup;
import com.da.itdaing.domain.popup.entity.QPopupCategory;
import com.da.itdaing.domain.popup.exception.PopupNotFoundException;
import com.da.itdaing.domain.popup.repository.PopupCategoryRepository;
import com.da.itdaing.domain.popup.repository.PopupFeatureRepository;
import com.da.itdaing.domain.popup.repository.PopupImageRepository;
import com.da.itdaing.domain.popup.repository.PopupRepository;
import com.da.itdaing.domain.popup.repository.PopupStyleRepository;
import com.da.itdaing.domain.social.entity.Review;
import com.da.itdaing.domain.social.entity.ReviewImage;
import com.da.itdaing.domain.social.repository.ReviewImageRepository;
import com.da.itdaing.domain.social.repository.ReviewRepository;
import com.da.itdaing.domain.user.entity.Users;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.jpa.impl.JPAQueryFactory;
import jakarta.persistence.EntityManager;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class PopupQueryService {

    private static final DateTimeFormatter REVIEW_DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy.MM.dd");

    private final PopupRepository popupRepository;
    private final PopupImageRepository popupImageRepository;
    private final PopupCategoryRepository popupCategoryRepository;
    private final PopupFeatureRepository popupFeatureRepository;
    private final PopupStyleRepository popupStyleRepository;
    private final ReviewRepository reviewRepository;
    private final ReviewImageRepository reviewImageRepository;
    private final EntityManager entityManager;

    public List<PopupSummaryResponse> getPopups() {
        List<Popup> popups = popupRepository.findAllWithZoneAndSeller();
        return mapToSummaryResponses(popups);
    }

    public List<PopupSummaryResponse> getPopupsBySeller(Long sellerId) {
        List<Popup> popups = popupRepository.findAllBySellerIdWithZoneAndSeller(sellerId);
        return mapToSummaryResponses(popups);
    }

    public PopupSummaryResponse getPopup(Long popupId) {
        Popup popup = popupRepository.findByIdWithZoneAndSeller(popupId)
            .orElseThrow(() -> new PopupNotFoundException(popupId));
        return mapToSummaryResponses(List.of(popup)).stream()
            .findFirst()
            .orElseThrow(() -> new PopupNotFoundException(popupId));
    }

    public List<PopupReviewResponse> getAllReviews() {
        List<Review> reviews = reviewRepository.findAllWithRelations();
        return mapToReviewResponses(reviews);
    }

    public List<PopupReviewResponse> getReviewsByPopup(Long popupId) {
        popupRepository.findById(popupId).orElseThrow(() -> new PopupNotFoundException(popupId));
        List<Review> reviews = reviewRepository.findByPopupIdWithRelations(popupId);
        return mapToReviewResponses(reviews);
    }

    public Page<PopupSummaryResponse> searchPopups(PopupSearchRequest request) {
        JPAQueryFactory queryFactory = new JPAQueryFactory(entityManager);
        QPopup popup = QPopup.popup;
        QPopupCategory popupCategory = QPopupCategory.popupCategory;

        BooleanBuilder builder = new BooleanBuilder();

        // 키워드 검색 (제목 또는 설명)
        if (StringUtils.hasText(request.getKeyword())) {
            String keyword = "%" + request.getKeyword().toLowerCase() + "%";
            builder.and(
                popup.name.lower().like(keyword)
                    .or(popup.description.lower().like(keyword))
            );
        }

        // 승인 상태 필터
        if (request.getApprovalStatus() != null) {
            builder.and(popup.approvalStatus.eq(request.getApprovalStatus()));
        }

        // 날짜 필터
        if (request.getStartDate() != null) {
            builder.and(popup.startDate.goe(request.getStartDate()));
        }
        if (request.getEndDate() != null) {
            builder.and(popup.endDate.loe(request.getEndDate()));
        }

        // 지역 필터 (ZoneArea ID)
        if (request.getRegionId() != null) {
            builder.and(popup.zoneCell.zoneArea.id.eq(request.getRegionId()));
        }

        // 카테고리 필터
        if (request.getCategoryIds() != null && !request.getCategoryIds().isEmpty()) {
            builder.and(
                popup.id.in(
                    queryFactory.select(popupCategory.popup.id)
                        .from(popupCategory)
                        .where(popupCategory.category.id.in(request.getCategoryIds()))
                        .distinct()
                )
            );
        }

        Pageable pageable = PageRequest.of(request.getPage(), request.getSize());
        
        // 카운트 쿼리
        Long totalCount = queryFactory.select(popup.count())
            .from(popup)
            .where(builder)
            .fetchOne();
        long total = totalCount != null ? totalCount : 0L;

        // 데이터 쿼리
        List<Popup> popups = queryFactory.selectFrom(popup)
            .leftJoin(popup.zoneCell).fetchJoin()
            .leftJoin(popup.zoneCell.zoneArea).fetchJoin()
            .leftJoin(popup.seller).fetchJoin()
            .where(builder)
            .orderBy(popup.createdAt.desc())
            .offset(pageable.getOffset())
            .limit(pageable.getPageSize())
            .fetch();

        List<PopupSummaryResponse> responses = mapToSummaryResponses(popups);
        return new PageImpl<>(responses, pageable, total);
    }

    private List<PopupSummaryResponse> mapToSummaryResponses(List<Popup> popups) {
        if (popups.isEmpty()) {
            return List.of();
        }

        List<Long> popupIds = popups.stream().map(Popup::getId).toList();

        Map<Long, List<PopupImage>> imagesByPopup = popupImageRepository.findByPopupIdIn(popupIds)
            .stream()
            .collect(Collectors.groupingBy(image -> image.getPopup().getId()));

        Map<Long, List<PopupCategory>> categoriesByPopup = popupCategoryRepository.findByPopupIdIn(popupIds)
            .stream()
            .collect(Collectors.groupingBy(item -> item.getPopup().getId()));

        Map<Long, List<PopupFeature>> featuresByPopup = popupFeatureRepository.findByPopupIdIn(popupIds)
            .stream()
            .collect(Collectors.groupingBy(item -> item.getPopup().getId()));

        Map<Long, List<PopupStyle>> stylesByPopup = popupStyleRepository.findByPopupIdIn(popupIds)
            .stream()
            .collect(Collectors.groupingBy(item -> item.getPopup().getId()));

        Map<Long, List<Review>> reviewsByPopup = popupIds.isEmpty()
            ? Map.of()
            : reviewRepository.findByPopupIdInWithRelations(popupIds)
            .stream()
            .collect(Collectors.groupingBy(review -> review.getPopup().getId()));

        return popups.stream()
            .map(popup -> toSummaryResponse(
                popup,
                imagesByPopup.getOrDefault(popup.getId(), List.of()),
                categoriesByPopup.getOrDefault(popup.getId(), List.of()),
                featuresByPopup.getOrDefault(popup.getId(), List.of()),
                stylesByPopup.getOrDefault(popup.getId(), List.of()),
                reviewsByPopup.getOrDefault(popup.getId(), List.of())
            ))
            .toList();
    }

    private PopupSummaryResponse toSummaryResponse(
        Popup popup,
        List<PopupImage> images,
        List<PopupCategory> categories,
        List<PopupFeature> features,
        List<PopupStyle> styles,
        List<Review> reviews
    ) {
        ImagePayload thumbnail = images.stream()
            .filter(image -> Boolean.TRUE.equals(image.getIsThumbnail()))
            .findFirst()
            .map(this::toImagePayload)
            .orElseGet(() -> images.stream().findFirst().map(this::toImagePayload).orElse(null));

        List<ImagePayload> gallery = images.stream()
            .filter(image -> !Boolean.TRUE.equals(image.getIsThumbnail()))
            .map(this::toImagePayload)
            .toList();

        List<Long> categoryIds = categories.stream()
            .map(item -> item.getCategory().getId())
            .distinct()
            .toList();

        List<Long> featureIds = features.stream()
            .map(item -> item.getFeature().getId())
            .distinct()
            .toList();

        List<String> styleTags = styles.stream()
            .map(item -> item.getStyle().getName())
            .distinct()
            .toList();

        List<PopupOperatingHourResponse> operatingHours = parseOperatingHours(popup.getOperatingTime());
        PopupReviewSummaryResponse reviewSummary = buildReviewSummary(reviews);

        String startDate = popup.getStartDate() != null ? popup.getStartDate().toString() : null;
        String endDate = popup.getEndDate() != null ? popup.getEndDate().toString() : null;
        String createdAt = formatDateTime(popup.getCreatedAt());
        String updatedAt = formatDateTime(popup.getUpdatedAt());
        String locationName = popup.getZoneCell().getZoneArea().getName();
        String address = popup.getZoneCell().getDetailedAddress();
        Double latitude = popup.getZoneCell().getLat();
        Double longitude = popup.getZoneCell().getLng();

        return new PopupSummaryResponse(
            popup.getId(),
            popup.getName(),
            popup.getSeller().getId(),
            resolveSellerName(popup.getSeller()),
            popup.getZoneCell().getZoneArea().getId(),
            popup.getZoneCell().getId(),
            popup.getZoneCell().getLabel(),
            locationName,
            address,
            latitude,
            longitude,
            popup.getApprovalStatus().name(),
            startDate,
            endDate,
            popup.getOperatingTime(),
            operatingHours,
            popup.getDescription(),
            popup.getViewCount(),
            0L,
            categoryIds,
            featureIds,
            styleTags,
            thumbnail,
            gallery,
            reviewSummary,
            createdAt,
            updatedAt
        );
    }

    private List<PopupOperatingHourResponse> parseOperatingHours(String operatingTime) {
        if (operatingTime == null || operatingTime.isBlank()) {
            return List.of();
        }
        return Arrays.stream(operatingTime.split("/"))
            .map(String::trim)
            .filter(segment -> !segment.isBlank())
            .map(segment -> {
                int firstSpace = segment.indexOf(' ');
                if (firstSpace > 0) {
                    String day = segment.substring(0, firstSpace).trim();
                    String time = segment.substring(firstSpace + 1).trim();
                    return new PopupOperatingHourResponse(day, time);
                }
                return new PopupOperatingHourResponse("기본", segment);
            })
            .toList();
    }

    private PopupReviewSummaryResponse buildReviewSummary(List<Review> reviews) {
        if (reviews.isEmpty()) {
            return new PopupReviewSummaryResponse(0.0, 0, List.of(0, 0, 0, 0, 0));
        }

        int[] distribution = new int[5];
        int total = reviews.size();
        int sum = 0;

        for (Review review : reviews) {
            int rating = review.getRating() != null ? review.getRating() : 0;
            sum += rating;
            if (rating >= 1 && rating <= 5) {
                distribution[rating - 1]++;
            }
        }

        double average = total > 0 ? (double) sum / total : 0.0;
        List<Integer> distributionList = Arrays.stream(distribution).boxed().toList();
        return new PopupReviewSummaryResponse(average, total, distributionList);
    }

    private ImagePayload toImagePayload(PopupImage image) {
        if (image == null) {
            return null;
        }
        return ImagePayload.builder()
            .url(image.getImageUrl())
            .key(image.getImageKey())
            .build();
    }

    private List<PopupReviewResponse> mapToReviewResponses(List<Review> reviews) {
        if (reviews.isEmpty()) {
            return List.of();
        }
        List<Long> reviewIds = reviews.stream().map(Review::getId).toList();
        Map<Long, List<ReviewImage>> imagesByReview = reviewImageRepository.findByReviewIdIn(reviewIds)
            .stream()
            .collect(Collectors.groupingBy(image -> image.getReview().getId()));

        return reviews.stream()
            .map(review -> {
                List<ImagePayload> images = imagesByReview.getOrDefault(review.getId(), List.of())
                    .stream()
                    .map(img -> ImagePayload.builder()
                        .url(img.getImageUrl())
                        .key(img.getImageKey())
                        .build())
                    .toList();
                PopupReviewAuthorResponse author = buildReviewAuthor(review.getConsumer());
                int rating = review.getRating() != null ? review.getRating() : 0;
                String date = formatReviewDate(review.getCreatedAt());
                return new PopupReviewResponse(
                    review.getId(),
                    review.getPopup().getId(),
                    author,
                    rating,
                    date,
                    review.getContent(),
                    images
                );
            })
            .toList();
    }

    private PopupReviewAuthorResponse buildReviewAuthor(Users user) {
        if (user == null) {
            return new PopupReviewAuthorResponse(null, null, null, null);
        }
        return new PopupReviewAuthorResponse(
            user.getId(),
            user.getName(),
            user.getNickname(),
            null
        );
    }

    private String resolveSellerName(Users user) {
        if (user == null) {
            return null;
        }
        if (user.getNickname() != null && !user.getNickname().isBlank()) {
            return user.getNickname();
        }
        if (user.getName() != null && !user.getName().isBlank()) {
            return user.getName();
        }
        return user.getLoginId();
    }

    private String formatDateTime(LocalDateTime dateTime) {
        return dateTime != null ? dateTime.toString() : null;
    }

    private String formatReviewDate(LocalDateTime createdAt) {
        return createdAt != null ? createdAt.format(REVIEW_DATE_FORMATTER) : null;
    }
}

