// EventController.java
package com.da.itdaing.domain.metric.api;

import com.da.itdaing.domain.metric.dto.ViewEventRequest;
import com.da.itdaing.domain.metric.service.MetricService;
import com.da.itdaing.global.web.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final MetricService metricService;

    @PostMapping("/view")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<Void> recordView(@RequestBody @Valid ViewEventRequest req, Principal principal) {
        metricService.recordView(req, principal);
        return ApiResponse.ok(); // 바디 없는 성공
    }
}
