package com.da.itdaing.domain.metric;

import com.da.itdaing.domain.common.enums.UserRole;
import com.da.itdaing.domain.geo.entity.ZoneArea;
import com.da.itdaing.domain.geo.repository.ZoneAreaRepository;
import com.da.itdaing.domain.geo.entity.ZoneCell;
import com.da.itdaing.domain.geo.repository.ZoneCellRepository;
import com.da.itdaing.domain.master.entity.Region;
import com.da.itdaing.domain.master.repository.RegionRepository;
import com.da.itdaing.domain.metric.entity.MetricDailyPopup;
import com.da.itdaing.domain.metric.repository.MetricDailyPopupRepository;
import com.da.itdaing.domain.popup.entity.Popup;
import com.da.itdaing.domain.popup.repository.PopupRepository;
import com.da.itdaing.domain.user.entity.Users;
import com.da.itdaing.domain.user.repository.UserRepository;
import com.da.itdaing.testsupport.JpaSliceTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@JpaSliceTest
class MetricDailyPopupRepositoryTest {

    @Autowired
    private MetricDailyPopupRepository metricDailyPopupRepository;

    @Autowired
    private PopupRepository popupRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ZoneCellRepository zoneCellRepository;

    @Autowired
    private ZoneAreaRepository zoneAreaRepository;

    @Autowired
    private RegionRepository regionRepository;

    @Test
    void 팝업_일일_메트릭을_저장하고_조회할_수_있다() {
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

        ZoneCell zoneCell = ZoneCell.builder()
                .zoneArea(zoneArea)
                .owner(seller)
                .label("A-1")
                .lat(35.0101)
                .lng(126.9711)
                .build();
        zoneCellRepository.save(zoneCell);

        Popup popup = Popup.builder()
                .seller(seller)
                .zoneCell(zoneCell)
                .name("팝업")
                .build();
        popupRepository.save(popup);

        MetricDailyPopup metric = MetricDailyPopup.builder()
                .popup(popup)
                .date(LocalDate.of(2025, 11, 1))
                .views(100)
                .uniqueUsers(50)
                .favorites(10)
                .reviews(5)
                .build();

        // when
        MetricDailyPopup saved = metricDailyPopupRepository.save(metric);
        MetricDailyPopup found = metricDailyPopupRepository.findById(saved.getId()).orElseThrow();

        // then
        assertThat(found.getPopup().getId()).isEqualTo(popup.getId());
        assertThat(found.getDate()).isEqualTo(LocalDate.of(2025, 11, 1));
        assertThat(found.getViews()).isEqualTo(100);
        assertThat(found.getUniqueUsers()).isEqualTo(50);
        assertThat(found.getFavorites()).isEqualTo(10);
        assertThat(found.getReviews()).isEqualTo(5);
    }

    @Test
    void 동일한_팝업과_날짜_조합은_중복_저장할_수_없다() {
        // given
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
                .owner(seller)
                .label("B-1")
                .lat(35.0202)
                .lng(126.9822)
                .build();
        zoneCellRepository.save(zoneCell);

        Popup popup = Popup.builder()
                .seller(seller)
                .zoneCell(zoneCell)
                .name("팝업2")
                .build();
        popupRepository.save(popup);

        LocalDate date = LocalDate.of(2025, 11, 2);

        MetricDailyPopup metric1 = MetricDailyPopup.builder()
                .popup(popup)
                .date(date)
                .views(50)
                .build();
        metricDailyPopupRepository.save(metric1);

        MetricDailyPopup metric2 = MetricDailyPopup.builder()
                .popup(popup)
                .date(date)
                .views(100)
                .build();

        // when & then
        assertThatThrownBy(() -> {
            metricDailyPopupRepository.save(metric2);
            metricDailyPopupRepository.flush();
        }).isInstanceOf(DataIntegrityViolationException.class);
    }
}

