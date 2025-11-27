import { useEffect } from 'react';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import useChatSession from '@/chatbot/hooks/useChatSession';

/**
 * 챗봇 공통 레이아웃 (실제 구현체)
 */
const ChatLayout = () => {
  const { messages, isLoading, sendMessage, resetSession } = useChatSession();

  // 마운트 시(또는 세션이 비었을 때) 초기화 로직이 필요하다면 여기서 처리
  // 현재는 useChatSession 내부나 여기서 초기 메시지를 주입할 수 있음

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-gray-50/50 shadow-sm">
      {/* 헤더 (선택사항) */}
      <div className="flex items-center justify-between border-b border-gray-100 bg-white px-5 py-4">
        <div>
          <h2 className="text-base font-bold text-gray-900">다잇다잉 AI 챗봇</h2>
          <p className="text-xs text-gray-500">무엇이든 물어보세요!</p>
        </div>
        <button
          onClick={resetSession}
          className="text-xs text-gray-400 hover:text-gray-600 underline"
        >
          대화 초기화
        </button>
      </div>

      {/* 메시지 영역 */}
      <MessageList messages={messages} isLoading={isLoading} />

      {/* 입력 영역 */}
      <ChatInput onSend={sendMessage} disabled={isLoading} />
    </div>
  );
};

export default ChatLayout;
