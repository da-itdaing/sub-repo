import { useState, useRef } from 'react';
import { X, Plus, Image as ImageIcon } from 'lucide-react';
import { uploadImage } from '@/services/uploadService';
import { useToast } from '@/hooks/useToast';

const ImageUploader = ({ images = [], onChange, maxImages = 5 }) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const { addToast } = useToast();

  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    if (images.length + files.length > maxImages) {
      addToast({
        title: `이미지는 최대 ${maxImages}장까지 업로드할 수 있습니다.`,
        variant: 'error',
      });
      return;
    }

    setIsUploading(true);
    try {
      const uploadPromises = files.map((file) => uploadImage(file));
      const newImages = await Promise.all(uploadPromises); // Returns objects {url, key}
      onChange([...images, ...newImages]);
    } catch (error) {
      console.error('Image upload error:', error);
      addToast({
        title: '이미지 업로드 실패',
        description: error?.message || '잠시 후 다시 시도해주세요.',
        variant: 'error',
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (indexToRemove) => {
    onChange(images.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-800">사진 첨부</p>
        <span className="text-xs text-gray-500">
          {images.length} / {maxImages}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {images.map((img, index) => {
          // images can be array of strings (legacy) or objects {url, key}
          const src = typeof img === 'string' ? img : img.url;
          const key = typeof img === 'string' ? `${img}-${index}` : img.key || `${img.url}-${index}`;
          
          return (
            <div key={key} className="relative h-20 w-20 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
              <img 
                src={src} 
                alt={`review-${index}`} 
                className="h-full w-full object-cover aspect-square" 
              />
            <button
              type="button"
              onClick={() => removeImage(index)}
                className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white hover:bg-black/70 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
          );
        })}

        {images.length < maxImages && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-gray-300 bg-gray-50 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
          >
            {isUploading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
            ) : (
              <>
                <Plus className="h-5 w-5" />
                <span className="text-[10px]">추가</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default ImageUploader;

