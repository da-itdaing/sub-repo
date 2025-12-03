import { useEffect, useRef } from 'react';
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
 * 걷는 사람 아이콘 (플리마켓 쇼핑객)
 */
const WalkingPerson = ({ delay = 0, direction = 'right' }) => (
  <svg
    viewBox="0 0 32 48"
    className="absolute h-6 w-4"
    style={{
      animation: `${direction === 'right' ? 'walkRight' : 'walkLeft'} 4s linear infinite`,
      animationDelay: `${delay}s`,
      bottom: '4px',
    }}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* 머리 */}
    <circle cx="16" cy="6" r="5" fill="#374151" />
    {/* 몸통 */}
    <path
      d="M16 11 L16 26"
      stroke="#374151"
      strokeWidth="3"
      strokeLinecap="round"
    />
    {/* 팔 - 쇼핑백 든 모습 */}
    <path
      d="M16 15 L10 22 M16 15 L22 20"
      stroke="#374151"
      strokeWidth="2.5"
      strokeLinecap="round"
      style={{ animation: 'armSwing 0.5s ease-in-out infinite alternate' }}
    />
    {/* 다리 - 걷는 모션 */}
    <path
      d="M16 26 L12 38 M16 26 L20 38"
      stroke="#374151"
      strokeWidth="2.5"
      strokeLinecap="round"
      style={{ animation: 'legWalk 0.5s ease-in-out infinite alternate' }}
    />
    {/* 쇼핑백 */}
    <rect
      x="6"
      y="19"
      width="6"
      height="8"
      rx="1"
      fill="#eb0000"
      style={{ animation: 'bagSwing 0.5s ease-in-out infinite alternate' }}
    />
  </svg>
);

/**
 * 광주 로고 모티브 로딩 애니메이션 - 개선된 버전
 * - 빨간 원 안에 자연스러운 사람 실루엣
 * - 플리마켓 분위기 연출
 */
const GwangjuMarketLoader = () => (
  <div className="relative flex flex-col items-center">
    {/* 메인 로고 - 광주 스타일 */}
    <div className="relative w-14 h-14 mb-3">
      {/* 배경 원 - 펄스 효과 */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#eb0000] to-[#c70000] shadow-lg shadow-red-200/50" />
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#eb0000] to-[#c70000] animate-ping opacity-20" />
      
      {/* 광주 로고 스타일 사람 실루엣 */}
      <svg
        viewBox="0 0 56 56"
        className="absolute inset-0 w-full h-full p-1"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* 머리 */}
        <circle cx="28" cy="14" r="6" fill="white" />
        {/* 몸통 - 역동적인 포즈 */}
        <path
          d="M28 20 C28 20 22 28 24 38 C25 42 31 42 32 38 C34 28 28 20 28 20"
          fill="white"
        />
        {/* 왼팔 - 위로 뻗은 모습 */}
        <path
          d="M24 24 C20 20 16 18 14 20"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
          style={{ animation: 'armWave 1s ease-in-out infinite' }}
        />
        {/* 오른팔 */}
        <path
          d="M32 24 C36 28 40 30 42 28"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
          style={{ animation: 'armWave 1s ease-in-out infinite 0.5s' }}
        />
        {/* 왼다리 */}
        <path
          d="M26 38 L22 50"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
        />
        {/* 오른다리 */}
        <path
          d="M30 38 L36 48"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
    </div>
    
    {/* 걷는 사람들 - 플리마켓 분위기 */}
    <div className="relative w-32 h-8 overflow-hidden">
      {/* 바닥 선 */}
      <div className="absolute bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
      
      {/* 걷는 사람들 */}
      <WalkingPerson delay={0} direction="right" />
      <WalkingPerson delay={1.5} direction="left" />
      <WalkingPerson delay={3} direction="right" />
    </div>
  </div>
);

/**
 * 타이핑 인디케이터 - 펄스 애니메이션
 */
const TypingIndicator = () => (
  <div className="flex gap-2.5 justify-start" role="status" aria-label="응답 작성 중">
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-red-600 shadow-sm shadow-rose-200">
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
 * 느린 응답 안내 - 광주 마켓 테마 디자인
 */
const SlowResponseMessage = () => (
  <div className="flex flex-col items-center justify-center gap-3 py-5 px-4">
    {/* 광주 로고 스타일 로딩 애니메이션 */}
    <GwangjuMarketLoader />
    
    {/* 메인 텍스트 */}
    <div className="text-center space-y-0.5">
      <p className="text-sm font-medium text-gray-700">
        광주 플리마켓을 찾고 있어요
      </p>
      <p className="text-[11px] text-gray-400">
        잠시만 기다려주세요 ✨
      </p>
    </div>
  </div>
);

/**
 * 스트리밍 커서 - 텍스트가 입력되고 있음을 표시
 * v14: 실제 토큰 스트리밍 중 표시
 */
const StreamingCursor = () => (
  <span className="inline-block w-0.5 h-4 bg-rose-500 animate-pulse ml-0.5 align-middle" />
);

/**
 * 메시지 목록 컴포넌트
 * v14: isStreaming prop 추가 - 스트리밍 중 커서 표시
 */
const MessageList = ({ messages, isTyping, isSlow, isStreaming }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, isSlow, isStreaming]);

  // 마지막 봇 메시지 찾기 (스트리밍 커서 표시용)
  const lastBotMessageIndex = messages.reduce((acc, msg, idx) => 
    msg.sender === 'BOT' ? idx : acc, -1
  );

  return (
    <div
      className="px-4 py-5 space-y-4"
      role="list"
      aria-label="채팅 메시지"
    >
      {messages.map((msg, idx) => (
        <MessageBubble 
          key={msg.id} 
          message={msg}
          showCursor={isStreaming && idx === lastBotMessageIndex}
        />
      ))}

      {/* 로딩 표시: 처음엔 TypingIndicator, 3초 후 SlowResponseMessage로 전환 */}
      {isTyping && !isSlow && <TypingIndicator />}
      {isTyping && isSlow && <SlowResponseMessage />}

      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList;
