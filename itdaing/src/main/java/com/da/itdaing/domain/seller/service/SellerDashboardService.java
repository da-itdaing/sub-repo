package com.da.itdaing.domain.seller.service;

import com.da.itdaing.domain.common.enums.ApprovalStatus;
import com.da.itdaing.domain.common.enums.UserRole;
import com.da.itdaing.domain.popup.entity.Popup;
import com.da.itdaing.domain.popup.entity.PopupImage;
import com.da.itdaing.domain.popup.repository.PopupImageRepository;
import com.da.itdaing.domain.popup.repository.PopupRepository;
import com.da.itdaing.domain.seller.dto.SellerDashboardDto;
import com.da.itdaing.domain.seller.entity.SellerProfile;
import com.da.itdaing.domain.seller.exception.SellerNotFoundException;
import com.da.itdaing.domain.seller.repository.SellerProfileRepository;
import com.da.itdaing.domain.social.repository.WishlistRepository;
import com.da.itdaing.domain.user.entity.Users;
import com.da.itdaing.domain.user.repository.UserRepository;
import java.time.LocalDate;
import java.util.Collection;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SellerDashboardService {

    private final UserRepository userRepository;
    private final SellerProfileRepository sellerProfileRepository;
    private final PopupRepository popupRepository;
    private final PopupImageRepository popupImageRepository;
    private final WishlistRepository wishlistRepository;

    public SellerDashboardDto.DashboardResponse getDashboard(Long sellerId) {
        Objects.requireNonNull(sellerId, "sellerId must not be null");

        Users seller = userRepository.findById(sellerId)
            .filter(u -> u.getRole() == UserRole.SELLER)
            .orElseThrow(() -> new SellerNotFoundException(sellerId));

        SellerProfile profile = sellerProfileRepository.findByUserId(sellerId).orElse(null);

        List<Popup> popups = popupRepository.findAllBySellerIdWithZoneAndSeller(sellerId);
        popups.sort(Comparator
            .comparing((Popup p) -> p.getStartDate(), Comparator.nullsLast(Comparator.reverseOrder()))
            .thenComparing(Popup::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())));

        List<Long> popupIds = popups.stream().map(Popup::getId).toList();

        Map<Long, Long> favoriteCounts = popupIds.isEmpty()
            ? Map.of()
            : wishlistRepository.countByPopupIds(popupIds)
                .stream()
                .collect(Collectors.toMap(
                    WishlistRepository.PopupFavoriteCount::getPopupId,
                    WishlistRepository.PopupFavoriteCount::getCount
                ));

        Map<Long, PopupImage> thumbnailMap = popupIds.isEmpty()
            ? Map.of()
            : resolveThumbnails(popupIds);

        List<SellerDashboardDto.PopupSummary> popupSummaries = popups.stream()
            .map(p -> SellerDashboardDto.PopupSummary.builder()
                .id(p.getId())
                .title(p.getName())
                .status(p.getApprovalStatus().name())
                .startDate(p.getStartDate())
                .endDate(p.getEndDate())
                .cellName(p.getZoneCell() != null ? p.getZoneCell().getLabel() : null)
                .viewCount(p.getViewCount() != null ? p.getViewCount() : 0L)
                .favoriteCount(favoriteCounts.getOrDefault(p.getId(), 0L))
                .thumbnailUrl(extractThumbnailUrl(thumbnailMap.get(p.getId())))
                .build())
            .toList();

        SellerDashboardDto.DashboardStats stats = buildStats(popups, favoriteCounts);

        SellerDashboardDto.SellerProfile profileDto = SellerDashboardDto.SellerProfile.builder()
            .userId(seller.getId())
            .name(resolveSellerName(seller))
            .email(seller.getEmail())
            .introduction(profile != null ? profile.getIntroduction() : null)
            .activityRegion(profile != null ? profile.getActivityRegion() : null)
            .snsUrl(profile != null ? profile.getSnsUrl() : null)
            .category(profile != null ? profile.getCategory() : null)
            .phone(profile != null ? profile.getContactPhone() : null)
            .profileImageUrl(profile != null ? profile.getProfileImageUrl() : null)
            .profileExists(profile != null)
            .build();

        return SellerDashboardDto.DashboardResponse.builder()
            .profile(profileDto)
            .stats(stats)
            .popups(popupSummaries)
            .build();
    }

    private Map<Long, PopupImage> resolveThumbnails(Collection<Long> popupIds) {
        List<PopupImage> images = popupImageRepository.findByPopupIdIn(popupIds);
        Map<Long, List<PopupImage>> grouped = images.stream()
            .collect(Collectors.groupingBy(img -> img.getPopup().getId()));

        return grouped.entrySet()
            .stream()
            .collect(Collectors.toMap(
                Map.Entry::getKey,
                entry -> selectThumbnail(entry.getValue())
            ));
    }

    private PopupImage selectThumbnail(List<PopupImage> images) {
        if (images == null || images.isEmpty()) {
            return null;
        }
        return images.stream()
            .sorted(Comparator
                .comparing((PopupImage img) -> Boolean.FALSE.equals(img.getIsThumbnail()))
                .thenComparing(PopupImage::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder())))
            .findFirst()
            .orElse(images.get(0));
    }

    private String extractThumbnailUrl(PopupImage image) {
        return image != null ? image.getImageUrl() : null;
    }

    private SellerDashboardDto.DashboardStats buildStats(
        List<Popup> popups,
        Map<Long, Long> favoriteCounts
    ) {
        if (popups.isEmpty()) {
            return SellerDashboardDto.DashboardStats.builder()
                .totalPopups(0)
                .activePopups(0)
                .pendingPopups(0)
                .rejectedPopups(0)
                .totalViews(0)
                .totalFavorites(0)
                .build();
        }

        LocalDate today = LocalDate.now();
        long totalPopups = popups.size();
        long activePopups = popups.stream()
            .filter(p -> p.getApprovalStatus() == ApprovalStatus.APPROVED)
            .filter(p -> p.getEndDate() == null || !p.getEndDate().isBefore(today))
            .count();
        long pendingPopups = popups.stream()
            .filter(p -> p.getApprovalStatus() == ApprovalStatus.PENDING)
            .count();
        long rejectedPopups = popups.stream()
            .filter(p -> p.getApprovalStatus() == ApprovalStatus.REJECTED)
            .count();
        long totalViews = popups.stream()
            .map(Popup::getViewCount)
            .filter(Objects::nonNull)
            .mapToLong(Long::longValue)
            .sum();
        long totalFavorites = favoriteCounts.values()
            .stream()
            .mapToLong(Long::longValue)
            .sum();

        return SellerDashboardDto.DashboardStats.builder()
            .totalPopups(totalPopups)
            .activePopups(activePopups)
            .pendingPopups(pendingPopups)
            .rejectedPopups(rejectedPopups)
            .totalViews(totalViews)
            .totalFavorites(totalFavorites)
            .build();
    }

    private String resolveSellerName(Users seller) {
        if (seller.getNickname() != null && !seller.getNickname().isBlank()) {
            return seller.getNickname();
        }
        if (seller.getName() != null && !seller.getName().isBlank()) {
            return seller.getName();
        }
        return seller.getLoginId();
    }
}
