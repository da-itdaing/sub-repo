import React from 'react';
import { MessageCircle, AlertTriangle } from 'lucide-react';
import { ThreadSummary } from '../../types/message';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface MessageThreadListProps {
  threads: ThreadSummary[];
  loading: boolean;
  onThreadClick: (threadId: number) => void;
  emptyMessage?: string;
}

export function MessageThreadList({
  threads,
  loading,
  onThreadClick,
  emptyMessage = '아직 시작된 대화가 없습니다.',
}: MessageThreadListProps) {
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: ko });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center text-sm text-gray-500">
        메시지를 불러오는 중입니다...
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 text-sm text-gray-500 flex items-center gap-2">
        <AlertTriangle className="size-4 text-yellow-500" />
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm divide-y divide-gray-100">
      {threads.map((thread) => (
        <button
          key={thread.threadId}
          onClick={() => onThreadClick(thread.threadId)}
          className="w-full text-left px-6 py-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <MessageCircle className="size-4 text-red-600 flex-shrink-0" />
              <p className="text-sm font-semibold text-gray-900 truncate">{thread.subject}</p>
            </div>
            <p className="text-xs text-gray-500 truncate">{thread.lastSnippet}</p>
            <p className="text-xs text-gray-400 mt-1">{thread.counterpart.name}</p>
          </div>
          <div className="flex flex-col items-end gap-2 ml-4 flex-shrink-0">
            <span className="text-xs text-gray-400 whitespace-nowrap">{formatDate(thread.updatedAt)}</span>
            {thread.unreadForMe > 0 && (
              <span className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-red-600/10 text-red-600 text-xs font-semibold">
                {thread.unreadForMe}
              </span>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}

