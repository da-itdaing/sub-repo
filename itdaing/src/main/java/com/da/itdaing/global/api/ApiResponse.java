// src/main/java/com/da/itdaing/global/api/ApiResponse.java
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

    // ✅ 데이터 없는 성공 응답 (void, 단순 OK용)
    public static ApiResponse<Void> success() {
        return new ApiResponse<>(true, null, null);
    }

    // ✅ 빌더 호출 제거: 가장 안전
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, data, null);
    }

    public static <T> ApiResponse<T> error(ErrorCode code) {
        return new ApiResponse<>(false, null,
            new ErrorBody(code.getStatus().value(), code.getCode(), code.getMessage()));
    }

    public static <T> ApiResponse<T> error(ErrorCode code, String message) {
        return new ApiResponse<>(false, null,
            new ErrorBody(code.getStatus().value(), code.getCode(), message));
    }

    @Getter
    @AllArgsConstructor
    public static class ErrorBody {
        private int status;
        private String code;
        private String message;
    }
}
