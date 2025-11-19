package com.da.itdaing.domain.seller.repository;

import com.da.itdaing.domain.common.enums.UserRole;
import com.da.itdaing.domain.seller.entity.SellerProfile;
import com.da.itdaing.domain.user.entity.Users;
import com.da.itdaing.domain.user.repository.UserRepository;
import com.da.itdaing.testsupport.JpaSliceTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static org.assertj.core.api.Assertions.assertThat;

@JpaSliceTest
class SellerProfileRepositoryTest {

    @Autowired
    private SellerProfileRepository sellerProfileRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    void 판매자_프로필을_저장하고_조회할_수_있다() {
        // given
        Users user = Users.builder()
                .loginId("seller1")
                .password("pass")
                .email("seller@example.com")
                .role(UserRole.SELLER)
                .build();
        userRepository.save(user);

        SellerProfile profile = SellerProfile.builder()
                .user(user)
                .introduction("안녕하세요")
                .activityRegion("광주 남구")
                .snsUrl("https://instagram.com/seller")
                .build();

        // when
        SellerProfile saved = sellerProfileRepository.save(profile);
        SellerProfile found = sellerProfileRepository.findById(saved.getUserId()).orElseThrow();

        // then
        assertThat(found.getIntroduction()).isEqualTo("안녕하세요");
        assertThat(found.getActivityRegion()).isEqualTo("광주 남구");
        assertThat(found.getCreatedAt()).isNotNull();
    }
}

