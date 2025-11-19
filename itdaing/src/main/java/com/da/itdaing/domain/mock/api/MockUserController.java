package com.da.itdaing.domain.mock.api;

import com.da.itdaing.domain.mock.dto.MockConsumerProfile;
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

@RestController
@Profile("local")
@RequiredArgsConstructor
@RequestMapping("/api/dev/users")
public class MockUserController {

    private final MockDataService mockDataService;

    @GetMapping("/{username}")
    public ResponseEntity<ApiResponse<MockConsumerProfile>> getUserProfile(@PathVariable String username) {
        MockConsumerProfile profile = mockDataService.getConsumerProfile(username)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User profile not found: " + username));
        return ResponseEntity.ok(ApiResponse.success(profile));
    }
}

