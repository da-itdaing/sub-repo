package com.da.itdaing.domain.popup;

import com.da.itdaing.domain.common.enums.UserRole;
import com.da.itdaing.domain.geo.entity.ZoneArea;
import com.da.itdaing.domain.geo.repository.ZoneAreaRepository;
import com.da.itdaing.domain.geo.entity.ZoneCell;
import com.da.itdaing.domain.geo.repository.ZoneCellRepository;
import com.da.itdaing.domain.master.entity.Feature;
import com.da.itdaing.domain.master.repository.FeatureRepository;
import com.da.itdaing.domain.master.entity.Region;
import com.da.itdaing.domain.master.repository.RegionRepository;
import com.da.itdaing.domain.popup.entity.Popup;
import com.da.itdaing.domain.popup.entity.PopupFeature;
import com.da.itdaing.domain.popup.repository.PopupFeatureRepository;
import com.da.itdaing.domain.popup.repository.PopupRepository;
import com.da.itdaing.domain.user.entity.Users;
import com.da.itdaing.domain.user.repository.UserRepository;
import com.da.itdaing.testsupport.JpaSliceTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static org.assertj.core.api.Assertions.assertThat;

@JpaSliceTest
class PopupFeatureRepositoryTest {

    @Autowired
    private PopupFeatureRepository popupFeatureRepository;

    @Autowired
    private PopupRepository popupRepository;

    @Autowired
    private FeatureRepository featureRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ZoneCellRepository zoneCellRepository;

    @Autowired
    private ZoneAreaRepository zoneAreaRepository;

    @Autowired
    private RegionRepository regionRepository;

    @Test
    void 팝업_특징을_저장하고_조회할_수_있다() {
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
                .lat(35.0678)
                .lng(126.9654)
                .build();
        zoneCellRepository.save(zoneCell);

        Popup popup = Popup.builder()
                .seller(seller)
                .zoneCell(zoneCell)
                .name("팝업")
                .build();
        popupRepository.save(popup);

        Feature feature = Feature.builder()
                .name("무료 주차")
                .build();
        featureRepository.save(feature);

        PopupFeature popupFeature = PopupFeature.builder()
                .popup(popup)
                .feature(feature)
                .build();

        // when
        PopupFeature saved = popupFeatureRepository.save(popupFeature);
        PopupFeature found = popupFeatureRepository.findById(saved.getId()).orElseThrow();

        // then
        assertThat(found.getPopup().getId()).isEqualTo(popup.getId());
        assertThat(found.getFeature().getId()).isEqualTo(feature.getId());
    }
}
