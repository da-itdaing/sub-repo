import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import ChatbotContent from '@/components/chatbot/ChatbotContent';

const ChatbotModal = ({ open, onClose }) => {
  if (!open || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center px-4 py-8">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-gray-200"
          aria-label="Close chatbot"
        >
          <X className="h-5 w-5" />
        </button>
        <ChatbotContent />
      </div>
    </div>,
    document.body
  );
};

export default ChatbotModal;
