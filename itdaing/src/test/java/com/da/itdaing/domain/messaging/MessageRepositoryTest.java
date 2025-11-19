package com.da.itdaing.domain.messaging;

import com.da.itdaing.domain.common.enums.UserRole;
import com.da.itdaing.domain.messaging.entity.Message;
import com.da.itdaing.domain.messaging.entity.MessageThread;
import com.da.itdaing.domain.messaging.repository.MessageRepository;
import com.da.itdaing.domain.messaging.repository.MessageThreadRepository;
import com.da.itdaing.domain.user.entity.Users;
import com.da.itdaing.domain.user.repository.UserRepository;
import com.da.itdaing.testsupport.JpaAuditingTestConfig;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.util.ReflectionTestUtils;

import java.lang.reflect.Constructor;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
@Import(JpaAuditingTestConfig.class)
class MessageRepositoryTest {

    @Autowired UserRepository userRepository;
    @Autowired MessageThreadRepository threadRepository;
    @Autowired MessageRepository messageRepository;

    @Test
    @DisplayName("메시지를 저장하고 조회할 수 있다 (Thread NOT NULL + Users 타임스탬프 세팅)")
    void save_and_find_message() throws Exception {
        // --- sender / receiver ---
        Users sender = Users.builder()
            .loginId("sender1").password("pw").name("보내는사람")
            .nickname("센더").email("sender1@example.com")
            .role(UserRole.CONSUMER).build();
        forceTimestamps(sender);

        Users receiver = Users.builder()
            .loginId("receiver1").password("pw").name("받는사람")
            .nickname("리시버").email("receiver1@example.com")
            .role(UserRole.SELLER).build();
        forceTimestamps(receiver);

        sender = userRepository.save(sender);
        receiver = userRepository.save(receiver);

        // --- thread ---
        MessageThread thread = threadRepository.save(
            MessageThread.create(receiver /*seller*/, null /*admin*/, "주문 문의 스레드")
        );

        // --- message ---
        Message msg = newInstance(Message.class);
        ReflectionTestUtils.setField(msg, "thread", thread);
        ReflectionTestUtils.setField(msg, "sender", sender);
        ReflectionTestUtils.setField(msg, "receiver", receiver);
        ReflectionTestUtils.setField(msg, "title", "문의드립니다");
        ReflectionTestUtils.setField(msg, "content", "배송 일정 문의드립니다.");
        ReflectionTestUtils.setField(msg, "sentAt", LocalDateTime.now());

        msg = messageRepository.save(msg);

        // --- then ---
        assertThat(msg.getId()).isNotNull();
        Message found = messageRepository.findById(msg.getId()).orElseThrow();
        assertThat(ReflectionTestUtils.getField(found, "title")).isEqualTo("문의드립니다");
        MessageThread foundThread = (MessageThread) ReflectionTestUtils.getField(found, "thread");
        assertThat(foundThread.getId()).isEqualTo(thread.getId());
    }

    private static void forceTimestamps(Object entity) {
        LocalDateTime now = LocalDateTime.now();
        // BaseTimeEntity를 상속했든 직접 필드로 두었든 둘 다 커버
        setIfPresent(entity, "createdAt", now);
        setIfPresent(entity, "updatedAt", now);
    }

    private static void setIfPresent(Object target, String field, Object value) {
        try { ReflectionTestUtils.setField(target, field, value); } catch (IllegalArgumentException ignored) {}
    }

    private static <T> T newInstance(Class<T> type) throws Exception {
        Constructor<T> ctor = type.getDeclaredConstructor();
        ctor.setAccessible(true);
        return ctor.newInstance();
    }
}
