// src/main/java/com/da/itdaing/domain/file/storage/ImageStorage.java
package com.da.itdaing.domain.file.storage;

import com.da.itdaing.domain.file.dto.UploadDtos.UploadImageResponse;
import org.springframework.web.multipart.MultipartFile;

public interface ImageStorage {
    UploadImageResponse store(MultipartFile file, Long userId);
    void delete(String key);
}
