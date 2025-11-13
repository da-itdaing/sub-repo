package com.da.itdaing.domain.file.storage;

import com.da.itdaing.domain.file.dto.UploadDtos.UploadImageResponse;
import com.da.itdaing.global.storage.StorageProps;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;
import org.springframework.mock.web.MockMultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;

class S3ImageStorageTest {

    @Test
    void store_callsS3_andBuildsCdnUrl() throws Exception {
        // given
        S3Client s3 = Mockito.mock(S3Client.class);

        StorageProps.S3 s3props = new StorageProps.S3();
        s3props.setBucket("my-bucket");
        s3props.setRegion("ap-northeast-2");
        s3props.setBaseDir("uploads");
        s3props.setPublicBaseUrl("https://cdn.example.com"); // CDN 사용 가정

        S3ImageStorage storage = new S3ImageStorage(s3, s3props);

        MockMultipartFile file = new MockMultipartFile(
            "images", "pic.jpg", "image/jpeg", new byte[]{1,2}
        );

        // when
        UploadImageResponse res = storage.store(file, 7L);

        // then
        ArgumentCaptor<PutObjectRequest> cap = ArgumentCaptor.forClass(PutObjectRequest.class);
        verify(s3).putObject(cap.capture(), any(RequestBody.class));

        PutObjectRequest req = cap.getValue();
        assertThat(req.bucket()).isEqualTo("my-bucket");
        assertThat(req.key()).startsWith("uploads/images/");
        assertThat(req.contentType()).isEqualTo("image/jpeg");

        assertThat(res.getKey()).startsWith("uploads/images/");
        assertThat(res.getUrl()).startsWith("https://cdn.example.com/");
        assertThat(res.getOriginalName()).isEqualTo("pic.jpg");
    }
}
