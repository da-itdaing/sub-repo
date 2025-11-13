package com.da.itdaing.domain.master.mapper;

import com.da.itdaing.domain.master.entity.Style;
import com.da.itdaing.domain.master.dto.StyleResponse;
import org.mapstruct.Mapper;

import java.util.List;

/**
 * Style 엔티티 <-> DTO 매퍼
 */
@Mapper(componentModel = "spring")
public interface StyleMapper {

    StyleResponse toResponse(Style style);

    List<StyleResponse> toResponseList(List<Style> styles);
}

