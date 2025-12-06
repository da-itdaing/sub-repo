import { useCallback, useState, useEffect } from 'react';
import { RotateCcw, Sparkles, Store } from 'lucide-react';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import RecommendationPanel from './RecommendationPanel';
import useChatSession from '@/chatbot/hooks/useChatSession';

// 모드별 빠른 질문 예시 - 실제 사용자 말투로 작성
const QUICK_QUESTIONS = {
  consumer: [
    '수공예품 파는 곳 없어?',
    '동구 쪽에 갈만한 곳 없으려나?',
    '강아지 데려갈 수 있는 곳 추천해줘!',
    '이번 주말 플리마켓 뭐 있어?',
  ],
  seller: [
    '처음인데 어디서 시작하면 좋을까?',
    '사람 많은 존 추천해줘',
    '입점하려면 어떻게 해?',
    '잘 파는 팁 좀 알려줘',
  ],
};

// 모드별 설정 - 친근한 이름으로 변경
const MODE_CONFIG = {
  consumer: {
    title: '마켓버디',
    subtitle: '광주 플리마켓 추천 친구',
    Icon: Sparkles,
  },
  seller: {
    title: '셀러버디',
    subtitle: '존 추천·운영 도우미',
    Icon: Store,
  },
};

// 모드별 팁 메시지 - 실제 대화체로 작성
const MARKET_TIPS = {
  consumer: [
    { emoji: '🛍️', text: '"수공예품 파는 곳 없어?" 이렇게 물어봐도 돼요' },
    { emoji: '📍', text: '"동구 쪽에 갈만한 곳" 처럼 지역 말해주면 좋아요' },
    { emoji: '🐕', text: '"강아지 데려갈 수 있는 곳" 도 찾아드려요' },
    { emoji: '🎨', text: '"예술시장" "대인시장" 도 추천해요' },
    { emoji: '❄️', text: '"이번 주말 플리마켓 뭐 있어?" 도 가능해요' },
    { emoji: '👨‍👩‍👧', text: '"가족이랑 가기 좋은 데" 도 알려드려요' },
    { emoji: '🍜', text: '"먹을거 많은 마켓" 도 찾아드려요' },
    { emoji: '✨', text: '"송정역시장 언제 해?" 도 물어보세요' },
  ],
  seller: [
    { emoji: '📊', text: '"처음인데 어디가 좋아?" 라고 물어보세요' },
    { emoji: '👥', text: '"사람 많은 데 추천해줘" 도 가능해요' },
    { emoji: '📝', text: '"입점 어떻게 해?" 안내해드려요' },
    { emoji: '🎯', text: '"잘 팔려면?" 팁도 알려드려요' },
    { emoji: '📍', text: '"동구쪽 존 있어?" 찾아드려요' },
    { emoji: '🏪', text: '"주말에 열리는 데" 도 추천해요' },
  ],
};

// 모드별 색상 테마
const THEME_COLORS = {
  consumer: {
    bgGradient: 'from-rose-50/50 to-white',
    headerBorder: 'border-rose-100/50',
    iconBg: 'from-rose-500 to-red-600',
    resetHover: 'hover:text-rose-500',
    quickBg: 'bg-rose-50',
    quickText: 'text-rose-600',
    quickHover: 'hover:bg-rose-100 hover:text-rose-700',
    tipBg: 'from-rose-50/80 to-amber-50/80',
    tipBorder: 'border-rose-100/30',
    tipIcon: 'text-rose-400',
    inputBorder: 'border-rose-100/50',
  },
  seller: {
    bgGradient: 'from-blue-50/50 to-white',
    headerBorder: 'border-blue-100/50',
    iconBg: 'from-blue-500 to-cyan-600',
    resetHover: 'hover:text-blue-500',
    quickBg: 'bg-blue-50',
    quickText: 'text-blue-600',
    quickHover: 'hover:bg-blue-100 hover:text-blue-700',
    tipBg: 'from-blue-50/80 to-cyan-50/80',
    tipBorder: 'border-blue-100/30',
    tipIcon: 'text-blue-400',
    inputBorder: 'border-blue-100/50',
  },
};

/**
 * 플리마켓 팁 메시지 (로테이션) - 클릭 시 질문 전송
 */
