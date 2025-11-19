package com.da.itdaing.domain.messaging;

import com.da.itdaing.domain.common.enums.AnnouncementAudience;
import com.da.itdaing.domain.common.enums.UserRole;
import com.da.itdaing.domain.messaging.entity.Announcement;
import com.da.itdaing.domain.messaging.repository.AnnouncementRepository;
import com.da.itdaing.domain.user.entity.Users;
import com.da.itdaing.domain.user.repository.UserRepository;
import com.da.itdaing.testsupport.JpaSliceTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static org.assertj.core.api.Assertions.assertThat;

@JpaSliceTest
class AnnouncementRepositoryTest {

    @Autowired
    private AnnouncementRepository announcementRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    void 공지사항을_저장하고_조회할_수_있다() {
        // given
        Users admin = Users.builder()
                .loginId("admin")
                .password("pass")
                .email("admin@example.com")
                .role(UserRole.ADMIN)
                .build();
        userRepository.save(admin);

        Announcement announcement = Announcement.builder()
                .author(admin)
                .audience(AnnouncementAudience.ALL)
                .title("서비스 점검 안내")
                .content("11월 1일 오전 2시-4시 서비스 점검이 있습니다.")
                .build();

        // when
        Announcement saved = announcementRepository.save(announcement);
        Announcement found = announcementRepository.findById(saved.getId()).orElseThrow();

        // then
        assertThat(found.getTitle()).isEqualTo("서비스 점검 안내");
        assertThat(found.getAudience()).isEqualTo(AnnouncementAudience.ALL);
        assertThat(found.getAuthor().getId()).isEqualTo(admin.getId());
        assertThat(found.getPopup()).isNull();
        assertThat(found.getCreatedAt()).isNotNull();
    }
}

