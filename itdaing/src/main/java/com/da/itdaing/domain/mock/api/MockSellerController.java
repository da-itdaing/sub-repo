package com.da.itdaing.domain.mock.api;

import com.da.itdaing.domain.mock.dto.MockSeller;
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
@RequestMapping("/api/dev/sellers")
public class MockSellerController {

    private final MockDataService mockDataService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<MockSeller>>> getSellers() {
        return ResponseEntity.ok(ApiResponse.success(mockDataService.getSellers()));
    }

    @GetMapping("/{sellerId}")
    public ResponseEntity<ApiResponse<MockSeller>> getSeller(@PathVariable long sellerId) {
        MockSeller seller = mockDataService.findSeller(sellerId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Seller not found: " + sellerId));
        return ResponseEntity.ok(ApiResponse.success(seller));
    }
}

