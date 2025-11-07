package com.da.itdaing.domain.reco;

import com.da.itdaing.domain.common.enums.UserRole;
import com.da.itdaing.domain.geo.ZoneArea;
import com.da.itdaing.domain.geo.ZoneAreaRepository;
import com.da.itdaing.domain.geo.ZoneCell;
import com.da.itdaing.domain.geo.ZoneCellRepository;
import com.da.itdaing.domain.master.Region;
import com.da.itdaing.domain.master.RegionRepository;
import com.da.itdaing.domain.popup.Popup;
import com.da.itdaing.domain.popup.PopupRepository;
import com.da.itdaing.domain.user.repository.UserRepository;
import com.da.itdaing.domain.user.entity.Users;
import com.da.itdaing.testsupport.JpaSliceTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@JpaSliceTest
class DailyConsumerRecommendationRepositoryTest {

    @Autowired
    private DailyConsumerRecommendationRepository dailyConsumerRecommendationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PopupRepository popupRepository;

    @Autowired
    private ZoneCellRepository zoneCellRepository;

    @Autowired
    private ZoneAreaRepository zoneAreaRepository;

    @Autowired
    private RegionRepository regionRepository;

    @Test
    void 일일_소비자_추천을_저장하고_조회할_수_있다() {
        // given
        Users consumer = Users.builder()
                .loginId("consumer1")
                .password("pass")
                .email("consumer1@example.com")
                .role(UserRole.CONSUMER)
                .build();
        userRepository.save(consumer);

        Users seller = Users.builder()
                .loginId("seller1")
                .password("pass")
                .email("seller1@example.com")
                .role(UserRole.SELLER)
                .build();
        userRepository.save(seller);

        Region region = Region.builder().name("남구").build();
        regionRepository.save(region);

        ZoneArea zoneArea = ZoneArea.builder()
                .region(region)
                .name("송암동 상권")
                .build();
        zoneAreaRepository.save(zoneArea);

        ZoneCell zoneCell = ZoneCell.builder()
                .zoneArea(zoneArea)
                .label("A-1")
                .build();
        zoneCellRepository.save(zoneCell);

        Popup popup = Popup.builder()
                .seller(seller)
                .zoneCell(zoneCell)
                .name("팝업")
                .build();
        popupRepository.save(popup);

        DailyConsumerRecommendation recommendation = DailyConsumerRecommendation.builder()
                .consumer(consumer)
                .popup(popup)
                .recommendationDate(LocalDate.of(2025, 11, 1))
                .score(new BigDecimal("0.850"))
                .modelVersion("v1.0")
                .reasonJson("{\"reason\":\"similar_preferences\"}")
                .build();

        // when
        DailyConsumerRecommendation saved = dailyConsumerRecommendationRepository.save(recommendation);
        DailyConsumerRecommendation found = dailyConsumerRecommendationRepository.findById(saved.getId()).orElseThrow();

        // then
        assertThat(found.getConsumer().getId()).isEqualTo(consumer.getId());
        assertThat(found.getPopup().getId()).isEqualTo(popup.getId());
        assertThat(found.getRecommendationDate()).isEqualTo(LocalDate.of(2025, 11, 1));
        assertThat(found.getScore()).isEqualByComparingTo(new BigDecimal("0.850"));
        assertThat(found.getModelVersion()).isEqualTo("v1.0");
        assertThat(found.getCreatedAt()).isNotNull();
    }

    @Test
    void 동일한_소비자_날짜_팝업_조합은_중복_저장할_수_없다() {
        // given
        Users consumer = Users.builder()
                .loginId("consumer2")
                .password("pass")
                .email("consumer2@example.com")
                .role(UserRole.CONSUMER)
                .build();
        userRepository.save(consumer);

        Users seller = Users.builder()
                .loginId("seller2")
                .password("pass")
                .email("seller2@example.com")
                .role(UserRole.SELLER)
                .build();
        userRepository.save(seller);

        Region region = Region.builder().name("동구").build();
        regionRepository.save(region);

        ZoneArea zoneArea = ZoneArea.builder()
                .region(region)
                .name("충장로 상권")
                .build();
        zoneAreaRepository.save(zoneArea);

        ZoneCell zoneCell = ZoneCell.builder()
                .zoneArea(zoneArea)
                .label("B-1")
                .build();
        zoneCellRepository.save(zoneCell);

        Popup popup = Popup.builder()
                .seller(seller)
                .zoneCell(zoneCell)
                .name("팝업2")
                .build();
        popupRepository.save(popup);

        LocalDate date = LocalDate.of(2025, 11, 2);

        DailyConsumerRecommendation rec1 = DailyConsumerRecommendation.builder()
                .consumer(consumer)
                .popup(popup)
                .recommendationDate(date)
                .score(new BigDecimal("0.750"))
                .build();
        dailyConsumerRecommendationRepository.save(rec1);

        DailyConsumerRecommendation rec2 = DailyConsumerRecommendation.builder()
                .consumer(consumer)
                .popup(popup)
                .recommendationDate(date)
                .score(new BigDecimal("0.800"))
                .build();

        // when & then
        assertThatThrownBy(() -> {
            dailyConsumerRecommendationRepository.save(rec2);
            dailyConsumerRecommendationRepository.flush();
        }).isInstanceOf(DataIntegrityViolationException.class);
    }
}

