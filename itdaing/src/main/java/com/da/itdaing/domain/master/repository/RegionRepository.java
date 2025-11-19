package com.da.itdaing.domain.master.repository;

import com.da.itdaing.domain.master.entity.Region;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RegionRepository extends JpaRepository<Region, Long> {

    List<Region> findByNameIn(Collection<String> names);
}
