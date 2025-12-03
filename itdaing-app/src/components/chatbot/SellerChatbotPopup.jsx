import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Minus, Maximize2, Minimize2, MessageCircle } from 'lucide-react';
import ChatbotContent from '@/components/chatbot/ChatbotContent';

/**
 * 판매자용 플로팅 챗봇 팝업
 * - 우측 하단에 플로팅 버튼
 * - 클릭 시 팝업 형태로 열림
 * - 탭 이동 중에도 유지됨
 * - 최소화/최대화 기능
 */
const SellerChatbotPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  // ESC 키로 닫기
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleToggle = useCallback(() => {
    if (isMinimized) {
      setIsMinimized(false);
    } else {
      setIsOpen((prev) => !prev);
    }
  }, [isMinimized]);

  const handleMinimize = useCallback(() => {
    setIsMinimized(true);
  }, []);

  const handleMaximize = useCallback(() => {
    setIsMaximized((prev) => !prev);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setIsMinimized(false);
    setIsMaximized(false);
  }, []);

  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <>
      {/* 플로팅 버튼 - 챗봇이 닫혀있거나 최소화 상태일 때 표시 */}
      {(!isOpen || isMinimized) && (
        <button
          type="button"
          onClick={handleToggle}
          className="fixed bottom-6 right-6 z-[100] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#ff235b] to-[#c4006b] text-white shadow-lg shadow-primary/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-primary/40 active:scale-95"
          aria-label="AI 챗봇 열기"
        >
          <MessageCircle className="h-6 w-6" />
          {/* 알림 뱃지 (선택사항) */}
          {isMinimized && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white">
              1
            </span>
          )}
        </button>
      )}

      {/* 챗봇 팝업 */}
      {isOpen && !isMinimized && (
        <div
          className={`fixed z-[110] flex flex-col bg-white shadow-2xl transition-all duration-300 ${
            isMaximized
              ? 'inset-4 rounded-2xl'
              : 'bottom-6 right-6 w-[400px] h-[600px] max-h-[80vh] rounded-2xl'
          }`}
          role="dialog"
          aria-modal="false"
          aria-labelledby="seller-chatbot-title"
        >
          {/* 헤더 */}
          <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-[#ff235b] to-[#c4006b] px-4 py-3 rounded-t-2xl">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                <MessageCircle className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 id="seller-chatbot-title" className="text-sm font-bold text-white">
                  다잇다잉 셀러 AI
                </h2>
                <p className="text-[10px] text-white/70">판매자 전용 도우미</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* 최소화 버튼 */}
              <button
                type="button"
                onClick={handleMinimize}
                className="flex h-7 w-7 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                aria-label="최소화"
              >
                <Minus className="h-4 w-4" />
              </button>

              {/* 최대화/축소 버튼 - 상태에 따라 아이콘 변경 */}
              <button
                type="button"
                onClick={handleMaximize}
                className="flex h-7 w-7 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                aria-label={isMaximized ? '원래 크기로' : '최대화'}
              >
                {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>

              {/* 닫기 버튼 */}
              <button
                type="button"
                onClick={handleClose}
                className="flex h-7 w-7 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                aria-label="닫기"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* 챗봇 콘텐츠 - flex-1과 min-h-0으로 스크롤 영역 확보 */}
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <ChatbotContent mode="seller" className="h-full" />
          </div>
        </div>
      )}
    </>,
    document.body
  );
};

export default SellerChatbotPopup;

