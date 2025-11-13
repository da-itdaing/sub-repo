// src/main/java/com/da/itdaing/domain/admin/service/ApprovalService.java
package com.da.itdaing.domain.admin.service;

import com.da.itdaing.domain.admin.dto.ApprovalDtos.*;
import com.da.itdaing.domain.audit.entity.ApprovalRecord;
import com.da.itdaing.domain.audit.repository.ApprovalRecordRepository;
import com.da.itdaing.domain.common.enums.ApprovalStatus;
import com.da.itdaing.domain.common.enums.ApprovalTargetType;
import com.da.itdaing.domain.common.enums.DecisionType;
import com.da.itdaing.domain.popup.entity.Popup;
import com.da.itdaing.domain.popup.repository.PopupRepository;
import com.da.itdaing.domain.user.entity.Users;
import com.da.itdaing.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ApprovalService {

    private final PopupRepository popupRepository;
    private final ApprovalRecordRepository approvalRecordRepository;
    private final UserRepository userRepository;

    /** 관리자: 승인 대기 목록 조회 */
    @Transactional(readOnly = true)
    public ApprovalListResponse listPendingApprovals(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        
        // 현재는 팝업만 지원
        Page<Popup> pendingPopups = popupRepository.findByApprovalStatus(
            ApprovalStatus.PENDING, pageable);

        List<ApprovalItemResponse> items = pendingPopups.getContent().stream()
            .map(popup -> ApprovalItemResponse.builder()
                .id(popup.getId())
                .targetType(ApprovalTargetType.POPUP)
                .targetId(popup.getId())
                .targetName(popup.getName())
                .currentStatus(popup.getApprovalStatus())
                .requesterLoginId(popup.getSeller().getLoginId())
                .requesterId(popup.getSeller().getId())
                .requestedAt(popup.getCreatedAt())
                .description(popup.getDescription() != null && popup.getDescription().length() > 100
                    ? popup.getDescription().substring(0, 100) + "..."
                    : popup.getDescription())
                .build())
            .collect(Collectors.toList());

        return ApprovalListResponse.builder()
            .items(items)
            .totalElements(pendingPopups.getTotalElements())
            .totalPages(pendingPopups.getTotalPages())
            .page(page)
            .size(size)
            .build();
    }

    /** 관리자: 승인 처리 */
    public ApprovalDecisionResponse approve(Long approvalId, Long adminId, ApprovalDecisionRequest req) {
        Objects.requireNonNull(approvalId, "approvalId must not be null");
        Objects.requireNonNull(adminId, "adminId must not be null");
        Objects.requireNonNull(req, "request must not be null");
        // 현재는 팝업만 지원
        Popup popup = popupRepository.findById(approvalId)
            .orElseThrow(() -> new IllegalArgumentException("승인 대기 항목을 찾을 수 없습니다: " + approvalId));

        if (popup.getApprovalStatus() != ApprovalStatus.PENDING) {
            throw new IllegalStateException("이미 처리된 항목입니다. 현재 상태: " + popup.getApprovalStatus());
        }

        Users admin = userRepository.findById(adminId)
            .orElseThrow(() -> new IllegalArgumentException("관리자를 찾을 수 없습니다: " + adminId));

        // 팝업 상태 변경
        popup.updateApprovalStatus(ApprovalStatus.APPROVED, null);
        popupRepository.save(popup);

        // 승인 기록 생성
        ApprovalRecord record = ApprovalRecord.forPopup(
            popup.getId(),
            DecisionType.APPROVE,
            req.getReason(),
            admin
        );
        Objects.requireNonNull(record, "approval record must not be null");
        approvalRecordRepository.save(record);

        return ApprovalDecisionResponse.builder()
            .approvalRecordId(record.getId())
            .targetType(ApprovalTargetType.POPUP)
            .targetId(popup.getId())
            .decision(DecisionType.APPROVE)
            .reason(req.getReason())
            .processedAt(record.getCreatedAt())
            .build();
    }

    /** 관리자: 거부 처리 */
    public ApprovalDecisionResponse reject(Long approvalId, Long adminId, ApprovalDecisionRequest req) {
        Objects.requireNonNull(approvalId, "approvalId must not be null");
        Objects.requireNonNull(adminId, "adminId must not be null");
        // 현재는 팝업만 지원
        Popup popup = popupRepository.findById(approvalId)
            .orElseThrow(() -> new IllegalArgumentException("승인 대기 항목을 찾을 수 없습니다: " + approvalId));

        if (popup.getApprovalStatus() != ApprovalStatus.PENDING) {
            throw new IllegalStateException("이미 처리된 항목입니다. 현재 상태: " + popup.getApprovalStatus());
        }

        Users admin = userRepository.findById(adminId)
            .orElseThrow(() -> new IllegalArgumentException("관리자를 찾을 수 없습니다: " + adminId));

        // 팝업 상태 변경
        popup.updateApprovalStatus(ApprovalStatus.REJECTED, req.getReason());
        popupRepository.save(popup);

        // 거부 기록 생성
        ApprovalRecord record = ApprovalRecord.forPopup(
            popup.getId(),
            DecisionType.REJECT,
            req != null ? req.getReason() : null,
            admin
        );
        Objects.requireNonNull(record, "approval record must not be null");
        approvalRecordRepository.save(record);

        return ApprovalDecisionResponse.builder()
            .approvalRecordId(record.getId())
            .targetType(ApprovalTargetType.POPUP)
            .targetId(popup.getId())
            .decision(DecisionType.REJECT)
            .reason(req.getReason())
            .processedAt(record.getCreatedAt())
            .build();
    }
}

