package com.da.itdaing.domain.user.repository;

import com.da.itdaing.domain.common.enums.UserRole;
import com.da.itdaing.domain.master.entity.Style;
import com.da.itdaing.domain.master.repository.StyleRepository;
import com.da.itdaing.domain.user.entity.UserPrefStyle;
import com.da.itdaing.domain.user.entity.Users;
import com.da.itdaing.testsupport.JpaSliceTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static org.assertj.core.api.Assertions.assertThat;

@JpaSliceTest
class UserPrefStyleRepositoryTest {

    @Autowired
    private UserPrefStyleRepository userPrefStyleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StyleRepository styleRepository;

    @Test
    void 사용자_선호_스타일을_저장하고_조회할_수_있다() {
        // given
        Users user = Users.builder()
            .loginId("user1")
            .password("pass")
            .email("user1@example.com")
            .role(UserRole.CONSUMER)
            .build();
        userRepository.save(user);

        Style style = Style.builder()
            .name("미니멀")
            .build();
        styleRepository.save(style);

        UserPrefStyle pref = UserPrefStyle.builder()
            .user(user)
            .style(style)
            .build();

        // when
        UserPrefStyle saved = userPrefStyleRepository.save(pref);
        UserPrefStyle found = userPrefStyleRepository.findById(saved.getId()).orElseThrow();

        // then
        assertThat(found.getUser().getId()).isEqualTo(user.getId());
        assertThat(found.getStyle().getId()).isEqualTo(style.getId());
        assertThat(found.getCreatedAt()).isNotNull();
    }
}
