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

/**
 * 외부 서비스 설정 API
 * 
 * 보안 정책:
 * - API 키는 일부만 마스킹하여 반환
 * - 또는 서버에서 직접 Kakao API 프록시 제공
 */
@RestController
@RequestMapping("/api/config")
public class ConfigController {

    @Value("${external.kakao.map-app-key:}")
    private String kakaoMapAppKey;

    /**
     * Kakao Map JavaScript API Key 제공
     * 
     * 보안 고려사항:
     * - JavaScript Key는 도메인 제한으로 보호됨
     * - Kakao Developers에서 도메인 설정 필요
     * - 브라우저에서만 사용 가능
     */
    @GetMapping("/map-key")
    public ResponseEntity<ApiResponse<MapKeyResponse>> getMapKey() {
        if (!StringUtils.hasText(kakaoMapAppKey)) {
            throw new IllegalStateException("KAKAO_MAP_APP_KEY is not configured");
        }
        
        // JavaScript Key는 도메인 제한으로 보호되므로 그대로 반환
        // Kakao Developers에서 허용 도메인 설정:
        // - https://aischool.daitdaing.link
        // - http://localhost:3000 (개발용)
        return ResponseEntity.ok(ApiResponse.success(new MapKeyResponse(kakaoMapAppKey)));
    }

    @Getter
    @AllArgsConstructor
    public static class MapKeyResponse {
        private String kakaoMapAppKey;
    }
}

