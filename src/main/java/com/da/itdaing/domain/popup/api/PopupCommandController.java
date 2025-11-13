package com.da.itdaing.domain.popup.api;

import com.da.itdaing.domain.popup.dto.PopupCreateRequest;
import com.da.itdaing.domain.popup.dto.PopupSummaryResponse;
import com.da.itdaing.domain.popup.service.PopupCommandService;
import com.da.itdaing.domain.popup.service.PopupQueryService;
import com.da.itdaing.global.web.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import java.security.Principal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/popups")
@RequiredArgsConstructor
public class PopupCommandController {

    private final PopupCommandService popupCommandService;
    private final PopupQueryService popupQueryService;

    @PreAuthorize("hasRole('SELLER')")
    @Operation(summary = "팝업 등록", description = "판매자가 셀을 선택해 신규 팝업을 등록합니다.")
    @PostMapping
    public ResponseEntity<ApiResponse<PopupSummaryResponse>> createPopup(
        Principal principal,
        @Valid @RequestBody PopupCreateRequest request
    ) {
        Long sellerId = Long.valueOf(principal.getName());
        Long popupId = popupCommandService.createPopup(sellerId, request);
        PopupSummaryResponse response = popupQueryService.getPopup(popupId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @PreAuthorize("hasRole('SELLER')")
    @Operation(summary = "팝업 수정", description = "판매자가 자신의 팝업 정보를 수정합니다.")
    @PutMapping("/{popupId}")
    public ResponseEntity<ApiResponse<PopupSummaryResponse>> updatePopup(
        Principal principal,
        @PathVariable Long popupId,
        @Valid @RequestBody PopupCreateRequest request
    ) {
        Long sellerId = Long.valueOf(principal.getName());
        Long updatedId = popupCommandService.updatePopup(sellerId, popupId, request);
        PopupSummaryResponse response = popupQueryService.getPopup(updatedId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PreAuthorize("hasRole('SELLER')")
    @Operation(summary = "팝업 삭제", description = "판매자가 자신의 팝업을 삭제합니다.")
    @DeleteMapping("/{popupId}")
    public ResponseEntity<ApiResponse<Void>> deletePopup(
        Principal principal,
        @PathVariable Long popupId
    ) {
        Long sellerId = Long.valueOf(principal.getName());
        popupCommandService.deletePopup(sellerId, popupId);
        return ResponseEntity.ok(ApiResponse.success());
    }
}
