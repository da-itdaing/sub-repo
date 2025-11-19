package com.da.itdaing.domain.mock.api;

import com.da.itdaing.domain.mock.dto.MockMessageThread;
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
@RequestMapping("/api/dev/messages")
public class MockMessageController {

    private final MockDataService mockDataService;

    @GetMapping("/threads")
    public ResponseEntity<ApiResponse<List<MockMessageThread>>> getThreads() {
        return ResponseEntity.ok(ApiResponse.success(mockDataService.getMessageThreads()));
    }
}

