// src/main/java/com/da/itdaing/domain/messaging/api/SellerNoticeController.java
package com.da.itdaing.domain.messaging.api;

import com.da.itdaing.domain.messaging.dto.NoticeCreateRequest;
import com.da.itdaing.domain.messaging.dto.NoticeResponse;
import com.da.itdaing.domain.messaging.service.SellerNoticeService;
import com.da.itdaing.global.api.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

// import는 네 프로젝트의 실제 Principal 타입에 맞게 수정
// import com.da.itdaing.global.auth.CustomUserPrincipal;

@RestController
@RequestMapping("/api/sellers/notices")
@RequiredArgsConstructor
public class SellerNoticeController {

    private final SellerNoticeService sellerNoticeService;

    /**
     * 공지 등록 (POST /api/sellers/notices)
     */
    @PostMapping
    public ApiResponse<NoticeResponse> createNotice(
        @AuthenticationPrincipal /* CustomUserPrincipal */ Object principal,
        @RequestBody NoticeCreateRequest request
    ) {
        // TODO: 실제 로그인 사용자 ID 가져오는 로직으로 교체
        Long sellerUserId = extractUserId(principal);

        NoticeResponse response = sellerNoticeService.createNotice(sellerUserId, request);
        return ApiResponse.success(response);
    }

    /**
     * 공지 조회 (GET /api/sellers/notices?popupId=&page=&size=)
     */
    @GetMapping
    public ApiResponse<Page<NoticeResponse>> getNotices(
        @AuthenticationPrincipal /* CustomUserPrincipal */ Object principal,
        @RequestParam Long popupId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        Long sellerUserId = extractUserId(principal);

        PageRequest pageRequest = PageRequest.of(page, size);
        Page<NoticeResponse> responsePage =
            sellerNoticeService.getNotices(sellerUserId, popupId, pageRequest);

        return ApiResponse.success(responsePage);
    }

    /**
     * 🔧 여기만 네 프로젝트에 맞게 고치면 됨
     *  - 예: ((CustomUserPrincipal) principal).getUserId()
     */
    private Long extractUserId(Object principal) {
        // 임시 구현: 실제로는 네가 쓰는 Principal 타입으로 캐스팅해서 userId 꺼내기
        // 예시:
        // CustomUserPrincipal p = (CustomUserPrincipal) principal;
        // return p.getUserId();

        throw new UnsupportedOperationException("Principal → userId 매핑을 구현하세요.");
    }
}
