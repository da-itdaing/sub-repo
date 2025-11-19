package com.da.itdaing.domain.geo.api;

import com.da.itdaing.domain.common.enums.AreaStatus;
import com.da.itdaing.domain.geo.dto.GeoDtos.*;
import com.da.itdaing.domain.geo.service.GeoAreaService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
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

import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(
    controllers = GeoAreaController.class,
    excludeFilters = @ComponentScan.Filter(
        type = FilterType.REGEX,
        pattern = ".*LocalStaticResourceConfig"   // 심볼 없이도 제외 가능
    )
)
@AutoConfigureMockMvc(addFilters = false) // 시큐리티 필터 끄고 @PreAuthorize는 WithMockUser로 통과
class GeoAreaControllerTest {

    @Resource MockMvc mvc;
    @Resource ObjectMapper om;

    @MockitoBean
    GeoAreaService areaService;

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("POST /api/geo/areas - 구역 생성(ADMIN)")
    void createArea_admin_ok() throws Exception {
        CreateAreaRequest req = CreateAreaRequest.builder()
            .name("A-구역")
            .polygonGeoJson("""
                    {"type":"Polygon","coordinates":[[[126.97,37.56],[126.98,37.56],[126.98,37.57],[126.97,37.57],[126.97,37.56]]]}
                """)
            .status(AreaStatus.AVAILABLE)
            .maxCapacity(120)
            .notice("소음 주의")
            .build();

        AreaResponse resp = AreaResponse.builder()
            .id(10L)
            .name("A-구역")
            .polygonGeoJson(req.getPolygonGeoJson())
            .status(AreaStatus.AVAILABLE)
            .maxCapacity(120)
            .notice("소음 주의")
            .build();

        Mockito.when(areaService.createArea(any())).thenReturn(resp);

        mvc.perform(post("/api/geo/areas")
                .contentType(MediaType.APPLICATION_JSON)
                .content(om.writeValueAsString(req)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.id").value(10))
            .andExpect(jsonPath("$.data.name").value("A-구역"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GET /api/geo/areas - 구역 목록(ADMIN)")
    void listAreas_admin_ok() throws Exception {
        AreaResponse item = AreaResponse.builder()
            .id(10L)
            .name("A-구역")
            .polygonGeoJson("""
                    {"type":"Polygon","coordinates":[[[126.97,37.56],[126.98,37.56],[126.98,37.57],[126.97,37.57],[126.97,37.56]]]}
                """)
            .status(AreaStatus.AVAILABLE)
            .build();

        AreaListResponse page = AreaListResponse.builder()
            .items(List.of(item))
            .page(0).size(20)
            .totalElements(1).totalPages(1)
            .build();

        Mockito.when(areaService.listAreas(any(), any(Integer.class), any(Integer.class)))
            .thenReturn(page);

        mvc.perform(get("/api/geo/areas?page=0&size=20"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.items[0].id").value(10));
    }
}
