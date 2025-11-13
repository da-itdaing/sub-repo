package com.da.itdaing.domain.file.storage;

import com.da.itdaing.domain.file.dto.UploadDtos.UploadImageResponse;
import com.da.itdaing.global.storage.StorageProps;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;

class LocalImageStorageTest {

    @TempDir
    Path tmp;

    @Test
    void store_savesToDisk_andReturnsUrl() throws Exception {
        // given
        StorageProps.Local props = new StorageProps.Local();
        props.setRoot(tmp.toString());                 // 임시 디렉토리
        props.setBaseDir("uploads");
        props.setPublicBaseUrl("http://localhost:8080");

        LocalImageStorage storage = new LocalImageStorage(props);

        MockMultipartFile file = new MockMultipartFile(
            "images", "pic.png", "image/png", new byte[]{1,2,3}
        );

        // when
        UploadImageResponse res = storage.store(file, 1L);

        // then
        assertThat(res.getKey()).startsWith("uploads/images/");
        assertThat(res.getUrl()).isEqualTo("http://localhost:8080/" + res.getKey());
        assertThat(res.getOriginalName()).isEqualTo("pic.png");
        Path saved = tmp.resolve(res.getKey());
        assertThat(Files.exists(saved)).isTrue();
    }
}
