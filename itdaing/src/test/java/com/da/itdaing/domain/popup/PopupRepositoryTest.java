package com.da.itdaing.domain.popup;

import com.da.itdaing.domain.common.enums.ApprovalStatus;
import com.da.itdaing.domain.common.enums.UserRole;
import com.da.itdaing.domain.geo.entity.ZoneArea;
import com.da.itdaing.domain.geo.repository.ZoneAreaRepository;
import com.da.itdaing.domain.geo.entity.ZoneCell;
import com.da.itdaing.domain.geo.repository.ZoneCellRepository;
import com.da.itdaing.domain.master.entity.Category;
import com.da.itdaing.domain.master.entity.Feature;
import com.da.itdaing.domain.master.entity.Region;
import com.da.itdaing.domain.master.repository.CategoryRepository;
import com.da.itdaing.domain.master.repository.FeatureRepository;
import com.da.itdaing.domain.master.repository.RegionRepository;
import com.da.itdaing.domain.popup.entity.Popup;
import com.da.itdaing.domain.popup.entity.PopupCategory;
import com.da.itdaing.domain.popup.entity.PopupFeature;
import com.da.itdaing.domain.popup.entity.PopupImage;
import com.da.itdaing.domain.popup.repository.PopupCategoryRepository;
import com.da.itdaing.domain.popup.repository.PopupFeatureRepository;
import com.da.itdaing.domain.popup.repository.PopupImageRepository;
import com.da.itdaing.domain.popup.repository.PopupRepository;
import com.da.itdaing.domain.user.repository.UserRepository;
import com.da.itdaing.domain.user.entity.Users;
import com.da.itdaing.testsupport.JpaSliceTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

@JpaSliceTest
class PopupRepositoryTest {

    @Autowired
    private PopupRepository popupRepository;

    @Autowired
    private PopupImageRepository popupImageRepository;

    @Autowired
    private PopupCategoryRepository popupCategoryRepository;

    @Autowired
    private PopupFeatureRepository popupFeatureRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ZoneCellRepository zoneCellRepository;

    @Autowired
    private ZoneAreaRepository zoneAreaRepository;

    @Autowired
    private RegionRepository regionRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private FeatureRepository featureRepository;

    @Test
    void 팝업을_저장하고_조회할_수_있다() {
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
                .lat(35.0891)
                .lng(126.9877)
                .build();
        zoneCellRepository.save(zoneCell);

        Popup popup = Popup.builder()
                .seller(seller)
                .zoneCell(zoneCell)
                .name("맛있는 팝업")
                .description("맛있는 음식 팝업스토어")
                .startDate(LocalDate.of(2025, 11, 1))
                .endDate(LocalDate.of(2025, 11, 30))
                .operatingTime("10:00-20:00")
                .approvalStatus(ApprovalStatus.PENDING)
                .build();

        // when
        Popup saved = popupRepository.save(popup);
        Popup found = popupRepository.findById(saved.getId()).orElseThrow();

        // then
        assertThat(found.getName()).isEqualTo("맛있는 팝업");
        assertThat(found.getApprovalStatus()).isEqualTo(ApprovalStatus.PENDING);
        assertThat(found.getViewCount()).isEqualTo(0L);
        assertThat(found.getCreatedAt()).isNotNull();
    }

