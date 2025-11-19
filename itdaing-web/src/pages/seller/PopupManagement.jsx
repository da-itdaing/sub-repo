import React, { useState } from "react";
import { PlusCircle, MapPin, Calendar, Pencil } from "lucide-react";
import { usePopups } from "../../hooks/usePopups";
import { PopupForm } from "../../components/seller/PopupForm";

export default function SellerPopupManagementPage() {
  const { data: popups, loading, refetch } = usePopups();
  const myPopups = (popups ?? []).slice(0, 6);
  const [showPopupForm, setShowPopupForm] = useState(false);
  const [editingPopupId, setEditingPopupId] = useState(null);

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">팝업 관리</h1>
          <p className="text-sm text-gray-500">등록한 팝업 현황을 확인하고 새로운 팝업을 신청하세요.</p>
        </div>
        <button 
          onClick={() => {
            setEditingPopupId(null);
            setShowPopupForm(true);
          }}
          className="inline-flex items-center gap-2 rounded-full bg-[#eb0000] text-white px-4 py-2 text-sm font-semibold hover:bg-[#d10000] transition"
        >
          <PlusCircle className="size-4" />
          신규 팝업 신청
        </button>
      </header>
      <section className="rounded-2xl border border-dashed border-gray-300 bg-white/60 p-4 text-sm text-gray-600">
        지도에서 셀을 선택하는 기능은 카카오맵 API 키 전달 후 연결될 예정입니다. 현재는 등록된 팝업 데이터를 기반으로 운영 현황만 확인할 수 있습니다.
      </section>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading && <p className="text-sm text-gray-500">팝업 데이터를 불러오는 중입니다...</p>}
        {myPopups.map(popup => (
          <article key={popup.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden relative group">
            <img src={popup.thumbnail} alt={popup.title} className="h-40 w-full object-cover" />
            <button
              onClick={() => {
                setEditingPopupId(popup.id);
                setShowPopupForm(true);
              }}
              className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
              aria-label="팝업 수정"
            >
              <Pencil className="w-4 h-4 text-gray-700" />
            </button>
            <div className="p-4 space-y-2">
              <p className="text-xs font-semibold text-[#eb0000] uppercase">셀 {popup.cellName ?? "-"}</p>
              <h2 className="text-base font-semibold text-gray-900">{popup.title}</h2>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Calendar className="size-3" />
                {popup.startDate} ~ {popup.endDate}
              </p>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <MapPin className="size-3" />
                {popup.locationName ?? "위치 미정"}
              </p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>관심 {popup.favoriteCount ?? 0}</span>
                <span>조회 {popup.viewCount}</span>
              </div>
            </div>
          </article>
        ))}
        {!loading && myPopups.length === 0 && (
          <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-6 text-sm text-gray-500">
            등록된 팝업이 없습니다. 신규 팝업을 신청해보세요.
          </div>
        )}
      </section>

      {showPopupForm && (
        <PopupForm
          popupId={editingPopupId}
          onClose={() => {
            setShowPopupForm(false);
            setEditingPopupId(null);
          }}
          onSave={() => {
            refetch?.();
            setShowPopupForm(false);
            setEditingPopupId(null);
          }}
        />
      )}
    </div>
  );
}

