package com.da.itdaing.domain.master.mapper;

import com.da.itdaing.domain.master.entity.Category;
import com.da.itdaing.domain.master.dto.CategoryResponse;
import org.mapstruct.Mapper;

import java.util.List;

/**
 * Category 엔티티 <-> DTO 매퍼
 */
@Mapper(componentModel = "spring")
public interface CategoryMapper {

    CategoryResponse toResponse(Category category);

    List<CategoryResponse> toResponseList(List<Category> categories);
}
