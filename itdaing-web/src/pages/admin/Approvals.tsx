import React from "react";
import { ClipboardCheck, ShieldCheck, Clock, XCircle } from "lucide-react";
import { usePopups } from "../../hooks/usePopups";

export default function AdminApprovalsPage() {
  const { data: popups } = usePopups();
  const pending = (popups ?? []).slice(0, 4);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-gray-900">승인 심사 현황</h1>
        <p className="text-sm text-gray-500">등록된 팝업의 행정 심사 · 셀 배정 · 안전 점검 현황을 관리합니다.</p>
      </header>
      <section className="grid gap-4 md:grid-cols-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
          <ClipboardCheck className="size-5 text-[#2563eb]" />
          <p className="mt-2 text-sm text-gray-500">전체 신청</p>
          <p className="text-2xl font-semibold">128</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
          <ShieldCheck className="size-5 text-[#16a34a]" />
          <p className="mt-2 text-sm text-gray-500">승인 완료</p>
          <p className="text-2xl font-semibold">92</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
          <Clock className="size-5 text-[#f97316]" />
          <p className="mt-2 text-sm text-gray-500">검토 중</p>
          <p className="text-2xl font-semibold">28</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
          <XCircle className="size-5 text-[#ef4444]" />
          <p className="mt-2 text-sm text-gray-500">반려</p>
          <p className="text-2xl font-semibold">8</p>
        </div>
      </section>
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">검토 중인 신청</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {pending.map(item => (
            <article key={item.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                <p className="text-xs text-gray-500 mt-1">기간 {item.startDate} ~ {item.endDate}</p>
                <p className="text-xs text-gray-500 mt-1">셀 요청: {item.cellName ?? "미지정"} · 판매자 ID {item.sellerId}</p>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 rounded-full border border-gray-300 text-xs text-gray-600 hover:border-gray-400">
                  검토 상세
                </button>
                <button className="px-4 py-2 rounded-full bg-[#16a34a] text-white text-xs hover:bg-[#15803d]">
                  승인
                </button>
                <button className="px-4 py-2 rounded-full bg-[#ef4444]/10 text-[#ef4444] text-xs hover:bg-[#ef4444]/20">
                  반려
                </button>
              </div>
            </article>
          ))}
          {pending.length === 0 && (
            <p className="px-6 py-5 text-sm text-gray-500">검토 중인 신청이 없습니다.</p>
          )}
        </div>
      </section>
    </div>
  );
}

