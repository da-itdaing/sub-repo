import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import ChatbotContent from '@/components/chatbot/ChatbotContent';

/**
 * 챗봇 모달 컴포넌트 (데스크톱용)
 * - Portal을 사용하여 body에 렌더링
 * - 배경 클릭 또는 X 버튼으로 닫기
 * - 접근성(aria) 속성 포함
 * - mode prop으로 consumer/seller 챗봇 구분
 * 
 * @param {Object} props
 * @param {boolean} props.open - 모달 열림 상태
 * @param {Function} props.onClose - 닫기 콜백
 * @param {'consumer' | 'seller'} props.mode - 챗봇 모드 (기본: consumer)
 */
const ChatbotModal = ({ open, onClose, mode = 'consumer' }) => {
  // 서버 사이드 렌더링 또는 닫힌 상태에서는 렌더링하지 않음
  if (!open || typeof document === 'undefined') {
    return null;
  }

  const isSeller = mode === 'seller';
  const titleText = isSeller ? '다잇다잉 셀러 AI' : '다잇다잉 AI 챗봇';

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
        {/* 닫기 버튼 */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-800"
          aria-label="챗봇 닫기"
        >
          <X className="h-5 w-5" />
        </button>

        {/* 숨겨진 제목 (접근성용) */}
        <h2 id="chatbot-modal-title" className="sr-only">
          {titleText}
        </h2>

        {/* 챗봇 콘텐츠 */}
        <div className="flex-1 p-4 md:p-6 overflow-hidden">
          <ChatbotContent mode={mode} />
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ChatbotModal;
