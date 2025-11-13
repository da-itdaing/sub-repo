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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";

export default function SellerMessagesPage() {
  const { user } = useAuth();
  const [selectedThreadId, setSelectedThreadId] = useState<number | null>(null);
  const [showNewMessageDialog, setShowNewMessageDialog] = useState(false);
  const [newMessageReceiverId, setNewMessageReceiverId] = useState<number | null>(null);
  const [newMessageSubject, setNewMessageSubject] = useState("");
  const [newMessageContent, setNewMessageContent] = useState("");

  const { threads, loading, error, refetch } = useMessageThreads({
    role: "SELLER",
    autoRefresh: true,
  });

  const { thread, messages, loading: detailLoading, refetch: refetchThread, loadMore } = useMessageThread({
    threadId: selectedThreadId || 0,
    role: "SELLER",
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

  const handleNewMessage = async () => {
    if (!newMessageReceiverId || !newMessageSubject.trim() || !newMessageContent.trim()) {
      alert("모든 필드를 입력해주세요.");
      return;
    }

    try {
      await messageService.createThread({
        receiverId: newMessageReceiverId,
        subject: newMessageSubject.trim(),
        content: newMessageContent.trim(),
      });
      setShowNewMessageDialog(false);
      setNewMessageSubject("");
      setNewMessageContent("");
      setNewMessageReceiverId(null);
      await refetch();
    } catch (error) {
      console.error("메시지 생성 실패:", error);
      alert("메시지 전송에 실패했습니다.");
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">메시지 센터</h1>
          <p className="text-sm text-gray-500">행정 담당자 및 운영팀과 실시간으로 소통하세요.</p>
        </div>
        <Button
          onClick={() => setShowNewMessageDialog(true)}
          className="inline-flex items-center gap-2 bg-gray-900 text-white hover:bg-gray-800"
        >
          <Send className="size-4" />
          새 메시지
        </Button>
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
            emptyMessage="아직 시작된 대화가 없습니다."
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

      {/* 새 메시지 작성 다이얼로그 */}
      <Dialog open={showNewMessageDialog} onOpenChange={setShowNewMessageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>새 메시지 작성</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                수신자 ID (관리자)
              </label>
              <Input
                type="number"
                value={newMessageReceiverId || ""}
                onChange={(e) => setNewMessageReceiverId(Number(e.target.value) || null)}
                placeholder="관리자 사용자 ID 입력"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
              <Input
                value={newMessageSubject}
                onChange={(e) => setNewMessageSubject(e.target.value)}
                placeholder="메시지 제목"
                required
              />
            </div>
              <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">내용</label>
              <Textarea
                value={newMessageContent}
                onChange={(e) => setNewMessageContent(e.target.value)}
                placeholder="메시지 내용"
                rows={6}
                required
              />
              </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNewMessageDialog(false)}>
                취소
              </Button>
              <Button onClick={handleNewMessage}>전송</Button>
              </div>
        </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
