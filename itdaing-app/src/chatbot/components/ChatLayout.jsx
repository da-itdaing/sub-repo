import { useEffect } from 'react';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import RecommendationPanel from './RecommendationPanel';
import useChatSession from '@/chatbot/hooks/useChatSession';

/**
 * 챗봇 공통 레이아웃 (실제 구현체)
 */
const ChatLayout = ({ mode = 'consumer' }) => {
  const { messages, isLoading, isSlow, recommendations, sendMessage, resetSession } = useChatSession({ mode });
  const subtitle =
    mode === 'seller'
      ? '존 추천, 운영 팁, 승인 절차 등 궁금한 점을 챗봇에게 물어보세요!'
      : '플리마켓·팝업 방문 관련 궁금한 점을 물어보세요!';

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-gray-50/50 shadow-sm" style={{ minHeight: '500px' }}>
      {/* 헤더 */}
      <div className="flex items-center justify-between border-b border-gray-100 bg-white px-5 py-4 shrink-0">
        <div>
          <h2 className="text-base font-bold text-gray-900">다잇다잉 AI 챗봇</h2>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
        <button
          onClick={resetSession}
          className="text-xs text-gray-400 hover:text-gray-600 underline"
        >
          대화 초기화
        </button>
      </div>

      {/* 메시지 영역 - 스크롤 가능 */}
      <div className="flex-1 overflow-hidden">
        <MessageList messages={messages} isTyping={isLoading} isSlow={isSlow} />
      </div>

      {/* 추천 카드 + 지도 - 스크롤 가능 */}
      {recommendations.length > 0 && (
        <div className="shrink-0 max-h-[40%] overflow-y-auto">
          <RecommendationPanel items={recommendations} mode={mode} />
        </div>
      )}

      {/* 입력 영역 - 고정 */}
      <div className="shrink-0">
        <ChatInput onSend={sendMessage} disabled={isLoading} />
      </div>
    </div>
  );
};

export default ChatLayout;
