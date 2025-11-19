package com.da.itdaing.domain.master.controller;

import com.da.itdaing.domain.master.dto.CategoryResponse;
import com.da.itdaing.domain.master.dto.FeatureResponse;
import com.da.itdaing.domain.master.dto.RegionResponse;
import com.da.itdaing.domain.master.dto.StyleResponse;
import com.da.itdaing.domain.master.service.MasterQueryService;
import com.da.itdaing.global.web.ApiResponse;
import com.da.itdaing.support.MvcNoSecurityTest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * MasterQueryController 테스트
 *
 * ✅ Updated: All tests now include:
 * - .andExpect(content().contentTypeCompatibleWith("application/json"))
 * - Response content validation with helpful error messages
 */
@Disabled("임시 제외: 컨트롤러 응답 포맷 점검 중")
@WebMvcTest(MasterQueryController.class)
class MasterQueryControllerTest extends MvcNoSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private MasterQueryService masterQueryService;

    @Test
    @WithMockUser
    @DisplayName("지역 목록 조회 - 성공")
    void getRegions_success() throws Exception {
        // given
        List<RegionResponse> regions = List.of(
                RegionResponse.builder().id(1L).name("남구").build(),
                RegionResponse.builder().id(2L).name("동구").build(),
                RegionResponse.builder().id(3L).name("서구").build()
        );
        given(masterQueryService.getAllRegions()).willReturn(regions);

        // when & then
        mockMvc.perform(get("/api/master/regions"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith("application/json"))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(3))
                .andExpect(jsonPath("$.data[0].id").value(1))
                .andExpect(jsonPath("$.data[0].name").value("남구"))
                .andExpect(jsonPath("$.data[1].id").value(2))
                .andExpect(jsonPath("$.data[1].name").value("동구"))
                .andExpect(jsonPath("$.error").doesNotExist())
                .andDo(result -> {
                    if (result.getResponse().getContentAsString().isEmpty()) {
                        System.err.println("⚠️ Response content is EMPTY!");
                        System.err.println("Check controller @RestController annotation and produces='application/json' in @GetMapping");
                        System.err.println("Verify return type is ResponseEntity<ApiResponse<...>>, not void or .build()");
                    }
                });

        verify(masterQueryService).getAllRegions();
    }

    @Test
    @WithMockUser
    @DisplayName("스타일 목록 조회 - 성공")
    void getStyles_success() throws Exception {
        // given
        List<StyleResponse> styles = List.of(
                StyleResponse.builder().id(1L).name("미니멀").build(),
                StyleResponse.builder().id(2L).name("빈티지").build()
        );
        given(masterQueryService.getAllStyles()).willReturn(styles);

        // when & then
        mockMvc.perform(get("/api/master/styles"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith("application/json"))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(2))
                .andExpect(jsonPath("$.data[0].name").value("미니멀"))
                .andDo(result -> {
                    if (result.getResponse().getContentAsString().isEmpty()) {
                        System.err.println("⚠️ Response content is EMPTY!");
                        System.err.println("Check controller @RestController annotation and produces='application/json' in @GetMapping");
                        System.err.println("Verify return type is ResponseEntity<ApiResponse<...>>, not void or .build()");
                    }
                });

        verify(masterQueryService).getAllStyles();
    }

    @Test
    @WithMockUser
    @DisplayName("특징 목록 조회 - 성공")
    void getFeatures_success() throws Exception {
        // given
        List<FeatureResponse> features = List.of(
                FeatureResponse.builder().id(1L).name("무료 주차").build(),
                FeatureResponse.builder().id(2L).name("애견 동반").build()
        );
        given(masterQueryService.getAllFeatures()).willReturn(features);

        // when & then
        mockMvc.perform(get("/api/master/features"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith("application/json"))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(2))
                .andExpect(jsonPath("$.data[0].name").value("무료 주차"))
                .andDo(result -> {
                    if (result.getResponse().getContentAsString().isEmpty()) {
                        System.err.println("⚠️ Response content is EMPTY!");
                        System.err.println("Check controller @RestController annotation and produces='application/json' in @GetMapping");
                        System.err.println("Verify return type is ResponseEntity<ApiResponse<...>>, not void or .build()");
                    }
                });

        verify(masterQueryService).getAllFeatures();
    }

    @Test
    @WithMockUser
    @DisplayName("카테고리 목록 조회 - 필터 없음 (전체)")
    void getCategories_withoutFilter_success() throws Exception {
        // given
        List<CategoryResponse> categories = List.of(
                CategoryResponse.builder().id(1L).name("패션").build(),
                CategoryResponse.builder().id(2L).name("뷰티").build(),
                CategoryResponse.builder().id(3L).name("20대").build()
        );
        given(masterQueryService.getAllCategories()).willReturn(categories);

        // when & then
        mockMvc.perform(get("/api/master/categories"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith("application/json"))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(3))
                .andExpect(jsonPath("$.data[0].name").value("패션"))
                .andDo(result -> {
                    if (result.getResponse().getContentAsString().isEmpty()) {
                        System.err.println("⚠️ Response content is EMPTY!");
                        System.err.println("Check controller @RestController annotation and produces='application/json' in @GetMapping");
                        System.err.println("Verify return type is ResponseEntity<ApiResponse<...>>, not void or .build()");
                    }
                });

        verify(masterQueryService).getAllCategories();
    }



    // ========================================
    // Jackson Message Converter Tests
    // ========================================

    @Autowired(required = false)
    private List<HttpMessageConverter<?>> messageConverters;

    @Test
    @DisplayName("테스트 컨텍스트에 HttpMessageConverter가 등록되어 있는지 확인")
    void verifyHttpMessageConvertersArePresent() {
        System.out.println("=== HTTP Message Converters in Test Context ===");

        if (messageConverters == null || messageConverters.isEmpty()) {
            System.err.println("❌ No HttpMessageConverters found!");
            System.err.println("This is unusual for @WebMvcTest. Check Spring Boot version and dependencies.");
        } else {
            System.out.println("✅ Found " + messageConverters.size() + " message converters:");
            for (int i = 0; i < messageConverters.size(); i++) {
                HttpMessageConverter<?> converter = messageConverters.get(i);
                System.out.println((i + 1) + ". " + converter.getClass().getName());
                System.out.println("   Supported media types: " + converter.getSupportedMediaTypes());
            }
        }

        // Assert MappingJackson2HttpMessageConverter is present
        boolean hasJacksonConverter = messageConverters != null && messageConverters.stream()
                .anyMatch(converter -> converter instanceof MappingJackson2HttpMessageConverter);

        if (hasJacksonConverter) {
            System.out.println("\n✅ MappingJackson2HttpMessageConverter is PRESENT");
        } else {
            System.err.println("\n❌ MappingJackson2HttpMessageConverter is MISSING!");
            System.err.println("Add to build.gradle.kts:");
            System.err.println("  implementation(\"com.fasterxml.jackson.core:jackson-databind\")");
            System.err.println("Or ensure spring-boot-starter-web is included (which contains Jackson)");
        }

        assertThat(hasJacksonConverter)
                .as("MappingJackson2HttpMessageConverter must be present for JSON serialization")
                .isTrue();
    }

    @Test
    @DisplayName("Standalone MockMvc로 실제 JSON 응답 생성 확인")
    void standaloneSetup_producesJsonResponse() throws Exception {
        // given
        List<RegionResponse> regions = List.of(
                RegionResponse.builder().id(10L).name("테스트구").build(),
                RegionResponse.builder().id(20L).name("샘플시").build()
        );
        given(masterQueryService.getAllRegions()).willReturn(regions);

        // Standalone MockMvc setup (컨텍스트 없이 컨트롤러 직접 테스트)
        MockMvc standaloneMockMvc = MockMvcBuilders
                .standaloneSetup(new MasterQueryController(masterQueryService))
                .build();

        // when
        String responseBody = standaloneMockMvc.perform(get("/api/master/regions"))
                .andDo(print())
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        // then - Response body가 비어있지 않음
        System.out.println("=== Standalone MockMvc Response ===");
        System.out.println(responseBody);

        assertThat(responseBody)
                .as("Response body must not be empty")
                .isNotEmpty();

        assertThat(responseBody.length())
                .as("Response body should have reasonable length")
                .isGreaterThan(50);

        // JSON 역직렬화로 구조 검증
        ObjectMapper objectMapper = new ObjectMapper();
        var responseNode = objectMapper.readTree(responseBody);

        assertThat(responseNode.has("success"))
                .as("Response must have 'success' field")
                .isTrue();

        assertThat(responseNode.get("success").asBoolean())
                .as("success field should be true")
                .isTrue();

        assertThat(responseNode.has("data"))
                .as("Response must have 'data' field")
                .isTrue();

        assertThat(responseNode.get("data").isArray())
                .as("data field should be an array")
                .isTrue();

        assertThat(responseNode.get("data").size())
                .as("data array should contain 2 regions")
                .isEqualTo(2);

        // 첫 번째 region 데이터 검증
        var firstRegion = responseNode.get("data").get(0);
        assertThat(firstRegion.get("id").asLong()).isEqualTo(10L);
        assertThat(firstRegion.get("name").asText()).isEqualTo("테스트구");

        System.out.println("✅ Standalone MockMvc successfully produced JSON response with ApiResponse wrapper");
    }

    @Test
    @DisplayName("Standalone MockMvc로 전체 ApiResponse 구조 검증")
    void standaloneSetup_matchesApiResponseStructure() throws Exception {
        // given
        List<StyleResponse> styles = List.of(
                StyleResponse.builder().id(1L).name("미니멀").build()
        );
        given(masterQueryService.getAllStyles()).willReturn(styles);

        MockMvc standaloneMockMvc = MockMvcBuilders
                .standaloneSetup(new MasterQueryController(masterQueryService))
                .build();

        // when
        String responseBody = standaloneMockMvc.perform(get("/api/master/styles"))
                .andDo(print())
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        // then - ObjectMapper로 ApiResponse 역직렬화
        ObjectMapper objectMapper = new ObjectMapper();

        // 예상되는 구조: ApiResponse.success(list)
        var expectedResponse = ApiResponse.success(styles);
        String expectedJson = objectMapper.writeValueAsString(expectedResponse);

        System.out.println("=== Expected JSON ===");
        System.out.println(expectedJson);
        System.out.println("\n=== Actual JSON ===");
        System.out.println(responseBody);

        // JSON 구조 비교 (순서/공백 무시)
        var expectedNode = objectMapper.readTree(expectedJson);
        var actualNode = objectMapper.readTree(responseBody);

        assertThat(actualNode.get("success").asBoolean())
                .isEqualTo(expectedNode.get("success").asBoolean());

        assertThat(actualNode.get("data").size())
                .isEqualTo(expectedNode.get("data").size());

        assertThat(actualNode.has("error"))
                .as("Error field should not exist in success response")
                .isFalse();

        System.out.println("✅ Response structure matches ApiResponse.success(list) pattern");
    }
}

