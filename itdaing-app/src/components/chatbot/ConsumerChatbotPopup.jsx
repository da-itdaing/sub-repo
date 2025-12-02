import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Minus, Maximize2, MessageCircle } from 'lucide-react';
import ChatbotContent from '@/components/chatbot/ChatbotContent';

const MOBILE_BOTTOM_NAV_HEIGHT_PX = 64; // BottomNav 높이(h-16)
const MOBILE_BUTTON_GAP_PX = 24; // 여유 공간
const POPUP_GAP_PX = 16;
const DESKTOP_BOTTOM_NAV_HEIGHT_PX = 88; // BottomNav md:h-22
const DESKTOP_BUTTON_GAP_PX = 32;
const DESKTOP_POPUP_GAP_PX = 24;
const MOBILE_CONTAINER_WIDTH_PX = 540;
const DESKTOP_CONTAINER_WIDTH_PX = 1200;
const MOBILE_BUTTON_SIDE_GAP_PX = 20;
const DESKTOP_BUTTON_SIDE_GAP_PX = 32;

const BUTTON_BOTTOM_OFFSET = `calc(env(safe-area-inset-bottom, 0px) + ${
  MOBILE_BOTTOM_NAV_HEIGHT_PX + MOBILE_BUTTON_GAP_PX
}px)`;
const POPUP_BOTTOM_OFFSET = `calc(env(safe-area-inset-bottom, 0px) + ${
  MOBILE_BOTTOM_NAV_HEIGHT_PX + POPUP_GAP_PX
}px)`;
const BUTTON_BOTTOM_OFFSET_DESKTOP = `calc(env(safe-area-inset-bottom, 0px) + ${
  DESKTOP_BOTTOM_NAV_HEIGHT_PX + DESKTOP_BUTTON_GAP_PX
}px)`;
const POPUP_BOTTOM_OFFSET_DESKTOP = `calc(env(safe-area-inset-bottom, 0px) + ${
  DESKTOP_BOTTOM_NAV_HEIGHT_PX + DESKTOP_POPUP_GAP_PX
}px)`;
const BUTTON_RIGHT_OFFSET = `calc((100vw - min(${MOBILE_CONTAINER_WIDTH_PX}px, 100vw)) / 2 + ${MOBILE_BUTTON_SIDE_GAP_PX}px)`;
const DESKTOP_BUTTON_RIGHT_OFFSET = `calc((100vw - min(${DESKTOP_CONTAINER_WIDTH_PX}px, 100vw)) / 2 + ${DESKTOP_BUTTON_SIDE_GAP_PX}px)`;

/**
 * 소비자용 플로팅 챗봇 팝업
 * - 우측 하단에 플로팅 버튼
 * - 클릭 시 팝업 형태로 열림
 * - 탭 이동 중에도 유지됨
 * - 최소화/최대화 기능
 */
const ConsumerChatbotPopup = () => {
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
          className="fixed z-[100] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#EB0000] to-[#c90000] text-white shadow-lg shadow-red-500/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-red-500/40 active:scale-95"
          style={{
            bottom: BUTTON_BOTTOM_OFFSET,
            right: BUTTON_RIGHT_OFFSET,
          }}
          aria-label="AI 챗봇 열기"
        >
          <MessageCircle className="h-6 w-6" />
          {/* 알림 뱃지 (최소화 상태) */}
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
          data-chatbot-floating={isMaximized ? undefined : 'true'}
          className={`fixed z-[110] flex flex-col bg-white shadow-2xl transition-all duration-300 ${
            isMaximized
              ? 'inset-4 rounded-2xl'
              : 'bottom-6 right-4 w-[380px] h-[550px] max-h-[75vh] rounded-2xl md:w-[420px] md:h-[600px]'
          }`}
          style={!isMaximized
            ? {
                bottom: POPUP_BOTTOM_OFFSET,
              }
            : undefined}
          role="dialog"
          aria-modal="false"
          aria-labelledby="consumer-chatbot-title"
        >
          {/* 헤더 */}
          <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-[#EB0000] to-[#c90000] px-4 py-3 rounded-t-2xl">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                <MessageCircle className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 id="consumer-chatbot-title" className="text-sm font-bold text-white">
                  다잇다잉 AI
                </h2>
                <p className="text-[10px] text-white/70">광주 플리마켓 추천</p>
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

              {/* 최대화 버튼 */}
              <button
                type="button"
                onClick={handleMaximize}
                className="flex h-7 w-7 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                aria-label={isMaximized ? '원래 크기로' : '최대화'}
              >
                <Maximize2 className="h-4 w-4" />
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

          {/* 챗봇 콘텐츠 */}
          <div className="flex-1 overflow-hidden">
            <ChatbotContent mode="consumer" className="h-full" />
          </div>
        </div>
      )}

      {/* 데스크톱 위치 조정 */}
      <style>{`
        @media (min-width: 768px) {
          button[aria-label="AI 챗봇 열기"] {
            bottom: ${BUTTON_BOTTOM_OFFSET_DESKTOP} !important;
            right: ${DESKTOP_BUTTON_RIGHT_OFFSET} !important;
          }
          div[data-chatbot-floating="true"] {
            bottom: ${POPUP_BOTTOM_OFFSET_DESKTOP} !important;
            right: ${DESKTOP_BUTTON_RIGHT_OFFSET} !important;
          }
        }
      `}</style>
    </>,
    document.body
  );
};

export default ConsumerChatbotPopup;

