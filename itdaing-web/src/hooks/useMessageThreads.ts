import { useState, useEffect } from 'react';
import { messageService } from '../services/messageService';
import { ThreadListResponse, ThreadSummary } from '../types/message';

interface UseMessageThreadsOptions {
  role: 'SELLER' | 'ADMIN';
  box?: 'inbox' | 'sent';
  page?: number;
  size?: number;
  autoRefresh?: boolean;
}

export function useMessageThreads(options: UseMessageThreadsOptions) {
  const { role, box, page = 0, size = 20, autoRefresh = false } = options;
  const [threads, setThreads] = useState<ThreadSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(page);

  const fetchThreads = async (pageNum: number = currentPage) => {
    try {
      setLoading(true);
      setError(null);
      const response = await messageService.listThreads(role, box, pageNum, size);
      setThreads(response.items);
      setTotalPages(response.totalPages);
      setCurrentPage(response.page);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('메시지 목록을 불러오지 못했습니다.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThreads();
  }, [role, box, size]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchThreads();
      }, 30000); // 30초마다 자동 새로고침
      return () => clearInterval(interval);
    }
  }, [autoRefresh, role, box]);

  return {
    threads,
    loading,
    error,
    totalPages,
    currentPage,
    refetch: () => fetchThreads(),
    goToPage: (pageNum: number) => fetchThreads(pageNum),
  };
}

