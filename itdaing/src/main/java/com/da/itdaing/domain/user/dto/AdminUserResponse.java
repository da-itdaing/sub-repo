// src/main/java/com/da/itdaing/domain/user/dto/AdminUserResponse.java
package com.da.itdaing.domain.user.dto;

import com.da.itdaing.domain.common.enums.UserRole;
import com.da.itdaing.domain.common.enums.UserStatus;
import com.da.itdaing.domain.user.entity.Users;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AdminUserResponse {

    private Long id;
    private String email;
    private String name;
    private String nickname;
    private UserRole role;
    private UserStatus status;
    private LocalDateTime createdAt;

    public static AdminUserResponse from(Users user) {
        return AdminUserResponse.builder()
            .id(user.getId())
            .email(user.getEmail())
            .name(user.getName())
            .nickname(user.getNickname())
            .role(user.getRole())
            .status(user.getStatus())
            .createdAt(user.getCreatedAt())
            .build();
    }
}
