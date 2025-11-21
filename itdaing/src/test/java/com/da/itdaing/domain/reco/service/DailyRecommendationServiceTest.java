// src/test/java/com/da/itdaing/domain/reco/service/DailyRecommendationServiceTest.java
package com.da.itdaing.domain.reco.service;

import com.da.itdaing.domain.popup.entity.Popup;
import com.da.itdaing.domain.reco.dto.RecoPopupCardResponse;
import com.da.itdaing.domain.reco.entity.DailyConsumerRecommendation;
import com.da.itdaing.domain.reco.repository.DailyConsumerRecommendationRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DailyRecommendationServiceTest {

    @Mock
    private DailyConsumerRecommendationRepository dailyRecoRepository;

    @InjectMocks
    private DailyRecommendationService dailyRecommendationService;

    @Test
    @DisplayName("추천 조회 시 중복 팝업은 제거되고 limit 개수만 반환된다")
    void getDailyRecommendations_dedup_and_limit() {
        // given
        Long userId = 1L;
        int limit = 2;

        // Mock DailyConsumerRecommendation
        DailyConsumerRecommendation reco1 = mock(DailyConsumerRecommendation.class);
        DailyConsumerRecommendation reco2 = mock(DailyConsumerRecommendation.class);
        DailyConsumerRecommendation reco3 = mock(DailyConsumerRecommendation.class);

        // Mock Popup
        Popup popup1 = mock(Popup.class); // id = 10L
        Popup popup2 = mock(Popup.class); // id = 10L (중복)
        Popup popup3 = mock(Popup.class); // id = 20L

        when(reco1.getPopup()).thenReturn(popup1);
        when(reco2.getPopup()).thenReturn(popup2);
        when(reco3.getPopup()).thenReturn(popup3);

        when(popup1.getId()).thenReturn(10L);
        when(popup2.getId()).thenReturn(10L);
        when(popup3.getId()).thenReturn(20L);

        when(popup1.getName()).thenReturn("팝업1");
//        when(popup2.getName()).thenReturn("팝업1-중복");
        when(popup3.getName()).thenReturn("팝업2");

        when(popup1.getDescription()).thenReturn("설명1");
        when(popup3.getDescription()).thenReturn("설명2");

        when(popup1.getFavoriteCount()).thenReturn(5L);
        when(popup3.getFavoriteCount()).thenReturn(3L);

        // repository가 3개의 추천을 반환 (popupId: 10, 10, 20)
        when(dailyRecoRepository.findByConsumer_IdOrderByIdDesc(userId))
            .thenReturn(List.of(reco1, reco2, reco3));

        // when
        List<RecoPopupCardResponse> result =
            dailyRecommendationService.getDailyRecommendations(userId, limit);

        // then
        // 1) 중복 제거 후 popupId 10, 20 → 2개
        assertThat(result).hasSize(2);

        // 2) 순서 유지 (먼저 나온 10, 그다음 20)
        assertThat(result.get(0).id()).isEqualTo(10L);
        assertThat(result.get(1).id()).isEqualTo(20L);

        // 3) favoriteCount 매핑 확인
        assertThat(result.get(0).favoriteCount()).isEqualTo(5L);
        assertThat(result.get(1).favoriteCount()).isEqualTo(3L);

        // 4) repository 호출 검증
        verify(dailyRecoRepository, times(1))
            .findByConsumer_IdOrderByIdDesc(userId);
    }

    @Test
    @DisplayName("추천에 popup이 null인 항목은 필터링된다")
    void getDailyRecommendations_filter_null_popup() {
        // given
        Long userId = 1L;

        DailyConsumerRecommendation reco1 = mock(DailyConsumerRecommendation.class);
        DailyConsumerRecommendation reco2 = mock(DailyConsumerRecommendation.class);

        Popup popup1 = mock(Popup.class);

        when(reco1.getPopup()).thenReturn(popup1);
        when(reco2.getPopup()).thenReturn(null); // null popup

        when(popup1.getId()).thenReturn(100L);
        when(popup1.getName()).thenReturn("유효 팝업");
        when(popup1.getDescription()).thenReturn("설명");
        when(popup1.getFavoriteCount()).thenReturn(1L);

        when(dailyRecoRepository.findByConsumer_IdOrderByIdDesc(userId))
            .thenReturn(List.of(reco1, reco2));

        // when
        List<RecoPopupCardResponse> result =
            dailyRecommendationService.getDailyRecommendations(userId, 10);

        // then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).id()).isEqualTo(100L);
    }
}
