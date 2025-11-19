import React from "react";
import { Activity, FileSpreadsheet } from "lucide-react";

const EVENTS = [
  { id: 1, type: "POPUP_APPROVED", actor: "admin01", target: "플레이팩토리 겨울 플리마켓", createdAt: "2025-10-28 14:22" },
  { id: 2, type: "ZONE_UPDATED", actor: "admin02", target: "광주동구-셀-004", createdAt: "2025-10-27 10:12" },
  { id: 3, type: "SELLER_JOINED", actor: "system", target: "위드마켓 협동조합", createdAt: "2025-10-26 09:30" }
];

export default function AdminLogsPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">이벤트 로그</h1>
          <p className="text-sm text-gray-500">관리자 및 시스템 이벤트 기록을 확인하고 CSV로 내보낼 수 있습니다.</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:border-gray-400">
          <FileSpreadsheet className="size-4" />
          CSV 다운로드
        </button>
      </header>
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2 text-sm font-semibold text-gray-900">
          <Activity className="size-4 text-[#2563eb]" />
          최근 이벤트
        </div>
        <div className="divide-y divide-gray-100">
          {EVENTS.map(event => (
            <article key={event.id} className="px-6 py-4 text-sm text-gray-600">
              <p className="font-semibold text-gray-900">{event.type}</p>
              <p className="mt-1 text-xs text-gray-500">{event.createdAt} · 담당자 {event.actor}</p>
              <p className="mt-2 text-sm text-gray-600">{event.target}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

