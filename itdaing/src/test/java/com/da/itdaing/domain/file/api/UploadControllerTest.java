// src/test/java/com/da/itdaing/domain/file/api/UploadControllerTest.java
package com.da.itdaing.domain.file.api;

import com.da.itdaing.domain.file.dto.UploadDtos.UploadImageResponse;
import com.da.itdaing.domain.file.service.UploadService;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = UploadController.class,
    properties = "storage.provider=s3") // ✅ local WebMvcConfigurer 비활성화
@AutoConfigureMockMvc(addFilters = false)
class UploadControllerTest {

    @Autowired MockMvc mockMvc;

    @MockitoBean
    UploadService uploadService;

    @Test
    void uploadImages_returnsList() throws Exception {
        // given
        MockMultipartFile f1 = new MockMultipartFile("images","a.png","image/png", new byte[]{1});
        MockMultipartFile f2 = new MockMultipartFile("images","b.jpg","image/jpeg", new byte[]{1,2});

        var r1 = UploadImageResponse.builder()
            .key("uploads/images/a.png")
            .url("http://localhost:8080/uploads/images/a.png")
            .originalName("a.png")
            .contentType("image/png")
            .size(1)
            .build();
        var r2 = UploadImageResponse.builder()
            .key("uploads/images/b.jpg")
            .url("http://localhost:8080/uploads/images/b.jpg")
            .originalName("b.jpg")
            .contentType("image/jpeg")
            .size(2)
            .build();

        when(uploadService.uploadImages(ArgumentMatchers.anyList(), ArgumentMatchers.any()))
            .thenReturn(List.of(r1, r2));

        // when & then
        mockMvc.perform(multipart("/api/uploads/images")
                .file(f1).file(f2)
                .contentType(MediaType.MULTIPART_FORM_DATA))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.files.length()").value(2))
            .andExpect(jsonPath("$.data.files[0].originalName").exists());
    }
}
