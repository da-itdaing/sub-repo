import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useKakaoLoader } from 'react-kakao-maps-sdk';
import AppRouter from './routes';
import { useAuthStore } from './store/authStore';
import { fetchKakaoMapKey } from './utils/kakaoMapLoader';

// React Query 클라이언트 생성
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5분
    },
  },
});

const KakaoLoader = ({ appkey }) => {
  useKakaoLoader({ appkey, libraries: ['services', 'clusterer', 'drawing'] });
  return null;
};

function App() {
  const initialize = useAuthStore((state) => state.initialize);
  const [kakaoKey, setKakaoKey] = useState('');
  const [keyError, setKeyError] = useState(null);

  // 앱 시작 시 토큰 복원
  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    let isMounted = true;

    const loadKey = async () => {
      try {
        const key = await fetchKakaoMapKey();
        if (isMounted) {
          setKakaoKey(key);
        }
      } catch (error) {
        console.error('[App] Failed to load Kakao Map key', error);
        if (isMounted) {
          setKeyError(error);
        }
      }
    };

    loadKey();

    return () => {
      isMounted = false;
    };
  }, []);

  if (keyError) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center text-sm text-gray-600">
        <div>
          <p className="font-semibold mb-2">카카오맵 API 키를 불러오지 못했습니다.</p>
          <p>{keyError.message}</p>
        </div>
      </div>
    );
  }

  if (!kakaoKey) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-sm text-gray-600">카카오맵을 준비하는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <KakaoLoader appkey={kakaoKey} />
      <AppRouter />
    </QueryClientProvider>
  );
}

export default App;
