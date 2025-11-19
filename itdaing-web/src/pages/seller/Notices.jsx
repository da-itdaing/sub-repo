import React from "react";
import { Bell, Download } from "lucide-react";

const SAMPLE_NOTICES = [
  {
    id: 1,
    title: "11월 광주 팝업 일정 안내",
    publishedAt: "2025-10-20",
    description: "광주광역시 문화관광과와 협력 중인 11월 행사 일정과 필수 제출 서류 안내입니다."
  },
  {
    id: 2,
    title: "카카오맵 셀 등록 및 도면 업로드 가이드",
    publishedAt: "2025-10-12",
    description: "존/셀 등록 기준과 도면 업로드 시 주의사항을 확인해주세요."
  }
];

export default function SellerNoticesPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-gray-900">공지사항</h1>
        <p className="text-sm text-gray-500 mt-1">운영팀에서 전달하는 최신 공지와 자료를 확인하세요.</p>
      </header>
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100">
        {SAMPLE_NOTICES.map(notice => (
          <article key={notice.id} className="p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <Bell className="size-4 text-[#eb0000]" />
                {notice.title}
              </p>
              <p className="text-xs text-gray-400 mt-1">{notice.publishedAt}</p>
              <p className="text-sm text-gray-600 mt-2">{notice.description}</p>
            </div>
            <button className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-xs text-gray-600 hover:border-gray-400">
              <Download className="size-4" />
              자료 다운로드
            </button>
          </article>
        ))}
      </section>
    </div>
  );
}