const MarketTipBanner = ({ mode, isLoading, onTipClick }) => {
  const tips = MARKET_TIPS[mode] || MARKET_TIPS.consumer;
  const theme = THEME_COLORS[mode] || THEME_COLORS.consumer;
  const [tipIndex, setTipIndex] = useState(() => Math.floor(Math.random() * tips.length));
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setTipIndex((prev) => (prev + 1) % tips.length);
        setIsVisible(true);
      }, 200);
    }, 5000);

    return () => clearInterval(interval);
  }, [tips.length]);

  const tip = tips[tipIndex];

  // 팁 텍스트에서 따옴표 안의 질문 추출
  const extractQuestion = (text) => {
    const match = text.match(/"([^"]+)"/);
    return match ? match[1] : text;
  };

  const handleClick = () => {
    if (onTipClick) {
      const question = extractQuestion(tip.text);
      onTipClick(question);
    }
  };

  // 로딩 중이 아닐 때만 표시
  if (isLoading) return null;

  return (
    <div className="px-4 pb-2">
      <button 
        type="button"
        onClick={handleClick}
        className={`w-full flex items-center justify-center gap-2 py-2 px-3 bg-gradient-to-r ${theme.tipBg} rounded-xl border ${theme.tipBorder} transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'
        }`}
      >
        <span className={`text-xs font-medium ${theme.tipIcon}`}>💡</span>
        <span className="text-[11px] text-gray-500">
          <span className="text-base mr-1">{tip.emoji}</span>
          {tip.text}
        </span>
      </button>
    </div>
  );
};

/**
 * 챗봇 공통 레이아웃 컴포넌트
 * @param {string} mode - 챗봇 모드 ('consumer' | 'seller')
 * @param {string} guestId - 게스트 ID (비로그인 체험 모드)
 */
const ChatLayout = ({ mode = 'consumer', guestId = null }) => {
  const {
    messages,
    isLoading,
    isSlow,
    isStreaming, // v14: 첫 토큰 도착 후 스트리밍 중 여부
    recommendations,
    sendMessage,
    resetSession,
  } = useChatSession({ mode, userId: guestId });

  const [showQuickQuestions, setShowQuickQuestions] = useState(true);
  const config = MODE_CONFIG[mode] || MODE_CONFIG.consumer;
  const quickQuestions = QUICK_QUESTIONS[mode] || QUICK_QUESTIONS.consumer;
  const theme = THEME_COLORS[mode] || THEME_COLORS.consumer;

  const handleReset = useCallback(() => {
    resetSession();
    setShowQuickQuestions(true);
  }, [resetSession]);

  const handleQuickQuestion = useCallback(
    (question) => {
      setShowQuickQuestions(false);
      sendMessage(question);
    },
    [sendMessage],
  );

  const handleSendMessage = useCallback(
    (text) => {
      setShowQuickQuestions(false);
      sendMessage(text);
    },
    [sendMessage],
  );

  const isInitialState = messages.length <= 1 && showQuickQuestions;

  return (
    <div
      className={`flex h-full flex-col bg-gradient-to-b ${theme.bgGradient} overflow-hidden`}
      role="region"
      aria-label="AI 챗봇"
    >
      {/* 헤더 - 미니멀 & 세련됨 */}
      <header className={`shrink-0 bg-white/80 backdrop-blur-sm border-b ${theme.headerBorder} px-4 py-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {/* 미니 로고 아이콘 */}
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${theme.iconBg} shadow-sm`}>
              <config.Icon className="h-4.5 w-4.5 text-white" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-gray-900 tracking-tight">
                {config.title}
              </h2>
              <p className="text-[10px] text-gray-400">
                {config.subtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className={`flex items-center gap-1 text-[11px] text-gray-400 ${theme.resetHover} transition-colors`}
            aria-label="대화 초기화"
          >
            <RotateCcw className="h-3 w-3" />
            초기화
          </button>
        </div>
      </header>

      {/* 메시지 영역 - 스크롤 가능 */}
      <main className="flex-1 overflow-y-auto min-h-0">
        <MessageList
          messages={messages}
          isTyping={isLoading && !isStreaming}
          isSlow={isSlow}
          isStreaming={isStreaming}
          mode={mode}
        />
      </main>

      {/* 빠른 질문 - 플로팅 스타일 */}
      {isInitialState && !isLoading && (
        <div className="shrink-0 px-4 py-4">
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-4">
            <p className="text-[11px] font-medium text-gray-400 mb-3 tracking-wide uppercase">
              추천 질문
            </p>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickQuestion(q)}
                  className={`rounded-full ${theme.quickBg} px-3.5 py-2 text-[12px] font-medium ${theme.quickText} ${theme.quickHover} transition-all active:scale-95`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 추천 패널 - 최대 높이 제한 */}
      {recommendations.length > 0 && (
        <aside className="shrink-0 max-h-[35%] overflow-y-auto border-t border-gray-100">
          <RecommendationPanel items={recommendations} mode={mode} />
        </aside>
      )}

      {/* 팁 메시지 - 입력창 위에 항상 표시 (클릭 시 질문 전송) */}
      <MarketTipBanner mode={mode} isLoading={isLoading} onTipClick={handleSendMessage} />

      {/* 입력 영역 - 항상 보이게 */}
      <footer className="shrink-0 border-t border-gray-100 bg-white">
        <ChatInput onSend={handleSendMessage} disabled={isLoading} mode={mode} />
      </footer>
    </div>
  );
};

export default ChatLayout;
