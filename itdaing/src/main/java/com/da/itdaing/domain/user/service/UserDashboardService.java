package com.da.itdaing.domain.user.service;

import com.da.itdaing.domain.common.enums.ApprovalStatus;
import com.da.itdaing.domain.common.enums.EventAction;
import com.da.itdaing.domain.metric.entity.EventLog;
import com.da.itdaing.domain.metric.repository.EventLogRepository;
import com.da.itdaing.domain.popup.entity.Popup;
import com.da.itdaing.domain.popup.repository.PopupRepository;
import com.da.itdaing.domain.reco.entity.DailyConsumerRecommendation;
import com.da.itdaing.domain.reco.repository.DailyConsumerRecommendationRepository;
import com.da.itdaing.domain.social.entity.Wishlist;
import com.da.itdaing.domain.social.repository.ReviewRepository;
import com.da.itdaing.domain.social.repository.WishlistRepository;
import com.da.itdaing.domain.user.dto.UserDashboardDto;
import com.da.itdaing.domain.user.entity.UserPrefCategory;
import com.da.itdaing.domain.user.entity.UserPrefFeature;
import com.da.itdaing.domain.user.entity.UserPrefRegion;
import com.da.itdaing.domain.user.entity.UserPrefStyle;
import com.da.itdaing.domain.user.entity.Users;
import com.da.itdaing.domain.user.repository.UserPrefCategoryRepository;
import com.da.itdaing.domain.user.repository.UserPrefFeatureRepository;
import com.da.itdaing.domain.user.repository.UserPrefRegionRepository;
import com.da.itdaing.domain.user.repository.UserPrefStyleRepository;
import com.da.itdaing.domain.user.repository.UserRepository;
import com.da.itdaing.global.error.ErrorCode;
import com.da.itdaing.global.error.exception.EntityNotFoundException;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserDashboardService {

    private static final int MAX_RECOMMENDATIONS = 8;
    private static final int MAX_RECENT_VIEWED = 6;

    private final UserRepository userRepository;
    private final UserPrefCategoryRepository userPrefCategoryRepository;
    private final UserPrefStyleRepository userPrefStyleRepository;
    private final UserPrefFeatureRepository userPrefFeatureRepository;
    private final UserPrefRegionRepository userPrefRegionRepository;
    private final WishlistRepository wishlistRepository;
    private final DailyConsumerRecommendationRepository dailyConsumerRecommendationRepository;
    private final PopupRepository popupRepository;
    private final ReviewRepository reviewRepository;
    private final EventLogRepository eventLogRepository;

    public UserDashboardDto.DashboardResponse getDashboard(Long userId) {
        Objects.requireNonNull(userId, "userId must not be null");
        Users user = userRepository.findById(userId)
            .orElseThrow(() -> new EntityNotFoundException(ErrorCode.USER_NOT_FOUND, "사용자를 찾을 수 없습니다."));

        List<String> interests = userPrefCategoryRepository.findByUserIdWithCategory(userId).stream()
            .sorted(Comparator.comparing(UserPrefCategory::getCreatedAt).reversed())
            .map(pref -> pref.getCategory().getName())
            .toList();

        List<String> styles = userPrefStyleRepository.findByUserIdWithStyle(userId).stream()
            .sorted(Comparator.comparing(UserPrefStyle::getCreatedAt).reversed())
            .map(pref -> pref.getStyle().getName())
            .toList();

        List<String> features = userPrefFeatureRepository.findByUserIdWithFeature(userId).stream()
            .sorted(Comparator.comparing(UserPrefFeature::getCreatedAt).reversed())
            .map(pref -> pref.getFeature().getName())
            .toList();

        List<String> regions = userPrefRegionRepository.findByUserIdWithRegion(userId).stream()
            .sorted(Comparator.comparing(UserPrefRegion::getCreatedAt).reversed())
            .map(pref -> pref.getRegion().getName())
            .toList();

        List<Long> favoriteIds = wishlistRepository.findByUserIdWithPopup(userId).stream()
            .sorted(Comparator.comparing(Wishlist::getCreatedAt).reversed())
            .map(wishlist -> wishlist.getPopup().getId())
            .toList();

        List<Long> recommendationIds = collectRecommendations(userId);
        List<Long> recentViewedIds = collectRecentViewed(userId);

        int reviewCount = Math.toIntExact(reviewRepository.countByConsumer_Id(userId));

        return UserDashboardDto.DashboardResponse.builder()
            .userId(user.getId())
            .loginId(user.getLoginId())
            .name(user.getName())
            .nickname(user.getNickname())
            .email(user.getEmail())
            .role(user.getRole() != null ? user.getRole().name() : null)
            .profileImageUrl(user.getProfileImageUrl())
            .mbti(user.getMbti())
            .interests(interests)
            .styles(styles)
            .features(features)
            .regions(regions)
            .favorites(favoriteIds)
            .recommendations(recommendationIds)
            .recentViewed(recentViewedIds)
            .stats(UserDashboardDto.DashboardStats.builder()
                .favoriteCount(favoriteIds.size())
                .reviewCount(reviewCount)
                .recommendationCount(recommendationIds.size())
                .build())
            .build();
    }

    private List<Long> collectRecommendations(Long userId) {
        List<DailyConsumerRecommendation> recent = dailyConsumerRecommendationRepository
            .findRecentRecommendations(userId, PageRequest.of(0, MAX_RECOMMENDATIONS));

        Set<Long> popupIds = new LinkedHashSet<>(
            recent.stream()
                .map(reco -> reco.getPopup().getId())
                .toList()
        );

        if (popupIds.size() < MAX_RECOMMENDATIONS) {
            List<Popup> fallback = popupRepository.findTop8ByApprovalStatusOrderByViewCountDesc(
                ApprovalStatus.APPROVED);
            fallback.stream()
                .map(Popup::getId)
                .forEach(popupIds::add);
        }

        return popupIds.stream()
            .limit(MAX_RECOMMENDATIONS)
            .toList();
    }

    private List<Long> collectRecentViewed(Long userId) {
        return eventLogRepository
            .findRecentEventsWithPopup(userId, EventAction.VIEW, PageRequest.of(0, MAX_RECENT_VIEWED))
            .stream()
            .map(EventLog::getPopup)
            .filter(popup -> popup != null && popup.getId() != null)
            .map(Popup::getId)
            .distinct()
            .limit(MAX_RECENT_VIEWED)
            .toList();
    }
}


