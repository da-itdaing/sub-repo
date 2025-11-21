// src/main/java/com/da/itdaing/domain/user/api/AdminUserController.java
package com.da.itdaing.domain.user.api;

import com.da.itdaing.domain.common.enums.UserRole;
import com.da.itdaing.domain.common.enums.UserStatus;
import com.da.itdaing.domain.user.dto.AdminUserResponse;
import com.da.itdaing.domain.user.dto.UserStatusUpdateRequest;
import com.da.itdaing.domain.user.service.AdminUserService;
import com.da.itdaing.global.api.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final AdminUserService adminUserService;

    /**
     * 소비자 / 판매자 계정 조회
     * GET /api/admin/users?role=CONSUMER|SELLER&status?&page=&size=
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Page<AdminUserResponse>> getUsers(
        @RequestParam("role") UserRole role,
        @RequestParam(value = "status", required = false) UserStatus status,
        @PageableDefault(size = 20) Pageable pageable
    ) {
        Page<AdminUserResponse> result = adminUserService.getUsers(role, status, pageable);
        return ApiResponse.success(result);
    }

    /**
     * 계정 상태 변경
     * PATCH /api/admin/users/{userId}/status
     * body: { "status": "ACTIVE" }
     */
    @PatchMapping("/{userId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<AdminUserResponse> updateUserStatus(
        @PathVariable Long userId,
        @Valid @RequestBody UserStatusUpdateRequest request
    ) {
        AdminUserResponse response =
            adminUserService.updateUserStatus(userId, request.getStatus());
        return ApiResponse.success(response);
    }
}
