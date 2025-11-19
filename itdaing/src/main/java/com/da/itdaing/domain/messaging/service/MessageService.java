// src/main/java/com/da/itdaing/domain/messaging/service/MessageService.java
package com.da.itdaing.domain.messaging.service;

import com.da.itdaing.domain.messaging.dto.MessageDtos.*;
import com.da.itdaing.domain.messaging.entity.Message;
import com.da.itdaing.domain.messaging.entity.MessageAttachment;
import com.da.itdaing.domain.messaging.entity.MessageThread;
import com.da.itdaing.domain.messaging.repository.MessageAttachmentRepository;
import com.da.itdaing.domain.messaging.repository.MessageRepository;
import com.da.itdaing.domain.messaging.repository.MessageThreadRepository;
import com.da.itdaing.domain.user.entity.Users;
import com.da.itdaing.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional
public class MessageService {

    private final MessageThreadRepository threadRepo;
    private final MessageRepository messageRepo;
    private final MessageAttachmentRepository attachRepo;
    private final UserRepository userRepo;

    /* ---------------- 생성 ---------------- */

    public CreateInquiryResponse createThreadAndSend(Long sellerId, CreateInquiryRequest req) {
        Users seller  = userRepo.findById(sellerId).orElseThrow();
        Users admin   = userRepo.findById(req.getReceiverId()).orElseThrow();

        MessageThread thread = MessageThread.create(seller, admin, req.getSubject());
        threadRepo.save(thread);

        Message first = new Message(
            thread, seller, admin,
            req.getSubject(), req.getContent(), LocalDateTime.now()
        );
        messageRepo.save(first);

        saveAttachments(first, req.getAttachments());

        // unread 집계 (관리자 기준 +1)
        thread.incUnreadForAdmin();
        thread.touchUpdatedAt();
        threadRepo.save(thread);

        return CreateInquiryResponse.builder()
            .threadId(thread.getId())
            .messageId(first.getId())
            .build();
    }

    public Long reply(Long actorId, Long threadId, ReplyRequest req) {
        MessageThread thread = threadRepo.findById(threadId).orElseThrow();
        Users actor = userRepo.findById(actorId).orElseThrow();

        // 참여자 판정 및 수신자 결정
        boolean isSeller = thread.getSeller().getId().equals(actorId);
        Users receiver = isSeller
            ? Optional.ofNullable(thread.getAdmin()).orElseThrow()
            : thread.getSeller();

        Message msg = new Message(
            thread,
            actor,
            receiver,
            req.getTitle() != null ? req.getTitle() : thread.getSubject(),
            req.getContent(),
            LocalDateTime.now()
        );
        messageRepo.save(msg);

        saveAttachments(msg, req.getAttachments());

        // unread 집계
        if (isSeller) thread.incUnreadForAdmin();
        else          thread.incUnreadForSeller();
        thread.touchUpdatedAt();
        threadRepo.save(thread);

        return msg.getId();
    }

    private void saveAttachments(Message msg, List<AttachmentDto> atts) {
        if (atts == null || atts.isEmpty()) return;
        for (AttachmentDto a : atts) {
            MessageAttachment m = MessageAttachment.builder()
                .message(msg)
                .fileUrl(a.getUrl())
                .mimeType(a.getMimeType())
                .fileKey(a.getFileKey())
                .originalName(a.getOriginalName())
                .sizeBytes(a.getSizeBytes())
                .build();
            attachRepo.save(m);
        }
    }

    /* ---------------- 목록 ---------------- */

