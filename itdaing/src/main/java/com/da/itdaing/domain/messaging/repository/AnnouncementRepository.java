package com.da.itdaing.domain.messaging.repository;

import com.da.itdaing.domain.messaging.entity.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
}

