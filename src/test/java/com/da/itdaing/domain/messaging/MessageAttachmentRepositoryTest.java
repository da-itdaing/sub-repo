package com.da.itdaing.domain.messaging;

import com.da.itdaing.domain.common.enums.UserRole;
import com.da.itdaing.domain.messaging.entity.Message;
import com.da.itdaing.domain.messaging.entity.MessageAttachment;
import com.da.itdaing.domain.messaging.entity.MessageThread;
import com.da.itdaing.domain.messaging.repository.MessageAttachmentRepository;
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
class MessageAttachmentRepositoryTest {

    @Autowired UserRepository userRepository;
    @Autowired MessageThreadRepository threadRepository;
    @Autowired MessageRepository messageRepository;
    @Autowired MessageAttachmentRepository attachmentRepository;

    @Test
    @DisplayName("메시지 첨부파일을 저장하고 조회할 수 있다 (Users 타임스탬프 + 필수 컬럼 채움)")
    void save_and_find_attachment() throws Exception {
        // --- Users (Auditing으로 createdAt/updatedAt 자동) ---
        Users sender = Users.builder()
            .loginId("sender2").password("pw").name("보내는사람2")
            .nickname("센더2").email("sender2@example.com")
            .role(UserRole.CONSUMER).build();
        Users receiver = Users.builder()
            .loginId("receiver2").password("pw").name("받는사람2")
            .nickname("리시버2").email("receiver2@example.com")
            .role(UserRole.SELLER).build();
        sender = userRepository.save(sender);
        receiver = userRepository.save(receiver);

        // --- Thread & Message ---
        MessageThread thread = threadRepository.save(
            MessageThread.create(receiver /*seller*/, null /*admin*/, "스레드-첨부 테스트")
        );

        Message msg = newInstance(Message.class);
        ReflectionTestUtils.setField(msg, "thread", thread);
        ReflectionTestUtils.setField(msg, "sender", sender);
        ReflectionTestUtils.setField(msg, "receiver", receiver);
        ReflectionTestUtils.setField(msg, "title", "첨부 테스트");
        ReflectionTestUtils.setField(msg, "content", "파일 보냅니다.");
        ReflectionTestUtils.setField(msg, "sentAt", LocalDateTime.now());
        msg = messageRepository.save(msg);

        // --- Attachment ---
        MessageAttachment att = newInstance(MessageAttachment.class);
        ReflectionTestUtils.setField(att, "message", msg);

        // ▷ 스키마 기준 필수 컬럼: file_url (NOT NULL) — 반드시 세팅
        setIfPresent(att, "fileUrl", "https://cdn.example.com/2025/11/menu-abc123.pdf"); // maps -> FILE_URL

        // 나머지 컬럼들도 최대한 매핑 (엔티티 필드명이 다를 수 있어 느슨 매핑)
        setIfPresent(att, "fileKey", "2025/11/menu-abc123.pdf");        // maps -> FILE_KEY
        setIfPresent(att, "mimeType", "application/pdf");               // maps -> MIME_TYPE
        setIfPresent(att, "originalName", "menu.pdf");                  // maps -> ORIGINAL_NAME
        setIfPresent(att, "sizeBytes", 12_345L);                        // maps -> SIZE_BYTES

        // 과거/다른 프로젝트 호환(있으면 세팅되고, 없으면 무시됨)
        setIfPresent(att, "originalFileName", "menu.pdf");
        setIfPresent(att, "originFileName",   "menu.pdf");
        setIfPresent(att, "fileName",         "menu.pdf");

        setIfPresent(att, "contentType", "application/pdf");

        setIfPresent(att, "size",     12_345L);
        setIfPresent(att, "fileSize", 12_345L);
        setIfPresent(att, "length",   12_345L);
        setIfPresent(att, "bytes",    12_345L);

        // 안전장치: fileUrl 필드가 실제로 존재하고 null이 아닌지 보증
        ensureNonNull(att, "fileUrl", "https://cdn.example.com/2025/11/menu-abc123.pdf");

        att = attachmentRepository.save(att);

        // --- then ---
        assertThat(att.getId()).isNotNull();
        MessageAttachment found = attachmentRepository.findById(att.getId()).orElseThrow();
        Message linked = (Message) ReflectionTestUtils.getField(found, "message");
        assertThat(linked.getId()).isEqualTo(msg.getId());

        // fileUrl이 실제로 저장되었는지 확인 (리플렉션 접근)
        assertThat((String) ReflectionTestUtils.getField(found, "fileUrl"))
            .isEqualTo("https://cdn.example.com/2025/11/menu-abc123.pdf");
    }

    private static void setIfPresent(Object target, String field, Object value) {
        try { ReflectionTestUtils.setField(target, field, value); } catch (IllegalArgumentException ignored) {}
    }

    private static void ensureNonNull(Object target, String field, Object value) {
        try {
            Object cur = ReflectionTestUtils.getField(target, field);
            if (cur == null) {
                ReflectionTestUtils.setField(target, field, value);
            }
        } catch (IllegalArgumentException ignored) {}
    }

    private static <T> T newInstance(Class<T> type) throws Exception {
        Constructor<T> ctor = type.getDeclaredConstructor();
        ctor.setAccessible(true);
        return ctor.newInstance();
    }
}
