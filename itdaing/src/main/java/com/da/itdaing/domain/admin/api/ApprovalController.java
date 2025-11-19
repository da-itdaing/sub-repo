// src/main/java/com/da/itdaing/domain/admin/api/ApprovalController.java
package com.da.itdaing.domain.admin.api;

import com.da.itdaing.domain.admin.dto.ApprovalDtos.*;
import com.da.itdaing.domain.admin.service.ApprovalService;
import com.da.itdaing.global.web.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/admin/approvals")
@RequiredArgsConstructor
@Tag(name = "Approval Management (Admin)")
@PreAuthorize("hasRole('ADMIN')")
public class ApprovalController {

    private final ApprovalService approvalService;

    @Operation(
        summary = "승인 대기 목록 조회 (관리자 전용)",
        description = """
            승인이 필요한 항목들의 목록을 조회합니다.
            
            승인 대상 타입:
            - POPUP: 팝업스토어 등록 신청
            - ZONE: 존 생성 신청
            - SELLER_PROFILE: 판매자 프로필 등록/수정
            
            반환되는 정보:
            - 승인 항목 ID
            - 대상 타입 (POPUP, ZONE, SELLER_PROFILE)
            - 대상 ID
            - 신청자 정보
            - 신청 일시
            - 현재 상태 (PENDING, APPROVED, REJECTED)
            
            페이지네이션 지원 (page, size)
            기본값: PENDING 상태만 조회
            
            권한: ADMIN 역할 필요
            """
    )
    @GetMapping
    public ApiResponse<ApprovalListResponse> listPendingApprovals(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.success(approvalService.listPendingApprovals(page, size));
    }

    @Operation(
        summary = "승인 처리 (관리자 전용)",
        description = """
            승인 대기 중인 항목을 승인합니다.
            
            승인 시 동작:
            - POPUP: 팝업스토어 상태가 APPROVED로 변경되어 공개됨
            - ZONE: 존 상태가 APPROVED로 변경되어 사용 가능해짐
            - SELLER_PROFILE: 판매자 프로필이 활성화됨
            
            요청 본문 (선택사항):
            - comment: 승인 사유 또는 메모
            
            승인 기록:
            - 승인 일시, 승인자(관리자) ID, 코멘트가 기록됩니다
            - 승인 기록은 ApprovalRecord 테이블에 저장되어 추적 가능합니다
            
            권한: ADMIN 역할 필요
            """
    )
    @PostMapping("/{id}/approve")
    public ApiResponse<ApprovalDecisionResponse> approve(
            @PathVariable Long id,
            Principal principal,
            @RequestBody(required = false) ApprovalDecisionRequest req) {
        Long adminId = Long.valueOf(principal.getName());
        if (req == null) {
            req = new ApprovalDecisionRequest();
        }
        return ApiResponse.success(approvalService.approve(id, adminId, req));
    }

    @Operation(
        summary = "거부 처리 (관리자 전용)",
        description = """
            승인 대기 중인 항목을 거부합니다.
            
            거부 시 동작:
            - POPUP: 팝업스토어가 REJECTED 상태로 변경되어 공개되지 않음
            - ZONE: 존이 REJECTED 상태로 변경되어 사용 불가
            - SELLER_PROFILE: 판매자 프로필이 비활성화됨
            
            요청 본문 (필수):
            - comment: 거부 사유 (필수)
            
            거부 기록:
            - 거부 일시, 거부자(관리자) ID, 거부 사유가 기록됩니다
            - 판매자는 거부 사유를 확인하고 수정 후 재신청할 수 있습니다
            
            권한: ADMIN 역할 필요
            """
    )
    @PostMapping("/{id}/reject")
    public ApiResponse<ApprovalDecisionResponse> reject(
            @PathVariable Long id,
            Principal principal,
            @RequestBody ApprovalDecisionRequest req) {
        Long adminId = Long.valueOf(principal.getName());
        return ApiResponse.success(approvalService.reject(id, adminId, req));
    }
}

