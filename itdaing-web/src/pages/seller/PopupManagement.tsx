import React, { useEffect, useState } from "react";
import { PlusCircle, MapPin, Calendar, Edit2, Trash2 } from "lucide-react";
import { PopupSummary } from "../../types/popup";
import { sellerService } from "../../services/sellerService";
import { popupService } from "../../services/popupService";
import { PopupForm } from "../../components/seller/PopupForm";

export default function SellerPopupManagementPage() {
  const [popups, setPopups] = useState<PopupSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [showPopupForm, setShowPopupForm] = useState(false);
  const [editingPopup, setEditingPopup] = useState<PopupSummary | undefined>(undefined);
  const [deletingPopupId, setDeletingPopupId] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    sellerService.getMyPopups()
      .then(result => {
        if (mounted) {
          setPopups(result);
          setError(null);
        }
      })
      .catch(err => {
        if (mounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  const myPopups = popups;

  const handleDeletePopup = async (popupId: number) => {
    try {
      setDeletingPopupId(popupId);
      await popupService.deletePopup(popupId);
      // Refresh popups
      const result = await sellerService.getMyPopups();
      setPopups(result);
    } catch (err) {
      alert(err instanceof Error ? err.message : '팝업 삭제에 실패했습니다.');
    } finally {
      setDeletingPopupId(null);
    }
  };

  const handleRefreshPopups = async () => {
    try {
      setLoading(true);
      const result = await sellerService.getMyPopups();
      setPopups(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">팝업 관리</h1>
          <p className="text-sm text-gray-500">등록한 팝업 현황을 확인하고 새로운 팝업을 신청하세요.</p>
        </div>
        <button
          onClick={() => {
            setEditingPopup(undefined);
            setShowPopupForm(true);
          }}
          className="inline-flex items-center gap-2 rounded-full bg-[#eb0000] text-white px-4 py-2 text-sm font-semibold hover:bg-[#d10000] transition"
        >
          <PlusCircle className="size-4" />
          신규 팝업 신청
        </button>
      </header>
      <section className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
        <p className="font-medium mb-1">📍 위치 선택 안내</p>
        <p>팝업 등록 시 관리자가 생성한 셀(Cell)을 지도에서 선택하실 수 있습니다. 셀 생성은 관리자만 가능하며, 판매자는 선택만 가능합니다.</p>
      </section>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading && <p className="text-sm text-gray-500">팝업 데이터를 불러오는 중입니다...</p>}
        {myPopups.map(popup => (
          <article key={popup.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden relative group">
            <img src={popup.thumbnail || "https://via.placeholder.com/400x200"} alt={popup.title} className="h-40 w-full object-cover" />
            <div className="p-4 space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-[#eb0000] uppercase">셀 {popup.cellName ?? "-"}</p>
                  <h2 className="text-base font-semibold text-gray-900">{popup.title}</h2>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <Calendar className="size-3" />
                    {popup.startDate} ~ {popup.endDate}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <MapPin className="size-3" />
                    {popup.locationName ?? "위치 미정"}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                    <span>관심 {popup.favoriteCount ?? 0}</span>
                    <span>조회 {popup.viewCount}</span>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={() => {
                      setEditingPopup(popup);
                      setShowPopupForm(true);
                    }}
                    className="p-2 text-gray-600 hover:text-[#eb0000] transition"
                    title="수정"
                  >
                    <Edit2 className="size-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('정말 이 팝업을 삭제하시겠습니까?')) {
                        handleDeletePopup(popup.id);
                      }
                    }}
                    disabled={deletingPopupId === popup.id}
                    className="p-2 text-gray-600 hover:text-red-600 transition disabled:opacity-50"
                    title="삭제"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <PopupForm
            popup={editingPopup}
            onClose={() => {
              setShowPopupForm(false);
              setEditingPopup(undefined);
            }}
            onSuccess={() => {
              handleRefreshPopups();
              setShowPopupForm(false);
              setEditingPopup(undefined);
            }}
          />
        </div>
      )}
    </div>
  );
}

