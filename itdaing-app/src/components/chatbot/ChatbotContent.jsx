import ChatLayout from '@/chatbot/components/ChatLayout';

const ChatbotContent = ({ className = '' }) => {
  return (
    <div className={`h-full ${className}`}>
      <ChatLayout mode="consumer" />
    </div>
  );
};

export default ChatbotContent;
