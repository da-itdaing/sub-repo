import { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import MessageBubble from './MessageBubble';

/**
 * 커스텀 봇 아이콘 (MessageBubble과 동일)
 */
const BotIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className="h-5 w-5"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="4" y="6" width="16" height="14" rx="4" fill="white" />
    <circle cx="9" cy="12" r="2" fill="#EB0000" />
    <circle cx="15" cy="12" r="2" fill="#EB0000" />
    <path
      d="M12 6V3M12 3L10 5M12 3L14 5"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9 16C9 16 10.5 17.5 12 17.5C13.5 17.5 15 16 15 16"
      stroke="#EB0000"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

/**
 * 타이핑 인디케이터 - 펄스 애니메이션
 */
const TypingIndicator = () => (
  <div className="flex gap-2.5 justify-start" role="status" aria-label="응답 작성 중">
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-rose-500 to-red-600 shadow-sm shadow-rose-200">
      <BotIcon />
    </div>
    <div className="flex items-center gap-1 bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm ring-1 ring-gray-100">
      <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-pulse" />
      <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-pulse" style={{ animationDelay: '150ms' }} />
      <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-pulse" style={{ animationDelay: '300ms' }} />
    </div>
  </div>
);

/**
 * 느린 응답 안내 - 서브틀한 디자인
 */
const SlowResponseMessage = () => (
  <div className="flex items-center justify-center gap-2 py-2">
    <Loader2 className="h-3.5 w-3.5 text-rose-400 animate-spin" />
    <p className="text-[11px] text-gray-400">추천 정보를 정리하고 있어요</p>
  </div>
);

/**
 * 메시지 목록 컴포넌트
 */
const MessageList = ({ messages, isTyping, isSlow }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, isSlow]);

  return (
    <div
      className="h-full overflow-y-auto px-4 py-5 space-y-4"
      role="list"
      aria-label="채팅 메시지"
    >
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}

      {isTyping && <TypingIndicator />}
      {isSlow && <SlowResponseMessage />}

      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList;
