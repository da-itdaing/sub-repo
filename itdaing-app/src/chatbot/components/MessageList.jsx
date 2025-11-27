import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';

/**
 * 메시지 리스트 영역
 * - 스크롤 자동 이동 처리
 */
const MessageList = ({ messages, isLoading }) => {
  const bottomRef = useRef(null);

  // 새 메시지 추가 시 자동 스크롤
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}

      {isLoading && (
        <div className="flex gap-3 justify-start">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-50 text-[#EB0000]">
            <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#EB0000] [animation-delay:-0.3s]" />
            <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#EB0000] [animation-delay:-0.15s] mx-0.5" />
            <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#EB0000]" />
          </div>
        </div>
      )}
      
      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList;

