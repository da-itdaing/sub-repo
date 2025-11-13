package com.da.itdaing.domain.popup.api;

import com.da.itdaing.domain.popup.dto.PopupReviewResponse;
import com.da.itdaing.domain.popup.dto.PopupSearchRequest;
import com.da.itdaing.domain.popup.dto.PopupSummaryResponse;
import com.da.itdaing.domain.popup.service.PopupQueryService;
import com.da.itdaing.global.web.ApiResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/popups")
@RequiredArgsConstructor
public class PopupQueryController {

    private final PopupQueryService popupQueryService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PopupSummaryResponse>>> getPopups() {
        return ResponseEntity.ok(ApiResponse.success(popupQueryService.getPopups()));
    }

    @GetMapping("/{popupId}")
    public ResponseEntity<ApiResponse<PopupSummaryResponse>> getPopup(@PathVariable Long popupId) {
        return ResponseEntity.ok(ApiResponse.success(popupQueryService.getPopup(popupId)));
    }

    @GetMapping("/reviews")
    public ResponseEntity<ApiResponse<List<PopupReviewResponse>>> getAllReviews() {
        return ResponseEntity.ok(ApiResponse.success(popupQueryService.getAllReviews()));
    }

    @GetMapping("/{popupId}/reviews")
    public ResponseEntity<ApiResponse<List<PopupReviewResponse>>> getReviewsByPopup(@PathVariable Long popupId) {
        return ResponseEntity.ok(ApiResponse.success(popupQueryService.getReviewsByPopup(popupId)));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<PopupSummaryResponse>>> searchPopups(
        @RequestParam(required = false) String keyword,
        @RequestParam(required = false) Long regionId,
        @RequestParam(required = false) List<Long> categoryIds,
        @RequestParam(required = false) String startDate,
        @RequestParam(required = false) String endDate,
        @RequestParam(required = false) String approvalStatus,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        PopupSearchRequest request = PopupSearchRequest.builder()
            .keyword(keyword)
            .regionId(regionId)
            .categoryIds(categoryIds)
            .startDate(startDate != null ? java.time.LocalDate.parse(startDate) : null)
            .endDate(endDate != null ? java.time.LocalDate.parse(endDate) : null)
            .approvalStatus(approvalStatus != null ? com.da.itdaing.domain.common.enums.ApprovalStatus.valueOf(approvalStatus) : null)
            .page(page)
            .size(size)
            .build();
        
        Page<PopupSummaryResponse> result = popupQueryService.searchPopups(request);
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}

