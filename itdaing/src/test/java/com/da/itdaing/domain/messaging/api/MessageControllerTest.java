// src/test/java/com/da/itdaing/domain/messaging/api/MessageControllerTest.java
package com.da.itdaing.domain.messaging.api;

import com.da.itdaing.domain.messaging.dto.MessageDtos.*;
import com.da.itdaing.domain.messaging.service.MessageService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * 보안 필터 비활성 + storage.provider=s3 로 LocalStaticResourceConfig 충돌 회피
 */
@WebMvcTest(controllers = MessageController.class)
@AutoConfigureMockMvc(addFilters = false)
@TestPropertySource(properties = {
    "storage.provider=s3"
})
class MessageControllerTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper om;

    @MockitoBean
    MessageService messageService;

    @Test
    @DisplayName("POST /api/inquiries - 스레드 생성 + 첫 메시지 전송")
    void createThreadAndSend_returnsIds() throws Exception {
        var req = CreateInquiryRequest.builder()
            .receiverId(99L)
            .subject("문의 제목")
            .content("문의 내용입니다")
            .attachments(List.of(
                AttachmentDto.builder()
                    .url("http://example.com/a.png")
                    .mimeType("image/png")
                    .fileKey("uploads/images/2025-11-10/uuid.png")
                    .originalName("a.png")
                    .sizeBytes(1234L)
                    .build()
            ))
            .build();

        var res = CreateInquiryResponse.builder()
            .threadId(10L)
            .messageId(20L)
            .build();

        when(messageService.createThreadAndSend(ArgumentMatchers.anyLong(), ArgumentMatchers.any()))
            .thenReturn(res);

        mvc.perform(post("/api/inquiries")
                .principal(() -> "1")  // sellerId=1
                .contentType(MediaType.APPLICATION_JSON)
                .content(om.writeValueAsString(req)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.threadId").value(10))
            .andExpect(jsonPath("$.data.messageId").value(20));
    }

    @Test
    @DisplayName("GET /api/inquiries - 스레드 목록 조회")
    void listThreads_returnsPaged() throws Exception {
        var item = ThreadSummary.builder()
            .threadId(10L)
            .subject("문의 제목")
            .lastSnippet("최근 메시지 스니펫")
            .updatedAt(LocalDateTime.now())
            .unreadForMe(3)
            .build();

        var res = ThreadListResponse.builder()
            .items(List.of(item))
            .totalElements(1)
            .totalPages(1)
            .page(0)
            .size(20)
            .build();

        when(messageService.listThreads(1L, "SELLER", "inbox", 0, 20)).thenReturn(res);

        mvc.perform(get("/api/inquiries")
                .principal(() -> "1")
                .param("role", "SELLER")
                .param("box", "inbox")
                .param("page", "0")
                .param("size", "20"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.items[0].threadId").value(10))
            .andExpect(jsonPath("$.data.totalElements").value(1));
    }

    @Test
    @DisplayName("GET /api/inquiries/{id} - 스레드 상세(메시지 페이지)")
    void getThreadDetail_returnsMessages() throws Exception {
        var msg = MessageItem.builder()
            .id(20L)
            .senderId(1L)
            .receiverId(99L)
            .title("Re: 문의 제목")
            .content("답변 내용")
            .sentAt(LocalDateTime.now())
            .attachments(List.of())
            .build();

        var res = ThreadDetailResponse.builder()
            .threadId(10L)
            .subject("문의 제목")
            .messages(List.of(msg))
            .page(0)
            .size(50)
            .totalElements(1)
            .totalPages(1)
            .build();

        when(messageService.getThreadDetail(1L, "SELLER", 10L, 0, 50)).thenReturn(res);

        mvc.perform(get("/api/inquiries/{threadId}", 10L)
                .principal(() -> "1")
                .param("role", "SELLER")
                .param("page", "0")
                .param("size", "50"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.threadId").value(10))
            .andExpect(jsonPath("$.data.messages[0].id").value(20));
    }

    @Test
    @DisplayName("POST /api/inquiries/{id}/reply - 답장 전송")
    void reply_returnsMessageId() throws Exception {
        var req = ReplyRequest.builder()
            .title("Re: 문의 제목")
            .content("추가 질문이 있습니다")
            .attachments(List.of())
            .build();

        when(messageService.reply(eq(1L), eq(10L),
            argThat(r -> Objects.equals(r.getTitle(), req.getTitle())
                && Objects.equals(r.getContent(), req.getContent())
                && (r.getAttachments() != null && r.getAttachments().isEmpty()))
        )).thenReturn(200L);

        mvc.perform(post("/api/inquiries/{threadId}/reply", 10L)
                .principal(() -> "1") // principal.getName() = "1"
                .contentType(MediaType.APPLICATION_JSON)
                .content(om.writeValueAsString(req)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.id").value(200));
    }

    @Test
    @DisplayName("DELETE /api/inquiries/messages/{id} - 소프트 삭제")
    void softDelete_ok() throws Exception {
        mvc.perform(delete("/api/inquiries/messages/{messageId}", 200L)
                .principal(() -> "1"))
            .andExpect(status().isOk());
    }
}
