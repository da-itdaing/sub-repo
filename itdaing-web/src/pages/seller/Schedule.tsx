import React from "react";
import { CalendarDays, Clock, CheckCircle2 } from "lucide-react";
import { MyPageCalendar } from "../../components/consumer/MyPageCalendar";

export default function SellerSchedulePage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-gray-900">운영 일정</h1>
        <p className="text-sm text-gray-500">승인된 팝업 일정과 준비 현황을 관리하세요.</p>
      </header>
      <section className="grid gap-4 md:grid-cols-3">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 text-[#eb0000]">
            <CalendarDays className="size-5" />
            <p className="text-sm font-semibold">이번 달 진행 예정</p>
          </div>
          <p className="mt-3 text-3xl font-semibold text-gray-900">3건</p>
          <p className="mt-1 text-xs text-gray-500">승인 완료 후 준비 중인 팝업</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 text-[#2563eb]">
            <Clock className="size-5" />
            <p className="text-sm font-semibold">검토 중</p>
          </div>
          <p className="mt-3 text-3xl font-semibold text-gray-900">1건</p>
          <p className="mt-1 text-xs text-gray-500">행정 승인 대기 팝업</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 text-[#16a34a]">
            <CheckCircle2 className="size-5" />
            <p className="text-sm font-semibold">완료</p>
          </div>
          <p className="mt-3 text-3xl font-semibold text-gray-900">12건</p>
          <p className="mt-1 text-xs text-gray-500">올해 진행 완료된 팝업</p>
        </div>
      </section>
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <MyPageCalendar />
      </section>
    </div>
  );
}

