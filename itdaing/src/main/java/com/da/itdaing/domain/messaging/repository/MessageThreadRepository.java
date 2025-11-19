// src/main/java/com/da/itdaing/domain/messaging/repository/MessageThreadRepository.java
package com.da.itdaing.domain.messaging.repository;

import com.da.itdaing.domain.messaging.entity.MessageThread;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MessageThreadRepository extends JpaRepository<MessageThread, Long> {
    Page<MessageThread> findBySeller_Id(Long sellerId, Pageable pageable);
    Page<MessageThread> findByAdmin_Id(Long adminId, Pageable pageable);
    Page<MessageThread> findByAdminIsNull(Pageable pageable); // 미배정 스레드(관리자용)
}
