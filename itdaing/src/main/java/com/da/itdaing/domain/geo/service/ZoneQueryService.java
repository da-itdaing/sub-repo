package com.da.itdaing.domain.geo.service;

import com.da.itdaing.domain.common.enums.AreaStatus;
import com.da.itdaing.domain.common.enums.ZoneStatus;
import com.da.itdaing.domain.geo.dto.ZoneCellSummaryResponse;
import com.da.itdaing.domain.geo.dto.ZoneSummaryResponse;
import com.da.itdaing.domain.geo.entity.ZoneArea;
import com.da.itdaing.domain.geo.entity.ZoneCell;
import com.da.itdaing.domain.geo.repository.ZoneAreaRepository;
import com.da.itdaing.domain.geo.repository.ZoneCellRepository;
import com.da.itdaing.domain.user.entity.Users;
import java.util.Collection;
import java.util.List;
import java.util.Map;
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

    public List<ZoneSummaryResponse> getZones() {
        List<ZoneArea> areas = zoneAreaRepository.findAll();
        if (areas.isEmpty()) {
            return List.of();
        }
        Map<Long, List<ZoneCell>> cellsByArea = loadCellsGroupedByArea(areas);

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
                    .toList()
            ))
            .toList();
    }

    private Map<Long, List<ZoneCell>> loadCellsGroupedByArea(List<ZoneArea> areas) {
        Collection<Long> areaIds = areas.stream().map(ZoneArea::getId).toList();
        return zoneCellRepository.findByZoneArea_IdIn(areaIds)
            .stream()
            .collect(Collectors.groupingBy(cell -> cell.getZoneArea().getId()));
    }

    private ZoneCellSummaryResponse toCellSummary(ZoneCell cell) {
        Users owner = cell.getOwner();
        Long reservedBy = owner != null ? owner.getId() : null;
        return new ZoneCellSummaryResponse(
            cell.getId(),
            cell.getLabel(),
            cell.getLat(),
            cell.getLng(),
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

