package com.da.itdaing.global.error;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

/**
 * 애플리케이션 전역 에러 코드
 */
@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // 400 Bad Request
    INVALID_INPUT_VALUE(HttpStatus.BAD_REQUEST, "E001", "입력값이 올바르지 않습니다"),
    INVALID_TYPE_VALUE(HttpStatus.BAD_REQUEST, "E002", "입력 타입이 올바르지 않습니다"),
    MISSING_INPUT_VALUE(HttpStatus.BAD_REQUEST, "E003", "필수 입력값이 누락되었습니다"),
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "E401", "로그인이 필요합니다"),
    INVALID_PREFERENCE_IDS(HttpStatus.BAD_REQUEST, "E004", "유효하지 않은 선호 ID가 포함되어 있습니다"),
    DATA_INTEGRITY_VIOLATION(HttpStatus.CONFLICT, "E409-DB", "데이터 무결성 위반"),
    FORBIDDEN(HttpStatus.FORBIDDEN, "E403", "접근 권한이 없습니다"),

    // 404 Not Found
    ENTITY_NOT_FOUND(HttpStatus.NOT_FOUND, "E101", "요청한 리소스를 찾을 수 없습니다"),
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "E102", "사용자를 찾을 수 없습니다"),
    POPUP_NOT_FOUND(HttpStatus.NOT_FOUND, "E103", "팝업스토어를 찾을 수 없습니다"),

    // 401 Unauthorized
    UNAUTHENTICATED(HttpStatus.UNAUTHORIZED, "AUTH-401", "인증이 필요합니다"),
    INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "AUTH-402", "유효하지 않은 토큰입니다"),
    EXPIRED_TOKEN(HttpStatus.UNAUTHORIZED, "AUTH-403", "만료된 토큰입니다"),
    INVALID_CREDENTIALS(HttpStatus.UNAUTHORIZED, "AUTH-404", "로그인ID 또는 비밀번호가 올바르지 않습니다"),
    REFRESH_NOT_FOUND(HttpStatus.UNAUTHORIZED, "AUTH-405", "리프레시 토큰이 존재하지 않거나 만료/삭제되었습니다"),
    REFRESH_REVOKED(HttpStatus.UNAUTHORIZED, "AUTH-406", "이미 철회된 리프레시 토큰입니다"),
    REFRESH_REUSED(HttpStatus.UNAUTHORIZED, "AUTH-407", "재사용된 리프레시 토큰입니다"),

    // 403 Forbidden
    ACCESS_DENIED(HttpStatus.FORBIDDEN, "AUTH-405", "접근 권한이 없습니다"),

    // 409 Conflict
    DUPLICATE_RESOURCE(HttpStatus.CONFLICT, "E201", "이미 존재하는 리소스입니다"),
    DUPLICATE_EMAIL(HttpStatus.CONFLICT, "E202", "이미 사용 중인 이메일입니다"),
    DUPLICATE_LOGIN_ID(HttpStatus.CONFLICT, "E203", "이미 사용 중인 로그인 아이디입니다"),

    // 503 Service Unavailable (옵션: 캐시/외부시스템 장애)
    CACHE_UNAVAILABLE(HttpStatus.SERVICE_UNAVAILABLE, "E901", "캐시 서버 연결에 실패했습니다"),

    // 500 Internal Server Error
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "E999", "서버 내부 오류가 발생했습니다");

    private final HttpStatus status;
    private final String code;
    private final String message;
}

