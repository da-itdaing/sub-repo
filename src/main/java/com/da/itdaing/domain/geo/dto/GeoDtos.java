// src/main/java/com/da/itdaing/domain/geo/dto/GeoDtos.java
package com.da.itdaing.domain.geo.dto;

import com.da.itdaing.domain.common.enums.AreaStatus;
import com.da.itdaing.domain.common.enums.ZoneStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

public class GeoDtos {

    /* ============ Area ============ */

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    @Schema(description = "구역 생성 요청")
    public static class CreateAreaRequest {
        private String name;
        private String polygonGeoJson;     // GeoJSON Polygon
        private AreaStatus status;         // null이면 AVAILABLE
        private Integer maxCapacity;
        private String notice;
        private Long regionId;             // 선택: Region 연결 유지 시
    }

    @Getter @Builder @AllArgsConstructor @NoArgsConstructor
    public static class AreaResponse {
        private Long id;
        private String name;
        private String polygonGeoJson;
        private AreaStatus status;
        private Integer maxCapacity;
        private String notice;
        private Long regionId;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Getter @Builder @AllArgsConstructor @NoArgsConstructor
    public static class AreaListResponse {
        private List<AreaResponse> items;
        private long totalElements;
        private int totalPages;
        private int page;
        private int size;
    }

    /* ============ Zone ============ */

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    @Schema(description = "존 생성 요청 (관리자)")
    public static class CreateZoneRequest {
        private Long areaId;           // 필수: 어느 구역 안인지
        private Long ownerId;          // 필수: 소유자(판매자) ID (관리자가 지정)
        private String label;          // 선택
        private String detailedAddress;// 선택
        private Double lat;            // 필수
        private Double lng;            // 필수
        private Integer maxCapacity;   // 선택
        private String notice;         // 선택
    }

    @Getter @Builder @AllArgsConstructor @NoArgsConstructor
    public static class ZoneResponse {
        private Long id;
        private Long areaId;
        private Long ownerId;
        private String label;
        private String detailedAddress;
        private Double lat;
        private Double lng;
        private ZoneStatus status;
        private Integer maxCapacity;
        private String notice;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Getter @Builder @AllArgsConstructor @NoArgsConstructor
    public static class ZoneListResponse {
        private List<ZoneResponse> items;
        private long totalElements;
        private int totalPages;
        private int page;
        private int size;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class UpdateZoneStatusRequest {
        private ZoneStatus status;
    }

    /* ============ Cell (Admin) ============ */

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    @Schema(description = "셀 생성 요청 (관리자)")
    public static class CreateCellRequest {
        private Long areaId;           // 필수: 어느 구역 안인지
        private Long ownerId;           // 필수: 소유자(판매자) ID
        private String label;            // 선택
        private String detailedAddress; // 선택
        private Double lat;              // 필수
        private Double lng;              // 필수
        private ZoneStatus status;       // 선택: 기본 PENDING
        private Integer maxCapacity;      // 선택
        private String notice;           // 선택
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    @Schema(description = "셀 수정 요청 (관리자)")
    public static class UpdateCellRequest {
        private Long areaId;             // 선택: 구역 변경
        private Long ownerId;             // 선택: 소유자 변경
        private String label;            // 선택
        private String detailedAddress;  // 선택
        private Double lat;              // 선택
        private Double lng;              // 선택
        private ZoneStatus status;        // 선택
        private Integer maxCapacity;      // 선택
        private String notice;           // 선택
    }

    @Getter @Builder @AllArgsConstructor @NoArgsConstructor
    public static class CellResponse {
        private Long id;
        private Long areaId;
        private String areaName;
        private Long ownerId;
        private String ownerLoginId;
        private String label;
        private String detailedAddress;
        private Double lat;
        private Double lng;
        private ZoneStatus status;
        private Integer maxCapacity;
        private String notice;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Getter @Builder @AllArgsConstructor @NoArgsConstructor
    public static class CellListResponse {
        private List<CellResponse> items;
        private long totalElements;
        private int totalPages;
        private int page;
        private int size;
    }

    /* ============ Area Update/Delete ============ */

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    @Schema(description = "구역 수정 요청 (관리자)")
    public static class UpdateAreaRequest {
        private String name;
        private String polygonGeoJson;
        private AreaStatus status;
        private Integer maxCapacity;
        private String notice;
        private Long regionId;
    }
}
