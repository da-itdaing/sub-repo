package com.da.itdaing.domain.social.service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.da.itdaing.domain.file.dto.ImagePayload;
import com.da.itdaing.domain.popup.dto.PopupSummaryResponse;
import com.da.itdaing.domain.popup.entity.Popup;
import com.da.itdaing.domain.popup.entity.PopupImage;
import com.da.itdaing.domain.popup.repository.PopupImageRepository;
import com.da.itdaing.domain.popup.repository.PopupRepository;
import com.da.itdaing.domain.social.entity.Wishlist;
import com.da.itdaing.domain.social.repository.WishlistRepository;
import com.da.itdaing.domain.user.entity.Users;
import com.da.itdaing.domain.user.repository.UserRepository;
import com.da.itdaing.global.error.exception.EntityNotFoundException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final PopupRepository popupRepository;
    private final UserRepository userRepository;
    private final PopupImageRepository popupImageRepository;

    public void addToWishlist(Long userId, Long popupId) {
        Users user = userRepository.findById(userId)
            .orElseThrow(() -> new EntityNotFoundException("User not found: " + userId));

        Popup popup = popupRepository.findById(popupId)
            .orElseThrow(() -> new EntityNotFoundException("Popup not found: " + popupId));

        // 이미 존재하면 unique 제약 안 터지게 방어
        if (wishlistRepository.existsByPopupIdAndUserId(popupId, userId)) {
            return;
        }

        Wishlist wishlist = Wishlist.builder()
            .user(user)
            .popup(popup)
            .build();

        wishlistRepository.save(wishlist);

        popup.increaseFavoriteCount();
    }

    public void removeFromWishlist(Long userId, Long popupId) {
        Wishlist wishlist = wishlistRepository.findByPopupIdAndUserId(popupId, userId);
        if (wishlist != null) {
            Popup popup = wishlist.getPopup();
            wishlistRepository.delete(wishlist);

            //  좋아요 수 감소
            if (popup != null) {
                popup.decreaseFavoriteCount();
            }
        }
    }

    @Transactional(readOnly = true)
    public Page<PopupSummaryResponse> getMyWishlist(Long userId, Pageable pageable) {
        // 페이지 요청에 널값 보호 로직 추가 가능하지만, Spring Data JPA가 기본 처리함
        // 만약 pageable이 null이면 기본값 사용하도록 방어
        if (pageable == null) {
            pageable = Pageable.ofSize(40).withPage(0);
        }
        
        Page<Wishlist> page = wishlistRepository.findByUserIdWithPopup(userId, pageable);

        // 위시리스트가 비어있으면 빈 페이지 반환
        if (page.isEmpty()) {
            return Page.empty(pageable);
        }

        // 1. 팝업 ID 목록 추출
        List<Long> popupIds = page.getContent().stream()
            .map(w -> w.getPopup().getId())
            .toList();

        // 2. 팝업별 이미지 목록을 조회해 썸네일 우선/없으면 첫 번째 이미지를 사용
        Map<Long, List<PopupImage>> imagesByPopupId = popupImageRepository.findByPopupIdIn(popupIds)
            .stream()
            .collect(Collectors.groupingBy(img -> img.getPopup().getId()));

        return page.map(w -> {
            Popup p = w.getPopup();

            // null 방어용 로컬 변수들
            Users seller = p.getSeller();
            var zoneCell = p.getZoneCell();
            var zoneArea = zoneCell != null ? zoneCell.getZoneArea() : null;

            String createdAt = p.getCreatedAt() != null ? p.getCreatedAt().toString() : null;
            String updatedAt = p.getUpdatedAt() != null ? p.getUpdatedAt().toString() : null;

            Long sellerId = seller != null ? seller.getId() : null;
            String sellerName = resolveSellerName(seller);

            Long zoneId = zoneArea != null ? zoneArea.getId() : null;
            String locationName = zoneArea != null ? zoneArea.getName() : null;

            Long cellId = zoneCell != null ? zoneCell.getId() : null;
            String cellName = zoneCell != null ? zoneCell.getLabel() : null;
            String address = zoneCell != null ? zoneCell.getDetailedAddress() : null;
            Double lat = zoneCell != null ? zoneCell.getLat() : null;
            Double lng = zoneCell != null ? zoneCell.getLng() : null;

            String status = p.getApprovalStatus() != null ? p.getApprovalStatus().name() : null;
            String startDate = p.getStartDate() != null ? p.getStartDate().toString() : null;
            String endDate = p.getEndDate() != null ? p.getEndDate().toString() : null;

            // 썸네일 매핑: isThumbnail=true 우선, 없으면 첫 번째 이미지 사용
            List<PopupImage> popupImages = imagesByPopupId.getOrDefault(p.getId(), List.of());
            PopupImage thumbnailImage = popupImages.stream()
                .filter(img -> Boolean.TRUE.equals(img.getIsThumbnail()))
                .findFirst()
                .orElseGet(() -> popupImages.stream().findFirst().orElse(null));
            ImagePayload thumbnail = null;
            if (thumbnailImage != null) {
                thumbnail = ImagePayload.builder()
                    .url(thumbnailImage.getImageUrl())
                    .key(thumbnailImage.getImageKey())
                    .build();
            }

            return new PopupSummaryResponse(
                p.getId(),
                p.getName(),
                sellerId,
                sellerName,
                zoneId,
                cellId,
                cellName,
                locationName,
                address,
                lat,
                lng,
                status,
                startDate,
                endDate,
                p.getOperatingTime(),
                List.of(),          // operatingHours
                p.getDescription(),
                p.getViewCount(),
                p.getFavoriteCount(),
                List.of(),          // categoryIds
                List.of(),          // featureIds
                List.of(),          // styleTags
                thumbnail,          // thumbnail
                List.of(),          // gallery
                null,               // reviewSummary
                true,               // isFavorite
                createdAt,
                updatedAt
            );
        });
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
}
