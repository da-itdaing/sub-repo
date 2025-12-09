package com.da.itdaing.domain.geo.dto;

import com.da.itdaing.domain.geo.entity.ZoneCommercialInfo;

/**
 * 존 상권 정보 응답 DTO
 * 
 * 판매자가 팝업 등록 시 참고할 수 있는 상권 분석 정보를 제공합니다.
 */
public record ZoneCommercialInfoResponse(
    String commercialGrade,    // 상권 등급 (A/B/C)
    Integer trafficScore,      // 유동인구 점수 (0-100)
    Integer competitionScore,  // 경쟁도 점수 (0-100)
    Integer potentialScore,    // 성장 잠재력 점수 (0-100)
    String weekdayTraffic,     // 평일 유동인구 특성
    String weekendTraffic,     // 주말 유동인구 특성
    String bestProducts,       // 추천 상품 카테고리
    Integer rentPerDay,        // 일일 대여료 (원)
    Integer avgSales,          // 평균 일매출 (원)
    String neighborhood        // 동네 이름
) {
    
    /**
     * 엔티티에서 DTO로 변환
     */
    public static ZoneCommercialInfoResponse from(ZoneCommercialInfo entity) {
        if (entity == null) {
            return null;
        }
        return new ZoneCommercialInfoResponse(
            entity.getCommercialGrade(),
            entity.getTrafficScore(),
            entity.getCompetitionScore(),
            entity.getPotentialScore(),
            entity.getWeekdayTraffic(),
            entity.getWeekendTraffic(),
            entity.getBestProducts(),
            entity.getRentPerDay(),
            entity.getAvgSales(),
            entity.getNeighborhood()
        );
    }
}

