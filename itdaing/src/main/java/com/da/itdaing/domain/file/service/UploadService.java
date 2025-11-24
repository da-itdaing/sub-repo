// src/main/java/com/da/itdaing/domain/file/service/UploadService.java
package com.da.itdaing.domain.file.service;

import com.da.itdaing.domain.file.dto.UploadDtos.UploadImageResponse;
import com.da.itdaing.domain.file.storage.ImageStorage;
import com.da.itdaing.global.error.ErrorCode;
import com.da.itdaing.global.error.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class UploadService {

    private static final long MAX_SIZE = 10L * 1024 * 1024; // 10MB
    private static final int MAX_FILE_COUNT = 10;
    private static final String DEFAULT_TYPE = "general";
    private static final Set<String> ALLOWED = Set.of(
        "image/jpeg", "image/png", "image/webp", "image/gif"
    );

    private final ImageStorage imageStorage;

    /**
     * 이미지 업로드 (기본 - 호환성 유지)
     * @deprecated 타입을 지정할 수 있는 uploadImages(List, Long, String) 사용 권장
     */
    @Deprecated
    public List<UploadImageResponse> uploadImages(List<MultipartFile> images, Long userId) {
        return uploadImages(images, userId, DEFAULT_TYPE);
    }

    /**
     * 이미지 업로드 (타입별 경로 분리)
     * @param images 업로드할 이미지 파일 목록
     * @param userId 사용자 ID (비로그인 시 null 허용)
     * @param type 이미지 타입 (popup, review, profile, seller-profile 등)
     * @return 업로드 결과 목록
     */
    public List<UploadImageResponse> uploadImages(List<MultipartFile> images, Long userId, String type) {
        validateImages(images);

        Long ownerId = userId != null ? userId : 0L;
        String normalizedType = (type != null && !type.isBlank()) ? type : DEFAULT_TYPE;

        List<UploadImageResponse> out = new ArrayList<>();
        for (MultipartFile file : images) {
            if (file == null || file.isEmpty()) {
                continue;
            }
            validateFile(file);
            out.add(storeSafely(file, ownerId, normalizedType));
        }

        if (out.isEmpty()) {
            throw new BusinessException(ErrorCode.MISSING_INPUT_VALUE, "업로드할 이미지가 없습니다.");
        }

        return out;
    }

    public void deleteByKey(String key) {
        imageStorage.delete(key);
    }

    private void validateImages(List<MultipartFile> images) {
        if (images == null || images.isEmpty()) {
            throw new BusinessException(ErrorCode.MISSING_INPUT_VALUE, "최소 1개의 이미지를 업로드해야 합니다.");
        }
        if (images.size() > MAX_FILE_COUNT) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE, "이미지는 최대 %d개까지 업로드할 수 있습니다.".formatted(MAX_FILE_COUNT));
        }
    }

    private void validateFile(MultipartFile file) {
        if (file.getSize() > MAX_SIZE) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE, "이미지 최대 용량(10MB)을 초과했습니다.");
        }
        String contentType = file.getContentType();
        String normalizedContentType = contentType != null ? contentType.toLowerCase(Locale.ROOT) : null;
        if (normalizedContentType == null || !ALLOWED.contains(normalizedContentType)) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE, "지원하지 않는 이미지 형식입니다.");
        }
    }

    private UploadImageResponse storeSafely(MultipartFile file, Long userId, String type) {
        try {
            return imageStorage.store(file, userId, type);
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("이미지 업로드 실패 (type={}, userId={}, filename={})", type, userId, file.getOriginalFilename(), e);
            throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR, "이미지 업로드 중 오류가 발생했습니다.");
        }
    }
}

