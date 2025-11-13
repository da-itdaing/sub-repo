// src/main/java/com/da/itdaing/domain/file/api/UploadController.java
package com.da.itdaing.domain.file.api;

import com.da.itdaing.domain.file.dto.UploadDtos.UploadImageResponse;
import com.da.itdaing.domain.file.dto.UploadDtos.UploadImagesResponse;
import com.da.itdaing.domain.file.service.UploadService;
import com.da.itdaing.global.web.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.NotEmpty;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/uploads")
@RequiredArgsConstructor
@Tag(name = "Upload")
public class UploadController {

    private final UploadService uploadService;

    @Operation(summary = "이미지 업로드 (복수)")
    @PostMapping(value = "/images",
        consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
        produces = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponse<UploadImagesResponse> uploadImages(
        Principal principal,
        @RequestPart("images") @NotEmpty List<MultipartFile> images
    ) {
        Long userId = principal != null ? Long.valueOf(principal.getName()) : null;
        List<UploadImageResponse> list = uploadService.uploadImages(images, userId);
        return ApiResponse.success(UploadImagesResponse.builder().files(list).build());
    }
}
