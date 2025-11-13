package com.da.itdaing.domain.user.repository;

import com.da.itdaing.domain.common.enums.UserRole;
import com.da.itdaing.domain.master.entity.Category;
import com.da.itdaing.domain.master.repository.CategoryRepository;
import com.da.itdaing.domain.user.entity.UserPrefCategory;
import com.da.itdaing.domain.user.entity.Users;
import com.da.itdaing.testsupport.JpaSliceTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@JpaSliceTest
class UserPrefCategoryRepositoryTest {

    @Autowired
    private UserPrefCategoryRepository userPrefCategoryRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Test
    void 사용자_선호_카테고리를_저장하고_조회할_수_있다() {
        // given
        Users user = Users.builder()
                .loginId("user1")
                .password("pass")
                .email("user1@example.com")
                .role(UserRole.CONSUMER)
                .build();
        userRepository.save(user);

        Category category = Category.builder()
                .name("패션")
                .build();
        categoryRepository.save(category);

        UserPrefCategory pref = UserPrefCategory.builder()
                .user(user)
                .category(category)
                .build();

        // when
        UserPrefCategory saved = userPrefCategoryRepository.save(pref);
        UserPrefCategory found = userPrefCategoryRepository.findById(saved.getId()).orElseThrow();

        // then
        assertThat(found.getUser().getId()).isEqualTo(user.getId());
        assertThat(found.getCreatedAt()).isNotNull();
    }

    @Test
    void 동일한_사용자와_카테고리_조합은_중복_저장할_수_없다() {
        // given
        Users user = Users.builder()
                .loginId("user2")
                .password("pass")
                .email("user2@example.com")
                .role(UserRole.CONSUMER)
                .build();
        userRepository.save(user);

        Category category = Category.builder()
                .name("뷰티")
                .build();
        categoryRepository.save(category);

        UserPrefCategory pref1 = UserPrefCategory.builder()
                .user(user)
                .category(category)
                .build();
        userPrefCategoryRepository.save(pref1);

        UserPrefCategory pref2 = UserPrefCategory.builder()
                .user(user)
                .category(category)
                .build();

        // when & then
        assertThatThrownBy(() -> {
            userPrefCategoryRepository.save(pref2);
            userPrefCategoryRepository.flush();
        }).isInstanceOf(DataIntegrityViolationException.class);
    }
}

