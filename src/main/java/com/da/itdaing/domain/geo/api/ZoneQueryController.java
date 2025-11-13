package com.da.itdaing.domain.geo.api;

import com.da.itdaing.domain.geo.dto.ZoneSummaryResponse;
import com.da.itdaing.domain.geo.service.ZoneQueryService;
import com.da.itdaing.global.web.ApiResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/zones")
@RequiredArgsConstructor
public class ZoneQueryController {

    private final ZoneQueryService zoneQueryService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ZoneSummaryResponse>>> getZones() {
        return ResponseEntity.ok(ApiResponse.success(zoneQueryService.getZones()));
    }
}


