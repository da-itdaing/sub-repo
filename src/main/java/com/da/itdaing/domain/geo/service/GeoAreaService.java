// src/main/java/com/da/itdaing/domain/geo/service/GeoAreaService.java
package com.da.itdaing.domain.geo.service;

import com.da.itdaing.domain.common.enums.AreaStatus;
import com.da.itdaing.domain.geo.dto.GeoDtos.*;
import com.da.itdaing.domain.geo.entity.*;
import com.da.itdaing.domain.geo.repository.*;
import com.da.itdaing.domain.master.entity.Region;
import com.da.itdaing.domain.master.repository.RegionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class GeoAreaService {

    private final ZoneAreaRepository areaRepo;
    private final RegionRepository regionRepo;

    public AreaResponse createArea(CreateAreaRequest req) {
        Region region = null;
        if (req.getRegionId() != null) {
            region = regionRepo.findById(req.getRegionId()).orElse(null);
        }

        ZoneArea area = ZoneArea.builder()
            .region(region)
            .name(req.getName())
            .polygonGeoJson(req.getPolygonGeoJson())
            .status(req.getStatus() != null ? req.getStatus() : AreaStatus.AVAILABLE)
            .maxCapacity(req.getMaxCapacity())
            .notice(req.getNotice())
            .build();

        areaRepo.save(area);

        return AreaResponse.builder()
            .id(area.getId())
            .name(area.getName())
            .polygonGeoJson(area.getPolygonGeoJson())
            .status(area.getStatus())
            .maxCapacity(area.getMaxCapacity())
            .notice(area.getNotice())
            .regionId(area.getRegion() != null ? area.getRegion().getId() : null)
            .createdAt(area.getCreatedAt())
            .updatedAt(area.getUpdatedAt())
            .build();
    }

    @Transactional(readOnly = true)
    public AreaListResponse listAreas(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        Page<ZoneArea> data = (keyword == null || keyword.isBlank())
            ? areaRepo.findAll(pageable)
            : areaRepo.findByNameContainingIgnoreCase(keyword, pageable);

        return AreaListResponse.builder()
            .items(data.getContent().stream().map(a -> AreaResponse.builder()
                .id(a.getId())
                .name(a.getName())
                .polygonGeoJson(a.getPolygonGeoJson())
                .status(a.getStatus())
                .maxCapacity(a.getMaxCapacity())
                .notice(a.getNotice())
                .regionId(a.getRegion() != null ? a.getRegion().getId() : null)
                .createdAt(a.getCreatedAt())
                .updatedAt(a.getUpdatedAt())
                .build()).toList())
            .totalElements(data.getTotalElements())
            .totalPages(data.getTotalPages())
            .page(page)
            .size(size)
            .build();
    }
}
