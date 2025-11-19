package com.da.itdaing.domain.messaging.repository;

import com.da.itdaing.domain.messaging.entity.MessageAttachment;
import com.da.itdaing.domain.messaging.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageAttachmentRepository extends JpaRepository<MessageAttachment, Long> {
    List<MessageAttachment> findByMessage(Message message);
}
