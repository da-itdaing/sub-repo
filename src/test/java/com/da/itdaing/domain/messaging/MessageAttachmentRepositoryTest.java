package com.da.itdaing.domain.messaging;

import com.da.itdaing.domain.common.enums.UserRole;
import com.da.itdaing.domain.user.entity.Users;
import com.da.itdaing.domain.user.repository.UserRepository;
import com.da.itdaing.testsupport.JpaSliceTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static org.assertj.core.api.Assertions.assertThat;

@JpaSliceTest
class MessageAttachmentRepositoryTest {

    @Autowired
    private MessageAttachmentRepository messageAttachmentRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    void 메시지_첨부파일을_저장하고_조회할_수_있다() {
        // given
        Users sender = Users.builder()
            .loginId("sender")
            .password("pass")
            .email("sender@example.com")
            .role(UserRole.CONSUMER)
            .build();
        userRepository.save(sender);

        Users receiver = Users.builder()
            .loginId("receiver")
            .password("pass")
            .email("receiver@example.com")
            .role(UserRole.CONSUMER)
            .build();
        userRepository.save(receiver);

        Message message = Message.builder()
            .sender(sender)
            .receiver(receiver)
            .title("파일 첨부 메시지")
            .content("첨부파일 확인해주세요")
            .build();
        messageRepository.save(message);

        MessageAttachment attachment = MessageAttachment.builder()
            .message(message)
            .fileUrl("https://example.com/file.pdf")
            .mimeType("application/pdf")
            .build();

        // when
        MessageAttachment saved = messageAttachmentRepository.save(attachment);
        MessageAttachment found = messageAttachmentRepository.findById(saved.getId()).orElseThrow();

        // then
        assertThat(found.getFileUrl()).isEqualTo("https://example.com/file.pdf");
        assertThat(found.getMimeType()).isEqualTo("application/pdf");
        assertThat(found.getMessage().getId()).isEqualTo(message.getId());
    }
}
