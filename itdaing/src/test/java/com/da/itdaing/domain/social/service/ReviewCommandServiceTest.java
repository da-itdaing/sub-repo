package com.da.itdaing.domain.social.service;

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
import com.da.itdaing.domain.master.entity.Region;
import com.da.itdaing.domain.master.repository.RegionRepository;
import com.da.itdaing.domain.popup.entity.Popup;
import com.da.itdaing.domain.popup.repository.PopupRepository;
import com.da.itdaing.domain.file.dto.ImagePayload;
import com.da.itdaing.domain.social.dto.ReviewCreateRequest;
import com.da.itdaing.domain.social.dto.ReviewUpdateRequest;
import com.da.itdaing.domain.social.entity.Review;
import com.da.itdaing.domain.social.repository.ReviewImageRepository;
import com.da.itdaing.domain.social.repository.ReviewRepository;
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
@Import(ReviewCommandService.class)
class ReviewCommandServiceTest {

    @Autowired ReviewCommandService reviewCommandService;
    @Autowired ReviewRepository reviewRepository;
    @Autowired ReviewImageRepository reviewImageRepository;
    @Autowired UserRepository userRepository;
    @Autowired PopupRepository popupRepository;
    @Autowired RegionRepository regionRepository;
    @Autowired ZoneAreaRepository zoneAreaRepository;
    @Autowired ZoneCellRepository zoneCellRepository;

    private Users consumer;
    private Users seller;
    private Users admin;
    private Popup popup;

    @BeforeEach
    void setUp() {
        consumer = userRepository.save(Users.builder()
            .loginId("consumer1")
            .password("encoded")
            .email("consumer@example.com")
            .role(UserRole.CONSUMER)
            .build());

        seller = userRepository.save(Users.builder()
            .loginId("seller1")
            .password("encoded")
            .email("seller@example.com")
            .role(UserRole.SELLER)
            .build());

        admin = userRepository.save(Users.builder()
            .loginId("admin1")
            .password("encoded")
            .email("admin@example.com")
            .role(UserRole.ADMIN)
            .build());

        Region region = regionRepository.save(Region.builder()
            .name("서구")
            .build());

        ZoneArea zoneArea = zoneAreaRepository.save(ZoneArea.builder()
            .region(region)
            .name("상무지구")
            .polygonGeoJson("{}")
            .build());

        ZoneCell zoneCell = zoneCellRepository.save(ZoneCell.builder()
            .zoneArea(zoneArea)
            .owner(seller)
            .label("셀 A")
            .detailedAddress("광주광역시 서구")
            .lat(35.1501)
            .lng(126.8512)
            .status(ZoneStatus.APPROVED)
            .build());

        popup = popupRepository.save(Popup.builder()
            .seller(seller)
            .zoneCell(zoneCell)
            .name("테스트 팝업")
            .description("테스트 설명")
            .startDate(LocalDate.of(2025, 3, 1))
            .endDate(LocalDate.of(2025, 3, 31))
            .approvalStatus(ApprovalStatus.APPROVED)
            .viewCount(0L)
            .build());
    }

    @Test
    @DisplayName("소비자가 리뷰를 작성할 수 있다")
    void createReview_success() {
        ReviewCreateRequest request = new ReviewCreateRequest(
            (byte) 5,
            "정말 좋은 팝업이었습니다!",
            List.of(
                ImagePayload.builder().url("https://s3.example.com/review-1.jpg").key("uploads/review-1.jpg").build(),
                ImagePayload.builder().url("https://s3.example.com/review-2.jpg").key("uploads/review-2.jpg").build()
            )
        );

        Long reviewId = reviewCommandService.createReview(consumer.getId(), popup.getId(), request);

        Review review = reviewRepository.findById(reviewId).orElseThrow();
        assertThat(review.getRating()).isEqualTo((byte) 5);
        assertThat(review.getContent()).isEqualTo("정말 좋은 팝업이었습니다!");
        assertThat(review.getConsumer().getId()).isEqualTo(consumer.getId());
        assertThat(review.getPopup().getId()).isEqualTo(popup.getId());
        assertThat(reviewImageRepository.findAll()).hasSize(2);
    }

    @Test
    @DisplayName("판매자는 리뷰를 작성할 수 없다")
    void createReview_invalidRole() {
        ReviewCreateRequest request = new ReviewCreateRequest(
            (byte) 5,
            "리뷰 내용",
            List.of()
        );

        assertThatThrownBy(() -> reviewCommandService.createReview(seller.getId(), popup.getId(), request))
            .isInstanceOf(BusinessException.class)
            .extracting(ex -> ((BusinessException) ex).getErrorCode())
            .isEqualTo(ErrorCode.ACCESS_DENIED);
    }

