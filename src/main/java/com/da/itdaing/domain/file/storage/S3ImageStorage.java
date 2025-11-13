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
    public UploadImageResponse store(MultipartFile file, Long userId) {
        try {
            String original = file.getOriginalFilename();
            String ext = StringUtils.getFilenameExtension(original);
            String yyyyMmDd = LocalDate.now().toString();

            // S3 key
            String key = "%s/images/%s/%s.%s".formatted(
                props.getBaseDir(), yyyyMmDd, UUID.randomUUID(), ext != null ? ext : "bin"
            );

            PutObjectRequest req = PutObjectRequest.builder()
                .bucket(props.getBucket())
                .key(key)
                .contentType(file.getContentType())
                .cacheControl("public, max-age=31536000")
                .acl(ObjectCannedACL.PUBLIC_READ) // 퍼블릭 버킷 아니라면 제거하고 CloudFront 서명 등 사용
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
