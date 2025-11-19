// src/test/java/com/da/itdaing/domain/geo/api/GeoZoneControllerTest.java
package com.da.itdaing.domain.geo.api;

import com.da.itdaing.domain.common.enums.ZoneStatus;
import com.da.itdaing.domain.geo.dto.GeoDtos.*;
import com.da.itdaing.domain.geo.service.GeoZoneService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import jakarta.annotation.Resource;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(
    controllers = GeoZoneController.class, // ★ 이 컨트롤러만 로드
    excludeFilters = @ComponentScan.Filter(
        type = FilterType.REGEX,
        pattern = ".*LocalStaticResourceConfig" // 정적 리소스 설정 제외
    )
)
@AutoConfigureMockMvc(addFilters = false) // 시큐리티 필터 OFF (@PreAuthorize는 WithMockUser로 통과)
class GeoZoneControllerTest {

    @Resource MockMvc mvc;
    @Resource ObjectMapper om;

    @MockitoBean
    GeoZoneService zoneService;

    @Test
    @WithMockUser(roles = "SELLER")
    @DisplayName("POST /api/geo/zones - 존 생성(SELLER)")
    void createZone_ok() throws Exception {
        var req = CreateZoneRequest.builder()
            .areaId(10L)
            .label("A-1")
            .detailedAddress("광주 남구 어딘가 101")
            .lat(37.5665)
            .lng(126.9780)
            .maxCapacity(50)
            .notice("전력 사용 제한")
            .build();

        var resp = ZoneResponse.builder()
            .id(100L)
            .areaId(10L)
            .ownerId(1L)
            .label("A-1")
            .detailedAddress("광주 남구 어딘가 101")
            .lat(37.5665)
            .lng(126.9780)
            .status(ZoneStatus.PENDING)
            .maxCapacity(50)
            .notice("전력 사용 제한")
            .build();

        when(zoneService.createZone(eq(1L), any(CreateZoneRequest.class)))
            .thenReturn(resp);

        mvc.perform(post("/api/geo/zones")
                .principal(() -> "1") // ★ sellerId=1
                .contentType(MediaType.APPLICATION_JSON)
                .content(om.writeValueAsString(req)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.id").value(100))
            .andExpect(jsonPath("$.data.status").value("PENDING"));
    }

    @Test
    @WithMockUser(roles = "SELLER")
    @DisplayName("GET /api/geo/zones/me - 내가 만든 존 목록(SELLER)")
    void listMyZones_ok() throws Exception {
        var item = ZoneResponse.builder()
            .id(101L).areaId(10L).ownerId(1L)
            .label("A-2").lat(37.56).lng(126.97)
            .status(ZoneStatus.PENDING)
            .build();

        var page = ZoneListResponse.builder()
            .items(List.of(item))
            .page(0).size(20)
            .totalElements(1).totalPages(1)
            .build();

        when(zoneService.listMyZones(eq(1L), eq(0), eq(20))).thenReturn(page);

        mvc.perform(get("/api/geo/zones/me?page=0&size=20")
                .principal(() -> "1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.items[0].id").value(101));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GET /api/geo/zones?areaId - 특정 구역의 존 목록(ADMIN)")
    void listByArea_ok() throws Exception {
        var item = ZoneResponse.builder()
            .id(201L).areaId(10L).ownerId(1L)
            .label("B-1").lat(37.57).lng(126.99)
            .status(ZoneStatus.APPROVED)
            .build();

        var page = ZoneListResponse.builder()
            .items(List.of(item))
            .page(0).size(10)
            .totalElements(1).totalPages(1)
            .build();

        when(zoneService.listZonesByArea(eq(10L), eq(0), eq(10))).thenReturn(page);

        mvc.perform(get("/api/geo/zones?areaId=10&page=0&size=10"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.items[0].areaId").value(10));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("PATCH /api/geo/zones/{id}/status - 존 상태 변경(ADMIN)")
    void changeStatus_ok() throws Exception {
        var req = UpdateZoneStatusRequest.builder()
            .status(ZoneStatus.APPROVED)
            .build();

        // void 메서드이므로 when(...) 필요 없음

        mvc.perform(patch("/api/geo/zones/{zoneId}/status", 300L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(om.writeValueAsString(req)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data").doesNotExist());
    }
}
