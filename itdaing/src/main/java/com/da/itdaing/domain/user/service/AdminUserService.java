// src/main/java/com/da/itdaing/domain/user/service/AdminUserService.java
package com.da.itdaing.domain.user.service;

import com.da.itdaing.domain.common.enums.UserRole;
import com.da.itdaing.domain.common.enums.UserStatus;
import com.da.itdaing.domain.user.dto.AdminUserResponse;
import com.da.itdaing.domain.user.entity.Users;
import com.da.itdaing.domain.user.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminUserService {

    private final UserRepository userRepository;

    /**
     * 소비자 / 판매자 계정 조회 + (선택) 상태 필터
     */
    public Page<AdminUserResponse> getUsers(UserRole role, UserStatus status, Pageable pageable) {
        Page<Users> usersPage;

        if (status != null) {
            usersPage = userRepository.findByRoleAndStatus(role, status, pageable);
        } else {
            usersPage = userRepository.findByRole(role, pageable);
        }

        return usersPage.map(AdminUserResponse::from);
    }

    /**
     * 계정 상태 변경
     */
    @Transactional
    public AdminUserResponse updateUserStatus(Long userId, UserStatus status) {
        Users user = userRepository.findById(userId)
            .orElseThrow(() -> new EntityNotFoundException("User not found: " + userId));

        user.changeStatus(status); // setStatus 없으면 엔티티에 메서드 추가 필요

        return AdminUserResponse.from(user);
    }
}
