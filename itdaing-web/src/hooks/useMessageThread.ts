import { useState, useEffect } from 'react';
import { messageService } from '../services/messageService';
import { ThreadDetailResponse, MessageItem } from '../types/message';

interface UseMessageThreadOptions {
  threadId: number;
  role: 'SELLER' | 'ADMIN';
  page?: number;
  size?: number;
}

export function useMessageThread(options: UseMessageThreadOptions) {
  const { threadId, role, page = 0, size = 50 } = options;
  const [thread, setThread] = useState<ThreadDetailResponse | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPage] = useState(page);

  const fetchThread = async (pageNum: number = currentPage) => {
    if (!threadId) return;
    try {
      setLoading(true);
      setError(null);
      const response = await messageService.getThreadDetail(threadId, role, pageNum, size);
      setThread(response);
      // 이전 페이지 로드 시 기존 메시지 앞에 추가
      if (pageNum > currentPage && messages.length > 0) {
        setMessages((prev) => [...response.messages, ...prev]);
      } else {
        setMessages(response.messages);
      }
      setCurrentPage(response.page);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('메시지 상세를 불러오지 못했습니다.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThread();
  }, [threadId, role, size]);

  return {
    thread,
    messages,
    loading,
    error,
    currentPage,
    refetch: () => fetchThread(),
    loadMore: () => {
      if (thread && currentPage < thread.totalPages - 1) {
        fetchThread(currentPage + 1);
      }
    },
  };
}

