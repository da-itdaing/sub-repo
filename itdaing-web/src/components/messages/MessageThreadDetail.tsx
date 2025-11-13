import React, { useEffect, useRef } from 'react';
import { MessageItem } from '../../types/message';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useAuth } from '../../context/AuthContext';

interface MessageThreadDetailProps {
  messages: MessageItem[];
  loading: boolean;
  currentUserId?: number;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export function MessageThreadDetail({
  messages,
  loading,
  currentUserId,
  onLoadMore,
  hasMore = false,
}: MessageThreadDetailProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: ko });
    } catch {
      return dateString;
    }
  };

  const formatFullDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('ko-KR');
    } catch {
      return dateString;
    }
  };

  const isMyMessage = (message: MessageItem) => {
    return currentUserId ? message.senderId === currentUserId : false;
  };

  if (loading && messages.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center text-sm text-gray-500">
        메시지를 불러오는 중입니다...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col h-[600px]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {hasMore && onLoadMore && (
          <div className="text-center">
            <button
              onClick={onLoadMore}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              이전 메시지 더보기
            </button>
          </div>
        )}
        {messages.map((message) => {
          const isMine = isMyMessage(message);
          return (
            <div
              key={message.id}
              className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  isMine
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {message.title && (
                  <p className={`text-sm font-semibold mb-1 ${isMine ? 'text-white' : 'text-gray-900'}`}>
                    {message.title}
                  </p>
                )}
                <p className={`text-sm whitespace-pre-wrap ${isMine ? 'text-white' : 'text-gray-900'}`}>
                  {message.content}
                </p>
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {message.attachments.map((attachment, idx) => (
                      <a
                        key={idx}
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-xs underline block ${isMine ? 'text-white/80' : 'text-blue-600'}`}
                      >
                        {attachment.originalName || '첨부파일'}
                      </a>
                    ))}
                  </div>
                )}
                <p className={`text-xs mt-1 ${isMine ? 'text-white/70' : 'text-gray-500'}`}>
                  {formatFullDate(message.sentAt)}
                  {message.readAt && ` · 읽음`}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

