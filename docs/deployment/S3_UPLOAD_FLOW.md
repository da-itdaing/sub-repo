# S3 이미지 업로드 및 읽기 흐름

## 📋 아키텍처 개요

```
┌─────────┐         ┌──────────┐         ┌─────┐         ┌──────────┐
│ 사용자  │ ──────> │ 프론트엔드│ ──────> │ S3  │         │   DB     │
└─────────┘         └──────────┘         └─────┘         └──────────┘
                           │                    │                │
                           │                    │                │
                           v                    v                │
                    ┌──────────────┐    ┌──────────────┐        │
                    │   백엔드 API │    │  이미지 파일  │        │
                    └──────────────┘    └──────────────┘        │
                           │                                      │
                           └─────────────────────────────────────┘
                                    S3 URL 저장
```

## 🔄 업로드 흐름

### 방식 1: 애플리케이션을 통한 업로드

```
1. 사용자가 프론트엔드에서 이미지 선택
2. 프론트엔드가 FormData로 백엔드 API에 전송
   POST /api/files/upload
   Content-Type: multipart/form-data
   
3. 백엔드가 이미지를 받아서 S3에 업로드
   - AWS SDK를 사용하여 S3에 PutObject
   - 업로드된 파일의 URL 생성
   
4. 백엔드가 DB에 S3 URL 저장
   - 팝업 이미지, 리뷰 이미지 등
   
5. 응답으로 S3 URL 반환
   {
     "url": "https://daitdaing-static-files.s3.ap-northeast-2.amazonaws.com/uploads/..."
   }
```

**장점:**
- 구현이 간단
- 백엔드에서 파일 검증 가능
- 보안 제어 용이

**단점:**
- 대용량 파일 시 백엔드 서버 부하
- 업로드 시간이 오래 걸릴 수 있음

### 방식 2: Presigned URL 사용 (권장)

```
1. 사용자가 프론트엔드에서 이미지 선택
2. 프론트엔드가 백엔드에 Presigned URL 요청
   POST /api/files/presigned-url
   {
     "fileName": "image.jpg",
     "contentType": "image/jpeg"
   }
   
3. 백엔드가 Presigned URL 생성
   - AWS SDK의 generatePresignedUrl() 사용
   - 만료 시간 설정 (예: 5분)
   - 업로드할 파일 경로 지정
   
4. 백엔드가 Presigned URL 반환
   {
     "uploadUrl": "https://daitdaing-static-files.s3.ap-northeast-2.amazonaws.com/uploads/...?X-Amz-Signature=...",
     "fileUrl": "https://daitdaing-static-files.s3.ap-northeast-2.amazonaws.com/uploads/...",
     "expiresIn": 300
   }
   
5. 프론트엔드가 Presigned URL로 직접 S3에 업로드
   PUT {uploadUrl}
   Content-Type: image/jpeg
   Body: [이미지 바이너리]
   
6. 업로드 완료 후 백엔드에 알림
   POST /api/files/upload-complete
   {
     "fileUrl": "https://..."
   }
   
7. 백엔드가 DB에 S3 URL 저장
```

**장점:**
- 백엔드 부하 감소
- 직접 업로드로 빠름
- 임시 권한으로 보안 유지

**단점:**
- 구현이 약간 복잡
- Presigned URL 만료 관리 필요

## 📖 읽기 흐름

```
1. 사용자가 페이지 접속
2. 프론트엔드가 백엔드 API 호출
   GET /api/popups/{id}
   
3. 백엔드가 DB에서 데이터 조회
   - 팝업 정보와 함께 S3 이미지 URL 포함
   
4. 백엔드가 응답 반환
   {
     "id": 1,
     "title": "팝업스토어",
     "images": [
       "https://daitdaing-static-files.s3.ap-northeast-2.amazonaws.com/uploads/popup1.jpg",
       "https://daitdaing-static-files.s3.ap-northeast-2.amazonaws.com/uploads/popup2.jpg"
     ]
   }
   
5. 프론트엔드가 이미지 URL을 <img> 태그에 사용
   <img src="https://daitdaing-static-files.s3.ap-northeast-2.amazonaws.com/uploads/popup1.jpg" />
   
6. 브라우저가 S3에서 직접 이미지 로드
   - S3 버킷 정책에서 공개 읽기 허용 필요
```

## 🔐 S3 버킷 정책 요구사항

### 필수 권한

1. **공개 읽기** (이미지 표시용)
   ```json
   {
     "Effect": "Allow",
     "Principal": "*",
     "Action": "s3:GetObject",
     "Resource": "arn:aws:s3:::daitdaing-static-files/uploads/*"
   }
   ```

2. **애플리케이션 쓰기** (업로드용)
   ```json
   {
     "Effect": "Allow",
     "Principal": {
       "AWS": "arn:aws:iam::166357011361:user/hj"
     },
     "Action": [
       "s3:PutObject",
       "s3:DeleteObject"
     ],
     "Resource": "arn:aws:s3:::daitdaing-static-files/uploads/*"
   }
   ```

3. **버킷 목록** (애플리케이션용)
   ```json
   {
     "Effect": "Allow",
     "Principal": {
       "AWS": "arn:aws:iam::166357011361:user/hj"
     },
     "Action": [
       "s3:ListBucket",
       "s3:GetBucketLocation"
     ],
     "Resource": "arn:aws:s3:::daitdaing-static-files"
   }
   ```

## 💡 구현 예시

### 백엔드: Presigned URL 생성

```java
@Service
public class FileUploadService {
    
    @Value("${storage.s3.bucket}")
    private String bucketName;
    
    @Value("${storage.s3.base-dir}")
    private String baseDir;
    
    private final S3Client s3Client;
    
    public PresignedUrlResponse generatePresignedUrl(String fileName, String contentType) {
        String key = baseDir + "/" + UUID.randomUUID() + "_" + fileName;
        
        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
            .signatureDuration(Duration.ofMinutes(5))
            .putObjectRequest(r -> r
                .bucket(bucketName)
                .key(key)
                .contentType(contentType)
            )
            .build();
        
        PresignedPutObjectRequest presignedRequest = s3Presigner.presignPutObject(presignRequest);
        
        String fileUrl = String.format("https://%s.s3.%s.amazonaws.com/%s",
            bucketName, region, key);
        
        return new PresignedUrlResponse(
            presignedRequest.url().toString(),
            fileUrl,
            300
        );
    }
}
```

### 프론트엔드: Presigned URL로 업로드

```typescript
async function uploadImage(file: File): Promise<string> {
  // 1. Presigned URL 요청
  const presignedResponse = await api.post('/api/files/presigned-url', {
    fileName: file.name,
    contentType: file.type
  });
  
  // 2. Presigned URL로 직접 업로드
  await fetch(presignedResponse.data.uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type
    },
    body: file
  });
  
  // 3. 업로드 완료 알림
  await api.post('/api/files/upload-complete', {
    fileUrl: presignedResponse.data.fileUrl
  });
  
  return presignedResponse.data.fileUrl;
}
```

## 📚 관련 문서

- [S3 버킷 정책 설정](S3_BUCKET_POLICY.md)
- [Private EC2 환경 설정](PRIVATE_EC2_ENV_SETUP.md)

