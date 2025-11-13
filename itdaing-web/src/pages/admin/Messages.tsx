import React, { useState } from "react";
import { Send, AlertTriangle } from "lucide-react";
import { useMessageThreads } from "../../hooks/useMessageThreads";
import { useMessageThread } from "../../hooks/useMessageThread";
import { MessageThreadList } from "../../components/messages/MessageThreadList";
import { MessageThreadDetail } from "../../components/messages/MessageThreadDetail";
import { MessageComposer } from "../../components/messages/MessageComposer";
import { messageService } from "../../services/messageService";
import { ReplyRequest } from "../../types/message";
import { useAuth } from "../../context/AuthContext";

export default function AdminMessagesPage() {
  const { user } = useAuth();
  const [selectedThreadId, setSelectedThreadId] = useState<number | null>(null);

  const { threads, loading, error, refetch } = useMessageThreads({
    role: "ADMIN",
    autoRefresh: true,
  });

  const { thread, messages, loading: detailLoading, refetch: refetchThread, loadMore } = useMessageThread({
    threadId: selectedThreadId || 0,
    role: "ADMIN",
  });

  const handleThreadClick = (threadId: number) => {
    setSelectedThreadId(threadId);
  };

  const handleReply = async (request: ReplyRequest) => {
    if (!selectedThreadId) return;
    await messageService.reply(selectedThreadId, request);
    await refetchThread();
    await refetch();
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">운영 메시지</h1>
          <p className="text-sm text-gray-500">자치구 · 협력 기관과 주고받은 메시지를 확인하세요.</p>
        </div>
      </header>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          {error.message}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 스레드 목록 */}
            <div>
          <MessageThreadList
            threads={threads}
            loading={loading}
            onThreadClick={handleThreadClick}
            emptyMessage="현재 대기 중인 메시지가 없습니다."
          />
        </div>

        {/* 스레드 상세 및 작성 */}
        <div className="space-y-4">
          {selectedThreadId ? (
            <>
              <MessageThreadDetail
                messages={messages}
                loading={detailLoading}
                currentUserId={user?.id}
                hasMore={thread ? thread.currentPage < thread.totalPages - 1 : false}
                onLoadMore={loadMore}
              />
              <MessageComposer onSubmit={handleReply} placeholder="답장을 입력하세요..." />
            </>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center text-sm text-gray-500">
              왼쪽에서 대화를 선택하세요.
            </div>
              )}
            </div>
          </div>
    </div>
  );
}
