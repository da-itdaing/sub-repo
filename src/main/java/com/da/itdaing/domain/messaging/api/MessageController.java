// src/main/java/com/da/itdaing/domain/messaging/api/MessageController.java
package com.da.itdaing.domain.messaging.api;

import com.da.itdaing.domain.messaging.dto.MessageDtos.*;
import com.da.itdaing.domain.messaging.service.MessageService;
import com.da.itdaing.global.web.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/inquiries")
@RequiredArgsConstructor
@Validated
public class MessageController {

    private final MessageService messageService;

    /** 스레드 생성 + 첫 메시지 전송 (판매자→관리자) */
    @PostMapping
    public ResponseEntity<ApiResponse<CreateInquiryResponse>> createThreadAndSend(
        Principal principal,
        @RequestBody @Valid CreateInquiryRequest req
    ) {
        Long sellerId = principal != null ? Long.valueOf(principal.getName()) : null;
        var res = messageService.createThreadAndSend(sellerId, req);
        return ResponseEntity.ok(ApiResponse.success(res));
    }

    /** 스레드 목록 (판매자/관리자 공용) */
    @GetMapping
    public ResponseEntity<ApiResponse<ThreadListResponse>> listThreads(
        Principal principal,
        @RequestParam String role,            // "SELLER" | "ADMIN"
        @RequestParam(required = false) String box, // inbox|sent|null
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        Long actorId = principal != null ? Long.valueOf(principal.getName()) : null;
        var res = messageService.listThreads(actorId, role, box, page, size);
        return ResponseEntity.ok(ApiResponse.success(res));
    }

    /** 스레드 상세 (페이지네이션된 메시지 목록) */
    @GetMapping("/{threadId}")
    public ResponseEntity<ApiResponse<ThreadDetailResponse>> getThreadDetail(
        Principal principal,
        @PathVariable Long threadId,
        @RequestParam String role,             // "SELLER" | "ADMIN"
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "50") int size
    ) {
        Long actorId = principal != null ? Long.valueOf(principal.getName()) : null;
        var res = messageService.getThreadDetail(actorId, role, threadId, page, size);
        return ResponseEntity.ok(ApiResponse.success(res));
    }

    /** 답장 전송 */
    @PostMapping("/{threadId}/reply")
    public ResponseEntity<ApiResponse<IdResponse>> reply(
        Principal principal,
        @PathVariable Long threadId,
        @RequestBody @Valid ReplyRequest req
    ) {
        Long actorId = principal != null ? Long.valueOf(principal.getName()) : null;
        Long messageId = messageService.reply(actorId, threadId, req);
        return ResponseEntity.ok(ApiResponse.success(new IdResponse(messageId)));
    }

    /** 나 기준 소프트 삭제 */
    @DeleteMapping("/messages/{messageId}")
    public ResponseEntity<ApiResponse<Void>> softDelete(
        Principal principal,
        @PathVariable Long messageId
    ) {
        Long actorId = principal != null ? Long.valueOf(principal.getName()) : null;
        messageService.softDeleteMessage(actorId, messageId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
