package com.da.itdaing.domain.social.service;

import com.da.itdaing.domain.popup.dto.PopupSummaryResponse;
import com.da.itdaing.domain.popup.entity.Popup;
import com.da.itdaing.domain.popup.repository.PopupRepository;
import com.da.itdaing.domain.social.entity.Wishlist;
import com.da.itdaing.domain.social.repository.WishlistRepository;
import com.da.itdaing.domain.user.entity.Users;
import com.da.itdaing.domain.user.repository.UserRepository;
import com.da.itdaing.global.error.exception.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final PopupRepository popupRepository;
    private final UserRepository userRepository;

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
    }

    public void removeFromWishlist(Long userId, Long popupId) {
        Wishlist wishlist = wishlistRepository.findByPopupIdAndUserId(popupId, userId);
        if (wishlist != null) {
            wishlistRepository.delete(wishlist);
        }
        // 없으면 조용히 패스 (정책에 따라 예외 던져도 됨)
    }

    @Transactional(readOnly = true)
    public Page<PopupSummaryResponse> getMyWishlist(Long userId, Pageable pageable) {
        Page<Wishlist> page = wishlistRepository.findByUserIdWithPopup(userId, pageable);

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
                List.of(),          // operatingHours (간단 버전에서는 비워둠)
                p.getDescription(),
                p.getViewCount(),
                0L,                 // favoriteCount (나중에 집계 로직 붙일 수 있음)
                List.of(),          // categoryIds
                List.of(),          // featureIds
                List.of(),          // styleTags
                null,               // thumbnail
                List.of(),          // gallery
                null,               // reviewSummary
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
