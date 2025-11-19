package com.da.itdaing.domain.user.service;

import com.da.itdaing.domain.master.entity.Category;
import com.da.itdaing.domain.master.entity.Feature;
import com.da.itdaing.domain.master.entity.Region;
import com.da.itdaing.domain.master.entity.Style;
import com.da.itdaing.domain.master.repository.CategoryRepository;
import com.da.itdaing.domain.master.repository.FeatureRepository;
import com.da.itdaing.domain.master.repository.RegionRepository;
import com.da.itdaing.domain.master.repository.StyleRepository;
import com.da.itdaing.domain.user.dto.PreferenceUpdateRequest;
import com.da.itdaing.domain.user.entity.*;
import com.da.itdaing.domain.user.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.Principal;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PreferenceService {

    private final UserRepository userRepository;

    private final CategoryRepository categoryRepository;
    private final StyleRepository styleRepository;
    private final RegionRepository regionRepository;
    private final FeatureRepository featureRepository;

    private final UserPrefCategoryRepository userPrefCategoryRepository;
    private final UserPrefStyleRepository userPrefStyleRepository;
    private final UserPrefRegionRepository userPrefRegionRepository;
    private final UserPrefFeatureRepository userPrefFeatureRepository;

    @Transactional
    public void updateMyPreferences(PreferenceUpdateRequest req, Principal principal) {
        Long userId = Long.parseLong(principal.getName());
        Users user = userRepository.findById(userId)
            .orElseThrow(() -> new EntityNotFoundException("User not found: " + userId));

        if (req.interestCategoryIds() != null) {
            replaceCategories(user, dedup(req.interestCategoryIds()));
        }

        if (req.styleIds() != null) {
            replaceStyles(user, dedup(req.styleIds()));
        }

        if (req.regionIds() != null) {
            replaceRegions(user, dedup(req.regionIds()));
        }

        if (req.featureIds() != null) {
            replaceFeatures(user, dedup(req.featureIds()));
        }
    }

    private List<Long> dedup(List<Long> ids) {
        return ids == null
            ? List.of()
            : ids.stream()
            .filter(Objects::nonNull)
            .distinct()
            .toList();
    }

    /* ===================== 카테고리 ===================== */

    private void replaceCategories(Users user, List<Long> ids) {
        // 현재 DB에 있는 것들
        List<UserPrefCategory> existing = userPrefCategoryRepository.findAllByUser_Id(user.getId());
        Set<Long> newIdSet = Set.copyOf(ids);

        // 1) 삭제해야 할 것: 기존 중에서 새 ID에 없는 것
        List<UserPrefCategory> toDelete = existing.stream()
            .filter(row -> !newIdSet.contains(row.getCategory().getId()))
            .toList();
        userPrefCategoryRepository.deleteAll(toDelete);

        if (ids.isEmpty()) {
            // 새로 설정할 게 없으면 여기서 끝
            return;
        }

        // 2) 남겨둘 것: 기존 ∩ 새
        Set<Long> existingIdsToKeep = existing.stream()
            .map(row -> row.getCategory().getId())
            .filter(newIdSet::contains)
            .collect(Collectors.toSet());

        // 3) 새로 넣을 것: 새 ID 중에서 기존에 없던 것
        List<Long> idsToInsert = ids.stream()
            .filter(id -> !existingIdsToKeep.contains(id))
            .toList();

        if (idsToInsert.isEmpty()) {
            // 다 기존에 있던 것이라면 insert 할 필요 없음
            return;
        }

        // 유효성 검증은 "추가 대상"에 대해서만
        List<Category> found = categoryRepository.findAllById(idsToInsert);
        ensureSameSizeOrBadRequest("category", idsToInsert, found, Category::getId);

        var rows = found.stream()
            .map(c -> UserPrefCategory.builder()
                .user(user)
                .category(c)
                .build())
            .toList();

        userPrefCategoryRepository.saveAll(rows);
    }

    /* ===================== 스타일 ===================== */

    private void replaceStyles(Users user, List<Long> ids) {
        List<UserPrefStyle> existing = userPrefStyleRepository.findAllByUser_Id(user.getId());
        Set<Long> newIdSet = Set.copyOf(ids);

        List<UserPrefStyle> toDelete = existing.stream()
            .filter(row -> !newIdSet.contains(row.getStyle().getId()))
            .toList();
        userPrefStyleRepository.deleteAll(toDelete);

        if (ids.isEmpty()) return;

        Set<Long> existingIdsToKeep = existing.stream()
            .map(row -> row.getStyle().getId())
            .filter(newIdSet::contains)
            .collect(Collectors.toSet());

        List<Long> idsToInsert = ids.stream()
            .filter(id -> !existingIdsToKeep.contains(id))
            .toList();

        if (idsToInsert.isEmpty()) return;

        List<Style> found = styleRepository.findAllById(idsToInsert);
        ensureSameSizeOrBadRequest("style", idsToInsert, found, Style::getId);

        var rows = found.stream()
            .map(s -> UserPrefStyle.builder()
                .user(user)
                .style(s)
                .build())
            .toList();

        userPrefStyleRepository.saveAll(rows);
    }

    /* ===================== 지역 ===================== */

    private void replaceRegions(Users user, List<Long> ids) {
        List<UserPrefRegion> existing = userPrefRegionRepository.findAllByUser_Id(user.getId());
        Set<Long> newIdSet = Set.copyOf(ids);

        List<UserPrefRegion> toDelete = existing.stream()
            .filter(row -> !newIdSet.contains(row.getRegion().getId()))
            .toList();
        userPrefRegionRepository.deleteAll(toDelete);

        if (ids.isEmpty()) return;

        Set<Long> existingIdsToKeep = existing.stream()
            .map(row -> row.getRegion().getId())
            .filter(newIdSet::contains)
            .collect(Collectors.toSet());

        List<Long> idsToInsert = ids.stream()
            .filter(id -> !existingIdsToKeep.contains(id))
            .toList();

        if (idsToInsert.isEmpty()) return;

        List<Region> found = regionRepository.findAllById(idsToInsert);
        ensureSameSizeOrBadRequest("region", idsToInsert, found, Region::getId);

        var rows = found.stream()
            .map(r -> UserPrefRegion.builder()
                .user(user)
                .region(r)
                .build())
            .toList();

        userPrefRegionRepository.saveAll(rows);
    }

    /* ===================== 특징 ===================== */

    private void replaceFeatures(Users user, List<Long> ids) {
        List<UserPrefFeature> existing = userPrefFeatureRepository.findAllByUser_Id(user.getId());
        Set<Long> newIdSet = Set.copyOf(ids);

        List<UserPrefFeature> toDelete = existing.stream()
            .filter(row -> !newIdSet.contains(row.getFeature().getId()))
            .toList();
        userPrefFeatureRepository.deleteAll(toDelete);

        if (ids.isEmpty()) return;

        Set<Long> existingIdsToKeep = existing.stream()
            .map(row -> row.getFeature().getId())
            .filter(newIdSet::contains)
            .collect(Collectors.toSet());

        List<Long> idsToInsert = ids.stream()
            .filter(id -> !existingIdsToKeep.contains(id))
            .toList();

        if (idsToInsert.isEmpty()) return;

        List<Feature> found = featureRepository.findAllById(idsToInsert);
        ensureSameSizeOrBadRequest("feature", idsToInsert, found, Feature::getId);

        var rows = found.stream()
            .map(f -> UserPrefFeature.builder()
                .user(user)
                .feature(f)
                .build())
            .toList();

        userPrefFeatureRepository.saveAll(rows);
    }

    /* ===================== 공통 유틸 ===================== */

    private <T> void ensureSameSizeOrBadRequest(
        String what,
        List<Long> reqIds,
        List<T> found,
        Function<T, Long> idGetter
    ) {
        if (found.size() != reqIds.size()) {
            Set<Long> foundIds = found.stream()
                .map(idGetter)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

            List<Long> missing = reqIds.stream()
                .filter(id -> !foundIds.contains(id))
                .toList();

            throw new IllegalArgumentException("Invalid " + what + " IDs: " + missing);
        }
    }
}
