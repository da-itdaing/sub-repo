package com.da.itdaing.domain.social.service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.da.itdaing.domain.file.dto.ImagePayload;
import com.da.itdaing.domain.popup.dto.PopupSummaryResponse;
import com.da.itdaing.domain.popup.entity.Popup;
import com.da.itdaing.domain.popup.entity.PopupImage;
import com.da.itdaing.domain.popup.repository.PopupImageRepository;
import com.da.itdaing.domain.popup.repository.PopupRepository;
import com.da.itdaing.domain.social.entity.Wishlist;
import com.da.itdaing.domain.social.repository.WishlistRepository;
import com.da.itdaing.domain.user.entity.Users;
import com.da.itdaing.domain.user.repository.UserRepository;
import com.da.itdaing.global.error.exception.EntityNotFoundException;
import org.locationtech.jts.geom.Coordinate;
import lombok.RequiredArgsConstructor;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.Geometry;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.LinearRing;
import org.locationtech.jts.geom.MultiPolygon;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.Polygon;

@Service
@RequiredArgsConstructor
@Transactional
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final PopupRepository popupRepository;
    private final UserRepository userRepository;
    private final PopupImageRepository popupImageRepository;

    public void addToWishlist(Long userId, Long popupId) {
        Users user = userRepository.findById(userId)
            .orElseThrow(() -> new EntityNotFoundException("User not found: " + userId));

        Popup popup = popupRepository.findById(popupId)
            .orElseThrow(() -> new EntityNotFoundException("Popup not found: " + popupId));

        // 이미 존재하면 unique 제약 안 터지게 방어
        if (wishlistRepository.existsByPopupIdAndUserId(popupId, userId)) {
            return;
        }

        Wishlist wishlist = Wishlist.builder()
            .user(user)
            .popup(popup)
            .build();

        wishlistRepository.save(wishlist);

        popup.increaseFavoriteCount();
    }

    public void removeFromWishlist(Long userId, Long popupId) {
        Wishlist wishlist = wishlistRepository.findByPopupIdAndUserId(popupId, userId);
        if (wishlist != null) {
            Popup popup = wishlist.getPopup();
            wishlistRepository.delete(wishlist);

            //  좋아요 수 감소
            if (popup != null) {
                popup.decreaseFavoriteCount();
            }
        }
    }

    @Transactional(readOnly = true)
    public Page<PopupSummaryResponse> getMyWishlist(Long userId, Pageable pageable) {
        if (pageable == null) {
            pageable = Pageable.ofSize(40).withPage(0);
        }

        Page<Wishlist> page = wishlistRepository.findByUserIdWithPopup(userId, pageable);
        if (page.isEmpty()) {
            return Page.empty(pageable);
        }

        List<Long> popupIds = page.getContent().stream()
            .map(w -> w.getPopup().getId())
            .toList();

        // 👉 여기: 팝업별 전체 이미지 조회 (PopupQueryService와 동일한 방식)
        Map<Long, List<PopupImage>> imagesByPopup = popupImageRepository.findByPopupIdIn(popupIds)
            .stream()
            .collect(Collectors.groupingBy(img -> img.getPopup().getId()));

        return page.map(w -> {
            Popup p = w.getPopup();

            Users seller = p.getSeller();
            var zoneCell = p.getZoneCell();
            var zoneArea = zoneCell != null ? zoneCell.getZoneArea() : null;

            String createdAt = p.getCreatedAt() != null ? p.getCreatedAt().toString() : null;
            String updatedAt = p.getUpdatedAt() != null ? p.getUpdatedAt().toString() : null;

            Long sellerId = seller != null ? seller.getId() : null;
            String sellerName = resolveSellerName(seller);

            Long zoneId = zoneArea != null ? zoneArea.getId() : null;
            String locationName = zoneArea != null ? zoneArea.getName() : null;

            Long cellId = zoneCell != null ? zoneCell.getId() : null;
            String cellName = zoneCell != null ? zoneCell.getLabel() : null;
            String address = zoneCell != null ? zoneCell.getDetailedAddress() : null;
            
            // 행정구역 정보 (Region)
            Long regionId = (zoneArea != null && zoneArea.getRegion() != null) 
                ? zoneArea.getRegion().getId() : null;
            String regionName = (zoneArea != null && zoneArea.getRegion() != null) 
                ? zoneArea.getRegion().getName() : null;
            
            Double lat = null;
            Double lng = null;

            if (zoneCell != null
                && zoneCell.getGeometryData() != null
                && !zoneCell.getGeometryData().isBlank()) {

                Coordinate centroid = centroidFromGeoJson(zoneCell.getGeometryData());
                // JTS: X = lng, Y = lat
                lng = centroid.getX();
                lat = centroid.getY();
            }

            String status = p.getApprovalStatus() != null ? p.getApprovalStatus().name() : null;
            String startDate = p.getStartDate() != null ? p.getStartDate().toString() : null;
            String endDate = p.getEndDate() != null ? p.getEndDate().toString() : null;

            // 👉 여기: 전체 이미지 목록에서 썸네일 + 갤러리 구성
            List<PopupImage> images = imagesByPopup.getOrDefault(p.getId(), List.of());

            ImagePayload thumbnail = images.stream()
                .filter(img -> Boolean.TRUE.equals(img.getIsThumbnail()))
                .findFirst()
                .map(img -> ImagePayload.builder()
                    .url(img.getImageUrl())
                    .key(img.getImageKey())
                    .build())
                .orElseGet(() -> images.stream().findFirst()
                    .map(img -> ImagePayload.builder()
                        .url(img.getImageUrl())
                        .key(img.getImageKey())
                        .build())
                    .orElse(null));

            List<ImagePayload> gallery = images.stream()
                .filter(img -> !Boolean.TRUE.equals(img.getIsThumbnail()))
                .map(img -> ImagePayload.builder()
                    .url(img.getImageUrl())
                    .key(img.getImageKey())
                    .build())
                .toList();

            return new PopupSummaryResponse(
                p.getId(),
                p.getName(),
                sellerId,
                sellerName,
                zoneId,
                cellId,
                cellName,
                locationName,
                address,
                regionId,           // 행정구역 ID
                regionName,         // 행정구역 이름 (동구, 서구 등)
                lat,
                lng,
                status,
                startDate,
                endDate,
                p.getOperatingTime(),
                List.of(),          // operatingHours (필요하면 PopupQueryService처럼 파싱 가능)
                p.getDescription(),
                p.getViewCount(),
                p.getFavoriteCount(),
                List.of(),          // categoryIds
                List.of(),          // featureIds
                List.of(),          // styleTags
                thumbnail,          // ✅ 이제 null이 아니라 fallback까지 고려
                gallery,            // ✅ gallery도 채워줌
                null,               // reviewSummary (원하면 ReviewRepository 써서 추가 가능)
                true,               // isFavorite
                createdAt,
                updatedAt,
                p.getHomepageUrl(),
                p.getSnsUrl(),
                p.getHashtags()
            );
        });
    }

    private String resolveSellerName(Users user) {
        if (user == null) {
            return null;
        }
        if (user.getNickname() != null && !user.getNickname().isBlank()) {
            return user.getNickname();
        }
        if (user.getName() != null && !user.getName().isBlank()) {
            return user.getName();
        }
        return user.getLoginId();
    }

    // WishlistService 내부에 추가

    private Coordinate centroidFromGeoJson(String geojson) {
        try {
            Geometry geom = readGeometryFromGeoJson(geojson);
            Point c = geom.getCentroid();
            return new Coordinate(c.getX(), c.getY()); // X=lng, Y=lat
        } catch (Exception e) {
            throw new IllegalArgumentException("셀 geometryData 파싱/centroid 계산 실패", e);
        }
    }

    private Geometry readGeometryFromGeoJson(String geojson) throws Exception {
        ObjectMapper om = new ObjectMapper();
        JsonNode root = om.readTree(geojson);

        // Feature / FeatureCollection 래핑 처리
        if (root.has("type") && "Feature".equalsIgnoreCase(root.get("type").asText()) && root.has("geometry")) {
            root = root.get("geometry");
        } else if (root.has("type") && "FeatureCollection".equalsIgnoreCase(root.get("type").asText())
            && root.has("features") && root.get("features").isArray() && root.get("features").size() > 0) {
            JsonNode first = root.get("features").get(0);
            if (first.has("geometry")) {
                root = first.get("geometry");
            }
        }

        String type = root.has("type") ? root.get("type").asText() : null;
        if (type == null) {
            throw new IllegalArgumentException("GeoJSON type이 없습니다.");
        }

        GeometryFactory gf = new GeometryFactory();

        if ("Point".equalsIgnoreCase(type)) {
            // ✅ 지금 네가 보여준 JSON이 여기에 해당
            return pointFromCoords(gf, root.get("coordinates"));
        } else if ("Polygon".equalsIgnoreCase(type)) {
            return polygonFromCoords(gf, root.get("coordinates"));
        } else if ("MultiPolygon".equalsIgnoreCase(type)) {
            return multiPolygonFromCoords(gf, root.get("coordinates"));
        } else {
            throw new IllegalArgumentException("지원하지 않는 GeoJSON 타입: " + type);
        }
    }

    private Point pointFromCoords(GeometryFactory gf, JsonNode coordsNode) {
        if (coordsNode == null || !coordsNode.isArray() || coordsNode.size() < 2) {
            throw new IllegalArgumentException("Point 좌표가 올바르지 않습니다.");
        }
        double lng = coordsNode.get(0).asDouble();
        double lat = coordsNode.get(1).asDouble();
        return gf.createPoint(new Coordinate(lng, lat));
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
