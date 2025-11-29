import ChatLayout from '@/chatbot/components/ChatLayout';

/**
 * 판매자용 챗봇 페이지
 * - SellerLayout의 Outlet 영역에서 사용할 수 있는 전용 페이지 컴포넌트
 * - 현재는 소비자와 동일한 ChatLayout을 사용하며,
 *   향후 판매자 전용 가이드/툴바를 상단에 추가할 수 있다.
 */
const SellerChatbotPage = () => {
  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-4">
        <h1 className="text-lg font-semibold text-gray-900">챗봇 도우미</h1>
        <p className="mt-1 text-sm text-gray-500">
          팝업 운영, 승인, 통계와 관련한 질문을 챗봇에게 물어볼 수 있어요.
        </p>
      </div>
      <div className="rounded-3xl border border-gray-100 bg-white px-4 py-6 md:px-6 md:py-8">
        <ChatLayout mode="seller" />
      </div>
    </div>
  );
};

export default SellerChatbotPage;


