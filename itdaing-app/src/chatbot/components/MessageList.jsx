import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import { ChatMotion, TypingIndicator, BotIcon } from './ChatMotions';

/**
 * 스트리밍 커서 - 텍스트가 입력되고 있음을 표시
 * v14: 실제 토큰 스트리밍 중 표시
 */
const StreamingCursor = () => (
  <span className="inline-block w-0.5 h-4 bg-rose-500 animate-pulse ml-0.5 align-middle" />
);

/**
 * 메시지 목록 컴포넌트
 * v15: motionType prop 추가 - 상황별 모션 그래픽 지원
 * 
 * @param {Object[]} messages - 메시지 배열
 * @param {boolean} isTyping - 응답 대기 중 여부
 * @param {boolean} isSlow - 느린 응답 (3초 이상) 여부
 * @param {boolean} isStreaming - 스트리밍 중 여부
 * @param {string} motionType - 모션 타입 (thinking, searching, analyzing, recommending, error, greeting)
 * @param {string} mode - 챗봇 모드 (consumer, seller)
 * @param {Function} onRetry - 재시도 콜백 (error 모션용)
 */
const MessageList = ({ 
  messages, 
  isTyping, 
  isSlow, 
  isStreaming, 
  motionType = 'thinking',
  mode = 'consumer',
  onRetry 
}) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, isSlow, isStreaming, motionType]);

  // 마지막 봇 메시지 찾기 (스트리밍 커서 표시용)
  const lastBotMessageIndex = messages.reduce((acc, msg, idx) => 
    msg.sender === 'BOT' ? idx : acc, -1
  );

  /**
   * 로딩 상태에 따른 모션 타입 결정
   * - isTyping + !isSlow: 초기 대기 (TypingIndicator)
   * - isTyping + isSlow: 느린 응답 (motionType에 따른 모션)
   * - motionType === 'error': 오류 상태
   */
  const getMotionMessage = () => {
    switch (motionType) {
      case 'searching':
        return mode === 'consumer' ? '플리마켓을 찾고 있어요' : '존 정보를 검색하고 있어요';
      case 'analyzing':
        return '상권 데이터를 분석하고 있어요';
      case 'recommending':
        return '맞춤 추천을 준비하고 있어요';
      case 'greeting':
        return '안녕하세요!';
      case 'error':
        return '문제가 발생했어요';
      case 'thinking':
      default:
        return mode === 'consumer' ? '광주 플리마켓을 찾고 있어요' : '존 정보를 확인하고 있어요';
    }
  };

  return (
    <div
      className="h-full overflow-y-auto px-4 py-5 space-y-4"
      role="list"
      aria-label="채팅 메시지"
    >
      {messages.map((msg, idx) => (
        <MessageBubble 
          key={msg.id} 
          message={msg}
          showCursor={isStreaming && idx === lastBotMessageIndex}
          mode={mode}
        />
      ))}

      {/* 로딩 표시 */}
      {isTyping && !isSlow && <TypingIndicator />}
      
      {/* 느린 응답 또는 상황별 모션 */}
      {isTyping && isSlow && (
        <ChatMotion 
          type={motionType} 
          message={getMotionMessage()}
          mode={mode}
          onRetry={onRetry}
        />
      )}
      
      {/* 에러 상태 (isTyping 없이도 표시 가능) */}
      {!isTyping && motionType === 'error' && (
        <ChatMotion 
          type="error" 
          message="문제가 발생했어요"
          mode={mode}
          onRetry={onRetry}
        />
      )}

      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList;
