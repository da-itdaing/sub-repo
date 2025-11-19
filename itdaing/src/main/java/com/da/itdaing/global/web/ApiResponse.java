package com.da.itdaing.global.web;

import com.da.itdaing.global.error.ApiError;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * API 공통 응답 포맷
 * @param <T> 응답 데이터 타입
 */
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ApiResponse<T> {

    private boolean success;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private T data;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private ApiError error;

    private ApiResponse(boolean success, T data, ApiError error) {
        this.success = success;
        this.data = data;
        this.error = error;
    }



    public static ApiResponse<Void> ok() {
        return new ApiResponse<>(true, null, null);
    }

    public static ApiResponse<Void> failure(ApiError error) {
        return new ApiResponse<>(false, null, error);
    }

    /**
     * 성공 응답 (데이터 포함)
     */
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, data, null);
    }

    /**
     * 성공 응답 (데이터 없음)
     */
    public static <T> ApiResponse<T> success() {
        return new ApiResponse<>(true, null, null);
    }

    /**
     * 실패 응답
     */
    public static <T> ApiResponse<T> error(ApiError error) {
        return new ApiResponse<>(false, null, error);
    }
}

