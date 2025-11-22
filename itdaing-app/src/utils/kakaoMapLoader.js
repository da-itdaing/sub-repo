/**
 * Kakao Map API 키 로딩 유틸리티
 * 
 * 우선순위:
 * 1. 환경변수 (VITE_KAKAO_MAP_KEY)
 * 2. Backend API (/api/config/map-key)
 */
export const fetchKakaoMapKey = async () => {
  // 1순위: 환경변수 (빠르고 안정적)
  const envKey = import.meta.env.VITE_KAKAO_MAP_KEY;
  if (envKey && envKey !== 'YOUR_KAKAO_MAP_KEY_HERE') {
    console.log('[KakaoMapKey] Loaded key from environment');
    return envKey;
  }

  // 2순위: Backend API (환경변수 없을 때만)
  try {
    const response = await fetch('/api/config/map-key');
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.data?.kakaoMapAppKey) {
        console.log('[KakaoMapKey] Loaded key from backend');
        return data.data.kakaoMapAppKey;
      }
    }
    console.warn('[KakaoMapKey] Backend response not ok:', response.status);
  } catch (error) {
    console.warn('[KakaoMapKey] Backend fetch failed:', error.message);
  }

  throw new Error('Kakao Map API key is not configured');
};

