import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { uploadService } from '../../services/uploadService';
import { UploadImageResponse } from '../../services/uploadService';

interface ImageUploaderProps {
  category?: 'PROFILE' | 'POPUP_THUMBNAIL' | 'POPUP_GALLERY' | 'REVIEW' | 'MESSAGE';
  resourceId?: number;
  multiple?: boolean;
  maxFiles?: number;
  maxSizeMB?: number;
  onUploadComplete: (urls: string[]) => void;
  onError?: (error: Error) => void;
  existingImages?: string[];
  onRemoveExisting?: (url: string) => void;
}

export function ImageUploader({
  category,
  resourceId,
  multiple = false,
  maxFiles = 5,
  maxSizeMB = 5,
  onUploadComplete,
  onError,
  existingImages = [],
  onRemoveExisting,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState<{ file: File; preview: string }[]>([]);
  const [uploadedImages, setUploadedImages] = useState<UploadImageResponse[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // 파일 개수 검증
    const totalFiles = previews.length + files.length;
    if (totalFiles > maxFiles) {
      const error = new Error(`최대 ${maxFiles}개의 이미지만 업로드할 수 있습니다.`);
      onError?.(error);
      return;
    }

    // 파일 크기 검증
    const oversizedFiles = files.filter((file) => file.size > maxSizeMB * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      const error = new Error(`파일 크기는 최대 ${maxSizeMB}MB입니다.`);
      onError?.(error);
      return;
    }

    // 파일 타입 검증
    const invalidFiles = files.filter(
      (file) => !file.type.startsWith('image/')
    );
    if (invalidFiles.length > 0) {
      const error = new Error('이미지 파일만 업로드할 수 있습니다.');
      onError?.(error);
      return;
    }

    // 미리보기 생성
    const newPreviews = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setPreviews((prev) => [...prev, ...newPreviews]);

    // 업로드 실행
    try {
      setUploading(true);
      const results = await uploadService.uploadImages(files);
      setUploadedImages((prev) => [...prev, ...results]);
      const urls = results.map((r) => r.url);
      onUploadComplete(urls);
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      onError?.(error instanceof Error ? error : new Error('업로드 실패'));
      // 실패한 파일 제거
      setPreviews((prev) => prev.filter((p) => !files.includes(p.file)));
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removePreview = (index: number) => {
    const removed = previews[index];
    URL.revokeObjectURL(removed.preview);
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExisting = (url: string) => {
    onRemoveExisting?.(url);
  };

  return (
    <div className="space-y-4">
      {/* 기존 이미지 표시 */}
      {existingImages.length > 0 && (
        <div className="grid grid-cols-4 gap-4">
          {existingImages.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`기존 이미지 ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border border-gray-200"
              />
              {onRemoveExisting && (
                <button
                  onClick={() => removeExisting(url)}
                  className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 미리보기 및 업로드된 이미지 */}
      {(previews.length > 0 || uploadedImages.length > 0) && (
        <div className="grid grid-cols-4 gap-4">
          {previews.map((preview, index) => (
            <div key={index} className="relative group">
              <img
                src={preview.preview}
                alt={`미리보기 ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border border-gray-200"
              />
              {uploading ? (
                <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                  <div className="text-white text-xs">업로드 중...</div>
                </div>
              ) : (
                <button
                  onClick={() => removePreview(index)}
                  className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 업로드 버튼 */}
      {previews.length + existingImages.length < maxFiles && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple={multiple}
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full p-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-red-500 transition-colors flex flex-col items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ImageIcon className="size-8 text-gray-400" />
            <span className="text-sm text-gray-600">
              {uploading ? '업로드 중...' : '이미지를 선택하거나 드래그하세요'}
            </span>
            <span className="text-xs text-gray-400">
              최대 {maxFiles}개, 각 {maxSizeMB}MB 이하
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

