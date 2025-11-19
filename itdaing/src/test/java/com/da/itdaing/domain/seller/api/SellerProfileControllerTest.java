// src/test/java/com/da/itdaing/domain/seller/api/SellerProfileControllerTest.java
package com.da.itdaing.domain.seller.api;

import com.da.itdaing.domain.file.dto.ImagePayload;
import com.da.itdaing.domain.seller.dto.SellerProfileRequest;
import com.da.itdaing.domain.seller.dto.SellerProfileResponse;
import com.da.itdaing.domain.seller.service.SellerProfileService;
import com.da.itdaing.global.error.GlobalExceptionHandler;
import com.da.itdaing.global.security.JwtAuthFilter;
import com.da.itdaing.global.security.JwtAuthenticationHandler;
import com.da.itdaing.global.security.JwtTokenProvider;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(SellerProfileController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
@TestPropertySource(properties = "storage.provider=test")
class SellerProfileControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @MockitoBean private SellerProfileService sellerProfileService;
    @MockitoBean private JwtAuthFilter jwtAuthFilter;
    @MockitoBean private JwtTokenProvider jwtTokenProvider;
    @MockitoBean private JwtAuthenticationHandler jwtAuthenticationHandler;

    @Test
    @DisplayName("판매자 프로필 조회 - 성공(프로필 존재)")
    void getMyProfile_success_exists() throws Exception {
        // given
        SellerProfileResponse resp = SellerProfileResponse.builder()
            .userId(1L)
            .exists(true)
            .profileImage(ImagePayload.builder()
                .url("https://example.com/p.png")
                .key("uploads/p.png")
                .build())
            .introduction("소개문")
            .activityRegion("광주 남구")
            .snsUrl("https://instagram.com/xyz")
            .build();
        given(sellerProfileService.getMyProfile(1L)).willReturn(resp);

        // when & then
        mockMvc.perform(get("/api/sellers/me/profile")
                .principal(() -> "1"))
            .andDo(print())
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true)) // <-- 이제 성공할 것입니다
            .andExpect(jsonPath("$.data.exists").value(true))
            .andExpect(jsonPath("$.data.userId").value(1))
            .andExpect(jsonPath("$.data.activityRegion").value("광주 남구"))
            .andExpect(jsonPath("$.error").doesNotExist());

        verify(sellerProfileService).getMyProfile(1L);
    }

    @Test
    @DisplayName("판매자 프로필 조회 - 성공(프로필 없음: 초기 상태)")
    void getMyProfile_success_empty() throws Exception {
        // given - 없음 케이스
        SellerProfileResponse empty = SellerProfileResponse.builder()
            .userId(1L)
            .exists(false)
            .build();
        given(sellerProfileService.getMyProfile(1L)).willReturn(empty);

        // when & then
        mockMvc.perform(get("/api/sellers/me/profile")
                .principal(() -> "1"))
            .andDo(print())
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.exists").value(false))
            .andExpect(jsonPath("$.data.userId").value(1))
            .andExpect(jsonPath("$.error").doesNotExist());

        verify(sellerProfileService).getMyProfile(1L);
    }

    @Test
    @DisplayName("판매자 프로필 업서트 - 성공")
    void upsertMyProfile_success() throws Exception {
        // given
        SellerProfileRequest req = SellerProfileRequest.builder()
            .profileImage(ImagePayload.builder()
                .url("https://example.com/new.png")
                .key("uploads/new.png")
                .build())
            .introduction("업데이트 소개문")
            .activityRegion("광주 동구")
            .snsUrl("https://instagram.com/new")
            .build();

        SellerProfileResponse resp = SellerProfileResponse.builder()
            .userId(1L)
            .exists(true)
            .profileImage(req.getProfileImage())
            .introduction(req.getIntroduction())
            .activityRegion(req.getActivityRegion())
            .snsUrl(req.getSnsUrl())
            .build();

        given(sellerProfileService.upsertMyProfile(eq(1L), any(SellerProfileRequest.class))).willReturn(resp);

        // when & then
        mockMvc.perform(put("/api/sellers/me/profile")
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req))
                .principal(() -> "1"))
            .andDo(print())
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.exists").value(true))
            .andExpect(jsonPath("$.data.userId").value(1))
            .andExpect(jsonPath("$.data.activityRegion").value("광주 동구"))
            .andExpect(jsonPath("$.error").doesNotExist());

        verify(sellerProfileService).upsertMyProfile(eq(1L), any(SellerProfileRequest.class));
    }
}
