package com.da.itdaing.domain.messaging.repository;

import com.da.itdaing.domain.messaging.entity.Message;
import com.da.itdaing.domain.messaging.entity.MessageThread;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MessageRepository extends JpaRepository<Message, Long> {
    Optional<Message> findTop1ByThreadOrderBySentAtDesc(MessageThread thread);
    List<Message> findByThreadOrderBySentAtAsc(MessageThread thread);
    // 스레드 내 메시지 페이지네이션 (시간 오름차순 + id 보조정렬)
    Page<Message> findByThread_Id(Long threadId, Pageable pageable);

    // 내게 도착했지만 아직 읽지 않은 메시지 개수(스레드 내 남은 미읽음 재집계용)
    long countByThreadAndReceiver_IdAndReadAtIsNull(MessageThread thread, Long receiverId);
}
