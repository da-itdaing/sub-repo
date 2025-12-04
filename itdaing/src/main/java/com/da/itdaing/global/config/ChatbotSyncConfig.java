package com.da.itdaing.global.config;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

/**
 * Chatbot 동기화 클라이언트 설정
 *
 * <p>RestTemplate Bean과 비동기 처리를 위한 @EnableAsync 설정
 */
@Configuration
@EnableAsync
public class ChatbotSyncConfig {

    /**
     * RestTemplate Bean 생성
     *
     * <p>타임아웃 설정:
     * - connect: 3초
     * - read: 10초 (임베딩 처리 시간 고려)
     */
    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        return builder
            .connectTimeout(Duration.ofSeconds(3))
            .readTimeout(Duration.ofSeconds(10))
            .build();
    }
}

