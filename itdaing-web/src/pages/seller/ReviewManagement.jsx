import React, { useMemo } from "react";
import { useAllReviews, usePopups } from "../../hooks/usePopups.js";
import { Star, Filter } from "lucide-react";

export default function SellerReviewManagementPage() {
  const { data: popups } = usePopups();
  const popupIds = useMemo(() => popups?.map(p => p.id) ?? [], [popups]);
  const { reviews, loading } = useAllReviews({ popupIds });

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">후기 관리</h1>
          <p className="text-sm text-gray-500">소비자 후기와 평점을 관리하고 피드백에 응답하세요.</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:border-gray-400">
          <Filter className="size-4" />
          필터 설정
        </button>
      </header>
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100">
        {loading && <p className="p-4 text-sm text-gray-500">후기를 불러오는 중입니다...</p>}
        {!loading && reviews.length === 0 && (
          <p className="p-4 text-sm text-gray-500">아직 등록된 후기가 없습니다.</p>
        )}
        {reviews.map(review => (
          <article key={review.id} className="p-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-900 flex items-center gap-3">
                <span className="inline-flex items-center justify-center rounded-full bg-[#eb0000]/10 text-[#eb0000] px-2 py-1 text-xs font-semibold">
                  {popups?.find(p => p.id === review.popupId)?.title ?? "팝업"}
                </span>
                {review.author.name}
              </p>
              <p className="text-xs text-gray-400 mt-1">{review.date}</p>
              <p className="mt-2 text-sm text-gray-600 whitespace-pre-line">{review.content}</p>
            </div>
            <div className="flex items-center gap-1 text-[#f59e0b]">
              {[1,2,3,4,5].map(idx => (
                <Star
                  key={idx}
                  className="size-4"
                  fill={idx <= review.rating ? "#f59e0b" : "none"}
                  stroke={idx <= review.rating ? "#f59e0b" : "#d1d5db"}
                />
              ))}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

