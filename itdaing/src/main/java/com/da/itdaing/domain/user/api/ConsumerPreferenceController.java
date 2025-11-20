package com.da.itdaing.domain.user.api;

import com.da.itdaing.domain.user.dto.PreferenceUpdateRequest;
import com.da.itdaing.domain.user.service.PreferenceService;
import com.da.itdaing.global.web.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/consumers/me/preferences")
public class ConsumerPreferenceController {

    private final PreferenceService preferenceService;

    @PutMapping
    @PreAuthorize("hasRole('CONSUMER')")
    public ApiResponse<Void> updateMyPreferences(@RequestBody PreferenceUpdateRequest req, Principal principal) {
        preferenceService.updateMyPreferences(req, principal);
        return ApiResponse.success(null); // 프로젝트의 응답 규약에 맞춰 사용
    }
}
