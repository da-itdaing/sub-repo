package com.da.itdaing.domain.popup.api;

import com.da.itdaing.domain.popup.dto.PopupReviewResponse;
import com.da.itdaing.domain.popup.dto.PopupSummaryResponse;
import com.da.itdaing.domain.popup.service.PopupQueryService;
import com.da.itdaing.global.web.ApiResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
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
}

