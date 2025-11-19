package com.da.itdaing.global.config;

import com.da.itdaing.global.web.ApiResponse;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/config")
public class ConfigController {

    @Value("${external.kakao.map-app-key:}")
    private String kakaoMapAppKey;

    @GetMapping("/map-key")
    public ResponseEntity<ApiResponse<MapKeyResponse>> getMapKey() {
        if (!StringUtils.hasText(kakaoMapAppKey)) {
            throw new IllegalStateException("KAKAO_MAP_APP_KEY is not configured");
        }
        return ResponseEntity.ok(ApiResponse.success(new MapKeyResponse(kakaoMapAppKey)));
    }

    @Getter
    @AllArgsConstructor
    public static class MapKeyResponse {
        private String kakaoMapAppKey;
    }
}

