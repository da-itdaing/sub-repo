// src/main/java/com/da/itdaing/domain/reco/service/DailyRecommendationService.java
package com.da.itdaing.domain.reco.service;

import com.da.itdaing.domain.popup.entity.Popup;
import com.da.itdaing.domain.reco.dto.RecoPopupCardResponse;
import com.da.itdaing.domain.reco.entity.DailyConsumerRecommendation;
import com.da.itdaing.domain.reco.repository.DailyConsumerRecommendationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DailyRecommendationService {

    private final DailyConsumerRecommendationRepository dailyRecoRepository;

    public List<RecoPopupCardResponse> getDailyRecommendations(Long userId, int limit) {
        // 일단 이 유저에 대한 모든 추천을 가져오고, 나중에 limit로 자른다.
        List<DailyConsumerRecommendation> recos =
            dailyRecoRepository.findByConsumer_IdOrderByIdDesc(userId);

        return recos.stream()
            .map(DailyConsumerRecommendation::getPopup)
            .filter(Objects::nonNull)
            // 같은 팝업이 여러 번 추천될 경우 한 번만
            .collect(Collectors.toMap(
                Popup::getId,
                p -> p,
                (p1, p2) -> p1, // 중복 발생 시 첫 번째 유지
                LinkedHashMap::new
            ))
            .values().stream()
            .limit(limit)
            .map(this::toCardResponse)
            .toList();
    }

    private RecoPopupCardResponse toCardResponse(Popup p) {
        var zoneCell = p.getZoneCell();
        var zoneArea = zoneCell != null ? zoneCell.getZoneArea() : null;

        String locationName = zoneArea != null ? zoneArea.getName() : null;
        String startDate = p.getStartDate() != null ? p.getStartDate().toString() : null;
        String endDate = p.getEndDate() != null ? p.getEndDate().toString() : null;

        return new RecoPopupCardResponse(
            p.getId(),
            p.getName(),
            p.getDescription(),
            startDate,
            endDate,
            locationName,
            null,               // thumbnail: 아직 이미지 연동 전이면 null
            p.getFavoriteCount()
        );
    }
}
