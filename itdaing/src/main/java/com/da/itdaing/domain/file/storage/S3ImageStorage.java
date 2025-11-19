// src/main/java/com/da/itdaing/domain/file/storage/S3ImageStorage.java
package com.da.itdaing.domain.file.storage;

import com.da.itdaing.domain.file.dto.UploadDtos.UploadImageResponse;
import com.da.itdaing.global.storage.StorageProps;
import lombok.RequiredArgsConstructor;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.time.LocalDate;
import java.util.UUID;

@RequiredArgsConstructor
public class S3ImageStorage implements ImageStorage {

    private final S3Client s3;
    private final StorageProps.S3 props;

    @Override
    @Deprecated
    public UploadImageResponse store(MultipartFile file, Long userId) {
        return store(file, userId, "general");
    }

    @Override
    public UploadImageResponse store(MultipartFile file, Long userId, String type) {
        try {
            String original = file.getOriginalFilename();
            String ext = StringUtils.getFilenameExtension(original);
            String yyyyMmDd = LocalDate.now().toString();

            // S3 key: 타입별 경로 분리
            // 형식: {baseDir}/{type}/{userId}/{date}/{uuid}.{ext}
            String normalizedType = (type != null && !type.isEmpty()) ? type : "general";
            String key = "%s/%s/%d/%s/%s.%s".formatted(
                props.getBaseDir(), normalizedType, userId, yyyyMmDd, UUID.randomUUID(), ext != null ? ext : "bin"
            );

            PutObjectRequest req = PutObjectRequest.builder()
                .bucket(props.getBucket())
                .key(key)
                .contentType(file.getContentType())
                .cacheControl("public, max-age=31536000")
                // ACL을 허용하지 않는 버킷(버킷 소유자 강제 모드)에서는 acl 설정이 400 오류를 유발한다.
                // 퍼블릭 접근은 버킷 정책 또는 CloudFront 서명 URL로 제어한다.
                .build();

            s3.putObject(req, RequestBody.fromBytes(file.getBytes()));

            String url = buildPublicUrl(key);

            return UploadImageResponse.builder()
                .key(key)
                .url(url)
                .originalName(original)
                .contentType(file.getContentType())
                .size(file.getSize())
                .build();
        } catch (Exception e) {
            throw new RuntimeException("S3 upload failed", e);
        }
    }

    @Override
    public void delete(String key) {
        s3.deleteObject(b -> b.bucket(props.getBucket()).key(key));
    }

    private String buildPublicUrl(String key) {
        if (StringUtils.hasText(props.getPublicBaseUrl())) {
            return props.getPublicBaseUrl() + "/" + key; // CloudFront 권장
        }
        return "https://%s.s3.%s.amazonaws.com/%s"
            .formatted(props.getBucket(), props.getRegion(), key);
    }
}
