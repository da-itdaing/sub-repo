import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Store, LogIn, Home, X } from 'lucide-react';
import ConsumerChatbotPage from '@/chatbot/pages/ConsumerChatbotPage';
import SellerChatbotPage from '@/chatbot/pages/SellerChatbotPage';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/routes/paths';

/**
 * 게스트 ID 생성 (uuid v4 스타일)
 */
const generateGuestId = () => {
  return `guest-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * 컴팩트 헤더 - 홈 버튼 + 모드 선택 + 체험 모드 뱃지
 */
const CompactHeader = ({ mode, setMode, isGuest, onGoHome, onLogin }) => (
  <header className="shrink-0 flex items-center justify-between px-3 py-2 bg-white border-b border-gray-200">
    {/* 왼쪽: 홈 버튼 */}
    <button
      type="button"
      onClick={onGoHome}
      className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors"
      aria-label="홈으로"
    >
      <Home className="h-5 w-5 text-gray-600" />
    </button>

    {/* 중앙: 모드 선택 (컴팩트 토글) */}
    <div className="flex items-center bg-gray-100 rounded-full p-0.5">
      <button
        type="button"
        onClick={() => setMode('consumer')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
          mode === 'consumer'
            ? 'bg-rose-500 text-white shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <Users className="h-3.5 w-3.5" />
        <span className="hidden xs:inline">소비자</span>
      </button>
      <button
        type="button"
        onClick={() => setMode('seller')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
          mode === 'seller'
            ? 'bg-blue-500 text-white shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <Store className="h-3.5 w-3.5" />
        <span className="hidden xs:inline">판매자</span>
      </button>
    </div>

    {/* 오른쪽: 체험 모드 뱃지 또는 로그인 */}
    {isGuest ? (
      <button
        type="button"
        onClick={onLogin}
        className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 text-[10px] font-medium rounded-full hover:bg-amber-200 transition-colors"
      >
        <LogIn className="h-3 w-3" />
        체험중
      </button>
    ) : (
      <div className="w-8" /> /* 균형을 위한 빈 공간 */
    )}
  </header>
);

/**
 * 체험 모드 슬라이드 배너 (접을 수 있음)
 */
const GuestBanner = ({ onLogin, onDismiss }) => (
  <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 px-3 py-2">
    <div className="flex items-center gap-2">
      <div className="flex-1 min-w-0">
        <p className="text-xs text-amber-700">
          <span className="font-medium">체험 모드</span> · 로그인하면 대화 내역이 유지됩니다
        </p>
      </div>
      <button
        type="button"
        onClick={onLogin}
        className="shrink-0 px-2.5 py-1 text-[10px] font-semibold text-white bg-amber-500 rounded-full hover:bg-amber-600 transition-colors"
      >
        로그인
      </button>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 p-1 hover:bg-amber-100 rounded-full transition-colors"
        aria-label="닫기"
      >
        <X className="h-3.5 w-3.5 text-amber-500" />
      </button>
    </div>
  </div>
);

/**
 * 통합 챗봇 페이지
 * - 소비자/판매자 모드 선택 가능
 * - 비로그인 시 체험 모드로 작동 (게스트 ID 사용)
 * - 컴팩트한 헤더 + 홈 버튼
 */
const ChatbotPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, role, user } = useAuthStore();
  
  // 모드 상태 (로그인 시 역할에 따라 초기값 설정)
  const [mode, setMode] = useState(() => {
    const currentRole = user?.role || role;
    if (currentRole === 'SELLER') return 'seller';
    return 'consumer';
  });
  
  // 게스트 상태
  const [guestId, setGuestId] = useState(null);
  const [showGuestBanner, setShowGuestBanner] = useState(true);
  
  // 비로그인 시 게스트 ID 생성 (세션 스토리지 사용)
  useEffect(() => {
    if (!isAuthenticated) {
      let existingGuestId = sessionStorage.getItem('chatbot_guest_id');
      
      if (!existingGuestId) {
        existingGuestId = generateGuestId();
        sessionStorage.setItem('chatbot_guest_id', existingGuestId);
      }
      
      setGuestId(existingGuestId);
    } else {
      sessionStorage.removeItem('chatbot_guest_id');
      setGuestId(null);
    }
  }, [isAuthenticated]);

  // 페이지 이탈 시 게스트 데이터 정리
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!isAuthenticated && guestId) {
        sessionStorage.removeItem('chatbot_guest_id');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isAuthenticated, guestId]);

  const handleGoHome = useCallback(() => {
    navigate(ROUTES.home);
  }, [navigate]);

  const handleLogin = useCallback(() => {
    navigate(ROUTES.login, { state: { from: ROUTES.chatbot } });
  }, [navigate]);

  const isGuest = !isAuthenticated && !!guestId;

  return (
    <div className="flex flex-col h-dvh bg-white overflow-hidden">
      {/* 컴팩트 헤더 */}
      <CompactHeader 
        mode={mode} 
        setMode={setMode} 
        isGuest={isGuest}
        onGoHome={handleGoHome}
        onLogin={handleLogin}
      />

      {/* 체험 모드 안내 배너 (비로그인 시만, 첫 방문 시) */}
      {isGuest && showGuestBanner && (
        <GuestBanner 
          onLogin={handleLogin}
          onDismiss={() => setShowGuestBanner(false)}
        />
      )}
      
      {/* 챗봇 컨텐츠 */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {mode === 'consumer' ? (
          <ConsumerChatbotPage hideHeader guestId={guestId} />
        ) : (
          <SellerChatbotPage hideHeader guestId={guestId} />
        )}
      </main>
    </div>
  );
};

export default ChatbotPage;
