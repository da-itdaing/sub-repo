package com.da.itdaing.domain.geo.service;

import com.da.itdaing.domain.common.enums.AreaStatus;
import com.da.itdaing.domain.common.enums.ZoneStatus;
import com.da.itdaing.domain.geo.dto.ZoneCellSummaryResponse;
import com.da.itdaing.domain.geo.dto.ZoneCommercialInfoResponse;
import com.da.itdaing.domain.geo.dto.ZoneSummaryResponse;
import com.da.itdaing.domain.geo.entity.ZoneArea;
import com.da.itdaing.domain.geo.entity.ZoneCell;
import com.da.itdaing.domain.geo.entity.ZoneCommercialInfo;
import com.da.itdaing.domain.geo.repository.ZoneAreaRepository;
import com.da.itdaing.domain.geo.repository.ZoneCellRepository;
import com.da.itdaing.domain.geo.repository.ZoneCommercialInfoRepository;
import com.da.itdaing.domain.user.entity.Users;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class ZoneQueryService {

    private final ZoneAreaRepository zoneAreaRepository;
    private final ZoneCellRepository zoneCellRepository;
    private final ZoneCommercialInfoRepository zoneCommercialInfoRepository;

    public List<ZoneSummaryResponse> getZones() {
        List<ZoneArea> areas = zoneAreaRepository.findAll();
        if (areas.isEmpty()) {
            return List.of();
        }
        
        Collection<Long> areaIds = areas.stream().map(ZoneArea::getId).toList();
        Map<Long, List<ZoneCell>> cellsByArea = loadCellsGroupedByArea(areaIds);
        Map<Long, ZoneCommercialInfo> commercialInfoByZone = loadCommercialInfoByZone(areaIds);

        return areas.stream()
            .map(area -> new ZoneSummaryResponse(
                area.getId(),
                area.getName(),
                area.getRegion() != null ? area.getRegion().getId() : null,
                areaStatusToString(area.getStatus()),
                area.getMaxCapacity(),
                area.getNotice(),
                area.getPolygonGeoJson(),
                cellsByArea.getOrDefault(area.getId(), List.of())
                    .stream()
                    .map(this::toCellSummary)
                    .toList(),
                ZoneCommercialInfoResponse.from(commercialInfoByZone.get(area.getId()))
            ))
            .toList();
    }

    private Map<Long, List<ZoneCell>> loadCellsGroupedByArea(Collection<Long> areaIds) {
        return zoneCellRepository.findByZoneArea_IdIn(areaIds)
            .stream()
            .collect(Collectors.groupingBy(cell -> cell.getZoneArea().getId()));
    }
    
    /**
     * 여러 zone ID에 대한 상권 정보를 일괄 조회하여 Map으로 반환
     */
    private Map<Long, ZoneCommercialInfo> loadCommercialInfoByZone(Collection<Long> zoneIds) {
        return zoneCommercialInfoRepository.findByZoneIdIn(zoneIds)
            .stream()
            .collect(Collectors.toMap(
                ZoneCommercialInfo::getZoneId,
                Function.identity(),
                (existing, replacement) -> existing  // 중복 시 기존 값 유지
            ));
    }

    private ZoneCellSummaryResponse toCellSummary(ZoneCell cell) {
        Users owner = cell.getOwner();
        Long reservedBy = owner != null ? owner.getId() : null;
        return new ZoneCellSummaryResponse(
            cell.getId(),
            cell.getLabel(),
            cell.getGeometryData(),
            cell.getMaxCapacity(),
            zoneStatusToString(cell.getStatus()),
            List.of(),
            cell.getNotice(),
            reservedBy
        );
    }

    private String areaStatusToString(AreaStatus status) {
        return status != null ? status.name() : AreaStatus.AVAILABLE.name();
    }

    private String zoneStatusToString(ZoneStatus status) {
        return status != null ? status.name() : ZoneStatus.APPROVED.name();
    }
}

