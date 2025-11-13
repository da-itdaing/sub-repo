package com.da.itdaing.domain.metric.repository;

import com.da.itdaing.domain.metric.entity.EventLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventLogRepository extends JpaRepository<EventLog, Long> {
}

