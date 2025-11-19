package com.da.itdaing.domain.metric.repository;

import com.da.itdaing.domain.metric.entity.MetricDailyPopup;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MetricDailyPopupRepository extends JpaRepository<MetricDailyPopup, Long> {
  Optional<MetricDailyPopup> findByPopupIdAndDate(Long popupId, LocalDate date);

    List<MetricDailyPopup> findAllByPopupIdAndDateBetweenOrderByDateAsc(Long popupId, LocalDate from, LocalDate to);

    @Query("""
           select coalesce(sum(m.views),0)
           from MetricDailyPopup m
           where m.popup.id = :popupId
             and m.date between :from and :to
           """)
    long sumViewsBetween(Long popupId, LocalDate from, LocalDate to);
}

