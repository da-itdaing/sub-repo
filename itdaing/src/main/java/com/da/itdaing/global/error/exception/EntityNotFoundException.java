package com.da.itdaing.global.error.exception;

import com.da.itdaing.global.error.ErrorCode;
import lombok.Getter;

/**
 * 엔티티를 찾을 수 없을 때 발생하는 예외
 */
@Getter
public class EntityNotFoundException extends RuntimeException {

    private final ErrorCode errorCode;

    public EntityNotFoundException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }

    public EntityNotFoundException(ErrorCode errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }

    public EntityNotFoundException(String message) {
        super(message);
        this.errorCode = ErrorCode.ENTITY_NOT_FOUND;
    }
}

