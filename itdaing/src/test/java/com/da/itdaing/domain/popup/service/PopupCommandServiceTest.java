package com.da.itdaing.domain.popup.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.da.itdaing.domain.common.enums.ApprovalStatus;
import com.da.itdaing.domain.common.enums.CategoryType;
import com.da.itdaing.domain.common.enums.UserRole;
import com.da.itdaing.domain.common.enums.ZoneStatus;
import com.da.itdaing.domain.geo.entity.ZoneArea;
import com.da.itdaing.domain.geo.entity.ZoneCell;
import com.da.itdaing.domain.geo.repository.ZoneAreaRepository;
import com.da.itdaing.domain.geo.repository.ZoneCellRepository;
import com.da.itdaing.domain.master.entity.Category;
import com.da.itdaing.domain.master.entity.Feature;
import com.da.itdaing.domain.master.entity.Region;
import com.da.itdaing.domain.master.entity.Style;
import com.da.itdaing.domain.master.repository.CategoryRepository;
import com.da.itdaing.domain.master.repository.FeatureRepository;
import com.da.itdaing.domain.master.repository.RegionRepository;
import com.da.itdaing.domain.master.repository.StyleRepository;
import com.da.itdaing.domain.file.dto.ImagePayload;
import com.da.itdaing.domain.popup.dto.PopupCreateRequest;
import com.da.itdaing.domain.popup.entity.Popup;
import com.da.itdaing.domain.popup.repository.PopupCategoryRepository;
import com.da.itdaing.domain.popup.repository.PopupFeatureRepository;
import com.da.itdaing.domain.popup.repository.PopupImageRepository;
import com.da.itdaing.domain.popup.repository.PopupRepository;
import com.da.itdaing.domain.popup.repository.PopupStyleRepository;
import com.da.itdaing.domain.user.entity.Users;
import com.da.itdaing.domain.user.repository.UserRepository;
import com.da.itdaing.global.error.ErrorCode;
import com.da.itdaing.global.error.exception.BusinessException;
import com.da.itdaing.testsupport.JpaSliceTest;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Import;

@JpaSliceTest
@Import(PopupCommandService.class)
class PopupCommandServiceTest {

    @Autowired PopupCommandService popupCommandService;
    @Autowired PopupRepository popupRepository;
    @Autowired PopupCategoryRepository popupCategoryRepository;
    @Autowired PopupFeatureRepository popupFeatureRepository;
    @Autowired PopupStyleRepository popupStyleRepository;
    @Autowired PopupImageRepository popupImageRepository;
    @Autowired UserRepository userRepository;
    @Autowired RegionRepository regionRepository;
    @Autowired ZoneAreaRepository zoneAreaRepository;
    @Autowired ZoneCellRepository zoneCellRepository;
    @Autowired CategoryRepository categoryRepository;
    @Autowired FeatureRepository featureRepository;
    @Autowired StyleRepository styleRepository;

    private Users seller;
    private ZoneCell approvedCell;
    private ZoneCell anotherApprovedCell;
    private Category popupCategoryA;
    private Category popupCategoryB;
    private Category consumerCategory;
    private Category popupCategoryC;
    private Feature feature;
    private Feature otherFeature;
    private Style style;
    private Style otherStyle;

    @BeforeEach
    void setUp() {
        seller = userRepository.save(Users.builder()
            .loginId("seller.account")
            .password("encoded-password")
            .email("seller@example.com")
            .role(UserRole.SELLER)
            .build());

        Region region = regionRepository.save(Region.builder()
            .name("서구")
            .build());

        ZoneArea zoneArea = zoneAreaRepository.save(ZoneArea.builder()
            .region(region)
            .name("상무지구")
            .polygonGeoJson("{}")
            .build());

        approvedCell = zoneCellRepository.save(ZoneCell.builder()
            .zoneArea(zoneArea)
            .owner(seller)
            .label("셀 A")
            .detailedAddress("광주광역시 서구")
            .lat(35.1501)
            .lng(126.8512)
            .status(ZoneStatus.APPROVED)
            .build());

        anotherApprovedCell = zoneCellRepository.save(ZoneCell.builder()
            .zoneArea(zoneArea)
            .owner(seller)
            .label("셀 B")
            .detailedAddress("광주광역시 서구")
            .lat(35.1512)
            .lng(126.8523)
            .status(ZoneStatus.APPROVED)
            .build());

        popupCategoryA = categoryRepository.save(Category.builder()
            .name("플리마켓")
            .type(CategoryType.POPUP)
            .build());
        popupCategoryB = categoryRepository.save(Category.builder()
            .name("패션")
            .type(CategoryType.POPUP)
            .build());
        consumerCategory = categoryRepository.save(Category.builder()
            .name("2030 여성")
            .type(CategoryType.CONSUMER)
            .build());
        popupCategoryC = categoryRepository.save(Category.builder()
            .name("푸드")
            .type(CategoryType.POPUP)
            .build());

        feature = featureRepository.save(Feature.builder()
            .name("무료 주차")
            .build());
        otherFeature = featureRepository.save(Feature.builder()
            .name("애견 동반")
            .build());
        style = styleRepository.save(Style.builder()
            .name("트렌디")
            .build());
        otherStyle = styleRepository.save(Style.builder()
            .name("빈티지")
            .build());
    }

