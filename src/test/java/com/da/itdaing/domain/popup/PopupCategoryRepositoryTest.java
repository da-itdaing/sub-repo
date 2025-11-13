package com.da.itdaing.domain.popup;

import com.da.itdaing.domain.common.enums.UserRole;
import com.da.itdaing.domain.geo.entity.ZoneArea;
import com.da.itdaing.domain.geo.repository.ZoneAreaRepository;
import com.da.itdaing.domain.geo.entity.ZoneCell;
import com.da.itdaing.domain.geo.repository.ZoneCellRepository;
import com.da.itdaing.domain.master.entity.Category;
import com.da.itdaing.domain.master.repository.CategoryRepository;
import com.da.itdaing.domain.master.entity.Region;
import com.da.itdaing.domain.master.repository.RegionRepository;
import com.da.itdaing.domain.popup.entity.Popup;
import com.da.itdaing.domain.popup.entity.PopupCategory;
import com.da.itdaing.domain.popup.repository.PopupCategoryRepository;
import com.da.itdaing.domain.popup.repository.PopupRepository;
import com.da.itdaing.domain.user.repository.UserRepository;
import com.da.itdaing.domain.user.entity.Users;
import com.da.itdaing.testsupport.JpaSliceTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static org.assertj.core.api.Assertions.assertThat;

@JpaSliceTest
class PopupCategoryRepositoryTest {

    @Autowired
    private PopupCategoryRepository popupCategoryRepository;

    @Autowired
    private PopupRepository popupRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ZoneCellRepository zoneCellRepository;

    @Autowired
    private ZoneAreaRepository zoneAreaRepository;

    @Autowired
    private RegionRepository regionRepository;

    @Test
    void 팝업_카테고리를_저장하고_조회할_수_있다() {
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
            .lat(35.0456)
            .lng(126.9543)
            .build();
        zoneCellRepository.save(zoneCell);

        Popup popup = Popup.builder()
            .seller(seller)
            .zoneCell(zoneCell)
            .name("팝업")
            .build();
        popupRepository.save(popup);

        Category category = Category.builder()
            .name("패션")
            .build();
        categoryRepository.save(category);

        PopupCategory popupCategory = PopupCategory.builder()
            .popup(popup)
            .category(category)
            .categoryRole("POPUP")
            .build();

        // when
        PopupCategory saved = popupCategoryRepository.save(popupCategory);
        PopupCategory found = popupCategoryRepository.findById(saved.getId()).orElseThrow();

        // then
        assertThat(found.getPopup().getId()).isEqualTo(popup.getId());
        assertThat(found.getCategory().getId()).isEqualTo(category.getId());
    }
}
