package com.da.itdaing.domain.messaging.repository;

import com.da.itdaing.domain.messaging.entity.Announcement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {

    // popupId 기준으로, 최신 공지 먼저 내려주기
    Page<Announcement> findByPopupIdOrderByCreatedAtDesc(Long popupId, Pageable pageable);

    // 작성자 기준으로, 최신 공지 먼저 내려주기
    Page<Announcement> findByAuthorIdOrderByCreatedAtDesc(Long authorId, Pageable pageable);
}
