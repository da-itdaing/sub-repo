package com.da.itdaing.support;

import com.da.itdaing.global.error.GlobalExceptionHandler;
import com.da.itdaing.global.security.JwtAuthFilter;
import com.da.itdaing.global.security.JwtAuthenticationHandler;
import com.da.itdaing.global.security.JwtTokenProvider;
import org.springframework.boot.autoconfigure.ImportAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@Import(GlobalExceptionHandler.class)
@AutoConfigureMockMvc(addFilters = false)
@ImportAutoConfiguration(exclude = {
    SecurityAutoConfiguration.class,
    SecurityFilterAutoConfiguration.class
})
public abstract class MvcNoSecurityTest {

    @MockitoBean protected JwtAuthFilter jwtAuthFilter;
    @MockitoBean protected JwtTokenProvider jwtTokenProvider;
    @MockitoBean protected JwtAuthenticationHandler jwtAuthenticationHandler;
}
