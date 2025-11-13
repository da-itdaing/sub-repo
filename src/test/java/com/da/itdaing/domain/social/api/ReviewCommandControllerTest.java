package com.da.itdaing.domain.social.api;

import com.da.itdaing.domain.social.dto.ReviewCreateRequest;
import com.da.itdaing.domain.social.dto.ReviewResponse;
import com.da.itdaing.domain.social.dto.ReviewUpdateRequest;
import com.da.itdaing.domain.social.service.ReviewCommandService;
import com.da.itdaing.global.error.GlobalExceptionHandler;
import com.da.itdaing.global.security.JwtAuthFilter;
import com.da.itdaing.global.security.JwtAuthenticationHandler;
import com.da.itdaing.global.security.JwtTokenProvider;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDateTime;
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

@WebMvcTest(ReviewCommandController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
@TestPropertySource(properties = "storage.provider=test")
class ReviewCommandControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @MockitoBean ReviewCommandService reviewCommandService;
    @MockitoBean com.da.itdaing.domain.social.repository.ReviewRepository reviewRepository;
    @MockitoBean com.da.itdaing.domain.social.repository.ReviewImageRepository reviewImageRepository;
    @MockitoBean JwtAuthFilter jwtAuthFilter;
    @MockitoBean JwtTokenProvider jwtTokenProvider;
    @MockitoBean JwtAuthenticationHandler jwtAuthenticationHandler;

    @Test
    @DisplayName("소비자가 리뷰를 작성할 수 있다")
    void createReview_success() throws Exception {
        ReviewCreateRequest request = new ReviewCreateRequest(
            (byte) 5,
            "정말 좋은 팝업이었습니다!",
            List.of("https://s3.example.com/review-1.jpg")
        );

        ReviewResponse response = new ReviewResponse(
            100L,
            200L,
            10L,
            "consumer1",
            (byte) 5,
            "정말 좋은 팝업이었습니다!",
            List.of("https://s3.example.com/review-1.jpg"),
            LocalDateTime.now()
        );

        given(reviewCommandService.createReview(any(Long.class), any(Long.class), any(ReviewCreateRequest.class))).willReturn(100L);
        
        com.da.itdaing.domain.social.entity.Review mockReview = org.mockito.Mockito.mock(com.da.itdaing.domain.social.entity.Review.class);
        com.da.itdaing.domain.user.entity.Users mockConsumer = org.mockito.Mockito.mock(com.da.itdaing.domain.user.entity.Users.class);
        com.da.itdaing.domain.popup.entity.Popup mockPopup = org.mockito.Mockito.mock(com.da.itdaing.domain.popup.entity.Popup.class);
        
        org.mockito.Mockito.when(mockReview.getId()).thenReturn(100L);
        org.mockito.Mockito.when(mockReview.getConsumer()).thenReturn(mockConsumer);
        org.mockito.Mockito.when(mockReview.getPopup()).thenReturn(mockPopup);
        org.mockito.Mockito.when(mockReview.getRating()).thenReturn((byte) 5);
        org.mockito.Mockito.when(mockReview.getContent()).thenReturn("정말 좋은 팝업이었습니다!");
        org.mockito.Mockito.when(mockReview.getCreatedAt()).thenReturn(LocalDateTime.now());
        org.mockito.Mockito.when(mockConsumer.getId()).thenReturn(10L);
        org.mockito.Mockito.when(mockConsumer.getLoginId()).thenReturn("consumer1");
        org.mockito.Mockito.when(mockPopup.getId()).thenReturn(200L);
        
        given(reviewRepository.findById(100L)).willReturn(java.util.Optional.of(mockReview));
        given(reviewImageRepository.findByReviewIdIn(any())).willReturn(List.of());

        mockMvc.perform(post("/api/popups/200/reviews")
                .principal(() -> "10")
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.id").value(100))
            .andExpect(jsonPath("$.data.rating").value(5));

        verify(reviewCommandService).createReview(any(Long.class), any(Long.class), any(ReviewCreateRequest.class));
    }

    @Test
    @DisplayName("소비자가 리뷰를 수정할 수 있다")
    void updateReview_success() throws Exception {
        ReviewUpdateRequest request = new ReviewUpdateRequest(
            (byte) 4,
            "수정된 리뷰 내용",
            List.of("https://s3.example.com/new.jpg")
        );

        given(reviewCommandService.updateReview(any(Long.class), any(Long.class), any(ReviewUpdateRequest.class))).willReturn(100L);
        
        com.da.itdaing.domain.social.entity.Review mockReview = org.mockito.Mockito.mock(com.da.itdaing.domain.social.entity.Review.class);
        com.da.itdaing.domain.user.entity.Users mockConsumer = org.mockito.Mockito.mock(com.da.itdaing.domain.user.entity.Users.class);
        com.da.itdaing.domain.popup.entity.Popup mockPopup = org.mockito.Mockito.mock(com.da.itdaing.domain.popup.entity.Popup.class);
        
        org.mockito.Mockito.when(mockReview.getId()).thenReturn(100L);
        org.mockito.Mockito.when(mockReview.getConsumer()).thenReturn(mockConsumer);
        org.mockito.Mockito.when(mockReview.getPopup()).thenReturn(mockPopup);
        org.mockito.Mockito.when(mockReview.getRating()).thenReturn((byte) 4);
        org.mockito.Mockito.when(mockReview.getContent()).thenReturn("수정된 리뷰 내용");
        org.mockito.Mockito.when(mockReview.getCreatedAt()).thenReturn(LocalDateTime.now());
        org.mockito.Mockito.when(mockConsumer.getId()).thenReturn(10L);
        org.mockito.Mockito.when(mockConsumer.getLoginId()).thenReturn("consumer1");
        org.mockito.Mockito.when(mockPopup.getId()).thenReturn(200L);
        
        given(reviewRepository.findById(100L)).willReturn(java.util.Optional.of(mockReview));
        given(reviewImageRepository.findByReviewIdIn(any())).willReturn(List.of());

        mockMvc.perform(put("/api/reviews/100")
                .principal(() -> "10")
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.id").value(100))
            .andExpect(jsonPath("$.data.rating").value(4));

        verify(reviewCommandService).updateReview(any(Long.class), any(Long.class), any(ReviewUpdateRequest.class));
    }

    @Test
    @DisplayName("소비자가 리뷰를 삭제할 수 있다")
    void deleteReview_success() throws Exception {
        doNothing().when(reviewCommandService).deleteReview(any(Long.class), any(Long.class));

        mockMvc.perform(delete("/api/reviews/100")
                .principal(() -> "10"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data").doesNotExist());

        verify(reviewCommandService).deleteReview(any(Long.class), any(Long.class));
    }
}

