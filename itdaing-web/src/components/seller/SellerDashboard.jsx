import React, { useState } from "react";
import { Pencil } from "lucide-react";
import { SellerProfileEdit } from "./SellerProfileEdit";
import useSellerDashboard from "../../hooks/useSellerDashboard";
import { getImageUrl } from "../../utils/imageUtils";

export function SellerDashboard({ sellerId }) {
  const { data, loading, error, refresh } = useSellerDashboard();
  const [showProfileEdit, setShowProfileEdit] = useState(false);

  const profile = data?.profile;
  const stats = data?.stats ?? {};
  const popups = data?.popups ?? [];

  const defaultSellerImage = "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop";

  const handleProfileSaved = () => {
    refresh().catch(() => {});
    setShowProfileEdit(false);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-sm text-gray-500">
        판매자 정보를 불러오는 중입니다...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-6 text-sm">
        판매자 정보를 불러오는 중 오류가 발생했습니다. {error.message}
      </div>
    );
  }

  if (!profile || (sellerId && profile.userId !== sellerId)) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-sm text-gray-500">
        판매자 정보를 불러오지 못했습니다.
      </div>
    );
  }

  const metricCards = [
    { label: "전체 팝업", value: stats.totalPopups ?? popups.length },
    { label: "운영 중", value: stats.activePopups ?? 0 },
    { label: "대기 중", value: stats.pendingPopups ?? 0 },
    { label: "누적 관심", value: stats.totalFavorites ?? 0 },
    { label: "누적 조회", value: stats.totalViews ?? 0 },
  ];

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">판매자 대시보드</h1>
            <p className="text-sm text-gray-500 mt-2">브랜드 프로필과 운영 중인 팝업 현황을 확인하세요.</p>
          </div>
          <button
            onClick={() => setShowProfileEdit(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 transition"
          >
            <Pencil className="w-4 h-4" />
            프로필 수정
          </button>
        </div>

        <div className="mt-6 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-600">
            <div className="w-20 h-20 rounded-full overflow-hidden border border-gray-100 shadow-sm">
              <img
                src={getImageUrl(profile.profileImageUrl, defaultSellerImage)}
                alt={profile.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-1">
              <p><span className="font-semibold text-gray-900">이름</span> {profile.name}</p>
              <p><span className="font-semibold text-gray-900">소개</span> {profile.introduction ?? "소개 정보가 준비중입니다."}</p>
              <p><span className="font-semibold text-gray-900">활동 지역</span> {profile.activityRegion ?? "미정"}</p>
              <p><span className="font-semibold text-gray-900">카테고리</span> {profile.category ?? "미분류"}</p>
              <p><span className="font-semibold text-gray-900">연락처</span> {profile.phone ?? "제공되지 않음"}</p>
              <p><span className="font-semibold text-gray-900">SNS</span> {profile.snsUrl ?? "등록되지 않음"}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {metricCards.map(card => (
              <div key={card.label} className="p-4 rounded-xl bg-[#f9fafb] text-center">
                <p className="text-xs text-gray-500">{card.label}</p>
                <p className="text-lg font-semibold text-gray-900">{card.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">내 팝업 ({popups.length})</h2>
          <button className="px-4 py-2 rounded-full border border-gray-300 text-xs text-gray-600 hover:border-gray-400">
            전체 보기
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {popups.map(p => (
            <article key={p.id} className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
              <img
                alt={p.title}
                src={getImageUrl(p.thumbnailUrl, "https://images.unsplash.com/photo-1555099962-4199c345e5dd?w=800&h=600&fit=crop")}
                className="w-full h-32 object-cover"
              />
              <div className="p-4 space-y-2">
                <p className="text-xs font-semibold text-[#eb0000] uppercase">{p.status}</p>
                <p className="font-semibold text-sm text-gray-900 line-clamp-2">{p.title}</p>
                <p className="text-xs text-[#4d4d4d]">
                  {p.startDate ?? "시작일 미정"} ~ {p.endDate ?? "종료일 미정"}
                </p>
                <p className="text-xs text-[#4d4d4d]">셀: {p.cellName ?? "미배정"}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>관심 {p.favoriteCount ?? 0}</span>
                  <span>조회 {p.viewCount ?? 0}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {!loading && popups.length === 0 && (
          <div className="border border-dashed border-gray-300 rounded-2xl p-6 text-sm text-gray-500 mt-4">
            등록된 팝업이 없습니다. 팝업을 신청해보세요.
          </div>
        )}
      </section>

      {showProfileEdit && (
        <SellerProfileEdit
          sellerId={sellerId}
          onClose={() => setShowProfileEdit(false)}
          onSave={handleProfileSaved}
        />
      )}
    </div>
  );
}

export default SellerDashboard;
