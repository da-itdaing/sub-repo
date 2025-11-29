import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ChatLayout from '@/chatbot/components/ChatLayout';

/**
 * 소비자용 챗봇 페이지
 * - 기존 ChatbotPage.jsx의 구조를 그대로 옮겨온 버전
 * - 중앙 컨텐츠 영역에서 ChatLayout을 사용한다.
 */
const ConsumerChatbotPage = () => {
  return (
    <div className="flex min-h-screen flex-col bg-gray-100">
      <Header />
      <main className="flex-1 w-full max-w-[540px] md:max-w-[1200px] mx-auto bg-white px-5 md:px-8 py-10">
        <ChatLayout mode="consumer" />
      </main>
      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
};

export default ConsumerChatbotPage;


