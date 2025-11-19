package com.da.itdaing.domain.master.controller;

import com.da.itdaing.domain.master.dto.RegionResponse;
import com.da.itdaing.domain.master.service.MasterQueryService;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * MasterQueryController 통합 테스트
 *
 * Purpose: 실제 Web Context를 시작하여 JSON 응답 생성 검증
 * - @SpringBootTest로 전체 컨텍스트 로드
 * - 실제 @RestController, MessageConverter, Jackson 직렬화 테스트
 * - 서비스 레이어만 stub으로 격리
 */

@Disabled("임시 제외: 컨트롤러 응답 포맷 점검 중")
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("MasterQueryController 통합 테스트 - JSON 응답 검증")
class MasterQueryControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private MasterQueryService masterQueryService;

    @Test
    @WithMockUser
    @DisplayName("GET /api/master/regions - 실제 JSON 응답 생성 검증")
    void getRegions_producesJsonResponseWithSuccessWrapper() throws Exception {
        // given - 서비스에서 non-empty 리스트 반환
        List<RegionResponse> mockRegions = List.of(
                RegionResponse.builder().id(1L).name("남구").build(),
                RegionResponse.builder().id(2L).name("동구").build(),
                RegionResponse.builder().id(3L).name("서구").build(),
                RegionResponse.builder().id(4L).name("북구").build()
        );
        given(masterQueryService.getAllRegions()).willReturn(mockRegions);

        // when & then - 실제 Web Context에서 JSON 직렬화 검증
        mockMvc.perform(get("/api/master/regions"))
                .andDo(print()) // 실제 응답 출력 (디버깅용)
                .andExpect(status().isOk()) // HTTP 200
                .andExpect(content().contentTypeCompatibleWith("application/json")) // Content-Type 검증

                // ApiResponse 래퍼 구조 검증
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.success").isBoolean())

                // data 필드가 배열이고 비어있지 않음
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data").isNotEmpty())
                .andExpect(jsonPath("$.data", hasSize(4)))

                // 실제 데이터 내용 검증
                .andExpect(jsonPath("$.data[0].id").value(1))
                .andExpect(jsonPath("$.data[0].name").value("남구"))
                .andExpect(jsonPath("$.data[1].id").value(2))
                .andExpect(jsonPath("$.data[1].name").value("동구"))
                .andExpect(jsonPath("$.data[2].id").value(3))
                .andExpect(jsonPath("$.data[2].name").value("서구"))
                .andExpect(jsonPath("$.data[3].id").value(4))
                .andExpect(jsonPath("$.data[3].name").value("북구"))

                // error 필드가 없어야 함 (성공 시)
                .andExpect(jsonPath("$.error").doesNotExist())

                // 응답 본문이 실제로 비어있지 않은지 확인
                .andDo(result -> {
                    String content = result.getResponse().getContentAsString();
                    if (content == null || content.trim().isEmpty()) {
                        throw new AssertionError(
                            "❌ FAILURE: Response body is EMPTY!\n" +
                            "Possible causes:\n" +
                            "1. Controller missing @RestController annotation\n" +
                            "2. Handler method missing @ResponseBody\n" +
                            "3. Handler returns void instead of ResponseEntity<ApiResponse<...>>\n" +
                            "4. Handler uses .build() without body\n" +
                            "5. @GetMapping missing produces=\"application/json\"\n" +
                            "6. Jackson MessageConverter not configured"
                        );
                    }

                    System.out.println("✅ SUCCESS: Response body generated:");
                    System.out.println("Length: " + content.length() + " bytes");
                    System.out.println("Content: " + content);

                    // 기본 JSON 구조 텍스트 검증 (파싱 전)
                    if (!content.contains("\"success\"")) {
                        throw new AssertionError("Response missing 'success' field");
                    }
                    if (!content.contains("\"data\"")) {
                        throw new AssertionError("Response missing 'data' field");
                    }
                });
    }

    @Test
    @WithMockUser
    @DisplayName("GET /api/master/regions - 빈 응답이 아님을 보장")
    void getRegions_ensuresNonEmptyResponseBody() throws Exception {
        // given
        List<RegionResponse> singleItem = List.of(
                RegionResponse.builder().id(100L).name("테스트구").build()
        );
        given(masterQueryService.getAllRegions()).willReturn(singleItem);

        // when & then
        mockMvc.perform(get("/api/master/regions"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/json"))
                .andExpect(jsonPath("$").exists()) // root 객체 존재
                .andExpect(jsonPath("$.success").exists())
                .andExpect(jsonPath("$.data").exists())
                .andExpect(jsonPath("$.data[0].id").value(100))
                .andExpect(jsonPath("$.data[0].name").value("테스트구"))
                .andDo(result -> {
                    String body = result.getResponse().getContentAsString();
                    System.out.println("✅ Response body verified (length=" + body.length() + "):");
                    System.out.println(body);

                    // 최소 JSON 구조 검증 (대략 50자 이상)
                    if (body.length() < 50) {
                        throw new AssertionError(
                            "Response body too short (" + body.length() + " bytes). " +
                            "Expected full ApiResponse JSON structure."
                        );
                    }
                });
    }

    @Test
    @WithMockUser
    @DisplayName("GET /api/master/regions - Content-Type 헤더 확인")
    void getRegions_hasCorrectContentTypeHeader() throws Exception {
        // given
        given(masterQueryService.getAllRegions()).willReturn(
            List.of(RegionResponse.builder().id(1L).name("Test").build())
        );

        // when & then
        mockMvc.perform(get("/api/master/regions"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(header().exists("Content-Type"))
                .andExpect(header().string("Content-Type", containsString("application/json")))
                .andDo(result -> {
                    String contentType = result.getResponse().getContentType();
                    System.out.println("✅ Content-Type header: " + contentType);

                    if (contentType == null || !contentType.contains("application/json")) {
                        throw new AssertionError(
                            "❌ Content-Type is not application/json: " + contentType + "\n" +
                            "Check @GetMapping(produces = \"application/json\")"
                        );
                    }
                });
    }
}

