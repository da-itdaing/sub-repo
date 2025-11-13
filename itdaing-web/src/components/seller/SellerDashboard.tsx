import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useMySellerPopups, useMySellerProfile } from "../../hooks/useSellerDashboard";
import { SellerProfileForm } from "./SellerProfileForm";
import { Edit2 } from "lucide-react";

interface SellerDashboardProps {
  sellerId: number;
}

export function SellerDashboard({ sellerId }: SellerDashboardProps) {
  const { user } = useAuth();
  const { profile, loading: profileLoading, error: profileError, refetch: refreshProfile } = useMySellerProfile();
  const { popups, loading: popupsLoading, error: popupsError } = useMySellerPopups();
  const [showProfileForm, setShowProfileForm] = useState(false);

  const defaultSellerImage = "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop";
  const defaultPopupImage = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=400&fit=crop";

  const displayName = user?.nickname ?? user?.name ?? user?.email ?? `판매자 #${sellerId}`;
  const email = profile?.email ?? user?.email ?? "미등록";
  const introduction = profile?.introduction ?? (profile?.exists === false ? "프로필을 작성해보세요." : "소개 정보가 준비중입니다.");
  const activityRegion = profile?.activityRegion ?? "미정";
  const snsUrl = profile?.snsUrl;
  const sellerImage = profile?.profileImageUrl ?? defaultSellerImage;
  const myPopups = popups ?? [];

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h1 className="text-2xl font-semibold text-gray-900">판매자 대시보드</h1>
        <p className="text-sm text-gray-500 mt-2">브랜드 프로필과 운영 중인 팝업 현황을 확인하세요.</p>
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">판매자 정보</h2>
            <button
              onClick={() => setShowProfileForm(true)}
              className="inline-flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:text-[#eb0000] border border-gray-300 rounded-lg hover:border-[#eb0000] transition"
            >
              <Edit2 className="size-4" />
              수정
            </button>
          </div>
          {profileLoading ? (
            <p className="text-sm text-[#4d4d4d]">판매자 정보를 불러오는 중입니다...</p>
          ) : profileError ? (
            <p className="text-sm text-red-500">판매자 정보를 불러오지 못했습니다: {profileError.message}</p>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-600">
              <div className="w-20 h-20 rounded-full overflow-hidden border border-gray-100 shadow-sm">
                <img src={sellerImage} alt={displayName} className="w-full h-full object-cover" />
              </div>
              <div className="space-y-1">
                <p>
                  <span className="font-semibold text-gray-900">이름</span> {displayName}
                </p>
                <p>
                  <span className="font-semibold text-gray-900">이메일</span> {email}
                </p>
                <p>
                  <span className="font-semibold text-gray-900">소개</span> {introduction || "소개 정보가 준비중입니다."}
                </p>
                <p>
                  <span className="font-semibold text-gray-900">활동 지역</span> {activityRegion}
                </p>
                <p>
                  <span className="font-semibold text-gray-900">SNS</span>{" "}
                  {snsUrl ? (
                    <a href={snsUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                      {snsUrl}
                    </a>
                  ) : (
                    "미등록"
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {showProfileForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-2xl">
            <SellerProfileForm
              onClose={() => setShowProfileForm(false)}
              onSuccess={() => {
                refreshProfile?.();
                setShowProfileForm(false);
              }}
            />
          </div>
        </div>
      )}

      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">내 팝업 ({myPopups.length})</h2>
          <button className="px-4 py-2 rounded-full border border-gray-300 text-xs text-gray-600 hover:border-gray-400">
            전체 보기
          </button>
        </div>
        {popupsError && (
          <p className="text-sm text-red-500 mb-4">팝업 목록을 불러오지 못했습니다: {popupsError.message}</p>
        )}
        {popupsLoading && <p className="text-sm text-[#4d4d4d]">팝업 정보를 불러오는 중입니다...</p>}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {myPopups.map(p => (
            <article key={p.id} className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
              <img
                alt={p.title}
                src={p.thumbnail ?? defaultPopupImage}
                className="w-full h-32 object-cover"
              />
              <div className="p-4 space-y-2">
                <p className="text-xs font-semibold text-[#eb0000] uppercase">{p.status}</p>
                <p className="font-semibold text-sm text-gray-900 line-clamp-2">{p.title}</p>
                <p className="text-xs text-[#4d4d4d]">
                  {(p.startDate ?? '미정')} ~ {(p.endDate ?? '미정')}
                </p>
                <p className="text-xs text-[#4d4d4d]">셀: {p.cellName ?? '미배정'}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>관심 {p.favoriteCount ?? 0}</span>
                  <span>조회 {p.viewCount}</span>
                </div>
              </div>
            </article>
          ))}
          {!popupsLoading && !popupsError && myPopups.length === 0 && (
            <div className="border border-dashed border-gray-300 rounded-2xl p-6 text-sm text-gray-500">
              등록된 팝업이 없습니다. 팝업을 신청해보세요.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default SellerDashboard;
