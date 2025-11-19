package com.da.itdaing.domain.geo.repository;

import com.da.itdaing.domain.geo.entity.ZoneCell;
import java.util.Collection;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ZoneCellRepository extends JpaRepository<ZoneCell, Long> {
    Page<ZoneCell> findByZoneArea_Id(Long areaId, Pageable pageable);
    Page<ZoneCell> findByOwner_Id(Long ownerId, Pageable pageable);
    List<ZoneCell> findByZoneArea_IdIn(Collection<Long> zoneAreaIds);
}
