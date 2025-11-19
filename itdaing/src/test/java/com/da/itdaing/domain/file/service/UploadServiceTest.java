package com.da.itdaing.domain.file.service;

import com.da.itdaing.domain.file.dto.UploadDtos.UploadImageResponse;
import com.da.itdaing.domain.file.storage.ImageStorage;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class UploadServiceTest {

    @Test
    void uploadImages_validImages_ok() {
        // given: 저장 자체는 관심 없음 -> 스텁
        ImageStorage stub = new ImageStorage() {
            @Override
            public UploadImageResponse store(MultipartFile file, Long userId, String type) {
                return UploadImageResponse.builder()
                    .key("uploads/images/" + file.getOriginalFilename())
                    .url("http://localhost:8080/uploads/images/" + file.getOriginalFilename())
                    .originalName(file.getOriginalFilename())
                    .contentType(file.getContentType())
                    .size(file.getSize())
                    .build();
            }
            @Override
            public void delete(String key) {}
        };

        UploadService service = new UploadService(stub);

        MockMultipartFile f1 = new MockMultipartFile("images","a.png","image/png",new byte[]{1});
        MockMultipartFile f2 = new MockMultipartFile("images","b.jpg","image/jpeg",new byte[]{1,2});

        // when
        var list = service.uploadImages(List.of(f1, f2), 1L);

        // then
        assertThat(list).hasSize(2);
        assertThat(list).extracting("originalName").containsExactlyInAnyOrder("a.png","b.jpg");
    }

    @Test
    void uploadImages_rejectsTooLarge() {
        ImageStorage dummy = mock(ImageStorage.class);
        UploadService service = new UploadService(dummy);

        byte[] big = new byte[(int)(5 * 1024 * 1024) + 1]; // 5MB + 1
        MockMultipartFile f = new MockMultipartFile("images","x.webp","image/webp", big);

        assertThatThrownBy(() -> service.uploadImages(List.of(f), 1L))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("너무 큽니다");
    }

    @Test
    void uploadImages_rejectsUnsupportedContentType() {
        ImageStorage dummy = mock(ImageStorage.class);
        UploadService service = new UploadService(dummy);

        MockMultipartFile f = new MockMultipartFile("images","x.txt","text/plain", new byte[]{1});

        assertThatThrownBy(() -> service.uploadImages(List.of(f), 1L))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("허용되지 않는");
    }
}
