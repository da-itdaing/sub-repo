package com.da.itdaing.domain.geo.repository;

import com.da.itdaing.domain.geo.entity.ZoneArea;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ZoneAreaRepository extends JpaRepository<ZoneArea, Long> {
    Page<ZoneArea> findByNameContainingIgnoreCase(String keyword, Pageable pageable);
}
