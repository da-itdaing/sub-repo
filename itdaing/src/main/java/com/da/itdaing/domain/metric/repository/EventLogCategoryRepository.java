package com.da.itdaing.domain.metric.repository;

import com.da.itdaing.domain.metric.entity.EventLogCategory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventLogCategoryRepository extends JpaRepository<EventLogCategory, Long> {
}

