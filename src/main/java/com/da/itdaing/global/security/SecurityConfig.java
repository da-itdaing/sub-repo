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

    /** CORS 설정: /api/** 만 허용 */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(
            "http://localhost:3000",
            "http://localhost:5173",
            "http://localhost:8081"
        ));
        config.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("Authorization"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }
}

/* ============ 일반/운영 프로파일용 보안체인 ============ */
@Profile("!openapi")
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    /** JwtTokenProvider를 여기서만 생성(@Component 제거 가정) */
    @Bean
    public JwtTokenProvider jwtTokenProvider(
        @Value("${jwt.secret}") String secret,
        @Value("${jwt.issuer:itdaing-server}") String issuer,
        @Value("${jwt.access-token-expiration:900000}") long accessTokenExpMs,        // 15분 기본값
        @Value("${jwt.refresh-token-expiration:1209600000}") long refreshTokenExpMs   // 14일 기본값
    ) {
        return new JwtTokenProvider(secret, issuer, accessTokenExpMs, refreshTokenExpMs);
    }

    /** 핸들러는 ObjectMapper를 필요로 함 */
    @Bean
    public JwtAuthenticationHandler jwtAuthenticationHandler(ObjectMapper objectMapper) {
        return new JwtAuthenticationHandler(objectMapper);
    }

    /** 필터는 JwtTokenProvider만 필요함 */
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
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint(jwtAuthenticationHandler)
                .accessDeniedHandler(jwtAuthenticationHandler)
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/master/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/popups/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/sellers/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/zones/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/inquiries/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/dev/**").permitAll()
                .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                .requestMatchers("/actuator/health").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/uploads/**").permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
