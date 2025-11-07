package com.da.itdaing.domain.popup;

import com.da.itdaing.domain.common.enums.CategoryType;
import com.da.itdaing.domain.common.enums.UserRole;
import com.da.itdaing.domain.geo.ZoneArea;
import com.da.itdaing.domain.geo.ZoneAreaRepository;
import com.da.itdaing.domain.geo.ZoneCell;
import com.da.itdaing.domain.geo.ZoneCellRepository;
import com.da.itdaing.domain.master.Category;
import com.da.itdaing.domain.master.CategoryRepository;
import com.da.itdaing.domain.master.Region;
import com.da.itdaing.domain.master.RegionRepository;
import com.da.itdaing.domain.user.repository.UserRepository;
import com.da.itdaing.domain.user.entity.Users;
import com.da.itdaing.testsupport.JpaSliceTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

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
            .label("A-1")
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
            .type(CategoryType.POPUP)
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
        assertThat(found.getCategoryRole()).isEqualTo("POPUP");
    }

    @Test
    void 동일한_팝업_카테고리_역할_조합은_중복_저장할_수_없다() {
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
            .label("B-1")
            .build();
        zoneCellRepository.save(zoneCell);

        Popup popup = Popup.builder()
            .seller(seller)
            .zoneCell(zoneCell)
            .name("팝업2")
            .build();
        popupRepository.save(popup);

        Category category = Category.builder()
            .name("뷰티")
            .type(CategoryType.POPUP)
            .build();
        categoryRepository.save(category);

        PopupCategory pc1 = PopupCategory.builder()
            .popup(popup)
            .category(category)
            .categoryRole("TARGET")
            .build();
        popupCategoryRepository.save(pc1);

        PopupCategory pc2 = PopupCategory.builder()
            .popup(popup)
            .category(category)
            .categoryRole("TARGET")
            .build();

        // when & then
        assertThatThrownBy(() -> {
            popupCategoryRepository.save(pc2);
            popupCategoryRepository.flush();
        }).isInstanceOf(DataIntegrityViolationException.class);
    }
}
