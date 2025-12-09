// src/main/java/com/da/itdaing/domain/geo/repository/ZoneCommercialInfoRepository.java
package com.da.itdaing.domain.geo.repository;

import com.da.itdaing.domain.geo.entity.ZoneCommercialInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

/**
 * 존 상권 정보 Repository
 */
@Repository
public interface ZoneCommercialInfoRepository extends JpaRepository<ZoneCommercialInfo, Integer> {

    /**
     * 특정 zone_id의 상권 정보 조회
     */
    Optional<ZoneCommercialInfo> findByZoneId(Long zoneId);

    /**
     * 여러 zone_id들의 상권 정보 일괄 조회
     */
    List<ZoneCommercialInfo> findByZoneIdIn(Collection<Long> zoneIds);
}
