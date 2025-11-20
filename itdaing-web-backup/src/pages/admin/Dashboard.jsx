import React from "react";
import { Activity, Users, Map, Store } from "lucide-react";

export default function AdminDashboardPage() {
  const cards = [
    { icon: Activity, label: "오늘의 이벤트", value: "128건", accent: "text-[#2563eb]" },
    { icon: Users, label: "신규 사용자", value: "42명", accent: "text-[#16a34a]" },
    { icon: Map, label: "등록 존/셀", value: "12 / 94", accent: "text-[#ef4444]" },
    { icon: Store, label: "승인 대기 팝업", value: "7건", accent: "text-[#ea580c]" }
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-gray-900">관리자 대시보드</h1>
        <p className="text-sm text-gray-500 mt-1">서비스 전반의 현황과 승인 진행 상황을 한눈에 확인하세요.</p>
      </header>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(card => (
          <article key={card.label} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col gap-2">
            <card.icon className={`size-6 ${card.accent}`} />
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="text-2xl font-semibold text-gray-900">{card.value}</p>
          </article>
        ))}
      </section>
      <section className="grid gap-4 xl:grid-cols-2">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">실시간 승인 현황</h2>
          <ul className="space-y-3 text-sm text-gray-600">
            <li>· 셀프존 광주 동구 - 셀 4개 신규 등록 대기 중</li>
            <li>· 플레이팩토리 - 겨울 플리마켓 승인 검토 중</li>
            <li>· 다잇다잉 - 문화 야시장 안전 점검 완료</li>
          </ul>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">알림</h2>
          <ul className="space-y-3 text-sm text-gray-600">
            <li>· 광주 서구청과의 협력 공문이 도착했습니다.</li>
            <li>· 카카오맵 API 키 갱신이 필요합니다.</li>
            <li>· 11월 이벤트 운영 계획서 검토 요청</li>
          </ul>
        </div>
      </section>
    </div>
  );
}

