package com.da.itdaing.domain.master.service;

import com.da.itdaing.domain.master.repository.CategoryRepository;
import com.da.itdaing.domain.master.repository.FeatureRepository;
import com.da.itdaing.domain.master.repository.RegionRepository;
import com.da.itdaing.domain.master.repository.StyleRepository;
import com.da.itdaing.domain.master.dto.CategoryResponse;
import com.da.itdaing.domain.master.dto.FeatureResponse;
import com.da.itdaing.domain.master.dto.RegionResponse;
import com.da.itdaing.domain.master.dto.StyleResponse;
import com.da.itdaing.domain.master.mapper.CategoryMapper;
import com.da.itdaing.domain.master.mapper.FeatureMapper;
import com.da.itdaing.domain.master.mapper.RegionMapper;
import com.da.itdaing.domain.master.mapper.StyleMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 마스터 데이터 조회 서비스 (읽기 전용)
 */
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class MasterQueryService {

    private final RegionRepository regionRepository;
    private final StyleRepository styleRepository;
    private final CategoryRepository categoryRepository;
    private final FeatureRepository featureRepository;

    private final RegionMapper regionMapper;
    private final StyleMapper styleMapper;
    private final CategoryMapper categoryMapper;
    private final FeatureMapper featureMapper;

    /**
     * 모든 지역 조회
     */
    public List<RegionResponse> getAllRegions() {
        return regionRepository.findAll().stream()
            .map(region -> RegionResponse.builder()
                .id(region.getId())
                .name(region.getName())
                .build())
            .toList();
    }

    /**
     * 모든 스타일 조회
     */
    public List<StyleResponse> getAllStyles() {
        return styleRepository.findAll().stream()
            .map(style -> StyleResponse.builder()
                .id(style.getId())
                .name(style.getName())
                .build())
            .toList();
    }

    /**
     * 모든 카테고리 조회
     */
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
            .map(category -> CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .type(category.getType())
                .build())
            .toList();
    }

    /**
     * 모든 특징 조회
     */
    public List<FeatureResponse> getAllFeatures() {
        return featureRepository.findAll().stream()
            .map(feature -> FeatureResponse.builder()
                .id(feature.getId())
                .name(feature.getName())
                .build())
            .toList();
    }
}
