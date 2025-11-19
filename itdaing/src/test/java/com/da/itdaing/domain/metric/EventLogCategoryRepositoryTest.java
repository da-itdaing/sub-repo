package com.da.itdaing.domain.metric;

import com.da.itdaing.domain.common.enums.EventAction;
import com.da.itdaing.domain.common.enums.UserRole;
import com.da.itdaing.domain.master.entity.Category;
import com.da.itdaing.domain.master.repository.CategoryRepository;
import com.da.itdaing.domain.metric.entity.EventLogCategory;
import com.da.itdaing.domain.metric.repository.EventLogCategoryRepository;
import com.da.itdaing.domain.user.entity.Users;
import com.da.itdaing.domain.user.repository.UserRepository;
import com.da.itdaing.testsupport.JpaSliceTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static org.assertj.core.api.Assertions.assertThat;

@JpaSliceTest
class EventLogCategoryRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private EventLogCategoryRepository eventLogCategoryRepository;

    @Test
    void 카테고리_이벤트_로그를_저장하고_조회할_수_있다() {
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

        EventLogCategory eventLog = EventLogCategory.builder()
                .user(user)
                .category(category)
                .actionType(EventAction.CLICK)
                .build();

        // when
        EventLogCategory saved = eventLogCategoryRepository.save(eventLog);
        EventLogCategory found = eventLogCategoryRepository.findById(saved.getId()).orElseThrow();

        // then
        assertThat(found.getUser().getId()).isEqualTo(user.getId());
        assertThat(found.getCategory().getId()).isEqualTo(category.getId());
        assertThat(found.getActionType()).isEqualTo(EventAction.CLICK);
        assertThat(found.getCreatedAt()).isNotNull();
    }
}

