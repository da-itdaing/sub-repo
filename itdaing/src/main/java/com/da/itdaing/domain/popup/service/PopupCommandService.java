package com.da.itdaing.domain.popup.service;

import com.da.itdaing.domain.common.enums.ApprovalStatus;
import com.da.itdaing.domain.common.enums.UserRole;
import com.da.itdaing.domain.common.enums.ZoneStatus;
import com.da.itdaing.domain.file.dto.ImagePayload;
import com.da.itdaing.domain.file.service.DefaultImageProvider;
import com.da.itdaing.domain.geo.entity.ZoneCell;
import com.da.itdaing.domain.geo.repository.ZoneCellRepository;
import com.da.itdaing.domain.master.entity.Category;
import com.da.itdaing.domain.master.entity.Feature;
import com.da.itdaing.domain.master.entity.Style;
import com.da.itdaing.domain.master.repository.CategoryRepository;
import com.da.itdaing.domain.master.repository.FeatureRepository;
import com.da.itdaing.domain.master.repository.StyleRepository;
import com.da.itdaing.domain.popup.dto.PopupCreateRequest;
import com.da.itdaing.domain.popup.entity.Popup;
import com.da.itdaing.domain.popup.entity.PopupCategory;
import com.da.itdaing.domain.popup.entity.PopupFeature;
import com.da.itdaing.domain.popup.entity.PopupImage;
import com.da.itdaing.domain.popup.entity.PopupStyle;
import com.da.itdaing.domain.popup.repository.PopupCategoryRepository;
import com.da.itdaing.domain.popup.repository.PopupFeatureRepository;
import com.da.itdaing.domain.popup.repository.PopupImageRepository;
import com.da.itdaing.domain.popup.repository.PopupRepository;
import com.da.itdaing.domain.popup.repository.PopupStyleRepository;
import com.da.itdaing.domain.user.entity.Users;
import com.da.itdaing.domain.user.repository.UserRepository;
import com.da.itdaing.global.error.ErrorCode;
import com.da.itdaing.global.error.exception.BusinessException;
import jakarta.transaction.Transactional;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class PopupCommandService {

    private static final String POPUP_CATEGORY_ROLE = "POPUP";
    private static final String TARGET_CATEGORY_ROLE = "TARGET";

    private final PopupRepository popupRepository;
    private final PopupImageRepository popupImageRepository;
    private final PopupCategoryRepository popupCategoryRepository;
    private final PopupFeatureRepository popupFeatureRepository;
    private final PopupStyleRepository popupStyleRepository;
    private final UserRepository userRepository;
    private final ZoneCellRepository zoneCellRepository;
    private final CategoryRepository categoryRepository;
    private final FeatureRepository featureRepository;
    private final StyleRepository styleRepository;
    private final DefaultImageProvider defaultImageProvider;

    @Transactional
    public Long createPopup(Long sellerId, PopupCreateRequest request) {
        Users seller = userRepository.findById(sellerId)
            .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        if (seller.getRole() != UserRole.SELLER) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED, "판매자만 팝업을 등록할 수 있습니다.");
        }

        ZoneCell zoneCell = zoneCellRepository.findById(request.zoneCellId())
            .orElseThrow(() -> new BusinessException(ErrorCode.ENTITY_NOT_FOUND, "선택한 셀을 찾을 수 없습니다."));
        validateZoneCellOwnership(zoneCell, sellerId);
        validateZoneCellStatus(zoneCell);
        validatePeriod(request.startDate(), request.endDate());

        Popup popup = popupRepository.save(
            Popup.builder()
                .seller(seller)
                .zoneCell(zoneCell)
                .name(request.title().trim())
                .description(request.description())
                .startDate(request.startDate())
                .endDate(request.endDate())
                .operatingTime(request.operatingTime())
                .approvalStatus(ApprovalStatus.PENDING)
                .viewCount(0L)
                .build()
        );

        persistCategories(popup, request.categoryIds(), POPUP_CATEGORY_ROLE);
        persistCategories(popup, request.targetCategoryIds(), TARGET_CATEGORY_ROLE);
        persistFeatures(popup, request.featureIds());
        persistStyles(popup, request.styleIds());
        persistImages(popup, request.thumbnailImage(), request.images());

        return popup.getId();
    }

    @Transactional
    public Long updatePopup(Long sellerId, Long popupId, PopupCreateRequest request) {
        Popup popup = popupRepository.findById(popupId)
            .orElseThrow(() -> new BusinessException(ErrorCode.POPUP_NOT_FOUND));
        if (!Objects.equals(popup.getSeller().getId(), sellerId)) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED, "본인 소유 팝업만 수정할 수 있습니다.");
        }

        ZoneCell zoneCell = zoneCellRepository.findById(request.zoneCellId())
            .orElseThrow(() -> new BusinessException(ErrorCode.ENTITY_NOT_FOUND, "선택한 셀을 찾을 수 없습니다."));
        validateZoneCellOwnership(zoneCell, sellerId);
        validateZoneCellStatus(zoneCell);
        validatePeriod(request.startDate(), request.endDate());

        popup.update(zoneCell,
            request.title().trim(),
            request.description(),
            request.startDate(),
            request.endDate(),
            request.operatingTime());

        popupCategoryRepository.deleteByPopup(popup);
        popupFeatureRepository.deleteByPopup(popup);
        popupStyleRepository.deleteByPopup(popup);
        popupImageRepository.deleteByPopup(popup);

        persistCategories(popup, request.categoryIds(), POPUP_CATEGORY_ROLE);
        persistCategories(popup, request.targetCategoryIds(), TARGET_CATEGORY_ROLE);
        persistFeatures(popup, request.featureIds());
        persistStyles(popup, request.styleIds());
        persistImages(popup, request.thumbnailImage(), request.images());

        return popup.getId();
    }

    @Transactional
    public void deletePopup(Long sellerId, Long popupId) {
        Popup popup = popupRepository.findById(popupId)
            .orElseThrow(() -> new BusinessException(ErrorCode.POPUP_NOT_FOUND));
        if (!Objects.equals(popup.getSeller().getId(), sellerId)) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED, "본인 소유 팝업만 삭제할 수 있습니다.");
        }

        popupCategoryRepository.deleteByPopup(popup);
        popupFeatureRepository.deleteByPopup(popup);
        popupStyleRepository.deleteByPopup(popup);
        popupImageRepository.deleteByPopup(popup);

        popupRepository.delete(popup);
    }


    private void validateZoneCellOwnership(ZoneCell zoneCell, Long sellerId) {
        if (!Objects.equals(zoneCell.getOwner().getId(), sellerId)) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED, "선택한 셀에 대한 권한이 없습니다.");
        }
    }

    private void validateZoneCellStatus(ZoneCell zoneCell) {
        if (zoneCell.getStatus() != ZoneStatus.APPROVED) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE, "관리자 승인된 셀만 선택할 수 있습니다.");
        }
    }

    private void validatePeriod(LocalDate startDate, LocalDate endDate) {
        if (startDate != null && endDate != null && endDate.isBefore(startDate)) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE, "종료일은 시작일 이후여야 합니다.");
        }
    }

    private void persistCategories(Popup popup, List<Long> categoryIds, String role) {
        if (categoryIds.isEmpty()) {
            return;
        }
        Map<Long, Category> categoryMap = categoryRepository.findAllById(categoryIds).stream()
            .collect(Collectors.toMap(Category::getId, category -> category));
        ensureAllIdsExist(categoryIds, categoryMap.keySet(), "카테고리");

        List<PopupCategory> mappings = categoryIds.stream()
            .distinct()
            .map(id -> PopupCategory.builder()
                .popup(popup)
                .category(categoryMap.get(id))
                .categoryRole(role)
                .build())
            .toList();
        popupCategoryRepository.saveAll(mappings);
    }

    private void persistFeatures(Popup popup, List<Long> featureIds) {
        if (featureIds.isEmpty()) {
            return;
        }
        Map<Long, Feature> featureMap = featureRepository.findAllById(featureIds).stream()
            .collect(Collectors.toMap(Feature::getId, feature -> feature));
        ensureAllIdsExist(featureIds, featureMap.keySet(), "편의시설");

        List<PopupFeature> mappings = featureIds.stream()
            .distinct()
            .map(id -> PopupFeature.builder()
                .popup(popup)
                .feature(featureMap.get(id))
                .build())
            .toList();
        popupFeatureRepository.saveAll(mappings);
    }

    private void persistStyles(Popup popup, List<Long> styleIds) {
        if (styleIds.isEmpty()) {
            return;
        }
        Map<Long, Style> styleMap = styleRepository.findAllById(styleIds).stream()
            .collect(Collectors.toMap(Style::getId, style -> style));
        ensureAllIdsExist(styleIds, styleMap.keySet(), "스타일");

        List<PopupStyle> mappings = styleIds.stream()
            .distinct()
            .map(id -> PopupStyle.builder()
                .popup(popup)
                .style(styleMap.get(id))
                .build())
            .toList();
        popupStyleRepository.saveAll(mappings);
    }

    private void persistImages(Popup popup, ImagePayload thumbnail, List<ImagePayload> gallery) {
        Set<PopupImage> images = new HashSet<>();

        if (hasUrl(thumbnail)) {
            images.add(PopupImage.builder()
                .popup(popup)
                .imageUrl(thumbnail.url())
                .imageKey(thumbnail.key())
                .isThumbnail(true)
                .build());
        }

        gallery.stream()
            .filter(this::hasUrl)
            .forEach(payload -> images.add(
                PopupImage.builder()
                    .popup(popup)
                    .imageUrl(payload.url())
                    .imageKey(payload.key())
                    .isThumbnail(false)
                    .build()
            ));

        if (images.isEmpty()) {
            ImagePayload fallback = defaultImageProvider.firstOrNull();
            if (fallback != null && hasUrl(fallback)) {
                images.add(PopupImage.builder()
                    .popup(popup)
                    .imageUrl(fallback.url())
                    .imageKey(fallback.key())
                    .isThumbnail(true)
                    .build());
            }
        }

        if (!images.isEmpty()) {
            popupImageRepository.saveAll(images);
        }
    }

    private boolean hasUrl(ImagePayload payload) {
        return payload != null && StringUtils.hasText(payload.url());
    }

    private void ensureAllIdsExist(List<Long> requestedIds, Set<Long> actualIds, String label) {
        Set<Long> missing = requestedIds.stream()
            .filter(id -> !actualIds.contains(id))
            .collect(Collectors.toSet());
        if (!missing.isEmpty()) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE, label + " ID가 올바르지 않습니다: " + missing);
        }
    }
}
