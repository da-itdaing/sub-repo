import ConsumerChatbotPage from '@/chatbot/pages/ConsumerChatbotPage';

/**
 * 기존 경로(`/pages/ChatbotPage.jsx`)를 유지하기 위한 래퍼 컴포넌트
 * - 실제 구현은 `src/chatbot/pages/ConsumerChatbotPage.jsx`에서 관리한다.
 */
const ChatbotPage = () => {
  return <ConsumerChatbotPage />;
};

export default ChatbotPage;
