package com.da.itdaing.global.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.*;

import java.util.List;

/* ===================== 공용 빈 ===================== */
@Configuration
class CommonSecurityBeans {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /** CORS 설정 (전체 경로 허용: /** ) */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of(
            "http://localhost:*",
            "http://127.0.0.1:*",
            "https://*.elb.amazonaws.com",
            "https://*.daitdaing.link",
            "http://*.daitdaing.link"
        ));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("Authorization"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

        // ⭐ 모든 경로 CORS 허용
        source.registerCorsConfiguration("/**", config);

        return source;
    }
}

/* ============ 일반/운영 프로파일용 보안체인 ============ */
@Profile("!openapi")
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    /** JwtTokenProvider 생성 */
    @Bean
    public JwtTokenProvider jwtTokenProvider(
        @Value("${jwt.secret}") String secret,
        @Value("${jwt.issuer:itdaing-server}") String issuer,
        @Value("${jwt.access-token-expiration:900000}") long accessTokenExpMs,
        @Value("${jwt.refresh-token-expiration:1209600000}") long refreshTokenExpMs
    ) {
        return new JwtTokenProvider(secret, issuer, accessTokenExpMs, refreshTokenExpMs);
    }

    /** 인증 실패/거부 핸들러 */
    @Bean
    public JwtAuthenticationHandler jwtAuthenticationHandler(ObjectMapper objectMapper) {
        return new JwtAuthenticationHandler(objectMapper);
    }

    /** JWT 필터 */
    @Bean
    public JwtAuthFilter jwtAuthFilter(JwtTokenProvider jwtTokenProvider) {
        return new JwtAuthFilter(jwtTokenProvider);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http,
                                               JwtAuthFilter jwtAuthFilter,
                                               JwtAuthenticationHandler jwtAuthenticationHandler) throws Exception {
    http
        .cors(cors -> {})
        .csrf(AbstractHttpConfigurer::disable)
        
        // 🔥 기본 인증 사용 안함
        .httpBasic(AbstractHttpConfigurer::disable)
        
        .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .exceptionHandling(ex -> ex
            .authenticationEntryPoint(jwtAuthenticationHandler)
            .accessDeniedHandler(jwtAuthenticationHandler)
        )
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/", "/index.html").permitAll()
            .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
            .requestMatchers(HttpMethod.POST, "/api/events/view").authenticated()
            .requestMatchers("/api/auth/**").permitAll()
            .requestMatchers(HttpMethod.GET, "/api/master/**").permitAll()
            .requestMatchers(HttpMethod.GET, "/api/popups/**").permitAll()
            .requestMatchers(HttpMethod.GET, "/api/sellers/**").permitAll()
            .requestMatchers(HttpMethod.GET, "/api/zones/**").permitAll()
            .requestMatchers(HttpMethod.GET, "/api/config/**").permitAll()
            .requestMatchers(HttpMethod.GET, "/api/inquiries/**").permitAll()
            .requestMatchers(HttpMethod.GET, "/api/dev/**").permitAll()
            .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
            .requestMatchers("/actuator/health").permitAll()
            .requestMatchers(HttpMethod.GET, "/uploads/**").permitAll()
            .anyRequest().authenticated()
        )
        .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        


    return http.build();
    }

}
