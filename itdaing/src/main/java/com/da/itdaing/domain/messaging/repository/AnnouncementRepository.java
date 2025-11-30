package com.da.itdaing.domain.messaging.repository;

import com.da.itdaing.domain.common.enums.AnnouncementAudience;
import com.da.itdaing.domain.messaging.entity.Announcement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {

    // popupId 기준으로, 최신 공지 먼저 내려주기
    Page<Announcement> findByPopupIdOrderByCreatedAtDesc(Long popupId, Pageable pageable);

    // 작성자 기준으로, 최신 공지 먼저 내려주기
    Page<Announcement> findByAuthorIdOrderByCreatedAtDesc(Long authorId, Pageable pageable);

    // 전체 공지 또는 특정 대상 공지 조회 (ALL 또는 SELLER)
    @Query("SELECT a FROM Announcement a WHERE a.audience = :audience OR a.audience = com.da.itdaing.domain.common.enums.AnnouncementAudience.ALL ORDER BY a.createdAt DESC")
    Page<Announcement> findByAudienceOrAll(@Param("audience") AnnouncementAudience audience, Pageable pageable);

    // 전체 공지 조회 (최신순)
    Page<Announcement> findAllByOrderByCreatedAtDesc(Pageable pageable);

    // 특정 대상 공지 조회 (최신순)
    Page<Announcement> findByAudienceInOrderByCreatedAtDesc(List<AnnouncementAudience> audiences, Pageable pageable);
}
