package com.da.itdaing.domain.master.mapper;

import com.da.itdaing.domain.master.entity.Feature;
import com.da.itdaing.domain.master.dto.FeatureResponse;
import org.mapstruct.Mapper;

import java.util.List;

/**
 * Feature 엔티티 <-> DTO 매퍼
 */
@Mapper(componentModel = "spring")
public interface FeatureMapper {

    FeatureResponse toResponse(Feature feature);

    List<FeatureResponse> toResponseList(List<Feature> features);
}