    @Test
    void 팝업에_카테고리와_특징과_이미지를_연결할_수_있다() {
        // given - 팝업 생성
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
                .lat(35.0992)
                .lng(126.9983)
                .build();
        zoneCellRepository.save(zoneCell);

        Popup popup = Popup.builder()
                .seller(seller)
                .zoneCell(zoneCell)
                .name("패션 팝업스토어")
                .description("최신 패션 트렌드")
                .startDate(LocalDate.of(2025, 12, 1))
                .endDate(LocalDate.of(2025, 12, 31))
                .operatingTime("11:00-21:00")
                .approvalStatus(ApprovalStatus.APPROVED)
                .build();
        popupRepository.save(popup);

        // given - 카테고리 생성 및 연결
        Category fashionCategory = Category.builder()
                .name("패션")
                .build();
        categoryRepository.save(fashionCategory);

        Category targetCategory = Category.builder()
                .name("20대")
                .build();
        categoryRepository.save(targetCategory);

        PopupCategory popupCat1 = PopupCategory.builder()
                .popup(popup)
                .category(fashionCategory)
                .categoryRole("POPUP")
                .build();
        popupCategoryRepository.save(popupCat1);

        PopupCategory popupCat2 = PopupCategory.builder()
                .popup(popup)
                .category(targetCategory)
                .categoryRole("TARGET")
                .build();
        popupCategoryRepository.save(popupCat2);

        // given - 특징 생성 및 연결
        Feature parking = Feature.builder()
                .name("무료 주차")
                .build();
        featureRepository.save(parking);

        PopupFeature popupFeature = PopupFeature.builder()
                .popup(popup)
                .feature(parking)
                .build();
        popupFeatureRepository.save(popupFeature);

        // given - 썸네일 이미지 추가
        PopupImage thumbnail = PopupImage.builder()
                .popup(popup)
                .imageUrl("https://example.com/popup-thumbnail.jpg")
                .isThumbnail(true)
                .build();
        popupImageRepository.save(thumbnail);

        // when
        Popup foundPopup = popupRepository.findById(popup.getId()).orElseThrow();
        PopupCategory foundCat1 = popupCategoryRepository.findById(popupCat1.getId()).orElseThrow();
        PopupCategory foundCat2 = popupCategoryRepository.findById(popupCat2.getId()).orElseThrow();
        PopupFeature foundFeature = popupFeatureRepository.findById(popupFeature.getId()).orElseThrow();
        PopupImage foundImage = popupImageRepository.findById(thumbnail.getId()).orElseThrow();

        // then
        assertThat(foundPopup.getName()).isEqualTo("패션 팝업스토어");
        assertThat(foundPopup.getApprovalStatus()).isEqualTo(ApprovalStatus.APPROVED);

        assertThat(foundCat1.getPopup().getId()).isEqualTo(popup.getId());
        assertThat(foundCat1.getCategory().getName()).isEqualTo("패션");
        assertThat(foundCat1.getCategoryRole()).isEqualTo("POPUP");

        assertThat(foundCat2.getPopup().getId()).isEqualTo(popup.getId());
        assertThat(foundCat2.getCategory().getName()).isEqualTo("20대");
        assertThat(foundCat2.getCategoryRole()).isEqualTo("TARGET");

        assertThat(foundFeature.getPopup().getId()).isEqualTo(popup.getId());
        assertThat(foundFeature.getFeature().getName()).isEqualTo("무료 주차");

        assertThat(foundImage.getPopup().getId()).isEqualTo(popup.getId());
        assertThat(foundImage.getImageUrl()).isEqualTo("https://example.com/popup-thumbnail.jpg");
        assertThat(foundImage.getIsThumbnail()).isTrue();
        assertThat(foundImage.getCreatedAt()).isNotNull();
    }
    @Test
    void 판매자_ID로_팝업을_조회할_수_있다() {
        Users sellerA = Users.builder()
            .loginId("seller-main")
            .password("pass")
            .email("seller-main@example.com")
            .role(UserRole.SELLER)
            .build();
        userRepository.save(sellerA);

        Users sellerB = Users.builder()
            .loginId("seller-sub")
            .password("pass")
            .email("seller-sub@example.com")
            .role(UserRole.SELLER)
            .build();
        userRepository.save(sellerB);

        Region region = Region.builder().name("광주 전역").build();
        regionRepository.save(region);

        ZoneArea zoneArea = ZoneArea.builder()
            .region(region)
            .name("상무지구")
            .build();
        zoneAreaRepository.save(zoneArea);

        ZoneCell cellA = ZoneCell.builder()
            .zoneArea(zoneArea)
            .owner(sellerA)
            .label("C-1")
            .lat(35.15)
            .lng(126.85)
            .build();
        zoneCellRepository.save(cellA);

        ZoneCell cellB = ZoneCell.builder()
            .zoneArea(zoneArea)
            .owner(sellerB)
            .label("C-2")
            .lat(35.16)
            .lng(126.86)
            .build();
        zoneCellRepository.save(cellB);

        Popup popupA = Popup.builder()
            .seller(sellerA)
            .zoneCell(cellA)
            .name("셀러A의 팝업")
            .description("셀러 A 전용 팝업")
            .approvalStatus(ApprovalStatus.APPROVED)
            .build();
        popupRepository.save(popupA);

        Popup popupB = Popup.builder()
            .seller(sellerB)
            .zoneCell(cellB)
            .name("셀러B의 팝업")
            .description("셀러 B 전용 팝업")
            .approvalStatus(ApprovalStatus.APPROVED)
            .build();
        popupRepository.save(popupB);

        // when
        var results = popupRepository.findAllBySellerIdWithZoneAndSeller(sellerA.getId());

        // then
        assertThat(results).hasSize(1);
        Popup onlyPopup = results.getFirst();
        assertThat(onlyPopup.getSeller().getId()).isEqualTo(sellerA.getId());
        assertThat(onlyPopup.getZoneCell().getZoneArea().getName()).isEqualTo("상무지구");
    }

}

