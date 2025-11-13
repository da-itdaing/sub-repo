// src/main/java/com/da/itdaing/domain/file/storage/LocalImageStorage.java
package com.da.itdaing.domain.file.storage;

import com.da.itdaing.domain.file.dto.UploadDtos.UploadImageResponse;
import com.da.itdaing.global.storage.StorageProps;
import lombok.RequiredArgsConstructor;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.*;
import java.time.LocalDate;
import java.util.UUID;

@RequiredArgsConstructor
public class LocalImageStorage implements ImageStorage {

    private final StorageProps.Local props;

    @Override
    public UploadImageResponse store(MultipartFile file, Long userId) {
        try {
            String ext = StringUtils.getFilenameExtension(file.getOriginalFilename());
            String yyyyMmDd = LocalDate.now().toString();

            // 저장소 상 key(상대경로) = baseDir/images/yyyy-MM-dd/uuid.ext
            String key = "%s/images/%s/%s.%s".formatted(
                props.getBaseDir(), yyyyMmDd, UUID.randomUUID(), ext != null ? ext : "bin"
            );

            // 실제 파일 시스템 경로: root + key
            Path target = Paths.get(props.getRoot()).resolve(key).normalize();
            Files.createDirectories(target.getParent());
            Files.write(target, file.getBytes(), StandardOpenOption.CREATE_NEW);

            String url = props.getPublicBaseUrl() + "/" + key;

            return UploadImageResponse.builder()
                .key(key)
                .url(url)
                .originalName(file.getOriginalFilename())
                .contentType(file.getContentType())
                .size(file.getSize())
                .build();
        } catch (Exception e) {
            throw new RuntimeException("Local upload failed", e);
        }
    }

    @Override
    public void delete(String key) {
        try {
            Path p = Paths.get(props.getRoot()).resolve(key).normalize();
            Files.deleteIfExists(p);
        } catch (Exception ignored) {}
    }
}
