import { useEffect, useState } from "react";
import { MessageCircle, Send, AlertTriangle } from "lucide-react";
import { mockApi } from "../../services/mockDataService";

export default function SellerMessagesPage() {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mockApi
      .messageThreads()
      .then(setThreads)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">메시지 센터</h1>
          <p className="text-sm text-gray-500">행정 담당자 및 운영팀과 실시간으로 소통하세요.</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-full bg-[#111827] text-white px-4 py-2 text-sm font-semibold hover:bg-[#0f172a] transition">
          <Send className="size-4" />
          새 메시지
        </button>
      </header>
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="divide-y divide-gray-100">
          {loading && <p className="p-4 text-sm text-gray-500">메시지를 불러오는 중입니다...</p>}
          {!loading && threads.length === 0 && (
            <div className="p-6 text-sm text-gray-500 flex items-center gap-2">
              <AlertTriangle className="size-4 text-[#f97316]" />
              아직 시작된 대화가 없습니다.
            </div>
          )}
          {threads.map(thread => (
            <button
              key={thread.id}
              className="w-full text-left px-5 py-4 hover:bg-gray-50 flex items-center justify-between"
            >
              <div>
                <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <MessageCircle className="size-4 text-[#eb0000]" />
                  {thread.title}
                </p>
                <p className="text-xs text-gray-500 mt-1">{thread.counterpart.name}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-xs text-gray-400">{thread.updatedAt}</span>
                {thread.unreadCount > 0 && (
                  <span className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-[#eb0000]/10 text-[#eb0000] text-xs font-semibold">
                    {thread.unreadCount}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

