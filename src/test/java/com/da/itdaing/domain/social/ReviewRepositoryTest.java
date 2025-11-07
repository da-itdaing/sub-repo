package com.da.itdaing.domain.social;

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

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@JpaSliceTest
class ReviewRepositoryTest {

    @Autowired
    private ReviewRepository reviewRepository;

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
    void 리뷰를_저장하고_조회할_수_있다() {
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

        Review review = Review.builder()
                .consumer(consumer)
                .popup(popup)
                .rating((byte) 5)
                .content("정말 좋았어요!")
                .build();

        // when
        Review saved = reviewRepository.save(review);
        Review found = reviewRepository.findById(saved.getId()).orElseThrow();

        // then
        assertThat(found.getConsumer().getId()).isEqualTo(consumer.getId());
        assertThat(found.getPopup().getId()).isEqualTo(popup.getId());
        assertThat(found.getRating()).isEqualTo((byte) 5);
        assertThat(found.getContent()).isEqualTo("정말 좋았어요!");
        assertThat(found.getCreatedAt()).isNotNull();
    }

    @Test
    void 동일한_소비자와_팝업에_대해_중복_리뷰를_작성할_수_없다() {
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

        Review review1 = Review.builder()
                .consumer(consumer)
                .popup(popup)
                .rating((byte) 4)
                .content("좋아요")
                .build();
        reviewRepository.save(review1);

        Review review2 = Review.builder()
                .consumer(consumer)
                .popup(popup)
                .rating((byte) 5)
                .content("다시 평가합니다")
                .build();

        // when & then
        assertThatThrownBy(() -> {
            reviewRepository.save(review2);
            reviewRepository.flush();
        }).isInstanceOf(DataIntegrityViolationException.class);
    }
}

