import React from "react";
import { BellRing, Pencil, Upload } from "lucide-react";

const ADMIN_NOTICES = [
  {
    id: 1,
    title: "11월 운영 점검 일정 안내",
    publishedAt: "2025-10-25",
    author: "관리자 김하늘",
    summary: "11월 1주차 존 점검 일정과 필수 점검 항목을 공유드립니다."
  },
  {
    id: 2,
    title: "카카오맵 API 키 갱신 공지",
    publishedAt: "2025-10-18",
    author: "시스템",
    summary: "11월 30일까지 운영 콘솔에 신규 API 키를 등록해주세요."
  }
];

export default function AdminNoticesPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">공지사항 관리</h1>
          <p className="text-sm text-gray-500">관리자 공지 · 자료 업로드를 통해 운영 정보를 공유하세요.</p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:border-gray-400">
            <Upload className="size-4" />
            첨부 업로드
          </button>
          <button className="inline-flex items-center gap-2 rounded-full bg-[#111827] text-white px-4 py-2 text-sm font-semibold hover:bg-[#0f172a] transition">
            <Pencil className="size-4" />
            새 공지 작성
          </button>
        </div>
      </header>
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100">
        {ADMIN_NOTICES.map(notice => (
          <article key={notice.id} className="px-6 py-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <BellRing className="size-4 text-[#ef4444]" />
                {notice.title}
              </p>
              <p className="text-xs text-gray-400">{notice.publishedAt} · {notice.author}</p>
              <p className="text-sm text-gray-600 mt-2">{notice.summary}</p>
            </div>
            <button className="inline-flex items-center justify-center rounded-full border border-gray-300 px-4 py-2 text-xs text-gray-600 hover:border-gray-400">
              상세 보기
            </button>
          </article>
        ))}
      </section>
    </div>
  );
}

