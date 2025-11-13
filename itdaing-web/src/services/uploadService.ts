import apiClient, { ApiResponse } from './api';

export interface UploadImageResponse {
  id?: string;
  key: string;
  url: string;
  originalName: string;
  contentType: string;
  size: number;
  width?: number;
  height?: number;
}

export interface UploadImagesResponse {
  files: UploadImageResponse[];
}

export const uploadService = {
  // 이미지 업로드 (복수)
  async uploadImages(files: File[]): Promise<UploadImageResponse[]> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });

    const response = await apiClient.post<ApiResponse<UploadImagesResponse>>(
      '/uploads/images',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (response.data.success && response.data.data) {
      return response.data.data.files;
    }
    const message = response.data.error?.message ?? '이미지 업로드에 실패했습니다.';
    throw new Error(message);
  },

  // 단일 이미지 업로드
  async uploadImage(file: File): Promise<UploadImageResponse> {
    const results = await this.uploadImages([file]);
    return results[0];
  },

  // S3 Key에서 URL 추출 (필요시)
  extractS3KeyFromUrl(url: string): string | null {
    try {
      // S3 URL 형식: https://bucket.s3.region.amazonaws.com/key
      // 또는 CloudFront: https://d1234567890.cloudfront.net/key
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      return pathname.startsWith('/') ? pathname.substring(1) : pathname;
    } catch {
      return null;
    }
  },
};

