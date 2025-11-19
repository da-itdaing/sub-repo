package com.da.itdaing.global.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

/**
 * OpenAPI 문서 생성을 위한 실행 프로파일에서만 등록되는 최소 JwtTokenProvider 빈.
 * SecurityConfig(일반/운영)는 @Profile("!openapi")로 제외되므로,
 * 서비스 레이어(AuthService 등)의 의존성 주입을 만족시키기 위해 동일 시그니처의 빈을 제공한다.
 */
@Profile("openapi")
@Configuration
public class JwtBeansOpenApiConfig {

    @Bean
    public JwtTokenProvider jwtTokenProvider(
        @Value("${jwt.secret:ThisIsALongDefaultJwtSecretKeyForOpenApiProfile_ChangeMe_1234567890}") String secret,
        @Value("${jwt.issuer:itdaing-server}") String issuer,
        @Value("${jwt.access-token-expiration:900000}") long accessTokenExpMs,
        @Value("${jwt.refresh-token-expiration:1209600000}") long refreshTokenExpMs
    ) {
        // 실제 보안은 필요 없고 애플리케이션 컨텍스트만 기동되면 되므로,
        // 구성 값으로 정상적인 Provider를 생성해 의존성만 만족시킨다.
        return new JwtTokenProvider(secret, issuer, accessTokenExpMs, refreshTokenExpMs);
    }
}
