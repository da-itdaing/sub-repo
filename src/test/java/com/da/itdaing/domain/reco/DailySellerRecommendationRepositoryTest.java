package com.da.itdaing.domain.reco;

import com.da.itdaing.domain.common.enums.UserRole;
import com.da.itdaing.domain.geo.entity.ZoneArea;
import com.da.itdaing.domain.geo.repository.ZoneAreaRepository;
import com.da.itdaing.domain.master.entity.Region;
import com.da.itdaing.domain.master.repository.RegionRepository;
import com.da.itdaing.domain.reco.entity.DailySellerRecommendation;
import com.da.itdaing.domain.reco.repository.DailySellerRecommendationRepository;
import com.da.itdaing.domain.user.repository.UserRepository;
import com.da.itdaing.domain.user.entity.Users;
import com.da.itdaing.testsupport.JpaSliceTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

@JpaSliceTest
class DailySellerRecommendationRepositoryTest {

    @Autowired
    private DailySellerRecommendationRepository dailySellerRecommendationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ZoneAreaRepository zoneAreaRepository;

    @Autowired
    private RegionRepository regionRepository;

    @Test
    void 일일_판매자_추천을_저장하고_조회할_수_있다() {
        // given
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

        DailySellerRecommendation recommendation = DailySellerRecommendation.builder()
                .seller(seller)
                .zoneArea(zoneArea)
                .recommendationDate(LocalDate.of(2025, 11, 1))
                .score(new BigDecimal("0.920"))
                .modelVersion("v2.0")
                .reasonJson("{\"reason\":\"high_traffic_area\"}")
                .build();

        // when
        DailySellerRecommendation saved = dailySellerRecommendationRepository.save(recommendation);
        DailySellerRecommendation found = dailySellerRecommendationRepository.findById(saved.getId()).orElseThrow();

        // then
        assertThat(found.getSeller().getId()).isEqualTo(seller.getId());
        assertThat(found.getZoneArea().getId()).isEqualTo(zoneArea.getId());
        assertThat(found.getRecommendationDate()).isEqualTo(LocalDate.of(2025, 11, 1));
        assertThat(found.getScore()).isEqualByComparingTo(new BigDecimal("0.920"));
        assertThat(found.getModelVersion()).isEqualTo("v2.0");
        assertThat(found.getCreatedAt()).isNotNull();
    }
}

