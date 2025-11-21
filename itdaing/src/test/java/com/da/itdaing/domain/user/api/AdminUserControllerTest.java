package com.da.itdaing.domain.user.api;

import com.da.itdaing.domain.common.enums.UserRole;
import com.da.itdaing.domain.common.enums.UserStatus;
import com.da.itdaing.domain.user.dto.AdminUserResponse;
import com.da.itdaing.domain.user.service.AdminUserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.data.domain.*;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = AdminUserController.class)
@AutoConfigureMockMvc(addFilters = false) // 시큐리티 필터 체인 비활성화 (권한 체크는 별도 통합테스트에서)
class AdminUserControllerTest {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper objectMapper;

    @MockitoBean
    AdminUserService adminUserService;

    @Test
    @DisplayName("관리자 - 소비자 계정 조회 성공 (role + status)")
    void getUsers_consumer_withStatus_success() throws Exception {
        // given
        Pageable pageable = PageRequest.of(0, 20);
        Page<AdminUserResponse> page =
            new PageImpl<>(List.of(Mockito.mock(AdminUserResponse.class)), pageable, 1);

        Mockito.when(adminUserService.getUsers(
                eq(UserRole.CONSUMER),
                eq(UserStatus.ACTIVE),
                any(Pageable.class)
            ))
            .thenReturn(page);

        // when & then
        mockMvc.perform(get("/api/admin/users")
                .param("role", "CONSUMER")
                .param("status", "ACTIVE")
                .param("page", "0")
                .param("size", "20"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.content").isArray())
            .andExpect(jsonPath("$.data.content.length()").value(1));
    }

    @Test
    @DisplayName("관리자 - 판매자 계정 조회 성공 (status 없이)")
    void getUsers_seller_withoutStatus_success() throws Exception {
        // given
        Pageable pageable = PageRequest.of(0, 10);
        Page<AdminUserResponse> page =
            new PageImpl<>(List.of(), pageable, 0);

        Mockito.when(adminUserService.getUsers(
                eq(UserRole.SELLER),
                isNull(),
                any(Pageable.class)
            ))
            .thenReturn(page);

        // when & then
        mockMvc.perform(get("/api/admin/users")
                .param("role", "SELLER")
                .param("page", "0")
                .param("size", "10"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.content").isArray())
            .andExpect(jsonPath("$.data.content.length()").value(0));
    }

    @Test
    @DisplayName("관리자 - 계정 상태 변경 성공")
    void updateUserStatus_success() throws Exception {
        // given
        Long userId = 1L;
        AdminUserResponse mockedResponse = Mockito.mock(AdminUserResponse.class);

        Mockito.when(adminUserService.updateUserStatus(userId, UserStatus.INACTIVE))
            .thenReturn(mockedResponse);

        Map<String, String> body = Map.of("status", "INACTIVE");
        String json = objectMapper.writeValueAsString(body);

        // when & then
        mockMvc.perform(patch("/api/admin/users/{userId}/status", userId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data").exists());
    }
}
