// src/main/java/com/da/itdaing/domain/file/api/UploadController.java
package com.da.itdaing.domain.file.api;

import com.da.itdaing.domain.file.dto.UploadDtos.UploadImageResponse;
import com.da.itdaing.domain.file.dto.UploadDtos.UploadImagesResponse;
import com.da.itdaing.domain.file.service.UploadService;
import com.da.itdaing.global.web.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.NotEmpty;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;

/**
 * 파일 업로드 API 컨트롤러
 * 
 * 이미지 파일 업로드를 처리하고, AWS S3에 저장한 후 URL을 반환합니다.
 * 업로드된 파일 정보는 다른 API(팝업 등록, 프로필 수정, 메시지 등)에서 사용할 수 있습니다.
 */
@Tag(name = "Upload", description = "파일 업로드 API")
@RestController
@RequestMapping("/api/uploads")
@RequiredArgsConstructor
public class UploadController {

    private final UploadService uploadService;

    @Operation(
        summary = "이미지 파일 업로드 (복수)",
        description = """
            하나 이상의 이미지 파일을 업로드하여 AWS S3에 저장하고, URL을 반환합니다.
            
            이 API는 JWT 토큰 인증이 필요합니다 (선택사항: 인증 없이도 사용 가능).
            
            **업로드 제한:**
            - 파일 형식: JPEG, PNG, GIF, WebP
            - 파일 크기: 최대 10MB per file
            - 파일 개수: 최대 10개
            
            **사용 예시:**
            1. 팝업스토어 등록 시 썸네일 및 갤러리 이미지 업로드
            2. 판매자 프로필 이미지 업로드
            3. 리뷰 작성 시 이미지 첨부
            4. 문의 메시지에 이미지 첨부
            
            **업로드 흐름:**
            1. 이 엔드포인트로 이미지 파일을 multipart/form-data로 전송
            2. 서버는 파일을 검증하고 S3에 업로드
            3. 각 파일의 URL과 key를 응답으로 반환
            4. 반환된 URL과 key를 다른 API의 요청 본문에 포함하여 사용
            
            **응답 구조:**
            - url: 업로드된 파일의 공개 URL (이미지를 표시할 때 사용)
            - key: S3 버킷 내의 파일 경로 (파일 삭제 시 사용)
            - originalFilename: 원본 파일명
            - contentType: MIME 타입
            - size: 파일 크기 (바이트)
            
            **주의사항:**
            - 업로드된 파일은 자동으로 삭제되지 않으므로, 사용하지 않는 파일은 관리자가 정리해야 합니다.
            - 파일명은 UUID로 변환되어 저장되므로, 중복 걱정 없이 업로드할 수 있습니다.
            """,
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "업로드 성공",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(value = """
                    {
                        "success": true,
                        "data": {
                            "files": [
                                {
                                    "url": "https://itdaing-bucket.s3.ap-northeast-2.amazonaws.com/uploads/2024/01/15/a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg",
                                    "key": "uploads/2024/01/15/a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg",
                                    "originalFilename": "popup_thumbnail.jpg",
                                    "contentType": "image/jpeg",
                                    "size": 1024567
                                },
                                {
                                    "url": "https://itdaing-bucket.s3.ap-northeast-2.amazonaws.com/uploads/2024/01/15/b2c3d4e5-f6a7-8901-bcde-f12345678901.jpg",
                                    "key": "uploads/2024/01/15/b2c3d4e5-f6a7-8901-bcde-f12345678901.jpg",
                                    "originalFilename": "popup_gallery_1.jpg",
                                    "contentType": "image/jpeg",
                                    "size": 2048765
                                }
                            ]
                        }
                    }
                    """)
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400",
            description = "업로드 실패 - 파일 형식 또는 크기 초과",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(value = """
                    {
                        "success": false,
                        "error": {
                            "status": 400,
                            "code": "E001",
                            "message": "지원하지 않는 파일 형식입니다. JPEG, PNG, GIF, WebP만 허용됩니다."
                        }
                    }
                    """)
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401",
            description = "인증 실패 (인증이 필요한 경우)",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(value = """
                    {
                        "success": false,
                        "error": {
                            "status": 401,
                            "code": "AUTH-401",
                            "message": "인증이 필요합니다"
                        }
                    }
                    """)
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "413",
            description = "파일 크기 초과",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(value = """
                    {
                        "success": false,
                        "error": {
                            "status": 413,
                            "code": "E002",
                            "message": "파일 크기가 10MB를 초과합니다"
                        }
                    }
                    """)
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "500",
            description = "서버 오류 - S3 업로드 실패",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(value = """
                    {
                        "success": false,
                        "error": {
                            "status": 500,
                            "code": "E999",
                            "message": "파일 업로드 중 오류가 발생했습니다"
                        }
                    }
                    """)
            )
        )
    })
    @PostMapping(value = "/images",
        consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
        produces = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponse<UploadImagesResponse> uploadImages(
        Principal principal,
        @Parameter(
            description = "업로드할 이미지 파일 목록 (최대 10개, 각 10MB 이하)",
            required = true,
            content = @Content(mediaType = MediaType.MULTIPART_FORM_DATA_VALUE)
        )
        @RequestPart("images") @NotEmpty List<MultipartFile> images
    ) {
        Long userId = principal != null ? Long.valueOf(principal.getName()) : null;
        List<UploadImageResponse> list = uploadService.uploadImages(images, userId);
        return ApiResponse.success(UploadImagesResponse.builder().files(list).build());
    }
}
