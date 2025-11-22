/**
 * Kakao Map API 키 로딩 유틸리티
 */
export const fetchKakaoMapKey = async () => {
  try {
    const response = await fetch('/api/config/map-key');
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.data?.kakaoMapAppKey) {
        console.log('[KakaoMapKey] Loaded key from backend');
        return data.data.kakaoMapAppKey;
      }
    }
  } catch (error) {
    console.warn('[KakaoMapKey] Backend fetch failed, fallback to env', error);
  }

  const envKey = import.meta.env.VITE_KAKAO_MAP_KEY;
  if (envKey && envKey !== 'YOUR_KAKAO_MAP_KEY_HERE') {
    console.log('[KakaoMapKey] Loaded key from environment');
    return envKey;
  }

  throw new Error('Kakao Map API key is not configured');
};

