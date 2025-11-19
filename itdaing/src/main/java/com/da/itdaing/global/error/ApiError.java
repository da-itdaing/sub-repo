package com.da.itdaing.global.error;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.validation.BindingResult;

import java.util.List;
import java.util.stream.Collectors;

/**
 * API 에러 응답 구조
 */
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class  ApiError {

    private int status;
    private String code;
    private String message;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private List<FieldError> fieldErrors;

    ApiError(ErrorCode errorCode) {
        this.status = errorCode.getStatus().value();
        this.code = errorCode.getCode();
        this.message = errorCode.getMessage();
    }

    ApiError(ErrorCode errorCode, List<FieldError> fieldErrors) {
        this.status = errorCode.getStatus().value();
        this.code = errorCode.getCode();
        this.message = errorCode.getMessage();
        this.fieldErrors = fieldErrors;
    }

    ApiError(ErrorCode errorCode, String customMessage) {
        this.status = errorCode.getStatus().value();
        this.code = errorCode.getCode();
        this.message = customMessage;
    }

    /**
     * ErrorCode로부터 ApiError 생성
     */
    public static ApiError of(ErrorCode errorCode) {
        return new ApiError(errorCode);
    }

    /**
     * ErrorCode와 BindingResult로부터 ApiError 생성
     */
    public static ApiError of(ErrorCode errorCode, BindingResult bindingResult) {
        List<FieldError> fieldErrors = bindingResult.getFieldErrors().stream()
                .map(error -> new FieldError(
                        error.getField(),
                        error.getRejectedValue() != null ? error.getRejectedValue().toString() : null,
                        error.getDefaultMessage()
                ))
                .collect(Collectors.toList());

        return new ApiError(errorCode, fieldErrors);
    }

    /**
     * ErrorCode와 커스텀 메시지로부터 ApiError 생성
     */
    public static ApiError of(ErrorCode errorCode, String customMessage) {
        return new ApiError(errorCode, customMessage);
    }

    /**
     * ErrorCode와 필드 에러 목록으로부터 ApiError 생성
     */
    public static ApiError of(ErrorCode errorCode, List<FieldError> fieldErrors) {
        return new ApiError(errorCode, fieldErrors);
    }

    /**
     * 필드 에러 정보
     */
    @Getter
    @NoArgsConstructor(access = AccessLevel.PROTECTED)
    public static class FieldError {
        private String field;
        private String value;
        private String reason;

        public FieldError(String field, String value, String reason) {
            this.field = field;
            this.value = value;
            this.reason = reason;
        }
    }
}

