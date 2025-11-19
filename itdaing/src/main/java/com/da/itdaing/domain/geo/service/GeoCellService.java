// src/main/java/com/da/itdaing/domain/geo/service/GeoCellService.java
package com.da.itdaing.domain.geo.service;

import com.da.itdaing.domain.common.enums.AreaStatus;
import com.da.itdaing.domain.common.enums.ZoneStatus;
import com.da.itdaing.domain.geo.dto.GeoDtos.*;
import com.da.itdaing.domain.geo.entity.ZoneArea;
import com.da.itdaing.domain.geo.entity.ZoneCell;
import com.da.itdaing.domain.geo.repository.ZoneAreaRepository;
import com.da.itdaing.domain.geo.repository.ZoneCellRepository;
import com.da.itdaing.domain.user.entity.Users;
import com.da.itdaing.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.locationtech.jts.geom.*;
import org.locationtech.jts.geom.prep.PreparedGeometry;
import org.locationtech.jts.geom.prep.PreparedGeometryFactory;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.stream.Collectors;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Transactional
public class GeoCellService {

    private final ZoneCellRepository cellRepo;
    private final ZoneAreaRepository areaRepo;
    private final UserRepository userRepo;

    /** 관리자: 셀 생성 */
    public CellResponse createCell(CreateCellRequest req) {
        // 필수 필드 검증
        if (req.getAreaId() == null) {
            throw new IllegalArgumentException("구역 ID는 필수입니다.");
        }
        if (req.getOwnerId() == null) {
            throw new IllegalArgumentException("소유자 ID는 필수입니다.");
        }
        if (req.getLat() == null || req.getLng() == null) {
            throw new IllegalArgumentException("좌표(lat, lng)는 필수입니다.");
        }

        ZoneArea area = areaRepo.findById(req.getAreaId())
            .orElseThrow(() -> new IllegalArgumentException("구역을 찾을 수 없습니다: " + req.getAreaId()));

        Users owner = userRepo.findById(req.getOwnerId())
            .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + req.getOwnerId()));

        // 구역 상태 체크
        if (area.getStatus() == AreaStatus.HIDDEN || area.getStatus() == AreaStatus.UNAVAILABLE) {
            throw new IllegalStateException("해당 구역은 현재 셀 등록이 불가합니다.");
        }

        // 포함검사: 좌표가 구역 폴리곤 내부에 있는지 확인
        if (area.getPolygonGeoJson() != null && !area.getPolygonGeoJson().isBlank()) {
            validatePointInsideOrThrow(area.getPolygonGeoJson(), req.getLng(), req.getLat());
        }

        ZoneCell cell = ZoneCell.builder()
            .zoneArea(area)
            .owner(owner)
            .label(req.getLabel())
            .detailedAddress(req.getDetailedAddress())
            .lat(req.getLat())
            .lng(req.getLng())
            .status(req.getStatus() != null ? req.getStatus() : ZoneStatus.PENDING)
            .maxCapacity(req.getMaxCapacity())
            .notice(req.getNotice())
            .build();

        cellRepo.save(cell);
        return toDto(cell);
    }

    /** 관리자: 셀 수정 */
    public CellResponse updateCell(Long cellId, UpdateCellRequest req) {
        ZoneCell existingCell = cellRepo.findById(cellId)
            .orElseThrow(() -> new IllegalArgumentException("셀을 찾을 수 없습니다: " + cellId));

        // 업데이트할 값 결정
        ZoneArea area = existingCell.getZoneArea();
        if (req.getAreaId() != null && !req.getAreaId().equals(existingCell.getZoneArea().getId())) {
            area = areaRepo.findById(req.getAreaId())
                .orElseThrow(() -> new IllegalArgumentException("구역을 찾을 수 없습니다: " + req.getAreaId()));
            
            if (area.getStatus() == AreaStatus.HIDDEN || area.getStatus() == AreaStatus.UNAVAILABLE) {
                throw new IllegalStateException("해당 구역은 현재 셀 등록이 불가합니다.");
            }
        }

        Users owner = existingCell.getOwner();
        if (req.getOwnerId() != null && !req.getOwnerId().equals(existingCell.getOwner().getId())) {
            owner = userRepo.findById(req.getOwnerId())
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + req.getOwnerId()));
        }

        // null이면 기존 값 유지, null이 아니면 업데이트
        String label = req.getLabel() != null ? req.getLabel() : existingCell.getLabel();
        String detailedAddress = req.getDetailedAddress() != null ? req.getDetailedAddress() : existingCell.getDetailedAddress();
        Double lat = req.getLat() != null ? req.getLat() : existingCell.getLat();
        Double lng = req.getLng() != null ? req.getLng() : existingCell.getLng();
        ZoneStatus status = req.getStatus() != null ? req.getStatus() : existingCell.getStatus();
        Integer maxCapacity = req.getMaxCapacity() != null ? req.getMaxCapacity() : existingCell.getMaxCapacity();
        String notice = req.getNotice() != null ? req.getNotice() : existingCell.getNotice();

        // 좌표 변경 시 포함검사
        if ((req.getLat() != null || req.getLng() != null || req.getAreaId() != null) 
            && area.getPolygonGeoJson() != null && !area.getPolygonGeoJson().isBlank()) {
            validatePointInsideOrThrow(area.getPolygonGeoJson(), lng, lat);
        }

        // 엔티티 업데이트
        existingCell.update(
            area,
            owner,
            label,
            detailedAddress,
            lat,
            lng,
            status,
            maxCapacity,
            notice
        );

        cellRepo.save(existingCell);
        return toDto(existingCell);
    }

    /** 관리자: 셀 삭제 */
    public void deleteCell(Long cellId) {
        ZoneCell cell = cellRepo.findById(cellId)
            .orElseThrow(() -> new IllegalArgumentException("셀을 찾을 수 없습니다: " + cellId));
        
        // 연관된 팝업이 있는지 확인 (선택사항: 경고만 표시하거나 삭제 방지)
        // 여기서는 삭제를 허용하되, 데이터베이스 외래키 제약조건에 의해 팝업이 있으면 삭제 실패
        
        cellRepo.delete(cell);
    }

    /** 관리자: 셀 목록 조회 (필터링 지원) */
    @Transactional(readOnly = true)
    public CellListResponse listCells(Long areaId, Long ownerId, ZoneStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        Page<ZoneCell> data;

        if (areaId != null && ownerId != null) {
            // 둘 다 필터링: 먼저 areaId로 필터링한 후 메모리에서 ownerId 필터링
            Page<ZoneCell> areaFiltered = cellRepo.findByZoneArea_Id(areaId, pageable);
            List<ZoneCell> filtered = areaFiltered.getContent().stream()
                .filter(cell -> cell.getOwner().getId().equals(ownerId))
                .collect(Collectors.toList());
            data = new PageImpl<>(filtered, pageable, filtered.size());
        } else if (areaId != null) {
            data = cellRepo.findByZoneArea_Id(areaId, pageable);
        } else if (ownerId != null) {
            data = cellRepo.findByOwner_Id(ownerId, pageable);
        } else {
            data = cellRepo.findAll(pageable);
        }

        // 상태 필터링 (메모리에서 필터링, 필요시 쿼리로 변경)
        List<CellResponse> filteredItems = data.getContent().stream()
            .filter(cell -> status == null || cell.getStatus() == status)
            .map(this::toDto)
            .toList();

        long totalElements = status != null 
            ? filteredItems.size() 
            : data.getTotalElements();

        return CellListResponse.builder()
            .items(filteredItems)
            .totalElements(totalElements)
            .totalPages((int) Math.ceil((double) totalElements / size))
            .page(page)
            .size(size)
            .build();
    }

    /** 관리자: 셀 상세 조회 */
    @Transactional(readOnly = true)
    public CellResponse getCell(Long cellId) {
        ZoneCell cell = cellRepo.findById(cellId)
            .orElseThrow(() -> new IllegalArgumentException("셀을 찾을 수 없습니다: " + cellId));
        return toDto(cell);
    }

    private CellResponse toDto(ZoneCell cell) {
        return CellResponse.builder()
            .id(Objects.requireNonNull(cell.getId()))
            .areaId(Objects.requireNonNull(cell.getZoneArea().getId()))
            .areaName(cell.getZoneArea().getName())
            .ownerId(Objects.requireNonNull(cell.getOwner().getId()))
            .ownerLoginId(cell.getOwner().getLoginId())
            .label(cell.getLabel())
            .detailedAddress(cell.getDetailedAddress())
            .lat(cell.getLat())
            .lng(cell.getLng())
            .status(cell.getStatus())
            .maxCapacity(cell.getMaxCapacity())
            .notice(cell.getNotice())
            .createdAt(cell.getCreatedAt())
            .updatedAt(cell.getUpdatedAt())
            .build();
    }

    /* ---------- 포함검사 유틸 (GeoJSON Polygon/MultiPolygon, 좌표는 WGS84 [lng, lat]) ---------- */

    private void validatePointInsideOrThrow(String polygonGeoJson, double lng, double lat) {
        if (polygonGeoJson == null || polygonGeoJson.isBlank()) {
            throw new IllegalArgumentException("구역 폴리곤(GeoJSON)이 없습니다.");
        }
        try {
            Geometry geom = readGeometryFromGeoJson(polygonGeoJson);

            Envelope env = geom.getEnvelopeInternal();
            if (!env.contains(new Coordinate(lng, lat))) {
                throw new IllegalArgumentException("선택 좌표는 구역 외부(BBOX)입니다.");
            }

            GeometryFactory gf = new GeometryFactory();
            Point p = gf.createPoint(new Coordinate(lng, lat));
            PreparedGeometry prepared = PreparedGeometryFactory.prepare(geom);

            if (!prepared.covers(p)) {
                throw new IllegalArgumentException("선택 좌표는 구역 폴리곤 내부가 아닙니다.");
            }
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalArgumentException("폴리곤 파싱/검증 실패(GeoJSON/WGS84 [lng,lat] 확인 필요).", e);
        }
    }

    private Geometry readGeometryFromGeoJson(String geojson) throws Exception {
        ObjectMapper om = new ObjectMapper();
        JsonNode root = om.readTree(geojson);

        if (root.has("type") && "Feature".equalsIgnoreCase(root.get("type").asText()) && root.has("geometry")) {
            root = root.get("geometry");
        } else if (root.has("type") && "FeatureCollection".equalsIgnoreCase(root.get("type").asText())
            && root.has("features") && root.get("features").isArray() && root.get("features").size() > 0) {
            JsonNode first = root.get("features").get(0);
            root = first.has("geometry") ? first.get("geometry") : root;
        }

        String type = root.has("type") ? root.get("type").asText() : null;
        if (type == null) throw new IllegalArgumentException("GeoJSON type이 없습니다.");

        GeometryFactory gf = new GeometryFactory();

        if ("Polygon".equalsIgnoreCase(type)) {
            return polygonFromCoords(gf, root.get("coordinates"));
        } else if ("MultiPolygon".equalsIgnoreCase(type)) {
            return multiPolygonFromCoords(gf, root.get("coordinates"));
        } else {
            throw new IllegalArgumentException("지원하지 않는 GeoJSON 타입: " + type);
        }
    }

    private Polygon polygonFromCoords(GeometryFactory gf, JsonNode coordsNode) {
        if (coordsNode == null || !coordsNode.isArray() || coordsNode.isEmpty()) {
            throw new IllegalArgumentException("Polygon coordinates가 비어있습니다.");
        }
        LinearRing shell = ringFromLinearCoords(gf, coordsNode.get(0));
        LinearRing[] holes = new LinearRing[Math.max(0, coordsNode.size() - 1)];
        for (int i = 1; i < coordsNode.size(); i++) {
            holes[i - 1] = ringFromLinearCoords(gf, coordsNode.get(i));
        }
        return gf.createPolygon(shell, holes);
    }

    private MultiPolygon multiPolygonFromCoords(GeometryFactory gf, JsonNode coordsNode) {
        if (coordsNode == null || !coordsNode.isArray() || coordsNode.isEmpty()) {
            throw new IllegalArgumentException("MultiPolygon coordinates가 비어있습니다.");
        }
        Polygon[] polys = new Polygon[coordsNode.size()];
        for (int i = 0; i < coordsNode.size(); i++) {
            polys[i] = polygonFromCoords(gf, coordsNode.get(i));
        }
        return gf.createMultiPolygon(polys);
    }

    private LinearRing ringFromLinearCoords(GeometryFactory gf, JsonNode ringNode) {
        if (ringNode == null || !ringNode.isArray() || ringNode.size() < 4) {
            throw new IllegalArgumentException("LinearRing 좌표는 최소 4개([lng,lat]...)이어야 합니다.");
        }
        Coordinate[] coords = new Coordinate[ringNode.size()];
        for (int i = 0; i < ringNode.size(); i++) {
            JsonNode p = ringNode.get(i);
            double lng = p.get(0).asDouble();
            double lat = p.get(1).asDouble();
            coords[i] = new Coordinate(lng, lat);
        }
        if (!coords[0].equals2D(coords[coords.length - 1])) {
            Coordinate[] closed = new Coordinate[coords.length + 1];
            System.arraycopy(coords, 0, closed, 0, coords.length);
            closed[closed.length - 1] = coords[0];
            coords = closed;
        }
        return gf.createLinearRing(coords);
    }
}

