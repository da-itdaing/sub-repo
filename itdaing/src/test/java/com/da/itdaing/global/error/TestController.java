package com.da.itdaing.global.error;

import com.da.itdaing.global.web.ApiResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 예외 처리 테스트용 컨트롤러
 */
@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
class TestController {

    @PostMapping("/validation")
    public ApiResponse<String> testValidation(@Valid @RequestBody TestRequest request) {
        return ApiResponse.success("Validation passed");
    }

    @Getter
    static class TestRequest {
        @NotBlank(message = "이름은 필수입니다")
        @Size(min = 2, max = 10, message = "이름은 2자 이상 10자 이하여야 합니다")
        private String name;

        @NotBlank(message = "이메일은 필수입니다")
        @Email(message = "올바른 이메일 형식이 아닙니다")
        private String email;
    }
}