    @Test
    @DisplayName("같은 팝업에 중복 리뷰를 작성할 수 없다")
    void createReview_duplicate() {
        ReviewCreateRequest firstRequest = new ReviewCreateRequest(
            (byte) 5,
            "첫 번째 리뷰",
            List.of()
        );
        reviewCommandService.createReview(consumer.getId(), popup.getId(), firstRequest);

        ReviewCreateRequest secondRequest = new ReviewCreateRequest(
            (byte) 4,
            "두 번째 리뷰",
            List.of()
        );

        assertThatThrownBy(() -> reviewCommandService.createReview(consumer.getId(), popup.getId(), secondRequest))
            .isInstanceOf(BusinessException.class)
            .extracting(ex -> ((BusinessException) ex).getErrorCode())
            .isEqualTo(ErrorCode.INVALID_INPUT_VALUE);
    }

    @Test
    @DisplayName("리뷰를 수정할 수 있다")
    void updateReview_success() {
        ReviewCreateRequest createRequest = new ReviewCreateRequest(
            (byte) 3,
            "초기 리뷰",
            List.of(ImagePayload.builder().url("https://s3.example.com/old.jpg").key("uploads/old.jpg").build())
        );
        Long reviewId = reviewCommandService.createReview(consumer.getId(), popup.getId(), createRequest);

        ReviewUpdateRequest updateRequest = new ReviewUpdateRequest(
            (byte) 5,
            "수정된 리뷰",
            List.of(
                ImagePayload.builder().url("https://s3.example.com/new-1.jpg").key("uploads/new-1.jpg").build(),
                ImagePayload.builder().url("https://s3.example.com/new-2.jpg").key("uploads/new-2.jpg").build()
            )
        );

        reviewCommandService.updateReview(consumer.getId(), reviewId, updateRequest);

        Review updated = reviewRepository.findById(reviewId).orElseThrow();
        assertThat(updated.getRating()).isEqualTo((byte) 5);
        assertThat(updated.getContent()).isEqualTo("수정된 리뷰");
        assertThat(reviewImageRepository.findAll()).hasSize(2);
    }

    @Test
    @DisplayName("다른 사용자가 리뷰를 수정할 수 없다")
    void updateReview_invalidOwner() {
        ReviewCreateRequest createRequest = new ReviewCreateRequest(
            (byte) 3,
            "초기 리뷰",
            List.of()
        );
        Long reviewId = reviewCommandService.createReview(consumer.getId(), popup.getId(), createRequest);

        Users otherConsumer = userRepository.save(Users.builder()
            .loginId("consumer2")
            .password("encoded")
            .email("consumer2@example.com")
            .role(UserRole.CONSUMER)
            .build());

        ReviewUpdateRequest updateRequest = new ReviewUpdateRequest(
            (byte) 5,
            "수정된 리뷰",
            List.of()
        );

        assertThatThrownBy(() -> reviewCommandService.updateReview(otherConsumer.getId(), reviewId, updateRequest))
            .isInstanceOf(BusinessException.class)
            .extracting(ex -> ((BusinessException) ex).getErrorCode())
            .isEqualTo(ErrorCode.ACCESS_DENIED);
    }

    @Test
    @DisplayName("리뷰 작성자가 리뷰를 삭제할 수 있다")
    void deleteReview_success() {
        ReviewCreateRequest request = new ReviewCreateRequest(
            (byte) 3,
            "리뷰 내용",
            List.of(ImagePayload.builder().url("https://s3.example.com/img.jpg").key("uploads/img.jpg").build())
        );
        Long reviewId = reviewCommandService.createReview(consumer.getId(), popup.getId(), request);

        reviewCommandService.deleteReview(consumer.getId(), reviewId);

        assertThat(reviewRepository.findById(reviewId)).isEmpty();
        assertThat(reviewImageRepository.findAll()).isEmpty();
    }

    @Test
    @DisplayName("관리자가 리뷰를 삭제할 수 있다")
    void deleteReview_byAdmin() {
        ReviewCreateRequest request = new ReviewCreateRequest(
            (byte) 3,
            "리뷰 내용",
            List.of()
        );
        Long reviewId = reviewCommandService.createReview(consumer.getId(), popup.getId(), request);

        reviewCommandService.deleteReview(admin.getId(), reviewId);

        assertThat(reviewRepository.findById(reviewId)).isEmpty();
    }

    @Test
    @DisplayName("다른 사용자가 리뷰를 삭제할 수 없다")
    void deleteReview_invalidUser() {
        ReviewCreateRequest request = new ReviewCreateRequest(
            (byte) 3,
            "리뷰 내용",
            List.of()
        );
        Long reviewId = reviewCommandService.createReview(consumer.getId(), popup.getId(), request);

        Users otherConsumer = userRepository.save(Users.builder()
            .loginId("consumer2")
            .password("encoded")
            .email("consumer2@example.com")
            .role(UserRole.CONSUMER)
            .build());

        assertThatThrownBy(() -> reviewCommandService.deleteReview(otherConsumer.getId(), reviewId))
            .isInstanceOf(BusinessException.class)
            .extracting(ex -> ((BusinessException) ex).getErrorCode())
            .isEqualTo(ErrorCode.ACCESS_DENIED);
    }
}

