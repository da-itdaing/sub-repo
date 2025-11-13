// src/main/java/com/da/itdaing/domain/master/controller/MasterQueryController.java
package com.da.itdaing.domain.master.controller;

import com.da.itdaing.domain.master.dto.CategoryResponse;
import com.da.itdaing.domain.master.dto.FeatureResponse;
import com.da.itdaing.domain.master.dto.RegionResponse;
import com.da.itdaing.domain.master.dto.StyleResponse;
import com.da.itdaing.domain.master.service.MasterQueryService;
import com.da.itdaing.global.web.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/master")
@RequiredArgsConstructor
public class MasterQueryController {

    private final MasterQueryService masterQueryService;

    @GetMapping(value = "/regions", produces = "application/json")
    public ResponseEntity<ApiResponse<List<RegionResponse>>> getRegions() {
        return ResponseEntity.ok(ApiResponse.success(masterQueryService.getAllRegions()));
    }

    @GetMapping(value = "/styles", produces = "application/json")
    public ResponseEntity<ApiResponse<List<StyleResponse>>> getStyles() {
        return ResponseEntity.ok(ApiResponse.success(masterQueryService.getAllStyles()));
    }

    @GetMapping(value = "/features", produces = "application/json")
    public ResponseEntity<ApiResponse<List<FeatureResponse>>> getFeatures() {
        return ResponseEntity.ok(ApiResponse.success(masterQueryService.getAllFeatures()));
    }

    @GetMapping(value = "/categories", produces = "application/json")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getCategories() {
        return ResponseEntity.ok(ApiResponse.success(masterQueryService.getAllCategories()));
    }
}
