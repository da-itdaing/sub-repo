import ChatLayout from '@/chatbot/components/ChatLayout';

/**
 * 챗봇 콘텐츠 래퍼 컴포넌트
 * - ChatLayout을 감싸서 높이/스타일 조정
 * - 모달 및 페이지에서 공통으로 사용
 */
const ChatbotContent = ({ className = '', mode = 'consumer' }) => {
  return (
    <div className={`flex flex-col h-full overflow-hidden ${className}`}>
      <ChatLayout mode={mode} />
    </div>
  );
};

export default ChatbotContent;
