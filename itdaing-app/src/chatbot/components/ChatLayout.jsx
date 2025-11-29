import { useCallback, useState } from 'react';
import { RotateCcw, Zap } from 'lucide-react';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import RecommendationPanel from './RecommendationPanel';
import useChatSession from '@/chatbot/hooks/useChatSession';

// 모드별 빠른 질문 예시
const QUICK_QUESTIONS = {
  consumer: [
    '이번 주말 플리마켓 추천해줘',
    '가족과 가기 좋은 팝업 있어?',
    '핸드메이드 소품 살 수 있는 곳',
    '카페 있는 플리마켓 알려줘',
  ],
  seller: [
    '초보 셀러에게 좋은 존 추천해줘',
    '수수료가 저렴한 존은?',
    '입점 승인 절차 알려줘',
    '매출 올리는 팁 있어?',
  ],
};

// 모드별 설정
const MODE_CONFIG = {
  consumer: {
    title: '플리마켓 AI',
    subtitle: '광주 플리마켓·팝업 추천',
  },
  seller: {
    title: '셀러 AI',
    subtitle: '존 추천·운영 가이드',
  },
};

/**
 * 챗봇 공통 레이아웃 컴포넌트
 */
const ChatLayout = ({ mode = 'consumer' }) => {
  const {
    messages,
    isLoading,
    isSlow,
    recommendations,
    sendMessage,
    resetSession,
  } = useChatSession({ mode });

  const [showQuickQuestions, setShowQuickQuestions] = useState(true);
  const config = MODE_CONFIG[mode] || MODE_CONFIG.consumer;
  const quickQuestions = QUICK_QUESTIONS[mode] || QUICK_QUESTIONS.consumer;

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
      className="flex flex-1 flex-col bg-linear-to-b from-rose-50/50 to-white"
      role="region"
      aria-label="AI 챗봇"
    >
      {/* 헤더 - 미니멀 & 세련됨 */}
      <header className="shrink-0 bg-white/80 backdrop-blur-sm border-b border-rose-100/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {/* 미니 로고 아이콘 */}
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-rose-500 to-red-600 shadow-sm">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-[14px] font-bold text-gray-900 tracking-tight">
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
            className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-rose-500 transition-colors"
            aria-label="대화 초기화"
          >
            <RotateCcw className="h-3 w-3" />
            초기화
          </button>
        </div>
      </header>

      {/* 메시지 영역 */}
      <main className="flex-1 overflow-hidden min-h-0">
        <MessageList
          messages={messages}
          isTyping={isLoading}
          isSlow={isSlow}
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
                  className="rounded-full bg-rose-50 px-3.5 py-2 text-[12px] font-medium text-rose-600 hover:bg-rose-100 hover:text-rose-700 transition-all active:scale-95"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 추천 패널 */}
      {recommendations.length > 0 && (
        <aside className="shrink-0 max-h-[40%] overflow-y-auto">
          <RecommendationPanel items={recommendations} mode={mode} />
        </aside>
      )}

      {/* 입력 영역 */}
      <footer className="shrink-0">
        <ChatInput onSend={handleSendMessage} disabled={isLoading} mode={mode} />
      </footer>
    </div>
  );
};

export default ChatLayout;
