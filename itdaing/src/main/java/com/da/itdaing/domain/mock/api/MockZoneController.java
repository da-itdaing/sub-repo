package com.da.itdaing.domain.mock.api;

import com.da.itdaing.domain.mock.dto.MockZone;
import com.da.itdaing.domain.mock.service.MockDataService;
import com.da.itdaing.global.web.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@Profile("local")
@RequiredArgsConstructor
@RequestMapping("/api/dev/zones")
public class MockZoneController {

    private final MockDataService mockDataService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<MockZone>>> getZones() {
        return ResponseEntity.ok(ApiResponse.success(mockDataService.getZones()));
    }
}

