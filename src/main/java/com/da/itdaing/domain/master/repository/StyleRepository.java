package com.da.itdaing.domain.master.repository;

import com.da.itdaing.domain.master.entity.Style;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StyleRepository extends JpaRepository<Style, Long> {

    List<Style> findByNameIn(Collection<String> names);
}
