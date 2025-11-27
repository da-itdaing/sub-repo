import { useCallback, useState, useEffect } from 'react';
import { sendChatMessage } from '@/chatbot/api/chatbotClient';

const INITIAL_MESSAGE = {
  id: 'bot-init',
  sender: 'BOT',
  text: '안녕하세요! 다잇다잉 챗봇입니다. 팝업이나 서비스 이용과 관련해 궁금한 점을 물어보세요.',
  createdAt: new Date().toISOString(),
};

/**
 * 챗봇 세션 상태와 메시지 전송 로직을 관리하는 훅
 * - 현재는 간단한 목업 형태로만 동작하며, 추후 백엔드 연동 시 이 훅만 확장하면 된다.
 */
const useChatSession = () => {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);

  // 세션 초기화 시에도 환영 메시지는 유지
  const resetSession = useCallback(() => {
    setSessionId(null);
    setMessages([INITIAL_MESSAGE]);
  }, []);

  const sendMessage = useCallback(async (text) => {
    if (!text?.trim()) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'USER',
      text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await sendChatMessage({ sessionId, message: text });
      if (!sessionId && response.sessionId) {
        setSessionId(response.sessionId);
      }

      const botMessage = {
        id: `bot-${Date.now()}`,
        sender: 'BOT',
        text: response.reply,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: `error-${Date.now()}`,
        sender: 'BOT',
        text: '죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  return {
    sessionId,
    messages,
    isLoading,
    sendMessage,
    resetSession,
  };
};

export default useChatSession;