    @Test
    @DisplayName("팝업 등록 시 관련 엔티티가 저장된다")
    void createPopup_success() {
        PopupCreateRequest request = new PopupCreateRequest(
            "봄 시즌 플리마켓",
            "광주 상무지구에서 열리는 봄맞이 플리마켓입니다.",
            LocalDate.of(2025, 3, 1),
            LocalDate.of(2025, 3, 31),
            "매일 11:00-20:00",
            approvedCell.getId(),
            List.of(popupCategoryA.getId(), popupCategoryB.getId()),
            List.of(consumerCategory.getId()),
            List.of(feature.getId()),
            List.of(style.getId()),
            ImagePayload.builder().url("https://s3.example.com/thumbnail.jpg").key("uploads/thumb.jpg").build(),
            List.of(
                ImagePayload.builder().url("https://s3.example.com/gallery-1.jpg").key("uploads/gallery-1.jpg").build(),
                ImagePayload.builder().url("https://s3.example.com/gallery-2.jpg").key("uploads/gallery-2.jpg").build()
            )
        );

        Long popupId = popupCommandService.createPopup(seller.getId(), request);

        Popup popup = popupRepository.findById(popupId).orElseThrow();
        assertThat(popup.getName()).isEqualTo("봄 시즌 플리마켓");
        assertThat(popup.getZoneCell().getId()).isEqualTo(approvedCell.getId());
        assertThat(popup.getApprovalStatus()).isEqualTo(ApprovalStatus.PENDING);

        assertThat(popupCategoryRepository.findAll()).hasSize(3);
        assertThat(popupFeatureRepository.findAll()).hasSize(1);
        assertThat(popupStyleRepository.findAll()).hasSize(1);
        assertThat(popupImageRepository.findAll()).hasSize(3);
    }

    @Test
    @DisplayName("팝업 정보를 수정할 수 있다")
    void updatePopup_success() {
        PopupCreateRequest createRequest = new PopupCreateRequest(
            "봄 시즌 플리마켓",
            "광주 상무지구에서 열리는 봄맞이 플리마켓입니다.",
            LocalDate.of(2025, 3, 1),
            LocalDate.of(2025, 3, 31),
            "매일 11:00-20:00",
            approvedCell.getId(),
            List.of(popupCategoryA.getId(), popupCategoryB.getId()),
            List.of(consumerCategory.getId()),
            List.of(feature.getId()),
            List.of(style.getId()),
            ImagePayload.builder().url("https://s3.example.com/thumbnail.jpg").key("uploads/thumb.jpg").build(),
            List.of(ImagePayload.builder().url("https://s3.example.com/gallery-1.jpg").key("uploads/gallery-1.jpg").build())
        );
        Long popupId = popupCommandService.createPopup(seller.getId(), createRequest);

        PopupCreateRequest updateRequest = new PopupCreateRequest(
            "여름 한정 야시장",
            "야간 특화된 푸드 중심 야시장입니다.",
            LocalDate.of(2025, 7, 1),
            LocalDate.of(2025, 7, 15),
            "매일 18:00-23:00",
            anotherApprovedCell.getId(),
            List.of(popupCategoryC.getId()),
            List.of(),
            List.of(otherFeature.getId()),
            List.of(otherStyle.getId()),
            ImagePayload.builder().url("https://s3.example.com/summer-thumb.jpg").key("uploads/summer-thumb.jpg").build(),
            List.of(
                ImagePayload.builder().url("https://s3.example.com/summer-1.jpg").key("uploads/summer-1.jpg").build(),
                ImagePayload.builder().url("https://s3.example.com/summer-2.jpg").key("uploads/summer-2.jpg").build()
            )
        );

        popupCommandService.updatePopup(seller.getId(), popupId, updateRequest);

        Popup updated = popupRepository.findById(popupId).orElseThrow();
        assertThat(updated.getName()).isEqualTo("여름 한정 야시장");
        assertThat(updated.getZoneCell().getId()).isEqualTo(anotherApprovedCell.getId());
        assertThat(updated.getStartDate()).isEqualTo(LocalDate.of(2025, 7, 1));
        assertThat(updated.getEndDate()).isEqualTo(LocalDate.of(2025, 7, 15));
        assertThat(updated.getOperatingTime()).isEqualTo("매일 18:00-23:00");

        assertThat(popupCategoryRepository.findAll()).hasSize(1);
        assertThat(popupFeatureRepository.findAll()).hasSize(1);
        assertThat(popupStyleRepository.findAll()).hasSize(1);
        assertThat(popupImageRepository.findAll()).hasSize(3);
    }

