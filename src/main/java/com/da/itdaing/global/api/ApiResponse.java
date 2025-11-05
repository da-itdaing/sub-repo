package com.da.itdaing.global.api;

import com.da.itdaing.global.error.ErrorCode;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
public class ApiResponse<T> {
    private final boolean success;
    private final T data;
    private final ErrorBody error;

    private ApiResponse(boolean success, T data, ErrorBody error) {
        this.success = success;
        this.data = data;
        this.error = error;
    }

    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(true, data, null);
    }

    // 기존: 기본 메시지 사용
    public static <T> ApiResponse<T> error(ErrorCode code) {
        return new ApiResponse<>(false, null,
            new ErrorBody(code.getStatus().value(), code.getCode(), code.getMessage()));
    }

    // 신규: 커스텀(상세) 메시지 사용
    public static <T> ApiResponse<T> error(ErrorCode code, String message) {
        return new ApiResponse<>(false, null,
            new ErrorBody(code.getStatus().value(), code.getCode(), message));
    }

    @Getter
    @AllArgsConstructor
    public static class ErrorBody {
        private int status;     // 예: 404
        private String code;    // 예: E101
        private String message; // 예: "존재하지 않는 카테고리가 포함되어 있습니다"
    }
}
