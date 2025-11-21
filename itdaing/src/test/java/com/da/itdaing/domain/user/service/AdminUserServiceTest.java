// src/test/java/com/da/itdaing/domain/user/service/AdminUserServiceTest.java
package com.da.itdaing.domain.user.service;

import com.da.itdaing.domain.common.enums.UserRole;
import com.da.itdaing.domain.common.enums.UserStatus;
import com.da.itdaing.domain.user.dto.AdminUserResponse;
import com.da.itdaing.domain.user.entity.Users;
import com.da.itdaing.domain.user.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminUserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AdminUserService adminUserService;

    @Test
    @DisplayName("status가 null이면 role만으로 조회한다 (findByRole 호출)")
    void getUsers_withoutStatus_usesFindByRole() {
        // given
        UserRole role = UserRole.CONSUMER;
        UserStatus status = null;
        Pageable pageable = PageRequest.of(0, 10);

        Users user = Users.builder()
            .loginId("user1")
            .password("encodedPw")
            .name("사용자1")
            .nickname("닉1")
            .email("user1@test.com")
            .ageGroup(20)
            .mbti("INTJ")
            .role(role)
            .profileImageUrl(null)
            .profileImageKey(null)
            .status(UserStatus.ACTIVE)
            .build();

        Page<Users> usersPage = new PageImpl<>(List.of(user), pageable, 1);
        when(userRepository.findByRole(role, pageable)).thenReturn(usersPage);

        // when
        Page<AdminUserResponse> result = adminUserService.getUsers(role, status, pageable);

        // then
        assertThat(result).isNotNull();
        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent()).hasSize(1);

        verify(userRepository, times(1)).findByRole(role, pageable);
        verify(userRepository, never()).findByRoleAndStatus(any(), any(), any());
    }

    @Test
    @DisplayName("status가 주어지면 role + status로 조회한다 (findByRoleAndStatus 호출)")
    void getUsers_withStatus_usesFindByRoleAndStatus() {
        // given
        UserRole role = UserRole.SELLER;
        UserStatus status = UserStatus.INACTIVE;
        Pageable pageable = PageRequest.of(0, 10);

        Users user = Users.builder()
            .loginId("seller1")
            .password("encodedPw")
            .name("판매자1")
            .nickname("셀러1")
            .email("seller1@test.com")
            .ageGroup(30)
            .mbti("ENFJ")
            .role(role)
            .profileImageUrl(null)
            .profileImageKey(null)
            .status(status)
            .build();

        Page<Users> usersPage = new PageImpl<>(List.of(user), pageable, 1);
        when(userRepository.findByRoleAndStatus(role, status, pageable)).thenReturn(usersPage);

        // when
        Page<AdminUserResponse> result = adminUserService.getUsers(role, status, pageable);

        // then
        assertThat(result).isNotNull();
        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent()).hasSize(1);

        verify(userRepository, times(1)).findByRoleAndStatus(role, status, pageable);
        verify(userRepository, never()).findByRole(any(), any());
    }

    @Test
    @DisplayName("계정 상태 변경 성공 시, 엔티티 status가 변경된다")
    void updateUserStatus_success() {
        // given
        Long userId = 1L;
        UserStatus before = UserStatus.ACTIVE;
        UserStatus after = UserStatus.INACTIVE;

        Users user = Users.builder()
            .loginId("user1")
            .password("encodedPw")
            .name("사용자1")
            .nickname("닉1")
            .email("user1@test.com")
            .ageGroup(20)
            .mbti("INTP")
            .role(UserRole.CONSUMER)
            .profileImageUrl(null)
            .profileImageKey(null)
            .status(before)
            .build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        // when
        AdminUserResponse response = adminUserService.updateUserStatus(userId, after);

        // then
        assertThat(response).isNotNull();
        // 엔티티가 실제로 바뀌었는지 확인
        assertThat(user.getStatus()).isEqualTo(after);

        verify(userRepository, times(1)).findById(userId);
    }

    @Test
    @DisplayName("계정 상태 변경 시 대상 유저가 없으면 EntityNotFoundException 발생")
    void updateUserStatus_userNotFound_throws() {
        // given
        Long userId = 999L;
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        // when & then
        assertThrows(EntityNotFoundException.class,
            () -> adminUserService.updateUserStatus(userId, UserStatus.INACTIVE));

        verify(userRepository, times(1)).findById(userId);
    }
}
