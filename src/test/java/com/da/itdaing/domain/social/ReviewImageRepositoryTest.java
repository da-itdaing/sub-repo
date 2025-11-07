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
import com.da.itdaing.domain.user.entity.Users;
import com.da.itdaing.domain.user.repository.UserRepository;
import com.da.itdaing.testsupport.JpaSliceTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static org.assertj.core.api.Assertions.assertThat;

@JpaSliceTest
class ReviewImageRepositoryTest {

    @Autowired
    private ReviewImageRepository reviewImageRepository;

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
    void 리뷰_이미지를_저장하고_조회할_수_있다() {
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
                .content("좋아요")
                .build();
        reviewRepository.save(review);

        ReviewImage reviewImage = ReviewImage.builder()
                .review(review)
                .imageUrl("https://example.com/review-photo.jpg")
                .build();

        // when
        ReviewImage saved = reviewImageRepository.save(reviewImage);
        ReviewImage found = reviewImageRepository.findById(saved.getId()).orElseThrow();

        // then
        assertThat(found.getReview().getId()).isEqualTo(review.getId());
        assertThat(found.getImageUrl()).isEqualTo("https://example.com/review-photo.jpg");
        assertThat(found.getCreatedAt()).isNotNull();
    }
}

