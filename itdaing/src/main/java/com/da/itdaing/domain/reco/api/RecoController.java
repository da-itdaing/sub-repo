// src/main/java/com/da/itdaing/domain/reco/api/RecoController.java
package com.da.itdaing.domain.reco.api;

import com.da.itdaing.domain.reco.dto.RecoPopupCardResponse;
import com.da.itdaing.domain.reco.service.DailyRecommendationService;
import com.da.itdaing.global.api.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/reco")
public class RecoController {

    private final DailyRecommendationService dailyRecommendationService;

    /**
     * AI 일일 추천 조회
     * GET /api/reco/daily/me?limit=10
     * (로그인: 소비자)
     */
    @GetMapping("/daily/me")
    @PreAuthorize("hasRole('CONSUMER')")
    public ApiResponse<List<RecoPopupCardResponse>> getDailyRecommendations(
        Principal principal,
        @RequestParam(name = "limit", defaultValue = "10") int limit
    ) {
        // principal.getName() 이 userId 문자열이라고 가정 (아니면 여기만 프로젝트에 맞게 수정)
        Long userId = Long.parseLong(principal.getName());

        // limit 가드 (1 ~ 50 사이로 제한)
        int safeLimit = Math.max(1, Math.min(limit, 50));

        List<RecoPopupCardResponse> result =
            dailyRecommendationService.getDailyRecommendations(userId, safeLimit);

        return ApiResponse.success(result);
    }
}