    @Transactional(readOnly = true)
    public ThreadListResponse listThreads(Long actorId, String role, String box,
                                          int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "updatedAt"));

        Page<MessageThread> pageData;
        if ("SELLER".equalsIgnoreCase(role)) {
            pageData = threadRepo.findBySeller_Id(actorId, pageable);
        } else if ("ADMIN".equalsIgnoreCase(role)) {
            pageData = threadRepo.findByAdmin_Id(actorId, pageable);
        } else {
            throw new IllegalArgumentException("Unsupported role: " + role);
        }

        // box 필터(inbox/sent)는 마지막 메시지 기준으로 간단 필터
        List<ThreadSummary> items = new ArrayList<>();
        for (MessageThread t : pageData.getContent()) {
            var lastOpt = messageRepo.findTop1ByThreadOrderBySentAtDesc(t);
            String lastSnippet = lastOpt.map(m -> cut(m.getContent(), 120)).orElse("");

            ThreadParticipantSummary counterpart = toParticipantSummary(resolveCounterpart(t, role));

            int unreadForMe = "SELLER".equalsIgnoreCase(role)
                ? t.getUnreadForSeller()
                : t.getUnreadForAdmin();

            if (box != null && lastOpt.isPresent()) {
                if ("inbox".equalsIgnoreCase(box) && !lastOpt.get().getReceiver().getId().equals(actorId)) {
                    continue;
                }
                if ("sent".equalsIgnoreCase(box) && !lastOpt.get().getSender().getId().equals(actorId)) {
                    continue;
                }
            }

            items.add(ThreadSummary.builder()
                .threadId(t.getId())
                .subject(nullToEmpty(t.getSubject()))
                .lastSnippet(lastSnippet)
                .updatedAt(t.getUpdatedAt())
                .unreadForMe(unreadForMe)
                .counterpart(counterpart)
                .build());
        }

        return ThreadListResponse.builder()
            .items(items)
            .totalElements(pageData.getTotalElements())
            .totalPages(pageData.getTotalPages())
            .page(page)
            .size(size)
            .build();
    }

    /* ---------------- 상세 ---------------- */

    // src/main/java/com/da/itdaing/domain/messaging/service/MessageService.java

    @Transactional
    public ThreadDetailResponse getThreadDetail(Long actorId, String role, Long threadId,
                                                int page, int size) {
        MessageThread t = threadRepo.findById(threadId).orElseThrow();

        // 권한 확인: 참여자만
        boolean isSeller = t.getSeller().getId().equals(actorId);
        boolean isAdmin  = t.getAdmin() != null && t.getAdmin().getId().equals(actorId);
        if (!isSeller && !isAdmin) {
            throw new IllegalArgumentException("Not a participant of this thread");
        }

        // 정렬: sentAt ASC + id ASC(동시각 충돌 방지)
        Pageable pageable = PageRequest.of(
            page, size, Sort.by(Sort.Direction.ASC, "sentAt").and(Sort.by(Sort.Direction.ASC, "id"))
        );

        // 페이지 조회
        Page<Message> pageMsg = messageRepo.findByThread_Id(threadId, pageable);

        // 소프트 삭제 필터링(나 기준으로 숨김)
        List<MessageItem> items = new ArrayList<>();
        for (Message m : pageMsg.getContent()) {
            if (m.getSenderDeletedAt() != null && m.getSender().getId().equals(actorId)) continue;
            if (m.getReceiverDeletedAt() != null && m.getReceiver().getId().equals(actorId)) continue;

            var atts = attachRepo.findByMessage(m).stream()
                .map(a -> AttachmentDto.builder()
                    .url(a.getFileUrl())
                    .mimeType(a.getMimeType())
                    .fileKey(a.getFileKey())
                    .originalName(a.getOriginalName())
                    .sizeBytes(a.getSizeBytes())
                    .build())
                .toList();

            items.add(MessageItem.builder()
                .id(m.getId())
                .senderId(m.getSender().getId())
                .receiverId(m.getReceiver().getId())
                .title(m.getTitle())
                .content(m.getContent())
                .sentAt(m.getSentAt())
                .readAt(m.getReadAt())
                .attachments(atts)
                .build());
        }

        // 읽음 처리: 이 페이지에서 내가 수신자인 미읽음들만 readAt 세팅
        boolean iAmReceiverForAny = false;
        for (Message m : pageMsg.getContent()) {
            if (m.getReceiver().getId().equals(actorId) && m.getReadAt() == null) {
                m.markRead(); // 내부에서 readAt = now
                iAmReceiverForAny = true;
            }
        }

        // unread 재집계(페이지 단위로 읽었으니 전체 남은 미읽음 수로 스레드 집계 업데이트)
        if (iAmReceiverForAny) {
            long remain = messageRepo.countByThreadAndReceiver_IdAndReadAtIsNull(t, actorId);
            if (isSeller) t.updateUnreadCounts((int)remain, null);
            if (isAdmin)  t.updateUnreadCounts(null, (int)remain);
            threadRepo.save(t);
        }

        return ThreadDetailResponse.builder()
            .threadId(t.getId())
            .subject(nullToEmpty(t.getSubject()))
            .messages(items)
            .page(pageMsg.getNumber())
            .size(pageMsg.getSize())
            .totalElements(pageMsg.getTotalElements())
            .totalPages(pageMsg.getTotalPages())
            .build();
    }

    /* ---------------- 삭제(소프트) ---------------- */

    public void softDeleteMessage(Long actorId, Long messageId) {
        Message m = messageRepo.findById(messageId).orElseThrow();
        if (!m.getSender().getId().equals(actorId) &&
            !m.getReceiver().getId().equals(actorId)) {
            throw new IllegalArgumentException("Not a participant");
        }
        // 나 기준 소프트 삭제
        m.softDeleteBy(m.getSender().getId().equals(actorId) ? m.getSender() : m.getReceiver());
        messageRepo.save(m);
    }

    /* ---------------- util ---------------- */

    private static String cut(String s, int n) {
        if (s == null) return "";
        return s.length() <= n ? s : s.substring(0, n) + "…";
    }
    private static String nullToEmpty(String s) { return s == null ? "" : s; }

    private Users resolveCounterpart(MessageThread thread, String role) {
        if ("SELLER".equalsIgnoreCase(role)) {
            return thread.getAdmin();
        }
        if ("ADMIN".equalsIgnoreCase(role)) {
            return thread.getSeller();
        }
        return null;
    }

    private ThreadParticipantSummary toParticipantSummary(Users user) {
        if (user == null) {
            return null;
        }
        return ThreadParticipantSummary.builder()
            .id(user.getId())
            .name(resolveDisplayName(user))
            .role(user.getRole() != null ? user.getRole().name() : null)
            .build();
    }

    private String resolveDisplayName(Users user) {
        if (user.getNickname() != null && !user.getNickname().isBlank()) {
            return user.getNickname();
        }
        if (user.getName() != null && !user.getName().isBlank()) {
            return user.getName();
        }
        return user.getLoginId();
    }
}
