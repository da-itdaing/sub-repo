import { useState, useRef } from 'react';
import { uploadImage, uploadImages } from '../../services/uploadService';
import { Button } from '../ui/button';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { cn } from '../ui/utils';

/**
 * 이미지 업로드 컴포넌트
 * @param {Object} props
 * @param {Array<{url: string, key: string}>} props.value - 현재 이미지 목록
 * @param {Function} props.onChange - 이미지 변경 콜백 (ImagePayload[] 전달)
 * @param {number} props.maxImages - 최대 이미지 개수
 * @param {boolean} props.multiple - 다중 선택 허용 여부
 * @param {string} props.className - 추가 CSS 클래스
 */
export default function ImageUpload({
  value = [],
  onChange,
  maxImages = 5,
  multiple = true,
  className,
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const remainingSlots = maxImages - value.length;
    if (files.length > remainingSlots) {
      setError(`최대 ${maxImages}개의 이미지만 업로드할 수 있습니다.`);
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const results = await uploadImages(files);
      const newImages = [...value, ...results];
      onChange?.(newImages);
    } catch (err) {
      setError(err.message || '이미지 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
      // 파일 입력 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = (index) => {
    const newImages = value.filter((_, i) => i !== index);
    onChange?.(newImages);
  };

  const canAddMore = value.length < maxImages;

  return (
    <div className={cn('space-y-4', className)}>
      {/* 이미지 미리보기 그리드 */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {value.map((image, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                <img
                  src={image.url}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/placeholder-image.png';
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="이미지 제거"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 업로드 버튼 */}
      {canAddMore && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple={multiple}
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
            id="image-upload-input"
          />
          <label htmlFor="image-upload-input">
            <Button
              type="button"
              variant="outline"
              disabled={uploading}
              className="w-full"
              asChild
            >
              <span>
                {uploading ? (
                  <>
                    <Upload className="w-4 h-4 mr-2 animate-spin" />
                    업로드 중...
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-4 h-4 mr-2" />
                    이미지 추가 ({value.length}/{maxImages})
                  </>
                )}
              </span>
            </Button>
          </label>
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}
    </div>
  );
}

