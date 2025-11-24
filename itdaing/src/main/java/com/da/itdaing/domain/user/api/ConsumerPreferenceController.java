package com.da.itdaing.domain.user.api;

import com.da.itdaing.domain.user.dto.PreferenceUpdateRequest;
import com.da.itdaing.domain.user.dto.PreferenceResponse;
import com.da.itdaing.domain.user.service.PreferenceService;
import com.da.itdaing.global.web.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/consumers/me/preferences")
public class ConsumerPreferenceController {

    private final PreferenceService preferenceService;

    @GetMapping
    @PreAuthorize("hasRole('CONSUMER')")
    public ApiResponse<PreferenceResponse> getMyPreferences(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return ApiResponse.success(preferenceService.getMyPreferences(userId));
    }

    @PutMapping
    @PreAuthorize("hasRole('CONSUMER')")
    public ApiResponse<Void> updateMyPreferences(@RequestBody PreferenceUpdateRequest req, Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        preferenceService.updateMyPreferences(req, userId);
        return ApiResponse.success(null);
    }
}
