package com.da.itdaing.global.infra;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

/**
 * Chatbot 서비스와 PGVector 동기화를 위한 HTTP 클라이언트
 *
 * <p>Spring에서 popup CRUD 시 Chatbot의 /api/sync/* 엔드포인트를 호출하여
 * RAG 벡터 데이터를 동기화합니다.
 *
 * <p>비동기(@Async) 처리로 메인 트랜잭션에 영향을 주지 않습니다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ChatbotSyncClient {

    private final RestTemplate restTemplate;

    @Value("${chatbot.sync.base-url:http://localhost:9000}")
    private String chatbotBaseUrl;

    @Value("${chatbot.sync.enabled:true}")
    private boolean syncEnabled;

    /**
     * Popup 생성/수정 시 임베딩 동기화
     *
     * @param popupId 동기화할 popup ID
     */
    @Async
    public void syncPopup(Long popupId) {
        if (!syncEnabled) {
            log.debug("[ChatbotSync] 동기화 비활성화 상태, popup={} 스킵", popupId);
            return;
        }

        try {
            String url = chatbotBaseUrl + "/api/sync/popup";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> body = Map.of("popup_id", popupId);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

            restTemplate.exchange(url, HttpMethod.POST, request, String.class);
            log.info("[ChatbotSync] Popup {} 동기화 완료", popupId);

        } catch (Exception e) {
            log.warn("[ChatbotSync] Popup {} 동기화 실패: {}", popupId, e.getMessage());
            // 동기화 실패해도 메인 로직에 영향 없음
        }
    }

    /**
     * Popup 삭제 시 임베딩 제거
     *
     * @param popupId 삭제할 popup ID
     */
    @Async
    public void deletePopup(Long popupId) {
        if (!syncEnabled) {
            log.debug("[ChatbotSync] 동기화 비활성화 상태, popup={} 삭제 스킵", popupId);
            return;
        }

        try {
            String url = chatbotBaseUrl + "/api/sync/popup/" + popupId;
            restTemplate.delete(url);
            log.info("[ChatbotSync] Popup {} 임베딩 삭제 완료", popupId);

        } catch (Exception e) {
            log.warn("[ChatbotSync] Popup {} 임베딩 삭제 실패: {}", popupId, e.getMessage());
            // 삭제 실패해도 메인 로직에 영향 없음
        }
    }

    /**
     * 동기화 상태 확인 (Health check용)
     *
     * @return 동기화 서비스 상태
     */
    public Map<String, Object> getStatus() {
        if (!syncEnabled) {
            return Map.of("enabled", false, "message", "동기화 비활성화");
        }

        try {
            String url = chatbotBaseUrl + "/api/sync/status";
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            return Map.of(
                "enabled", true,
                "chatbotUrl", chatbotBaseUrl,
                "status", response != null ? response : Map.of()
            );

        } catch (Exception e) {
            return Map.of(
                "enabled", true,
                "chatbotUrl", chatbotBaseUrl,
                "error", e.getMessage()
            );
        }
    }
}

