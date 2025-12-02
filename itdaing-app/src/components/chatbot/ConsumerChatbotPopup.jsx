import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { ROUTES } from '@/routes/paths';

const MOBILE_BOTTOM_NAV_HEIGHT_PX = 64; // BottomNav 높이(h-16)
const MOBILE_BUTTON_GAP_PX = 24; // 여유 공간
const DESKTOP_BOTTOM_NAV_HEIGHT_PX = 88; // BottomNav md:h-22
const DESKTOP_BUTTON_GAP_PX = 32;
const MOBILE_CONTAINER_WIDTH_PX = 540;
const DESKTOP_CONTAINER_WIDTH_PX = 1200;
const MOBILE_BUTTON_SIDE_GAP_PX = 20;
const DESKTOP_BUTTON_SIDE_GAP_PX = 32;

const BUTTON_BOTTOM_OFFSET = `calc(env(safe-area-inset-bottom, 0px) + ${
  MOBILE_BOTTOM_NAV_HEIGHT_PX + MOBILE_BUTTON_GAP_PX
}px)`;
const BUTTON_BOTTOM_OFFSET_DESKTOP = `calc(env(safe-area-inset-bottom, 0px) + ${
  DESKTOP_BOTTOM_NAV_HEIGHT_PX + DESKTOP_BUTTON_GAP_PX
}px)`;
const BUTTON_RIGHT_OFFSET = `calc((100vw - min(${MOBILE_CONTAINER_WIDTH_PX}px, 100vw)) / 2 + ${MOBILE_BUTTON_SIDE_GAP_PX}px)`;
const DESKTOP_BUTTON_RIGHT_OFFSET = `calc((100vw - min(${DESKTOP_CONTAINER_WIDTH_PX}px, 100vw)) / 2 + ${DESKTOP_BUTTON_SIDE_GAP_PX}px)`;

/**
 * 소비자용 플로팅 챗봇 버튼
 * - 우측 하단에 플로팅 버튼
 * - 클릭 시 /chatbot 페이지로 이동
 */
const ConsumerChatbotPopup = () => {
  const navigate = useNavigate();

  // 버튼 클릭 시 챗봇 페이지로 이동
  const handleClick = () => {
    navigate(ROUTES.chatbot);
  };

  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <>
      {/* 플로팅 버튼 - 클릭 시 챗봇 페이지로 이동 */}
      <button
        type="button"
        onClick={handleClick}
        className="fixed z-[100] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#EB0000] to-[#c90000] text-white shadow-lg shadow-red-500/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-red-500/40 active:scale-95"
        style={{
          bottom: BUTTON_BOTTOM_OFFSET,
          right: BUTTON_RIGHT_OFFSET,
        }}
        aria-label="AI 챗봇 열기"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {/* 데스크톱 위치 조정 */}
      <style>{`
        @media (min-width: 768px) {
          button[aria-label="AI 챗봇 열기"] {
            bottom: ${BUTTON_BOTTOM_OFFSET_DESKTOP} !important;
            right: ${DESKTOP_BUTTON_RIGHT_OFFSET} !important;
          }
        }
      `}</style>
    </>,
    document.body
  );
};

export default ConsumerChatbotPopup;

