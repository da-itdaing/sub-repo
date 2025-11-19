package com.da.itdaing.domain.metric.repository;

import com.da.itdaing.domain.common.enums.EventAction;
import com.da.itdaing.domain.metric.entity.EventLog;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface EventLogRepository extends JpaRepository<EventLog, Long> {

    @Query("""
        select e
        from EventLog e
        join fetch e.popup
        where e.user.id = :userId
          and e.actionType = :actionType
          and e.popup is not null
        order by e.createdAt desc
        """)
    List<EventLog> findRecentEventsWithPopup(
        @Param("userId") Long userId,
        @Param("actionType") EventAction actionType,
        Pageable pageable
    );
}

