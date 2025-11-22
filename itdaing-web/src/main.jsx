import { createRoot } from 'react-dom/client';
import { useState, useEffect } from 'react';
import { useKakaoLoader } from 'react-kakao-maps-sdk';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { UserProvider } from './context/UserContext';
import { getKakaoMapKey } from './services/api';
import './styles/fonts.css';
import './index.css';

// API 키를 먼저 가져오는 래퍼
function KakaoMapProvider({ children }) {
  const [appKey, setAppKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    getKakaoMapKey()
      .then(key => {
        console.log('Kakao Map API 키 로드 성공');
        setAppKey(key);
        setLoading(false);
      })
      .catch(err => {
        console.error('Kakao Map API 키 로드 실패:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f6f7fb]">
        <p className="text-gray-600">지도 API 키 로딩 중...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f6f7fb] gap-4">
        <p className="text-red-600">API 키 로드 실패: {error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-[#eb0000] text-white rounded-lg hover:bg-[#cc0000]"
        >
          새로고침
        </button>
      </div>
    );
  }
  
  // appKey가 로드된 후에만 KakaoMapInitializer 렌더링
  return <KakaoMapInitializer appKey={appKey}>{children}</KakaoMapInitializer>;
}

// useKakaoLoader Hook을 사용하는 컴포넌트
function KakaoMapInitializer({ appKey, children }) {
  // useKakaoLoader Hook 사용 (appKey가 유효할 때만 이 컴포넌트가 렌더링됨)
  const [loading, error] = useKakaoLoader({
    appkey: appKey,
    libraries: ['drawing', 'services', 'clusterer'],
  });
  
  // SDK 로딩 대기
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f6f7fb]">
        <p className="text-gray-600">카카오맵 SDK 로딩 중...</p>
      </div>
    );
  }
  
  // 에러 처리
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f6f7fb] gap-4">
        <p className="text-red-600">지도 SDK 로드 실패</p>
        <p className="text-sm text-gray-600">{String(error)}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-[#eb0000] text-white rounded-lg hover:bg-[#cc0000]"
        >
          새로고침
        </button>
      </div>
    );
  }
  
  return children;
}

function AppWrapper() {
  return (
    <KakaoMapProvider>
      <AuthProvider>
        <UserProvider>
          <App />
        </UserProvider>
      </AuthProvider>
    </KakaoMapProvider>
  );
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(<AppWrapper />);

// Register service worker for PWA (only in production)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('SW registration failed:', err);
    });
  });
}
