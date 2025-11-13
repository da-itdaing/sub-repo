package com.da.itdaing.domain.popup.api;

import com.da.itdaing.domain.popup.dto.PopupCreateRequest;
import com.da.itdaing.domain.popup.dto.PopupOperatingHourResponse;
import com.da.itdaing.domain.popup.dto.PopupReviewSummaryResponse;
import com.da.itdaing.domain.popup.dto.PopupSummaryResponse;
import com.da.itdaing.domain.popup.service.PopupCommandService;
import com.da.itdaing.domain.popup.service.PopupQueryService;
import com.da.itdaing.global.error.GlobalExceptionHandler;
import com.da.itdaing.global.security.JwtAuthFilter;
import com.da.itdaing.global.security.JwtAuthenticationHandler;
import com.da.itdaing.global.security.JwtTokenProvider;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(PopupCommandController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
@TestPropertySource(properties = "storage.provider=test")
class PopupCommandControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @MockitoBean PopupCommandService popupCommandService;
    @MockitoBean PopupQueryService popupQueryService;
    @MockitoBean JwtAuthFilter jwtAuthFilter;
    @MockitoBean JwtTokenProvider jwtTokenProvider;
    @MockitoBean JwtAuthenticationHandler jwtAuthenticationHandler;

    @Test
    @DisplayName("판매자가 팝업을 등록할 수 있다")
    void createPopup_success() throws Exception {
        PopupCreateRequest request = new PopupCreateRequest(
            "봄 시즌 플리마켓",
            "광주 상무지구에서 열리는 봄맞이 플리마켓입니다.",
            LocalDate.of(2025, 3, 1),
            LocalDate.of(2025, 3, 31),
            "매일 11:00-20:00",
            100L,
            List.of(1L, 2L),
            List.of(3L),
            List.of(5L),
            List.of(7L),
            "https://s3.example.com/thumbnail.jpg",
            List.of("https://s3.example.com/gallery-1.jpg")
        );

        PopupSummaryResponse summary = new PopupSummaryResponse(
            200L,
            "봄 시즌 플리마켓",
            10L,
            "데모 판매자",
            1L,
            2L,
            "셀 A",
            "상무지구",
            "광주광역시 서구",
            "PENDING",
            "2025-03-01",
            "2025-03-31",
            "매일 11:00-20:00",
            List.of(new PopupOperatingHourResponse("매일", "11:00-20:00")),
            "광주 상무지구에서 열리는 봄맞이 플리마켓입니다.",
            0L,
            0L,
            List.of(1L, 2L),
            List.of(5L),
            List.of("트렌디"),
            "https://s3.example.com/thumbnail.jpg",
            List.of("https://s3.example.com/gallery-1.jpg"),
            new PopupReviewSummaryResponse(0.0, 0, List.of(0, 0, 0, 0, 0)),
            "2025-02-01T10:00:00",
            "2025-02-01T10:00:00"
        );

        given(popupCommandService.createPopup(any(Long.class), any(PopupCreateRequest.class))).willReturn(200L);
        given(popupQueryService.getPopup(200L)).willReturn(summary);

        mockMvc.perform(post("/api/popups")
                .principal(() -> "10")
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.id").value(200))
            .andExpect(jsonPath("$.data.sellerId").value(10))
            .andExpect(jsonPath("$.error").doesNotExist());

        verify(popupCommandService).createPopup(any(Long.class), any(PopupCreateRequest.class));
        verify(popupQueryService).getPopup(200L);
    }

    @Test
    @DisplayName("판매자가 팝업을 수정할 수 있다")
    void updatePopup_success() throws Exception {
        PopupCreateRequest request = new PopupCreateRequest(
            "여름 야시장",
            "야간 한정 야시장입니다.",
            LocalDate.of(2025, 7, 1),
            LocalDate.of(2025, 7, 15),
            "매일 18:00-23:00",
            200L,
            List.of(4L),
            List.of(),
            List.of(8L),
            List.of(9L),
            "https://s3.example.com/new-thumb.jpg",
            List.of("https://s3.example.com/new-1.jpg")
        );

        PopupSummaryResponse summary = new PopupSummaryResponse(
            200L,
            "여름 야시장",
            10L,
            "데모 판매자",
            1L,
            2L,
            "셀 B",
            "상무지구",
            "광주광역시 서구",
            "PENDING",
            "2025-07-01",
            "2025-07-15",
            "매일 18:00-23:00",
            List.of(new PopupOperatingHourResponse("매일", "18:00-23:00")),
            "야간 한정 야시장입니다.",
            0L,
            0L,
            List.of(4L),
            List.of(8L),
            List.of("빈티지"),
            "https://s3.example.com/new-thumb.jpg",
            List.of("https://s3.example.com/new-1.jpg"),
            new PopupReviewSummaryResponse(0.0, 0, List.of(0, 0, 0, 0, 0)),
            "2025-02-02T10:00:00",
            "2025-02-02T10:00:00"
        );

        given(popupCommandService.updatePopup(any(Long.class), any(Long.class), any(PopupCreateRequest.class))).willReturn(200L);
        given(popupQueryService.getPopup(200L)).willReturn(summary);

        mockMvc.perform(put("/api/popups/200")
                .principal(() -> "10")
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.id").value(200))
            .andExpect(jsonPath("$.data.title").value("여름 야시장"));

        verify(popupCommandService).updatePopup(any(Long.class), any(Long.class), any(PopupCreateRequest.class));
        verify(popupQueryService).getPopup(200L);
    }

    @Test
    @DisplayName("판매자가 팝업을 삭제할 수 있다")
    void deletePopup_success() throws Exception {
        doNothing().when(popupCommandService).deletePopup(any(Long.class), any(Long.class));

        mockMvc.perform(delete("/api/popups/200")
                .principal(() -> "10"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data").doesNotExist());

        verify(popupCommandService).deletePopup(any(Long.class), any(Long.class));
    }
}
