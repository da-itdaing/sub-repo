import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { ROUTES } from '@/routes/paths';
import ChatbotModal from '@/components/chatbot/ChatbotModal';

const ChatbotButton = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleNavigate = () => {
    navigate(ROUTES.chatbot);
  };

  const handleClick = () => {
    const isDesktop = typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches;
    if (isDesktop) {
      setIsModalOpen(true);
    } else {
      handleNavigate();
    }
  };

  useEffect(() => {
    if (!isModalOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  return (
    <>
      <button
        data-chatbot-button
        onClick={handleClick}
        className="fixed w-12 h-12 md:w-16 md:h-16 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-colors flex items-center justify-center z-40"
        aria-label="Open chatbot"
      >
        <MessageCircle className="w-6 h-6 md:w-8 md:h-8" />
      </button>
      <ChatbotModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <style>{`
        button[data-chatbot-button] {
          bottom: 7rem;
          right: max(1.25rem, calc((100vw - min(540px, 100vw)) / 2 + 1.25rem));
        }

        @media (min-width: 768px) {
          button[data-chatbot-button] {
            bottom: 5.5rem;
            right: max(3rem, calc((100vw - 1200px) / 2 + 3rem));
          }
        }
      `}</style>
    </>
  );
};

export default ChatbotButton;
