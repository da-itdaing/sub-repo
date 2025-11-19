package com.da.itdaing.domain.master.mapper;

import com.da.itdaing.domain.master.entity.Region;
import com.da.itdaing.domain.master.dto.RegionResponse;
import org.mapstruct.Mapper;

import java.util.List;

/**
 * Region 엔티티 <-> DTO 매퍼
 */
@Mapper(componentModel = "spring")
public interface RegionMapper {

    RegionResponse toResponse(Region region);

    List<RegionResponse> toResponseList(List<Region> regions);
}

