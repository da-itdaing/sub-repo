package com.da.itdaing.domain.seller.api;

import com.da.itdaing.domain.seller.dto.SellerSummaryResponse;
import com.da.itdaing.domain.seller.service.SellerQueryService;
import com.da.itdaing.global.web.ApiResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/sellers")
@RequiredArgsConstructor
public class SellerQueryController {

    private final SellerQueryService sellerQueryService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SellerSummaryResponse>>> getSellers() {
        return ResponseEntity.ok(ApiResponse.success(sellerQueryService.getSellers()));
    }

    @GetMapping("/{sellerId}")
    public ResponseEntity<ApiResponse<SellerSummaryResponse>> getSeller(@PathVariable Long sellerId) {
        return ResponseEntity.ok(ApiResponse.success(sellerQueryService.getSeller(sellerId)));
    }
}

