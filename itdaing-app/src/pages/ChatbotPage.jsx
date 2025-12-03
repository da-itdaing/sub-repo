import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Store, LogIn, AlertCircle, X } from 'lucide-react';
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
 * 모드 선택 탭 컴포넌트
 */
const ModeSelector = ({ mode, setMode, isGuest }) => (
  <div className="flex items-center justify-center gap-2 p-2 bg-gray-50 border-b border-gray-200">
    <button
      type="button"
      onClick={() => setMode('consumer')}
      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
        mode === 'consumer'
          ? 'bg-rose-500 text-white shadow-md'
          : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
      }`}
    >
      <Users className="h-4 w-4" />
      소비자
    </button>
    <button
      type="button"
      onClick={() => setMode('seller')}
      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
        mode === 'seller'
          ? 'bg-blue-500 text-white shadow-md'
          : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
      }`}
    >
      <Store className="h-4 w-4" />
      판매자
    </button>
    {isGuest && (
      <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
        체험 모드
      </span>
    )}
  </div>
);

/**
 * 체험 모드 안내 배너
 */
const GuestBanner = ({ onLogin, onDismiss }) => (
  <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 px-4 py-3">
    <div className="flex items-start gap-3">
      <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-amber-800">체험 모드로 이용 중입니다</p>
        <p className="text-xs text-amber-600 mt-0.5">
          대화 내역은 페이지를 벗어나면 저장되지 않습니다.
          로그인하면 대화 내역이 유지됩니다.
        </p>
        <button
          type="button"
          onClick={onLogin}
          className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-amber-500 rounded-full hover:bg-amber-600 transition-colors"
        >
          <LogIn className="h-3 w-3" />
          로그인하기
        </button>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="p-1 hover:bg-amber-100 rounded-full transition-colors"
        aria-label="닫기"
      >
        <X className="h-4 w-4 text-amber-500" />
      </button>
    </div>
  </div>
);

/**
 * 통합 챗봇 페이지
 * - 소비자/판매자 모드 선택 가능
 * - 비로그인 시 체험 모드로 작동 (게스트 ID 사용)
 * - 페이지 이탈 시 세션 스토리지 데이터 삭제
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
      // 기존 게스트 ID 확인
      let existingGuestId = sessionStorage.getItem('chatbot_guest_id');
      
      if (!existingGuestId) {
        existingGuestId = generateGuestId();
        sessionStorage.setItem('chatbot_guest_id', existingGuestId);
      }
      
      setGuestId(existingGuestId);
    } else {
      // 로그인 시 게스트 데이터 정리
      sessionStorage.removeItem('chatbot_guest_id');
      setGuestId(null);
    }
  }, [isAuthenticated]);

  // 페이지 이탈 시 게스트 데이터 정리
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!isAuthenticated && guestId) {
        // 브라우저 닫기/새로고침 시 게스트 데이터 정리
        // 참고: beforeunload에서 세션 스토리지 조작은 브라우저마다 다를 수 있음
        sessionStorage.removeItem('chatbot_guest_id');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isAuthenticated, guestId]);

  const handleLogin = useCallback(() => {
    navigate(ROUTES.login, { state: { from: ROUTES.chatbot } });
  }, [navigate]);

  const isGuest = !isAuthenticated && !!guestId;

  return (
    <div className="flex flex-col h-dvh bg-white overflow-hidden">
      {/* 체험 모드 안내 배너 (비로그인 시만) */}
      {isGuest && showGuestBanner && (
        <GuestBanner 
          onLogin={handleLogin}
          onDismiss={() => setShowGuestBanner(false)}
        />
      )}
      
      {/* 모드 선택 탭 */}
      <ModeSelector mode={mode} setMode={setMode} isGuest={isGuest} />
      
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
