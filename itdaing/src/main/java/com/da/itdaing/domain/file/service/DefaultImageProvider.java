package com.da.itdaing.domain.file.service;

import com.da.itdaing.domain.file.dto.ImagePayload;
import com.da.itdaing.global.storage.StorageProps;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

/**
 * 설정에 등록된 기본 이미지 데이터를 제공한다.
 * 더미 데이터나 초기화 시점에 공통으로 사용할 수 있다.
 */
@Component
@RequiredArgsConstructor
public class DefaultImageProvider {

    private final StorageProps storageProps;

    /**
     * 설정된 기본 이미지 목록을 반환한다.
     */
    public List<ImagePayload> list() {
        List<StorageProps.DefaultImage> defaults = storageProps.getDefaults().getImages();
        if (defaults == null || defaults.isEmpty()) {
            return List.of();
        }
        List<ImagePayload> copies = new ArrayList<>(defaults.size());
        for (StorageProps.DefaultImage image : defaults) {
            if (image == null || !StringUtils.hasText(image.getUrl())) {
                continue;
            }
            copies.add(ImagePayload.builder()
                .url(image.getUrl())
                .key(image.getKey())
                .build());
        }
        return Collections.unmodifiableList(copies);
    }

    /**
     * 기본 이미지가 하나도 없다면 null을 반환한다.
     */
    public ImagePayload firstOrNull() {
        return list().stream().findFirst().orElse(null);
    }

    /**
     * index를 기준으로 이미지를 순환(circular) 선택한다.
     */
    public ImagePayload pickByIndex(int index) {
        List<ImagePayload> images = list();
        if (images.isEmpty()) {
            return null;
        }
        int safeIndex = Math.floorMod(index, images.size());
        return images.get(safeIndex);
    }
}

