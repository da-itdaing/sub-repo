package com.da.itdaing.global.error;

import com.da.itdaing.domain.user.exception.AuthException;
import com.da.itdaing.global.error.exception.DuplicateResourceException;
import com.da.itdaing.global.error.exception.EntityNotFoundException;
import com.da.itdaing.global.web.ApiResponse;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

/**
 * 글로벌 예외 처리 핸들러
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Bean Validation 검증 실패 (RequestBody)
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    protected ResponseEntity<ApiResponse<Void>> handleMethodArgumentNotValidException(MethodArgumentNotValidException e) {
        log.warn("MethodArgumentNotValidException: {}", e.getMessage());
        
        // @AssertTrue 메서드 에러를 실제 필드명으로 매핑
        org.springframework.validation.BindingResult bindingResult = e.getBindingResult();
        java.util.List<org.springframework.validation.FieldError> fieldErrors = bindingResult.getFieldErrors();
        
        // @AssertTrue 에러 필드명 매핑 (isPasswordConfirmed -> passwordConfirm)
        java.util.Map<String, String> assertTrueFieldMapping = java.util.Map.of(
            "isPasswordConfirmed", "passwordConfirm",
            "isAgeGroupTens", "ageGroup"
        );
        
        java.util.List<org.springframework.validation.FieldError> mappedFieldErrors = fieldErrors.stream()
            .map(error -> {
                String fieldName = error.getField();
                // @AssertTrue 메서드명인 경우 실제 필드명으로 매핑
                if (assertTrueFieldMapping.containsKey(fieldName)) {
                    return new org.springframework.validation.FieldError(
                        error.getObjectName(),
                        assertTrueFieldMapping.get(fieldName),
                        error.getRejectedValue(),
                        error.isBindingFailure(),
                        error.getCodes(),
                        error.getArguments(),
                        error.getDefaultMessage()
                    );
                }
                return error;
            })
            .collect(java.util.stream.Collectors.toList());
        
        // 매핑된 필드 에러로 ApiError 생성
        java.util.List<com.da.itdaing.global.error.ApiError.FieldError> apiFieldErrors = mappedFieldErrors.stream()
            .map(error -> new com.da.itdaing.global.error.ApiError.FieldError(
                error.getField(),
                error.getRejectedValue() != null ? error.getRejectedValue().toString() : null,
                error.getDefaultMessage()
            ))
            .collect(java.util.stream.Collectors.toList());
        
        ApiError apiError = ApiError.of(ErrorCode.INVALID_INPUT_VALUE, apiFieldErrors);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(apiError));
    }

    /**
     * Bean Validation 검증 실패 (ModelAttribute)
     */
    @ExceptionHandler(BindException.class)
    protected ResponseEntity<ApiResponse<Void>> handleBindException(BindException e) {
        log.warn("BindException: {}", e.getMessage());
        ApiError apiError = ApiError.of(ErrorCode.INVALID_INPUT_VALUE, e.getBindingResult());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(apiError));
    }

    /**
     * Bean Validation 검증 실패 (PathVariable, RequestParam)
     */
    @ExceptionHandler(ConstraintViolationException.class)
    protected ResponseEntity<ApiResponse<Void>> handleConstraintViolationException(ConstraintViolationException e) {
        log.warn("ConstraintViolationException: {}", e.getMessage());
        String errors = e.getConstraintViolations().stream()
            .map(ConstraintViolation::getMessage)
            .collect(Collectors.joining(", "));
        ApiError apiError = ApiError.of(ErrorCode.INVALID_INPUT_VALUE, errors);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(apiError));
    }

    /**
     * 엔티티를 찾을 수 없는 경우(404) - 상세 메시지 그대로 노출 (옵션 A)
     */
    @ExceptionHandler(EntityNotFoundException.class)
    protected ResponseEntity<ApiResponse<Void>> handleEntityNotFoundException(EntityNotFoundException e) {
        log.warn("EntityNotFoundException: {}", e.getMessage());
        // ❗핵심: 에러코드 기본메시지 대신, 예외가 가진 상세 메시지를 내려준다.
        ApiError apiError = ApiError.of(e.getErrorCode(), e.getMessage());
        return ResponseEntity.status(e.getErrorCode().getStatus()).body(ApiResponse.error(apiError));
    }

    /**
     * 리소스 중복(409)
     */
    @ExceptionHandler(DuplicateResourceException.class)
    protected ResponseEntity<ApiResponse<Void>> handleDuplicateResourceException(DuplicateResourceException e) {
        log.warn("DuplicateResourceException: {}", e.getMessage());
        ApiError apiError = ApiError.of(e.getErrorCode());
        return ResponseEntity.status(e.getErrorCode().getStatus()).body(ApiResponse.error(apiError));
    }

    /**
     * 인증/인가 예외
     */
    @ExceptionHandler(AuthException.class)
    protected ResponseEntity<ApiResponse<Void>> handleAuthException(AuthException e) {
        log.warn("AuthException: {}", e.getMessage());
        ApiError apiError = ApiError.of(e.getErrorCode());
        return ResponseEntity.status(e.getErrorCode().getStatus()).body(ApiResponse.error(apiError));
    }

    /**
     * 데이터 무결성 위반 (DB 제약조건 위반 등)
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    protected ResponseEntity<ApiResponse<Void>> handleDataIntegrityViolationException(DataIntegrityViolationException e) {
        log.warn("DataIntegrityViolationException: {}", e.getMessage());
        // 중복 키 등은 409로 처리 (케이스에 맞게 ErrorCode 매핑 확장 가능)
        ApiError apiError = ApiError.of(ErrorCode.DUPLICATE_EMAIL);
        return ResponseEntity.status(HttpStatus.CONFLICT).body(ApiResponse.error(apiError));
    }

    /**
     * 그 외 모든 예외(500)
     */
    @ExceptionHandler(Exception.class)
    protected ResponseEntity<ApiResponse<Void>> handleException(Exception e) {
        log.error("Unexpected exception occurred", e);
        ApiError apiError = ApiError.of(ErrorCode.INTERNAL_SERVER_ERROR);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error(apiError));
    }
}
