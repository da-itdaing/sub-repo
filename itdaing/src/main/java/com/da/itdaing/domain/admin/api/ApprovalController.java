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

    @Operation(summary = "승인 목록 조회 (관리자) - status 파라미터로 필터링 가능, 생략 시 전체 조회")
    @GetMapping
    public ApiResponse<ApprovalListResponse> listApprovals(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.success(approvalService.listApprovals(status, page, size));
    }

    @Operation(summary = "승인 처리 (관리자)")
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

    @Operation(summary = "거부 처리 (관리자)")
    @PostMapping("/{id}/reject")
    public ApiResponse<ApprovalDecisionResponse> reject(
            @PathVariable Long id,
            Principal principal,
            @RequestBody ApprovalDecisionRequest req) {
        Long adminId = Long.valueOf(principal.getName());
        return ApiResponse.success(approvalService.reject(id, adminId, req));
    }

    @Operation(summary = "상태 직접 변경 (관리자) - 승인/반려 후에도 다른 상태로 변경 가능")
    @PatchMapping("/{id}/status")
    public ApiResponse<Void> changeStatus(
            @PathVariable Long id,
            Principal principal,
            @RequestBody StatusChangeRequest req) {
        Long adminId = Long.valueOf(principal.getName());
        approvalService.changeStatus(id, req.getStatus(), adminId);
        return ApiResponse.success(null);
    }
}

