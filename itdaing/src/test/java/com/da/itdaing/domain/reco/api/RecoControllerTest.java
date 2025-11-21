// src/test/java/com/da/itdaing/domain/reco/api/RecoControllerTest.java
package com.da.itdaing.domain.reco.api;

import com.da.itdaing.domain.reco.dto.RecoPopupCardResponse;
import com.da.itdaing.domain.reco.service.DailyRecommendationService;
import com.da.itdaing.global.api.ApiResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(RecoController.class)
class RecoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private DailyRecommendationService dailyRecommendationService;

    @Test
    @DisplayName("CONSUMER 권한으로 일일 추천 조회 시 정상 응답을 반환한다")
    @WithMockUser(username = "1", roles = "CONSUMER")
    void getDailyRecommendations_success() throws Exception {
        // given
        Long userId = 1L;
        int limit = 5;

        RecoPopupCardResponse card1 = new RecoPopupCardResponse(
            10L,
            "추천 팝업1",
            "설명1",
            "2025-01-01",
            "2025-01-10",
            "홍대입구",
            null,
            7L
        );

        RecoPopupCardResponse card2 = new RecoPopupCardResponse(
            20L,
            "추천 팝업2",
            "설명2",
            "2025-02-01",
            "2025-02-05",
            "강남역",
            null,
            3L
        );

        when(dailyRecommendationService.getDailyRecommendations(eq(userId), eq(limit)))
            .thenReturn(List.of(card1, card2));

        // when & then
        mockMvc.perform(get("/api/reco/daily/me")
                .param("limit", String.valueOf(limit))
                .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            // ApiResponse<Boolean, data, error> 구조 검증
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data", hasSize(2)))
            .andExpect(jsonPath("$.data[0].id", is(10)))
            .andExpect(jsonPath("$.data[0].title", is("추천 팝업1")))
            .andExpect(jsonPath("$.data[0].favoriteCount", is(7)))
            .andExpect(jsonPath("$.data[1].id", is(20)))
            .andExpect(jsonPath("$.data[1].locationName", is("강남역")));

        verify(dailyRecommendationService, times(1))
            .getDailyRecommendations(userId, limit);
    }

    @Test
    @DisplayName("limit이 너무 크면 safeLimit(최대 50)으로 제한되어 서비스가 호출된다")
    @WithMockUser(username = "1", roles = "CONSUMER")
    void getDailyRecommendations_limit_clamped() throws Exception {
        // given
        Long userId = 1L;
        int requestedLimit = 999;
        int expectedLimit = 50; // 컨트롤러 내부의 safeLimit 로직

        when(dailyRecommendationService.getDailyRecommendations(eq(userId), eq(expectedLimit)))
            .thenReturn(List.of());

        // when
        mockMvc.perform(get("/api/reco/daily/me")
                .param("limit", String.valueOf(requestedLimit))
                .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data", hasSize(0)));

        // then
        verify(dailyRecommendationService, times(1))
            .getDailyRecommendations(userId, expectedLimit);
    }
}
