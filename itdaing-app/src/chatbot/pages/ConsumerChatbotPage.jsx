import Header from '@/components/layout/Header';
import ChatLayout from '@/chatbot/components/ChatLayout';

/**
 * 소비자용 챗봇 페이지
 * - 모바일 앱 비율 (540px) 최적화
 * - 화면 전체를 챗봇이 차지하도록 구성
 */
const ConsumerChatbotPage = () => {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      {/* 챗봇 영역 - 화면 전체 사용 */}
      <main className="flex-1 flex flex-col w-full max-w-[540px] mx-auto">
        <ChatLayout mode="consumer" />
      </main>
    </div>
  );
};

export default ConsumerChatbotPage;
