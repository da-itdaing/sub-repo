import React, { useMemo, useState } from "react";
import { FALLBACK_IMAGES } from "../../constants/fallbackImages";

const ERROR_IMG_SRC =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg==";

type ImageWithFallbackProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  /**
   * Optional deterministic key to map to a fallback image.
   * Passing an id (e.g. popup id) keeps the fallback consistent.
   */
  fallbackKey?: number | string;
};

const FALLBACK_COUNT = FALLBACK_IMAGES.length;

function resolveFallback(fallbackKey?: number | string) {
  if (FALLBACK_COUNT === 0) {
    return ERROR_IMG_SRC;
  }
  if (typeof fallbackKey === "number" && Number.isFinite(fallbackKey)) {
    const index = Math.abs(Math.trunc(fallbackKey)) % FALLBACK_COUNT;
    return FALLBACK_IMAGES[index];
  }
  if (typeof fallbackKey === "string" && fallbackKey.length > 0) {
    let hash = 0;
    for (let i = 0; i < fallbackKey.length; i += 1) {
      hash = (hash * 31 + fallbackKey.charCodeAt(i)) | 0;
    }
    return FALLBACK_IMAGES[Math.abs(hash) % FALLBACK_COUNT];
  }
  return FALLBACK_IMAGES[Math.floor(Math.random() * FALLBACK_COUNT)];
}

export function ImageWithFallback(props: ImageWithFallbackProps) {
  const { src, alt, style, className, fallbackKey, ...rest } = props;
  const [didError, setDidError] = useState(false);
  const [showPlaceholder, setShowPlaceholder] = useState(false);

  const fallbackSrc = useMemo(() => resolveFallback(fallbackKey), [fallbackKey]);

  const displaySrc = showPlaceholder ? ERROR_IMG_SRC : !src || didError ? fallbackSrc : src;

  const handleError = () => {
    if (!src || didError) {
      setShowPlaceholder(true);
      return;
    }
    setDidError(true);
  };

  if (showPlaceholder) {
    return (
      <div
        className={`inline-block bg-gray-100 text-center align-middle ${className ?? ""}`}
        style={style}
      >
        <div className="flex items-center justify-center w-full h-full">
          <img
            src={ERROR_IMG_SRC}
            alt={alt ?? "이미지를 불러오지 못했어요"}
            {...rest}
            data-original-url={src}
          />
        </div>
      </div>
    );
  }

  return (
    <img
      src={displaySrc}
      alt={alt}
      className={className}
      style={style}
      onError={handleError}
      data-original-url={src}
      {...rest}
    />
  );
}
