// src/main/java/com/da/itdaing/domain/messaging/api/MessageController.java
package com.da.itdaing.domain.messaging.api;

import com.da.itdaing.domain.messaging.dto.MessageDtos.*;
import com.da.itdaing.domain.messaging.service.MessageService;
import com.da.itdaing.global.web.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

/**
 * 메시징(문의) API 컨트롤러
 * 
 * 판매자와 관리자 간의 문의 및 메시지 송수신을 관리합니다.
 * 스레드 기반의 대화형 메시징 시스템을 제공합니다.
 */
@Tag(name = "Messaging", description = "메시징(문의) API - 판매자와 관리자 간 메시지")
@RestController
@RequestMapping("/api/inquiries")
@RequiredArgsConstructor
@Validated
public class MessageController {

    private final MessageService messageService;

    @Operation(
        summary = "문의 스레드 생성 및 첫 메시지 전송",
        description = """
            판매자가 관리자에게 새로운 문의 스레드를 생성하고 첫 메시지를 전송합니다.
            
            이 API는 JWT 토큰 인증이 필요하며, SELLER 역할을 가진 사용자만 접근할 수 있습니다.
            
            요청 본문:
            - subject: 문의 제목 (필수, 최대 255자)
            - body: 메시지 내용 (필수, 최대 5000자)
            - attachments: 첨부파일 목록 (선택, 최대 5개)
            
            첨부파일은 먼저 /api/uploads/images 엔드포인트를 통해 업로드한 후,
            반환된 파일 정보(url, key)를 attachments 배열에 포함해야 합니다.
            """,
        security = @SecurityRequirement(name = "bearerAuth"),
        requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
            required = true,
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    name = "문의 생성 요청 예시",
                    value = """
                        {
                            "subject": "팝업 승인 관련 문의",
                            "body": "제출한 팝업스토어가 승인되지 않았는데, 어떤 부분이 문제인지 알 수 있을까요?",
                            "attachments": [
                                {
                                    "url": "https://s3.amazonaws.com/bucket/uploads/image1.jpg",
                                    "key": "uploads/image1.jpg"
                                }
                            ]
                        }
                        """
                )
            )
        )
    )
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "문의 생성 성공",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(value = """
                    {
                        "success": true,
                        "data": {
                            "threadId": 1,
                            "messageId": 1,
                            "subject": "팝업 승인 관련 문의",
                            "createdAt": "2024-01-15T10:30:00"
                        }
                    }
                    """)
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400",
            description = "입력값 검증 실패",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(value = """
                    {
                        "success": false,
                        "error": {
                            "status": 400,
                            "code": "E001",
                            "message": "입력값이 올바르지 않습니다"
                        }
                    }
                    """)
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401",
            description = "인증 실패",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(value = """
                    {
                        "success": false,
                        "error": {
                            "status": 401,
                            "code": "AUTH-401",
                            "message": "인증이 필요합니다"
                        }
                    }
                    """)
            )
        )
    })
    @PostMapping
    public ResponseEntity<ApiResponse<CreateInquiryResponse>> createThreadAndSend(
        Principal principal,
        @RequestBody @Valid CreateInquiryRequest req
    ) {
        Long sellerId = principal != null ? Long.valueOf(principal.getName()) : null;
        var res = messageService.createThreadAndSend(sellerId, req);
        return ResponseEntity.ok(ApiResponse.success(res));
    }

    @Operation(
        summary = "문의 스레드 목록 조회",
        description = """
            판매자 또는 관리자의 문의 스레드 목록을 조회합니다.
            
            이 API는 JWT 토큰 인증이 필요합니다.
            
            쿼리 파라미터:
            - role: 사용자 역할 (필수, "SELLER" 또는 "ADMIN")
            - box: 메일함 타입 (선택, "inbox" 또는 "sent", 미지정 시 전체)
            - page: 페이지 번호 (기본값: 0)
            - size: 페이지 크기 (기본값: 20)
            
            반환되는 스레드는 최신 메시지 순으로 정렬되며,
            각 스레드에는 다음 정보가 포함됩니다:
            - 스레드 ID 및 제목
            - 상대방 정보 (판매자 또는 관리자)
            - 최신 메시지 내용 및 시간
            - 읽지 않은 메시지 수
            """,
        security = @SecurityRequirement(name = "bearerAuth"),
        parameters = {
            @Parameter(
                name = "role",
                description = "사용자 역할 (SELLER 또는 ADMIN)",
                required = true,
                example = "SELLER"
            ),
            @Parameter(
                name = "box",
                description = "메일함 타입 (inbox: 받은편지함, sent: 보낸편지함, 미지정: 전체)",
                required = false,
                example = "inbox"
            ),
            @Parameter(
                name = "page",
                description = "페이지 번호 (0부터 시작)",
                example = "0"
            ),
            @Parameter(
                name = "size",
                description = "페이지 크기",
                example = "20"
            )
        }
    )
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "조회 성공",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(value = """
                    {
                        "success": true,
                        "data": {
                            "threads": [
                                {
                                    "threadId": 1,
                                    "subject": "팝업 승인 관련 문의",
                                    "otherParty": {
                                        "id": 1,
                                        "name": "관리자",
                                        "role": "ADMIN"
                                    },
                                    "lastMessage": "검토 후 답변 드리겠습니다.",
                                    "lastMessageAt": "2024-01-15T11:00:00",
                                    "unreadCount": 1
                                }
                            ],
                            "totalElements": 1,
                            "totalPages": 1,
                            "currentPage": 0
                        }
                    }
                    """)
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401",
            description = "인증 실패",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(value = """
                    {
                        "success": false,
                        "error": {
                            "status": 401,
                            "code": "AUTH-401",
                            "message": "인증이 필요합니다"
                        }
                    }
                    """)
            )
        )
    })
    @GetMapping
    public ResponseEntity<ApiResponse<ThreadListResponse>> listThreads(
        Principal principal,
        @RequestParam String role,
        @RequestParam(required = false) String box,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        Long actorId = principal != null ? Long.valueOf(principal.getName()) : null;
        var res = messageService.listThreads(actorId, role, box, page, size);
        return ResponseEntity.ok(ApiResponse.success(res));
    }

    @Operation(
        summary = "문의 스레드 상세 조회",
        description = """
            특정 문의 스레드의 상세 정보와 메시지 목록을 조회합니다.
            
            이 API는 JWT 토큰 인증이 필요합니다.
            
            스레드 내의 메시지는 페이징 처리되어 반환되며, 시간순으로 정렬됩니다.
            각 메시지에는 다음 정보가 포함됩니다:
            - 메시지 ID 및 내용
            - 발신자 정보
            - 전송 시간
            - 첨부파일 목록
            - 읽음 상태
            """,
        security = @SecurityRequirement(name = "bearerAuth"),
        parameters = {
            @Parameter(
                name = "threadId",
                description = "스레드 ID",
                required = true,
                example = "1"
            ),
            @Parameter(
                name = "role",
                description = "사용자 역할 (SELLER 또는 ADMIN)",
                required = true,
                example = "SELLER"
            ),
            @Parameter(
                name = "page",
                description = "페이지 번호 (0부터 시작)",
                example = "0"
            ),
            @Parameter(
                name = "size",
                description = "페이지 크기",
                example = "50"
            )
        }
    )
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "조회 성공",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(value = """
                    {
                        "success": true,
                        "data": {
                            "threadId": 1,
                            "subject": "팝업 승인 관련 문의",
                            "messages": [
                                {
                                    "messageId": 1,
                                    "sender": {
                                        "id": 1,
                                        "name": "판매자",
                                        "role": "SELLER"
                                    },
                                    "body": "팝업 승인 관련 문의드립니다.",
                                    "sentAt": "2024-01-15T10:30:00",
                                    "attachments": [],
                                    "read": true
                                },
                                {
                                    "messageId": 2,
                                    "sender": {
                                        "id": 2,
                                        "name": "관리자",
                                        "role": "ADMIN"
                                    },
                                    "body": "검토 후 답변 드리겠습니다.",
                                    "sentAt": "2024-01-15T11:00:00",
                                    "attachments": [],
                                    "read": false
                                }
                            ],
                            "totalElements": 2,
                            "totalPages": 1,
                            "currentPage": 0
                        }
                    }
                    """)
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401",
            description = "인증 실패",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(value = """
                    {
                        "success": false,
                        "error": {
                            "status": 401,
                            "code": "AUTH-401",
                            "message": "인증이 필요합니다"
                        }
                    }
                    """)
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "404",
            description = "스레드를 찾을 수 없음",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(value = """
                    {
                        "success": false,
                        "error": {
                            "status": 404,
                            "code": "COMMON-404",
                            "message": "스레드를 찾을 수 없습니다"
                        }
                    }
                    """)
            )
        )
    })
    @GetMapping("/{threadId}")
    public ResponseEntity<ApiResponse<ThreadDetailResponse>> getThreadDetail(
        Principal principal,
        @PathVariable Long threadId,
        @RequestParam String role,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "50") int size
    ) {
        Long actorId = principal != null ? Long.valueOf(principal.getName()) : null;
        var res = messageService.getThreadDetail(actorId, role, threadId, page, size);
        return ResponseEntity.ok(ApiResponse.success(res));
    }

    @Operation(
        summary = "답장 전송",
        description = """
            기존 문의 스레드에 답장 메시지를 전송합니다.
            
            이 API는 JWT 토큰 인증이 필요하며, 판매자 또는 관리자가 사용할 수 있습니다.
            
            요청 본문:
            - body: 메시지 내용 (필수, 최대 5000자)
            - attachments: 첨부파일 목록 (선택, 최대 5개)
            
            첨부파일은 먼저 /api/uploads/images 엔드포인트를 통해 업로드한 후,
            반환된 파일 정보(url, key)를 attachments 배열에 포함해야 합니다.
            """,
        security = @SecurityRequirement(name = "bearerAuth"),
        parameters = {
            @Parameter(
                name = "threadId",
                description = "스레드 ID",
                required = true,
                example = "1"
            )
        },
        requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
            required = true,
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    name = "답장 전송 요청 예시",
                    value = """
                        {
                            "body": "검토 완료했습니다. 승인 처리되었습니다.",
                            "attachments": []
                        }
                        """
                )
            )
        )
    )
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "답장 전송 성공",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(value = """
                    {
                        "success": true,
                        "data": {
                            "id": 3
                        }
                    }
                    """)
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400",
            description = "입력값 검증 실패",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(value = """
                    {
                        "success": false,
                        "error": {
                            "status": 400,
                            "code": "E001",
                            "message": "입력값이 올바르지 않습니다"
                        }
                    }
                    """)
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401",
            description = "인증 실패",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(value = """
                    {
                        "success": false,
                        "error": {
                            "status": 401,
                            "code": "AUTH-401",
                            "message": "인증이 필요합니다"
                        }
                    }
                    """)
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "404",
            description = "스레드를 찾을 수 없음",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(value = """
                    {
                        "success": false,
                        "error": {
                            "status": 404,
                            "code": "COMMON-404",
                            "message": "스레드를 찾을 수 없습니다"
                        }
                    }
                    """)
            )
        )
    })
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

    @Operation(
        summary = "메시지 소프트 삭제",
        description = """
            특정 메시지를 소프트 삭제합니다.
            
            이 API는 JWT 토큰 인증이 필요합니다.
            
            소프트 삭제는 실제로 메시지를 삭제하지 않고,
            현재 사용자의 뷰에서만 숨깁니다.
            상대방은 여전히 해당 메시지를 볼 수 있습니다.
            """,
        security = @SecurityRequirement(name = "bearerAuth"),
        parameters = {
            @Parameter(
                name = "messageId",
                description = "메시지 ID",
                required = true,
                example = "1"
            )
        }
    )
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "삭제 성공",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(value = """
                    {
                        "success": true,
                        "data": null
                    }
                    """)
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401",
            description = "인증 실패",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(value = """
                    {
                        "success": false,
                        "error": {
                            "status": 401,
                            "code": "AUTH-401",
                            "message": "인증이 필요합니다"
                        }
                    }
                    """)
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "404",
            description = "메시지를 찾을 수 없음",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(value = """
                    {
                        "success": false,
                        "error": {
                            "status": 404,
                            "code": "COMMON-404",
                            "message": "메시지를 찾을 수 없습니다"
                        }
                    }
                    """)
            )
        )
    })
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
