import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { streamChatMessage } from '@/chatbot/api/chatbotClient';

const BOT_GREETINGS = {
  consumer:
    '안녕하세요! 다잇다잉 소비자용 챗봇입니다. 플리마켓이나 팝업 방문 관련해서 무엇이든 물어보세요.',
  seller:
    '안녕하세요! 다잇다잉 판매자용 챗봇입니다. 존 추천, 운영 팁, 승인 절차 등 궁금한 점을 물어보세요.',
};

const DEBUG_PATTERNS = [
  /호출 준비/,
  /structured_plan_result/i,
  /"type":\s*"(consumer|seller)_retrieve/i,
];

const sanitizeDelta = (delta) => {
  if (!delta) return '';
  const lines = delta.split('\n');
  const filtered = lines
    .filter((line) => {
      const trimmed = line.trim();
      if (!trimmed) return true;
      return !DEBUG_PATTERNS.some((pattern) => pattern.test(trimmed));
    })
    .map((line) => line.replace(/\s+$/g, ''));
  return filtered.join('\n').replace(/^\s+/, '');
};

const useChatSession = ({ mode = 'consumer' } = {}) => {
  const initialMessage = useMemo(
    () => ({
      id: `bot-init-${mode}`,
      sender: 'BOT',
      text: BOT_GREETINGS[mode] ?? BOT_GREETINGS.consumer,
      createdAt: new Date().toISOString(),
    }),
    [mode],
  );

  const [sessionId, setSessionId] = useState(null);
  const [threadId, setThreadId] = useState(null);
  const threadIdRef = useRef(null);
  useEffect(() => {
    threadIdRef.current = threadId;
  }, [threadId]);

  const [messages, setMessages] = useState([initialMessage]);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSlow, setIsSlow] = useState(false);
  const slowTimerRef = useRef(null);

  useEffect(() => {
    setMessages([initialMessage]);
    setSessionId(null);
    setThreadId(null);
    setIsSlow(false);
    setRecommendations([]);
  }, [initialMessage]);

  const clearSlowTimer = useCallback(() => {
    if (slowTimerRef.current) {
      clearTimeout(slowTimerRef.current);
      slowTimerRef.current = null;
    }
    setIsSlow(false);
  }, []);

  const startSlowTimer = useCallback(() => {
    clearSlowTimer();
    slowTimerRef.current = setTimeout(() => {
      setIsSlow(true);
    }, 2000);
  }, [clearSlowTimer]);

  useEffect(() => () => clearSlowTimer(), [clearSlowTimer]);

  const resetSession = useCallback(() => {
    clearSlowTimer();
    setSessionId(null);
    setThreadId(null);
    setMessages([initialMessage]);
    setRecommendations([]);
  }, [clearSlowTimer, initialMessage]);

  const sendMessage = useCallback(
    async (text) => {
    if (!text?.trim()) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'USER',
      text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);

      const effectiveSessionId = sessionId ?? `session-${Date.now()}`;
      if (!sessionId) {
        setSessionId(effectiveSessionId);
      }

    setIsLoading(true);
      startSlowTimer();
      setRecommendations([]);

      try {
        let botMessageId = `bot-${Date.now()}`;
        let hasFirstDelta = false;
        const trimmedQuestion = text.trim();
        const normalizedQuestion = trimmedQuestion.toLowerCase();

        await streamChatMessage({
          mode,
          message: text,
          sessionId: effectiveSessionId,
          threadId: threadIdRef.current,
          onDelta: ({ delta, thread_id, recommendations: incomingRecs }) => {
            if (thread_id && thread_id !== threadIdRef.current) {
              threadIdRef.current = thread_id;
              setThreadId(thread_id);
            }

            // 추천 결과 처리
            const hasIncomingRecommendations = Array.isArray(incomingRecs) && incomingRecs.length > 0;
            if (hasIncomingRecommendations) {
              console.log('[useChatSession] Recommendations received:', incomingRecs);
              setRecommendations(incomingRecs);
            } else if (incomingRecs !== undefined && Array.isArray(incomingRecs) && incomingRecs.length === 0) {
              // 명시적으로 빈 배열이 왔다면 추천 없음을 설정
              console.log('[useChatSession] Empty recommendations received');
              setRecommendations([]);
            }
            
            if (!delta) {
              return;
            }

            let cleanDelta = sanitizeDelta(delta);
            if (!cleanDelta.trim()) {
              return;
            }

            if (!hasFirstDelta) {
              const lower = cleanDelta.toLowerCase();
              console.log('[useChatSession] First delta:', cleanDelta.substring(0, 100));
              // 봇이 사용자 질문을 그대로 반복하는 경우 제거
              if (normalizedQuestion && lower.startsWith(normalizedQuestion)) {
                const questionLength = normalizedQuestion.length;
                const remaining = cleanDelta.slice(questionLength);
                const trimmedRemaining = remaining.trimStart();
                
                // 질문 뒤에 의미있는 답변이 있는지 확인
                if (trimmedRemaining.length > 0) {
                  console.log('[useChatSession] Question echo removed, remaining:', trimmedRemaining.substring(0, 50));
                  cleanDelta = trimmedRemaining;
                } else {
                  // 질문만 있고 답변이 없으면 스킵하되, 플래그는 설정
                  console.log('[useChatSession] Skipping question-only delta');
                  hasFirstDelta = true;  // 다음 delta는 echo 제거 안 함
                  return;
                }
              }
              hasFirstDelta = true;  // echo 제거 후 플래그 설정
            }

            if (!cleanDelta.trim()) {
              return;
            }
            clearSlowTimer();

            setMessages((prev) => {
              const next = [...prev];
              const existingIndex = next.findIndex((msg) => msg.id === botMessageId);

              if (existingIndex === -1) {
                next.push({
                  id: botMessageId,
        sender: 'BOT',
                  text: cleanDelta,
        createdAt: new Date().toISOString(),
                });
                return next;
              }

              const current = next[existingIndex];
              next[existingIndex] = {
                ...current,
                text: `${current.text}${cleanDelta}`,
              };
              return next;
            });
          },
        });
    } catch (error) {
        console.error('chatbot stream error', error);
        setMessages((prev) => [
          ...prev,
          {
        id: `error-${Date.now()}`,
        sender: 'BOT',
            text: '죄송합니다. 연결이 원활하지 않습니다. 잠시 후 다시 시도해주세요.',
        createdAt: new Date().toISOString(),
          },
        ]);
    } finally {
      setIsLoading(false);
        clearSlowTimer();
    }
    },
    [sessionId, mode, clearSlowTimer, startSlowTimer],
  );

  return {
    sessionId,
    threadId,
    messages,
    isLoading,
    isSlow,
    recommendations,
    sendMessage,
    resetSession,
  };
};

export default useChatSession;