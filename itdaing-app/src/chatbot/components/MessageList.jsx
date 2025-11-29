import { useEffect, useRef, useState } from 'react';
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
 * 광주 로고 모티브 로딩 애니메이션
 * - 빨간 원 배경 + 역동적인 사람 실루엣
 * - 플리마켓 분위기의 마켓 텐트 요소
 */
const GwangjuMarketLoader = () => (
  <div className="relative w-16 h-16">
    {/* 메인 원 - 광주 로고 스타일 */}
    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#eb0000] to-[#c70000] animate-pulse shadow-lg shadow-red-200" />
    
    {/* 역동적인 사람 실루엣 - 광주 로고 모티브 */}
    <svg
      viewBox="0 0 64 64"
      className="absolute inset-0 w-full h-full"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 머리 */}
      <circle 
        cx="32" 
        cy="18" 
        r="6" 
        fill="white"
        className="animate-bounce"
        style={{ animationDuration: '1.5s' }}
      />
      {/* 몸통 - 역동적인 곡선 */}
      <path
        d="M32 24 C20 30 18 45 28 52 C30 54 34 54 36 52 C46 45 44 30 32 24"
        fill="white"
        className="origin-center"
        style={{ 
          animation: 'sway 2s ease-in-out infinite',
        }}
      />
      {/* 팔 - 쇼핑백 든 모습 */}
      <path
        d="M26 32 C18 28 14 35 18 40"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
        className="origin-center"
        style={{ animation: 'wave 1.5s ease-in-out infinite' }}
      />
      <path
        d="M38 32 C46 28 50 35 46 40"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
        style={{ animation: 'wave 1.5s ease-in-out infinite 0.3s' }}
      />
    </svg>
    
    {/* 반짝이는 효과 */}
    <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-300 rounded-full animate-ping opacity-75" />
    <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-amber-400 rounded-full animate-ping opacity-60" style={{ animationDelay: '0.5s' }} />
  </div>
);

/**
 * 플리마켓 팁 메시지 (로테이션)
 */
const MARKET_TIPS = [
  { emoji: '🛍️', text: '"이번 주말 플리마켓" 처럼 시간을 알려주세요!' },
  { emoji: '📍', text: '"동구 근처 마켓" 처럼 지역을 말해주세요!' },
  { emoji: '🐕', text: '"반려동물 동반 가능한 곳" 도 찾아드려요!' },
  { emoji: '🎨', text: '"핸드메이드 소품 마켓" 도 추천해드려요!' },
  { emoji: '🌙', text: '"야시장" 이나 "저녁에 열리는 곳" 도 있어요!' },
  { emoji: '👨‍👩‍👧', text: '"가족과 가기 좋은 곳" 도 물어보세요!' },
];

const MarketTip = () => {
  const [tipIndex, setTipIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setTipIndex((prev) => (prev + 1) % MARKET_TIPS.length);
        setIsVisible(true);
      }, 300);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const tip = MARKET_TIPS[tipIndex];

  return (
    <div 
      className={`flex items-center gap-2 text-xs text-gray-500 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <span className="text-base">{tip.emoji}</span>
      <span>{tip.text}</span>
    </div>
  );
};

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
  <div className="flex flex-col items-center justify-center gap-4 py-6 px-4">
    {/* 광주 로고 스타일 로딩 애니메이션 */}
    <GwangjuMarketLoader />
    
    {/* 메인 텍스트 */}
    <div className="text-center space-y-1">
      <p className="text-sm font-medium text-gray-700">
        광주 플리마켓을 찾고 있어요
      </p>
      <p className="text-xs text-gray-400">
        잠시만 기다려주세요 ✨
      </p>
    </div>
    
    {/* 팁 메시지 */}
    <div className="mt-2 px-4 py-2.5 bg-gradient-to-r from-rose-50 to-amber-50 rounded-xl border border-rose-100/50">
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-[10px] font-semibold text-rose-500 uppercase tracking-wider">💡 Tip</span>
      </div>
      <MarketTip />
    </div>
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
