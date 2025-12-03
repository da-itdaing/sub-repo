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

    /** 관리자: 승인 목록 조회 (status로 필터링 가능, null이면 전체 조회) */
    @Transactional(readOnly = true)
    public ApprovalListResponse listApprovals(String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        
        // 현재는 팝업만 지원
        Page<Popup> popups;
        if (status != null && !status.isBlank()) {
            try {
                ApprovalStatus approvalStatus = ApprovalStatus.valueOf(status.toUpperCase());
                popups = popupRepository.findByApprovalStatus(approvalStatus, pageable);
            } catch (IllegalArgumentException e) {
                // 잘못된 status 값이면 전체 조회
                popups = popupRepository.findAll(pageable);
            }
        } else {
            // status 없으면 전체 조회
            popups = popupRepository.findAll(pageable);
        }

        List<ApprovalItemResponse> items = popups.getContent().stream()
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
            .totalElements(popups.getTotalElements())
            .totalPages(popups.getTotalPages())
            .page(page)
            .size(size)
            .build();
    }

    /** 관리자: 승인 대기 목록 조회 (PENDING만) - 하위 호환용 */
    @Transactional(readOnly = true)
    public ApprovalListResponse listPendingApprovals(int page, int size) {
        return listApprovals("PENDING", page, size);
    }

    /** 관리자: 승인 처리 (모든 상태에서 가능) */
    public ApprovalDecisionResponse approve(Long approvalId, Long adminId, ApprovalDecisionRequest req) {
        Objects.requireNonNull(approvalId, "approvalId must not be null");
        Objects.requireNonNull(adminId, "adminId must not be null");
        Objects.requireNonNull(req, "request must not be null");
        
        Popup popup = popupRepository.findById(approvalId)
            .orElseThrow(() -> new IllegalArgumentException("팝업을 찾을 수 없습니다: " + approvalId));

        // 이미 승인된 상태면 스킵
        if (popup.getApprovalStatus() == ApprovalStatus.APPROVED) {
            return ApprovalDecisionResponse.builder()
                .targetType(ApprovalTargetType.POPUP)
                .targetId(popup.getId())
                .decision(DecisionType.APPROVE)
                .build();
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

    /** 관리자: 거부 처리 (모든 상태에서 가능) */
    public ApprovalDecisionResponse reject(Long approvalId, Long adminId, ApprovalDecisionRequest req) {
        Objects.requireNonNull(approvalId, "approvalId must not be null");
        Objects.requireNonNull(adminId, "adminId must not be null");
        
        Popup popup = popupRepository.findById(approvalId)
            .orElseThrow(() -> new IllegalArgumentException("팝업을 찾을 수 없습니다: " + approvalId));

        // 이미 거부된 상태면 스킵
        if (popup.getApprovalStatus() == ApprovalStatus.REJECTED) {
            return ApprovalDecisionResponse.builder()
                .targetType(ApprovalTargetType.POPUP)
                .targetId(popup.getId())
                .decision(DecisionType.REJECT)
                .build();
        }

        Users admin = userRepository.findById(adminId)
            .orElseThrow(() -> new IllegalArgumentException("관리자를 찾을 수 없습니다: " + adminId));

        // 팝업 상태 변경
        popup.updateApprovalStatus(ApprovalStatus.REJECTED, req != null ? req.getReason() : null);
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
            .reason(req != null ? req.getReason() : null)
            .processedAt(record.getCreatedAt())
            .build();
    }

    /** 관리자: 상태 직접 변경 (승인/반려 후에도 다시 대기로 변경 등) */
    public void changeStatus(Long popupId, String status, Long adminId) {
        Objects.requireNonNull(popupId, "popupId must not be null");
        Objects.requireNonNull(status, "status must not be null");
        
        Popup popup = popupRepository.findById(popupId)
            .orElseThrow(() -> new IllegalArgumentException("팝업을 찾을 수 없습니다: " + popupId));

        ApprovalStatus newStatus;
        try {
            newStatus = ApprovalStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("유효하지 않은 상태입니다: " + status);
        }

        // 같은 상태면 스킵
        if (popup.getApprovalStatus() == newStatus) {
            return;
        }

        popup.updateApprovalStatus(newStatus, null);
        popupRepository.save(popup);
    }
}

