package com.da.itdaing.domain.popup;

import com.da.itdaing.domain.common.enums.UserRole;
import com.da.itdaing.domain.geo.entity.ZoneArea;
import com.da.itdaing.domain.geo.repository.ZoneAreaRepository;
import com.da.itdaing.domain.geo.entity.ZoneCell;
import com.da.itdaing.domain.geo.repository.ZoneCellRepository;
import com.da.itdaing.domain.master.entity.Region;
import com.da.itdaing.domain.master.repository.RegionRepository;
import com.da.itdaing.domain.popup.entity.Popup;
import com.da.itdaing.domain.popup.entity.PopupImage;
import com.da.itdaing.domain.popup.repository.PopupImageRepository;
import com.da.itdaing.domain.popup.repository.PopupRepository;
import com.da.itdaing.domain.user.repository.UserRepository;
import com.da.itdaing.domain.user.entity.Users;
import com.da.itdaing.testsupport.JpaSliceTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static org.assertj.core.api.Assertions.assertThat;

@JpaSliceTest
class PopupImageRepositoryTest {

    @Autowired
    private PopupImageRepository popupImageRepository;

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
    void 팝업_이미지를_저장하고_조회할_수_있다() {
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
                .lat(35.0789)
                .lng(126.9765)
                .build();
        zoneCellRepository.save(zoneCell);

        Popup popup = Popup.builder()
                .seller(seller)
                .zoneCell(zoneCell)
                .name("팝업")
                .build();
        popupRepository.save(popup);

        PopupImage image = PopupImage.builder()
                .popup(popup)
                .imageUrl("https://example.com/image.jpg")
                .isThumbnail(true)
                .build();

        // when
        PopupImage saved = popupImageRepository.save(image);
        PopupImage found = popupImageRepository.findById(saved.getId()).orElseThrow();

        // then
        assertThat(found.getImageUrl()).isEqualTo("https://example.com/image.jpg");
        assertThat(found.getIsThumbnail()).isTrue();
        assertThat(found.getCreatedAt()).isNotNull();
    }
}

