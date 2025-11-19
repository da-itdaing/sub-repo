package com.da.itdaing.domain.user.repository;

import com.da.itdaing.domain.common.enums.UserRole;
import com.da.itdaing.domain.master.entity.Region;
import com.da.itdaing.domain.master.repository.RegionRepository;
import com.da.itdaing.domain.user.entity.UserPrefRegion;
import com.da.itdaing.domain.user.entity.Users;
import com.da.itdaing.testsupport.JpaSliceTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static org.assertj.core.api.Assertions.assertThat;

@JpaSliceTest
class UserPrefRegionRepositoryTest {

    @Autowired
    private UserPrefRegionRepository userPrefRegionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RegionRepository regionRepository;

    @Test
    void 사용자_선호_지역을_저장하고_조회할_수_있다() {
        // given
        Users user = Users.builder()
                .loginId("user1")
                .password("pass")
                .email("user1@example.com")
                .role(UserRole.CONSUMER)
                .build();
        userRepository.save(user);

        Region region = Region.builder()
                .name("남구")
                .build();
        regionRepository.save(region);

        UserPrefRegion pref = UserPrefRegion.builder()
                .user(user)
                .region(region)
                .build();

        // when
        UserPrefRegion saved = userPrefRegionRepository.save(pref);
        UserPrefRegion found = userPrefRegionRepository.findById(saved.getId()).orElseThrow();

        // then
        assertThat(found.getUser().getId()).isEqualTo(user.getId());
        assertThat(found.getRegion().getId()).isEqualTo(region.getId());
        assertThat(found.getCreatedAt()).isNotNull();
    }
}

