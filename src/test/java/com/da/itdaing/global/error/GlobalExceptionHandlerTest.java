package com.da.itdaing.global.error;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashMap;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * GlobalExceptionHandler 테스트
 */
@SuppressWarnings("null")
@WebMvcTest(TestController.class)
@AutoConfigureMockMvc(addFilters = false)
class GlobalExceptionHandlerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Bean Validation 실패 시 적절한 에러 응답을 반환한다")
    void whenValidationFails_thenReturnsApiErrorResponse() throws Exception {
        // given
        Map<String, String> invalidRequest = new HashMap<>();
        invalidRequest.put("name", ""); // NotBlank 위반
        invalidRequest.put("email", "invalid-email"); // Email 형식 위반

        // when & then
        mockMvc.perform(post("/api/test/validation")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andDo(print())
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.data").doesNotExist())
                .andExpect(jsonPath("$.error").exists())
                .andExpect(jsonPath("$.error.status").value(400))
                .andExpect(jsonPath("$.error.code").value("E001"))
                .andExpect(jsonPath("$.error.message").value("입력값이 올바르지 않습니다"))
                .andExpect(jsonPath("$.error.fieldErrors").isArray())
                .andExpect(jsonPath("$.error.fieldErrors.length()").value(3));
    }

    @Test
    @DisplayName("유효한 요청은 성공 응답을 반환한다")
    void whenValidationSucceeds_thenReturnsSuccessResponse() throws Exception {
        // given
        Map<String, String> validRequest = new HashMap<>();
        validRequest.put("name", "홍길동");
        validRequest.put("email", "test@example.com");

        // when & then
        mockMvc.perform(post("/api/test/validation")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").value("Validation passed"))
                .andExpect(jsonPath("$.error").doesNotExist());
    }

    @Test
    @DisplayName("이름 길이 검증 실패 시 fieldErrors에 상세 정보가 포함된다")
    void whenNameLengthInvalid_thenReturnsFieldError() throws Exception {
        // given
        Map<String, String> invalidRequest = new HashMap<>();
        invalidRequest.put("name", "김"); // Size 제약 위반 (최소 2자)
        invalidRequest.put("email", "test@example.com");

        // when & then
        mockMvc.perform(post("/api/test/validation")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andDo(print())
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.fieldErrors[0].field").value("name"))
                .andExpect(jsonPath("$.error.fieldErrors[0].value").value("김"))
                .andExpect(jsonPath("$.error.fieldErrors[0].reason").value("이름은 2자 이상 10자 이하여야 합니다"));
    }

    @Test
    @DisplayName("이메일 형식 검증 실패 시 fieldErrors에 상세 정보가 포함된다")
    void whenEmailFormatInvalid_thenReturnsFieldError() throws Exception {
        // given
        Map<String, String> invalidRequest = new HashMap<>();
        invalidRequest.put("name", "홍길동");
        invalidRequest.put("email", "not-an-email"); // Email 형식 위반

        // when & then
        mockMvc.perform(post("/api/test/validation")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andDo(print())
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.fieldErrors[0].field").value("email"))
                .andExpect(jsonPath("$.error.fieldErrors[0].value").value("not-an-email"))
                .andExpect(jsonPath("$.error.fieldErrors[0].reason").value("올바른 이메일 형식이 아닙니다"));
    }
}

