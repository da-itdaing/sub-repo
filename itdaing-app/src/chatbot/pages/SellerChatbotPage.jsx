import ChatLayout from '@/chatbot/components/ChatLayout';

/**
 * 판매자용 챗봇 페이지
 * - SellerLayout의 Outlet 영역에서 사용
 */
const SellerChatbotPage = () => {
  return (
    <div className="flex flex-1 flex-col gap-4">
      {/* 페이지 헤더 */}
      <div>
        <h1 className="text-lg font-semibold text-gray-900">AI 챗봇 도우미</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          존 추천, 운영 팁, 승인 절차 등 궁금한 점을 물어보세요
        </p>
      </div>

      {/* 챗봇 */}
      <div className="flex-1 rounded-2xl border border-gray-200 bg-white overflow-hidden">
        <ChatLayout mode="seller" />
      </div>

      {/* 안내 */}
      <p className="text-xs text-gray-400 text-center">
        AI 답변은 참고용이며, 실제 정책과 다를 수 있습니다.
      </p>
    </div>
  );
};

export default SellerChatbotPage;