    @Test
    @DisplayName("팝업을 삭제할 수 있다")
    void deletePopup_success() {
        PopupCreateRequest request = new PopupCreateRequest(
            "봄 시즌 플리마켓",
            "광주 상무지구에서 열리는 봄맞이 플리마켓입니다.",
            LocalDate.of(2025, 3, 1),
            LocalDate.of(2025, 3, 31),
            "매일 11:00-20:00",
            approvedCell.getId(),
            List.of(popupCategoryA.getId(), popupCategoryB.getId()),
            List.of(consumerCategory.getId()),
            List.of(feature.getId()),
            List.of(style.getId()),
            ImagePayload.builder().url("https://s3.example.com/thumbnail.jpg").key("uploads/thumb.jpg").build(),
            List.of(
                ImagePayload.builder().url("https://s3.example.com/gallery-1.jpg").key("uploads/gallery-1.jpg").build(),
                ImagePayload.builder().url("https://s3.example.com/gallery-2.jpg").key("uploads/gallery-2.jpg").build()
            )
        );
        Long popupId = popupCommandService.createPopup(seller.getId(), request);

        popupCommandService.deletePopup(seller.getId(), popupId);

        assertThat(popupRepository.findById(popupId)).isEmpty();
        assertThat(popupCategoryRepository.findAll()).isEmpty();
        assertThat(popupFeatureRepository.findAll()).isEmpty();
        assertThat(popupStyleRepository.findAll()).isEmpty();
        assertThat(popupImageRepository.findAll()).isEmpty();
    }

    @Test
    @DisplayName("다른 판매자가 팝업을 삭제하면 예외가 발생한다")
    void deletePopup_invalidSeller() {
        PopupCreateRequest request = new PopupCreateRequest(
            "봄 시즌 플리마켓",
            "",
            null,
            null,
            null,
            approvedCell.getId(),
            List.of(),
            List.of(),
            List.of(),
            List.of(),
            null,
            List.of()
        );
        Long popupId = popupCommandService.createPopup(seller.getId(), request);

        Users otherSeller = userRepository.save(Users.builder()
            .loginId("delete.other")
            .password("encoded")
            .email("delete@example.com")
            .role(UserRole.SELLER)
            .build());

        assertThatThrownBy(() -> popupCommandService.deletePopup(otherSeller.getId(), popupId))
            .isInstanceOf(BusinessException.class)
            .extracting(ex -> ((BusinessException) ex).getErrorCode())
            .isEqualTo(ErrorCode.ACCESS_DENIED);
    }

    @Test
    @DisplayName("다른 판매자가 팝업을 수정하면 예외가 발생한다")
    void updatePopup_invalidSeller() {
        PopupCreateRequest createRequest = new PopupCreateRequest(
            "봄 시즌 플리마켓",
            "",
            null,
            null,
            null,
            approvedCell.getId(),
            List.of(),
            List.of(),
            List.of(),
            List.of(),
            null,
            List.of()
        );
        Long popupId = popupCommandService.createPopup(seller.getId(), createRequest);

        Users otherSeller = userRepository.save(Users.builder()
            .loginId("third.seller")
            .password("encoded")
            .email("third@example.com")
            .role(UserRole.SELLER)
            .build());

        assertThatThrownBy(() -> popupCommandService.updatePopup(otherSeller.getId(), popupId, createRequest))
            .isInstanceOf(BusinessException.class)
            .extracting(ex -> ((BusinessException) ex).getErrorCode())
            .isEqualTo(ErrorCode.ACCESS_DENIED);
    }


    @Test
    @DisplayName("소유하지 않은 셀로 팝업 등록 시 예외가 발생한다")
    void createPopup_invalidOwner() {
        Users otherSeller = userRepository.save(Users.builder()
            .loginId("other.seller")
            .password("encoded")
            .email("other@example.com")
            .role(UserRole.SELLER)
            .build());

        PopupCreateRequest request = new PopupCreateRequest(
            "봄 시즌 플리마켓",
            "",
            null,
            null,
            null,
            approvedCell.getId(),
            List.of(),
            List.of(),
            List.of(),
            List.of(),
            null,
            List.of()
        );

        assertThatThrownBy(() -> popupCommandService.createPopup(otherSeller.getId(), request))
            .isInstanceOf(BusinessException.class)
            .extracting(ex -> ((BusinessException) ex).getErrorCode())
            .isEqualTo(ErrorCode.ACCESS_DENIED);
    }
}
