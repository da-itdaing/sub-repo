import React, { useEffect, useState } from "react";
import { MapPin, Layers, Route, Upload } from "lucide-react";
import { mockApi, Zone } from "../../services/mockDataService";

export default function AdminZoneManagementPage() {
  const [zones, setZones] = useState<Zone[]>([]);

  useEffect(() => {
    mockApi.zones().then(setZones);
  }, []);

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">존 / 셀 관리</h1>
          <p className="text-sm text-gray-500">카카오맵 도면 기반으로 존과 셀을 생성 · 편집하세요.</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-full bg-[#111827] text-white px-4 py-2 text-sm font-semibold hover:bg-[#0f172a] transition">
          <Upload className="size-4" />
          도면 업로드
        </button>
      </header>
      <section className="rounded-2xl border border-dashed border-gray-300 bg-white/60 p-4 text-sm text-gray-600">
        카카오맵 드로잉 API 연동은 키 발급 후 적용할 예정입니다. 현재는 사전 등록된 존·셀 메타데이터를 검토하는 용도로 제공됩니다.
      </section>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {zones.map(zone => (
          <article key={zone.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <MapPin className="size-4 text-[#ef4444]" />
              {zone.name}
            </div>
            <p className="text-xs text-gray-500 flex items-center gap-2">
              <Route className="size-4" />
              셀 {zone.cells.length}개 · 예약 가능 {zone.cells.filter(cell => cell.status === "AVAILABLE").length}개
            </p>
            <div className="flex gap-2 text-xs text-gray-600">
              {zone.tags?.map(tag => (
                <span key={tag} className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1">{tag}</span>
              ))}
            </div>
            <button className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-xs text-gray-600 hover:border-gray-400">
              <Layers className="size-4" />
              상세 편집
            </button>
          </article>
        ))}
      </section>
    </div>
  );
}

