import { useState } from 'react';
import { ImageOff } from 'lucide-react';
import clsx from 'clsx';

/**
 * 이미지 로드 실패 시 플레이스홀더를 표시하는 컴포넌트
 */
const ImageWithFallback = ({
  src,
  alt = '',
  className = '',
  placeholderClassName = '',
  placeholderText = '이미지 없음',
  showIcon = true,
  iconSize = 'md',
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  // 이미지 URL이 없거나 에러 발생 시 플레이스홀더 표시
  if (!src || hasError) {
    return (
      <div
        className={clsx(
          'flex flex-col items-center justify-center bg-gray-100 text-gray-400',
          className,
          placeholderClassName
        )}
        {...props}
      >
        {showIcon && <ImageOff className={clsx(iconSizes[iconSize], 'mb-1')} />}
        <span className="text-xs font-medium">{placeholderText}</span>
      </div>
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

