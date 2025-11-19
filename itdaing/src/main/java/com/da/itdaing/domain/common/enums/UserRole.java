package com.da.itdaing.domain.common.enums;

/**
 * 사용자 역할
 * - CONSUMER: 일반 소비자
 * - SELLER: 팝업 판매자
 * - ADMIN: 관리자
 */
public enum UserRole {
    CONSUMER,
    SELLER,
    ADMIN;

    /**
     * Spring Security용 ROLE_ 접두사 포함 권한명 반환
     */
    public String toAuthority() {
        return "ROLE_" + this.name();
    }
}

