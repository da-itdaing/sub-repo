// src/main/java/com/da/itdaing/domain/file/service/UploadService.java
package com.da.itdaing.domain.file.service;

import com.da.itdaing.domain.file.dto.UploadDtos.UploadImageResponse;
import com.da.itdaing.domain.file.storage.ImageStorage;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@Service
@RequiredArgsConstructor
public class UploadService {

    private static final long MAX_SIZE = 5L * 1024 * 1024; // 5MB
    private static final Set<String> ALLOWED = Set.of(
        "image/jpeg", "image/png", "image/webp", "image/gif"
    );

    private final ImageStorage imageStorage;

    public List<UploadImageResponse> uploadImages(List<MultipartFile> images, Long userId) {
        if (images == null || images.isEmpty()) {
            throw new IllegalArgumentException("이미지가 비었습니다");
        }
        List<UploadImageResponse> out = new ArrayList<>();
        for (MultipartFile f : images) {
            if (f.isEmpty()) continue;
            if (f.getSize() > MAX_SIZE) {
                throw new IllegalArgumentException("파일이 너무 큽니다 (최대 5MB)");
            }
            if (f.getContentType() == null || !ALLOWED.contains(f.getContentType())) {
                throw new IllegalArgumentException("허용되지 않는 이미지 형식: " + f.getContentType());
            }
            out.add(imageStorage.store(f, userId));
        }
        return out;
    }

    public void deleteByKey(String key) {
        imageStorage.delete(key);
    }
}
