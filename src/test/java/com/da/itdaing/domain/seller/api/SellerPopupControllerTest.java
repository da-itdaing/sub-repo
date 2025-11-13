package com.da.itdaing.domain.seller.api;

import com.da.itdaing.domain.popup.dto.PopupOperatingHourResponse;
import com.da.itdaing.domain.popup.dto.PopupReviewSummaryResponse;
import com.da.itdaing.domain.popup.dto.PopupSummaryResponse;
import com.da.itdaing.domain.popup.service.PopupQueryService;
import com.da.itdaing.global.error.GlobalExceptionHandler;
import com.da.itdaing.global.security.JwtAuthFilter;
import com.da.itdaing.global.security.JwtAuthenticationHandler;
import com.da.itdaing.global.security.JwtTokenProvider;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(SellerPopupController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
@TestPropertySource(properties = "storage.provider=test")
class SellerPopupControllerTest {

    @Autowired MockMvc mockMvc;

    @MockitoBean PopupQueryService popupQueryService;
    @MockitoBean JwtAuthFilter jwtAuthFilter;
    @MockitoBean JwtTokenProvider jwtTokenProvider;
    @MockitoBean JwtAuthenticationHandler jwtAuthenticationHandler;

    @Test
    @DisplayName("판매자 소유 팝업 목록을 조회한다")
    void getMyPopups_success() throws Exception {
        PopupSummaryResponse popup = new PopupSummaryResponse(
            1L,
            "테스트 팝업",
            42L,
            "테스트 셀러",
            10L,
            20L,
            "셀A",
            "상무지구",
            "광주광역시 상무지구",
            "APPROVED",
            "2025-01-01",
            "2025-01-31",
            "10:00-20:00",
            List.of(new PopupOperatingHourResponse("매일", "10:00-20:00")),
            "소개",
            100L,
            5L,
            List.of(1L, 2L),
            List.of(3L),
            List.of("트렌디"),
            "https://example.com/thumb.jpg",
            List.of("https://example.com/img1.jpg"),
            new PopupReviewSummaryResponse(4.5, 10, List.of(1, 2, 3, 4, 0)),
            "2025-01-01T10:00:00",
            "2025-01-02T12:00:00"
        );
        given(popupQueryService.getPopupsBySeller(42L)).willReturn(List.of(popup));

        mockMvc.perform(get("/api/sellers/me/popups")
                .principal(() -> "42")
                .accept(APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data[0].id").value(1))
            .andExpect(jsonPath("$.data[0].sellerId").value(42))
            .andExpect(jsonPath("$.error").doesNotExist());

        verify(popupQueryService).getPopupsBySeller(42L);
    }
}
