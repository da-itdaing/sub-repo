import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ChatbotContent from '@/components/chatbot/ChatbotContent';

const ChatbotPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <main className="flex-1 w-full max-w-[540px] md:max-w-[1200px] mx-auto bg-white px-5 md:px-8 py-10">
        <ChatbotContent />
      </main>
      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
};

export default ChatbotPage;
