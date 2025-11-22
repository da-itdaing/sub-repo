/**
 * 이미지 URL 유틸리티 함수
 * 백엔드에서 반환하는 ImagePayload 객체 또는 문자열 URL을 처리합니다.
 */

/**
 * ImagePayload 타입 정의
 * @typedef {Object} ImagePayload
 * @property {string} url - 이미지 URL
 * @property {string} [key] - 저장소의 원본 key (S3 object key 등)
 */

/**
 * 이미지 URL을 추출합니다.
 * ImagePayload 객체인 경우 url을 반환하고, 문자열인 경우 그대로 반환합니다.
 * 값이 없거나 유효하지 않은 경우 fallback을 반환합니다.
 * 
 * @param {ImagePayload|string|null|undefined} imagePayloadOrString - ImagePayload 객체 또는 문자열 URL
 * @param {string} [fallback] - 이미지가 없을 때 사용할 기본 이미지 URL
 * @returns {string} 이미지 URL
 * 
 * @example
 * // ImagePayload 객체인 경우
 * getImageUrl({ url: 'https://example.com/image.png' }, 'default.png')
 * // => 'https://example.com/image.png'
 * 
 * // 문자열인 경우
 * getImageUrl('https://example.com/image.png', 'default.png')
 * // => 'https://example.com/image.png'
 * 
 * // 값이 없는 경우
 * getImageUrl(null, 'default.png')
 * // => 'default.png'
 */
export function getImageUrl(imagePayloadOrString, fallback = '') {
  if (!imagePayloadOrString) {
    return fallback;
  }

  // ImagePayload 객체인 경우 (url 속성이 있는 경우)
  if (typeof imagePayloadOrString === 'object' && imagePayloadOrString !== null && 'url' in imagePayloadOrString) {
    const url = imagePayloadOrString.url;
    return (url && typeof url === 'string' && url.trim()) ? url.trim() : fallback;
  }

  // 문자열인 경우
  if (typeof imagePayloadOrString === 'string') {
    const trimmed = imagePayloadOrString.trim();
    return trimmed || fallback;
  }

  // 기타 경우 fallback 반환
  return fallback;
}

/**
 * 여러 이미지 URL을 추출합니다.
 * 
 * @param {ImagePayload[]|string[]|null|undefined} images - ImagePayload 배열 또는 문자열 배열
 * @param {string} [fallback] - 이미지가 없을 때 사용할 기본 이미지 URL
 * @returns {string[]} 이미지 URL 배열
 */
export function getImageUrls(images, fallback = '') {
  if (!Array.isArray(images) || images.length === 0) {
    return [];
  }

  return images.map(img => getImageUrl(img, fallback)).filter(url => url);
}

