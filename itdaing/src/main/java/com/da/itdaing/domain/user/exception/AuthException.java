package com.da.itdaing.domain.user.exception;

import com.da.itdaing.global.error.ErrorCode;
import lombok.Getter;

/**
 * 인증 관련 예외
 */
@Getter
public class AuthException extends RuntimeException {

    private final ErrorCode errorCode;

    public AuthException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }

    public AuthException(ErrorCode errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }
}

