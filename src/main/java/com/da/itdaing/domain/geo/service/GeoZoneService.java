// src/main/java/com/da/itdaing/domain/geo/service/GeoZoneService.java
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
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.Envelope;
import org.locationtech.jts.geom.Geometry;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.prep.PreparedGeometry;
import org.locationtech.jts.geom.prep.PreparedGeometryFactory;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.locationtech.jts.geom.*;

@Service
@RequiredArgsConstructor
@Transactional
public class GeoZoneService {

    private final ZoneCellRepository zoneRepo;
    private final ZoneAreaRepository areaRepo;
    private final UserRepository userRepo;

    /** 판매자: 존 생성 (기본 PENDING) + 폴리곤 포함검사(강제) */
    public ZoneResponse createZone(Long sellerId, CreateZoneRequest req) {
        Users owner = userRepo.findById(sellerId).orElseThrow();
        ZoneArea area = areaRepo.findById(req.getAreaId()).orElseThrow();

        // 구역 상태 체크
        if (area.getStatus() == AreaStatus.HIDDEN || area.getStatus() == AreaStatus.UNAVAILABLE) {
            throw new IllegalStateException("해당 구역은 현재 존 등록이 불가합니다.");
        }

        // 포함검사: (lng, lat) 좌표가 area.polygonGeoJson 내부(또는 경계선)에 존재해야 함
        validatePointInsideOrThrow(area.getPolygonGeoJson(), req.getLng(), req.getLat());

        ZoneCell z = ZoneCell.builder()
            .zoneArea(area)
            .owner(owner)
            .label(req.getLabel())
            .detailedAddress(req.getDetailedAddress())
            .lat(req.getLat())
            .lng(req.getLng())
            .status(ZoneStatus.PENDING)
            .maxCapacity(req.getMaxCapacity())
            .notice(req.getNotice())
            .build();

        zoneRepo.save(z);
        return toDto(z);
    }

    /** 관리자: 특정 구역의 존 목록 조회 */
    @Transactional(readOnly = true)
    public ZoneListResponse listZonesByArea(Long areaId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        Page<ZoneCell> data = zoneRepo.findByZoneArea_Id(areaId, pageable);
        return pageToList(data);
    }

    /** 판매자: 내가 만든 존 목록 조회 */
    @Transactional(readOnly = true)
    public ZoneListResponse listMyZones(Long sellerId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        Page<ZoneCell> data = zoneRepo.findByOwner_Id(sellerId, pageable);
        return pageToList(data);
    }

    /** 관리자: 존 상태 변경(승인/반려/숨김 등) */
    public void changeZoneStatus(Long zoneId, ZoneStatus status) {
        ZoneCell z = zoneRepo.findById(zoneId).orElseThrow();
        z.changeStatus(status);
        zoneRepo.save(z);
    }

    /* ---------- 포함검사 유틸 (GeoJSON Polygon/MultiPolygon, 좌표는 WGS84 [lng, lat]) ---------- */

    private void validatePointInsideOrThrow(String polygonGeoJson, double lng, double lat) {
        if (polygonGeoJson == null || polygonGeoJson.isBlank()) {
            throw new IllegalArgumentException("구역 폴리곤(GeoJSON)이 없습니다.");
        }
        try {
            Geometry geom = readGeometryFromGeoJson(polygonGeoJson); // ← GeoJSON → JTS

            Envelope env = geom.getEnvelopeInternal();
            if (!env.contains(new Coordinate(lng, lat))) {
                throw new IllegalArgumentException("선택 좌표는 구역 외부(BBOX)입니다.");
            }

            GeometryFactory gf = new GeometryFactory();
            Point p = gf.createPoint(new Coordinate(lng, lat));
            PreparedGeometry prepared = PreparedGeometryFactory.prepare(geom);

            if (!prepared.covers(p)) { // 경계 포함 허용
                throw new IllegalArgumentException("선택 좌표는 구역 폴리곤 내부가 아닙니다.");
            }
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalArgumentException("폴리곤 파싱/검증 실패(GeoJSON/WGS84 [lng,lat] 확인 필요).", e);
        }
    }

    /** 최소 지원: Polygon / MultiPolygon (Feature/FeatureCollection은 첫 geometry만 처리) */
    private Geometry readGeometryFromGeoJson(String geojson) throws Exception {
        ObjectMapper om = new ObjectMapper();
        JsonNode root = om.readTree(geojson);

        // Feature / FeatureCollection 처리(간단히 첫 geometry만)
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
        // 외곽 링
        LinearRing shell = ringFromLinearCoords(gf, coordsNode.get(0));
        // 홀(내부 링들)
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
        // 폐합 보정: 첫 점 != 마지막 점이면 닫아준다
        if (!coords[0].equals2D(coords[coords.length - 1])) {
            Coordinate[] closed = new Coordinate[coords.length + 1];
            System.arraycopy(coords, 0, closed, 0, coords.length);
            closed[closed.length - 1] = coords[0];
            coords = closed;
        }
        return gf.createLinearRing(coords);
    }

    /* ---------- helpers ---------- */

    private ZoneResponse toDto(ZoneCell z) {
        return ZoneResponse.builder()
            .id(z.getId())
            .areaId(z.getZoneArea().getId())
            .ownerId(z.getOwner().getId())
            .label(z.getLabel())
            .detailedAddress(z.getDetailedAddress())
            .lat(z.getLat())
            .lng(z.getLng())
            .status(z.getStatus())
            .maxCapacity(z.getMaxCapacity())
            .notice(z.getNotice())
            .createdAt(z.getCreatedAt())
            .updatedAt(z.getUpdatedAt())
            .build();
    }

    private ZoneListResponse pageToList(Page<ZoneCell> page) {
        return ZoneListResponse.builder()
            .items(page.getContent().stream().map(this::toDto).toList())
            .totalElements(page.getTotalElements())
            .totalPages(page.getTotalPages())
            .page(page.getNumber())
            .size(page.getSize())
            .build();
    }
}
