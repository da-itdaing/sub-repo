package com.da.itdaing.domain.reco.repository;

import com.da.itdaing.domain.reco.entity.DailyConsumerRecommendation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DailyConsumerRecommendationRepository extends JpaRepository<DailyConsumerRecommendation, Long> {
}

