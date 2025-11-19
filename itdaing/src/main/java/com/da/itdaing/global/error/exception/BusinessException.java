package com.da.itdaing.global.error.exception;

import com.da.itdaing.global.error.ErrorCode;
import lombok.Getter;

@Getter
public class BusinessException extends RuntimeException {
    private final ErrorCode errorCode;

    public BusinessException(ErrorCode errorCode) {
        super(errorCode.getMessage());          // 기본 메시지
        this.errorCode = errorCode;
    }

    public BusinessException(ErrorCode errorCode, String detailMessage) {
        super(detailMessage);                   // 상세 메시지(핸들러에서 우선 사용)
        this.errorCode = errorCode;
    }
}
