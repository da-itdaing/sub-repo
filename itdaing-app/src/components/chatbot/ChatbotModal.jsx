import { createPortal } from 'react-dom';
import { X, MessageCircle } from 'lucide-react';
import ChatbotContent from '@/components/chatbot/ChatbotContent';

/**
 * 소비자용 챗봇 모달 컴포넌트
 * - Portal을 사용하여 body에 렌더링
 * - 배경 클릭 또는 X 버튼으로 닫기
 * - 접근성(aria) 속성 포함
 * - 전체 화면 모달 형태
 * 
 * @param {Object} props
 * @param {boolean} props.open - 모달 열림 상태
 * @param {Function} props.onClose - 닫기 콜백
 */
const ChatbotModal = ({ open, onClose }) => {
  // 서버 사이드 렌더링 또는 닫힌 상태에서는 렌더링하지 않음
  if (!open || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="chatbot-modal-title"
    >
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 모달 컨테이너 */}
      <div className="relative w-full max-w-4xl h-[85vh] max-h-[800px] rounded-3xl bg-white shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* 헤더 */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-[#ff235b] to-[#c4006b] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <MessageCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 id="chatbot-modal-title" className="text-base font-bold text-white">
                다잇다잉 AI 챗봇
              </h2>
              <p className="text-xs text-white/70">광주 플리마켓 추천 도우미</p>
            </div>
          </div>

          {/* 닫기 버튼 */}
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/20 hover:text-white"
            aria-label="챗봇 닫기"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 챗봇 콘텐츠 */}
        <div className="flex-1 overflow-hidden">
          <ChatbotContent mode="consumer" className="h-full" />
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ChatbotModal;
