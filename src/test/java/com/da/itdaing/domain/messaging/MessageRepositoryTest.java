package com.da.itdaing.domain.messaging;

import com.da.itdaing.domain.common.enums.UserRole;
import com.da.itdaing.domain.user.entity.Users;
import com.da.itdaing.domain.user.repository.UserRepository;
import com.da.itdaing.testsupport.JpaSliceTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static org.assertj.core.api.Assertions.assertThat;

@JpaSliceTest
class MessageRepositoryTest {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    void 메시지를_저장하고_조회할_수_있다() {
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
                .title("안녕하세요")
                .content("문의드립니다.")
                .build();

        // when
        Message saved = messageRepository.save(message);
        Message found = messageRepository.findById(saved.getId()).orElseThrow();

        // then
        assertThat(found.getTitle()).isEqualTo("안녕하세요");
        assertThat(found.getContent()).isEqualTo("문의드립니다.");
        assertThat(found.getSender().getId()).isEqualTo(sender.getId());
        assertThat(found.getReceiver().getId()).isEqualTo(receiver.getId());
        assertThat(found.getSentAt()).isNotNull();
        assertThat(found.getReadAt()).isNull();
    }
}

