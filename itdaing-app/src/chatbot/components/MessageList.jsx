import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';

const TypingIndicator = () => (
  <div className="flex gap-3 justify-start">
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-50 text-[#EB0000]">
      <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#EB0000] [animation-delay:-0.3s]" />
      <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#EB0000] [animation-delay:-0.15s] mx-0.5" />
      <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#EB0000]" />
    </div>
  </div>
);

const MessageList = ({ messages, isTyping, isSlow }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, isSlow]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}

      {isTyping && <TypingIndicator />}

      {isSlow && (
        <p className="pl-14 text-xs text-gray-400">
          추천 정보를 정리하는 중이에요. 조금만 기다려 주세요!
        </p>
      )}
      
      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList;

