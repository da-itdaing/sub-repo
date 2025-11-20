// SellerMetricsController.java
package com.da.itdaing.domain.metric.api;

import com.da.itdaing.domain.metric.dto.ViewsTimeseriesResponse;
import com.da.itdaing.domain.metric.service.MetricService;
import com.da.itdaing.global.web.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/sellers/popups")
@RequiredArgsConstructor
public class SellerMetricsController {

    private final MetricService metricService;

    @GetMapping("/{popupId}/views")
    @PreAuthorize("hasRole('SELLER')")
    public ApiResponse<ViewsTimeseriesResponse> getViews(
        @PathVariable Long popupId,
        @RequestParam(defaultValue = "daily") String granularity,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
        Principal principal
    ) {
        Long sellerId = Long.parseLong(principal.getName());
        var data = metricService.getViewsForSeller(popupId, granularity, from, to, sellerId);
        return ApiResponse.ok(data);
    }
}
