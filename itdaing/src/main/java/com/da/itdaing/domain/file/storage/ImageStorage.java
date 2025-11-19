// src/main/java/com/da/itdaing/domain/file/storage/ImageStorage.java
package com.da.itdaing.domain.file.storage;

import com.da.itdaing.domain.file.dto.UploadDtos.UploadImageResponse;
import org.springframework.web.multipart.MultipartFile;

public interface ImageStorage {
    /**
     * 이미지 저장 (기본 - 호환성 유지)
     * @deprecated 타입을 지정할 수 있는 store(MultipartFile, Long, String) 사용 권장
     */
    @Deprecated
    default UploadImageResponse store(MultipartFile file, Long userId) {
        return store(file, userId, "general");
    }
    
    /**
     * 이미지 저장 (타입별 경로 분리)
     * @param file 업로드할 파일
     * @param userId 사용자 ID
     * @param type 이미지 타입 (popup, review, profile, seller-profile 등)
     * @return 업로드 결과
     */
    UploadImageResponse store(MultipartFile file, Long userId, String type);
    
    void delete(String key);
}
