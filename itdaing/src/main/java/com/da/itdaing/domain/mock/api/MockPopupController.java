package com.da.itdaing.domain.mock.api;

import com.da.itdaing.domain.mock.dto.MockPopup;
import com.da.itdaing.domain.mock.dto.MockReview;
import com.da.itdaing.domain.mock.service.MockDataService;
import com.da.itdaing.global.web.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@Profile("local")
@RequiredArgsConstructor
@RequestMapping("/api/dev/popups")
public class MockPopupController {

    private final MockDataService mockDataService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<MockPopup>>> getPopups() {
        return ResponseEntity.ok(ApiResponse.success(mockDataService.getPopups()));
    }

    @GetMapping("/{popupId}")
    public ResponseEntity<ApiResponse<MockPopup>> getPopup(@PathVariable long popupId) {
        MockPopup popup = mockDataService.findPopup(popupId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Popup not found: " + popupId));
        return ResponseEntity.ok(ApiResponse.success(popup));
    }

    @GetMapping("/{popupId}/reviews")
    public ResponseEntity<ApiResponse<List<MockReview>>> getReviews(@PathVariable long popupId) {
        if (mockDataService.findPopup(popupId).isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Popup not found: " + popupId);
        }
        List<MockReview> reviews = mockDataService.getReviewsByPopupId(popupId);
        return ResponseEntity.ok(ApiResponse.success(reviews));
    }

    @GetMapping("/reviews")
    public ResponseEntity<ApiResponse<List<MockReview>>> getAllReviews() {
        return ResponseEntity.ok(ApiResponse.success(mockDataService.getReviews()));
    }
}

