// src/main/java/com/da/itdaing/domain/social/api/WishlistController.java
package com.da.itdaing.domain.social.api;

import com.da.itdaing.domain.popup.dto.PopupSummaryResponse;
import com.da.itdaing.domain.social.service.WishlistService;
import com.da.itdaing.global.api.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    /**
     * 위시 등록
     * POST /api/wishlist?popupId=1
     */
    @PostMapping
    @PreAuthorize("hasRole('CONSUMER')")
    public ApiResponse<Void> addToWishlist(
        @AuthenticationPrincipal(expression = "id") Long userId,
        @RequestParam Long popupId
    ) {
        wishlistService.addToWishlist(userId, popupId);
        // 이미 존재하면 service에서 조용히 무시 → 항상 성공 응답
        return ApiResponse.success();
    }

    /**
     * 위시 삭제
     * DELETE /api/wishlist/{popupId}
     */
    @DeleteMapping("/{popupId}")
    @PreAuthorize("hasRole('CONSUMER')")
    public ApiResponse<Void> removeFromWishlist(
        @AuthenticationPrincipal(expression = "id") Long userId,
        @PathVariable Long popupId
    ) {
        wishlistService.removeFromWishlist(userId, popupId);
        return ApiResponse.success();
    }

    /**
     * 내 위시 목록 조회
     * GET /api/wishlist?page=0&size=10
     */
    @GetMapping
    @PreAuthorize("hasRole('CONSUMER')")
    public ApiResponse<Page<PopupSummaryResponse>> getMyWishlist(
        @AuthenticationPrincipal(expression = "id") Long userId,
        Pageable pageable
    ) {
        Page<PopupSummaryResponse> page = wishlistService.getMyWishlist(userId, pageable);
        return ApiResponse.success(page);
    }
}
