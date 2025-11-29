import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { ROUTES } from '@/routes/paths';
import ChatbotModal from '@/components/chatbot/ChatbotModal';

/**
 * 챗봇 플로팅 버튼 컴포넌트
 * - 모바일: 페이지 이동
 * - 데스크톱: 모달 열기
 * - ESC 키로 모달 닫기 지원
 */
const ChatbotButton = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 데스크톱 여부 확인
  const isDesktop = useCallback(() => {
    return typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches;
  }, []);

  // 버튼 클릭 핸들러
  const handleClick = useCallback(() => {
    if (isDesktop()) {
      setIsModalOpen(true);
    } else {
      navigate(ROUTES.chatbot);
    }
  }, [isDesktop, navigate]);

  // 모달 닫기
  const handleClose = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  // ESC 키로 모달 닫기
  useEffect(() => {
    if (!isModalOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, handleClose]);

  return (
    <>
      {/* 플로팅 버튼 */}
      <button
        type="button"
        onClick={handleClick}
        className="fixed z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#EB0000] text-white shadow-lg transition-all hover:bg-[#c90000] hover:scale-105 active:scale-95 md:h-16 md:w-16"
        style={{
          bottom: 'max(7rem, calc(env(safe-area-inset-bottom, 0px) + 7rem))',
          right: 'max(1.25rem, calc((100vw - min(540px, 100vw)) / 2 + 1.25rem))',
        }}
        aria-label="AI 챗봇 열기"
      >
        <MessageCircle className="h-6 w-6 md:h-7 md:w-7" />
      </button>

      {/* 데스크톱 모달 */}
      <ChatbotModal open={isModalOpen} onClose={handleClose} />

      {/* 데스크톱 위치 조정 */}
      <style>{`
        @media (min-width: 768px) {
          button[aria-label="AI 챗봇 열기"] {
            bottom: 5.5rem !important;
            right: max(3rem, calc((100vw - 1200px) / 2 + 3rem)) !important;
          }
        }
      `}</style>
    </>
  );
};

export default ChatbotButton;
