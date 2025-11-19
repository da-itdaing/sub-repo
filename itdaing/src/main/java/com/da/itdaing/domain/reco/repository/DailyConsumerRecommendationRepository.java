package com.da.itdaing.domain.reco.repository;

import com.da.itdaing.domain.reco.entity.DailyConsumerRecommendation;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DailyConsumerRecommendationRepository extends JpaRepository<DailyConsumerRecommendation, Long> {

    @Query("""
        select dcr
        from DailyConsumerRecommendation dcr
        join fetch dcr.popup
        where dcr.consumer.id = :consumerId
        order by dcr.recommendationDate desc, dcr.score desc
        """)
    List<DailyConsumerRecommendation> findRecentRecommendations(
        @Param("consumerId") Long consumerId,
        Pageable pageable
    );
}

