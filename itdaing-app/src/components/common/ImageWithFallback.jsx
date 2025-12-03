import { useState } from 'react';
import clsx from 'clsx';

// 외부 Placeholder 이미지 URL (via.placeholder.com 사용)
const FALLBACK_IMAGE_URL = 'https://via.placeholder.com/400x300/f3f4f6/9ca3af?text=No+Image';

/**
 * 이미지 로드 실패 시 외부 placeholder 이미지를 표시하는 컴포넌트
 */
const ImageWithFallback = ({
  src,
  alt = '',
  className = '',
  placeholderClassName = '',
  fallbackSrc = FALLBACK_IMAGE_URL,
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 이미지 URL이 없거나 에러 발생 시 외부 placeholder 이미지 표시
  if (!src || hasError) {
    return (
      <img
        src={fallbackSrc}
        alt={alt || '이미지 없음'}
        className={clsx(className, placeholderClassName)}
        {...props}
      />
    );
  }

  return (
    <>
      {isLoading && (
        <div
          className={clsx(
            'flex items-center justify-center bg-gray-100 animate-pulse',
            className
          )}
        >
          <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-400 rounded-full animate-spin" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={clsx(className, isLoading && 'hidden')}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
        {...props}
      />
    </>
  );
};

export default ImageWithFallback;

