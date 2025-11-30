package com.da.itdaing.domain.messaging.api;

import com.da.itdaing.domain.messaging.dto.NoticeCreateRequest;
import com.da.itdaing.domain.messaging.dto.NoticeResponse;
import com.da.itdaing.domain.messaging.service.SellerNoticeService;
import com.da.itdaing.global.web.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/sellers")
@RequiredArgsConstructor
public class SellerNoticeController {

    private final SellerNoticeService sellerNoticeService;

    /**
     * 판매자용 전체 공지사항 조회 (ALL + SELLER 대상)
     * GET /api/sellers/me/notices
     */
    @GetMapping("/me/notices")
    public ApiResponse<Page<NoticeResponse>> getSellerNotices(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "100") int size
    ) {
        PageRequest pageRequest = PageRequest.of(page, size);
        Page<NoticeResponse> responsePage = sellerNoticeService.getSellerNotices(pageRequest);
        return ApiResponse.success(responsePage);
    }

    /**
     * 공지사항 상세 조회 (공개)
     * GET /api/sellers/notices/{noticeId}
     */
    @GetMapping("/notices/{noticeId}")
    public ApiResponse<NoticeResponse> getNoticeById(
        @PathVariable Long noticeId
    ) {
        NoticeResponse response = sellerNoticeService.getNoticeByIdPublic(noticeId);
        return ApiResponse.success(response);
    }

    /**
     * 공지사항 등록
     * POST /api/sellers/notices
     */
    @PostMapping("/notices")
    public ApiResponse<NoticeResponse> createNotice(
        Principal principal,
        @RequestBody NoticeCreateRequest request
    ) {
        Long sellerUserId = Long.valueOf(principal.getName());
        NoticeResponse response = sellerNoticeService.createNotice(sellerUserId, request);
        return ApiResponse.success(response);
    }

    /**
     * 공지사항 수정
     * PUT /api/sellers/notices/{noticeId}
     */
    @PutMapping("/notices/{noticeId}")
    public ApiResponse<NoticeResponse> updateNotice(
        Principal principal,
        @PathVariable Long noticeId,
        @RequestBody NoticeCreateRequest request
    ) {
        Long sellerUserId = Long.valueOf(principal.getName());
        NoticeResponse response = sellerNoticeService.updateNotice(sellerUserId, noticeId, request);
        return ApiResponse.success(response);
    }

    /**
     * 공지사항 삭제
     * DELETE /api/sellers/notices/{noticeId}
     */
    @DeleteMapping("/notices/{noticeId}")
    public ApiResponse<Void> deleteNotice(
        Principal principal,
        @PathVariable Long noticeId
    ) {
        Long sellerUserId = Long.valueOf(principal.getName());
        sellerNoticeService.deleteNotice(sellerUserId, noticeId);
        return ApiResponse.success();
    }

    /**
     * 공지사항 다중 삭제
     * DELETE /api/sellers/notices
     */
    @DeleteMapping("/notices")
    public ApiResponse<Void> deleteNotices(
        Principal principal,
        @RequestBody DeleteNoticesRequest request
    ) {
        Long sellerUserId = Long.valueOf(principal.getName());
        sellerNoticeService.deleteNotices(sellerUserId, request.getIds());
        return ApiResponse.success();
    }

    @lombok.Data
    public static class DeleteNoticesRequest {
        private List<Long> ids;
    }
}
