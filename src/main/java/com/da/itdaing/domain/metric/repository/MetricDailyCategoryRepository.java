package com.da.itdaing.domain.metric.repository;

import com.da.itdaing.domain.metric.entity.MetricDailyCategory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MetricDailyCategoryRepository extends JpaRepository<MetricDailyCategory, Long> {
}

