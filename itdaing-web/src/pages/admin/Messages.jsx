import React from "react";
import { MessageSquare, AlertTriangle, Send } from "lucide-react";

const ADMIN_MESSAGES = [
  {
    id: 1,
    title: "광주 동구청 담당자",
    summary: "다잇다잉 야시장 안전 점검 일정 조율",
    updatedAt: "2025-10-26",
    unread: 2
  },
  {
    id: 2,
    title: "문화재단 협력팀",
    summary: "11월 공동 홍보 콘텐츠 초안 전달",
    updatedAt: "2025-10-24",
    unread: 0
  }
];

export default function AdminMessagesPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">운영 메시지</h1>
          <p className="text-sm text-gray-500">자치구 · 협력 기관과 주고받은 메시지를 확인하세요.</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-full bg-[#2563eb] text-white px-4 py-2 text-sm font-semibold hover:bg-[#1d4ed8] transition">
          <Send className="size-4" />
          새 메시지
        </button>
      </header>
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100">
        {ADMIN_MESSAGES.map(message => (
          <article key={message.id} className="px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <MessageSquare className="size-4 text-[#ef4444]" />
                {message.title}
              </p>
              <p className="text-xs text-gray-500 mt-1">{message.summary}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400">{message.updatedAt}</span>
              {message.unread > 0 && (
                <span className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-[#ef4444]/10 text-[#ef4444] text-xs font-semibold">
                  {message.unread}
                </span>
              )}
            </div>
          </article>
        ))}
        {ADMIN_MESSAGES.length === 0 && (
          <div className="px-6 py-5 text-sm text-gray-500 flex items-center gap-2">
            <AlertTriangle className="size-4 text-[#f97316]" />
            현재 대기 중인 메시지가 없습니다.
          </div>
        )}
      </section>
    </div>
  );
}

