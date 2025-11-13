package com.da.itdaing.domain.common.enums;

public enum ZoneStatus {
    PENDING,     // 판매자 생성 직후(기본)
    APPROVED,    // 관리자 승인
    REJECTED,    // 관리자 반려
    HIDDEN       // 숨김(운영상 비노출)
}
