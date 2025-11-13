import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { usePopups } from "../../hooks/usePopups";
import { useUser } from "../../context/UserContext";
import { useAuth } from "../../context/AuthContext";
import { ImageWithFallback } from "../common/ImageWithFallback";

interface RecommendationModalProps {
  onClose: () => void;
  onDismissToday: () => void;
  onPopupClick: (id: number) => void;
}

export function RecommendationModal({
  onClose,
  onDismissToday,
  onPopupClick,
}: RecommendationModalProps) {
  const navigate = useNavigate();
  const { data: popupList } = usePopups();
  const { profile } = useUser();
  const { isAuthenticated } = useAuth();

  // 소비자 선호 카테고리 기반 추천 팝업 상위 2개 선택
  const recommended = useMemo(() => {
    if (!popupList || popupList.length === 0) return [];

    // 선호 카테고리 매칭 우선, 없으면 상위 2개
    const list = [...popupList];
    const scored = list.map(p => {
      const tags = p.styleTags ?? [];
      const score = (profile?.interests ?? []).reduce((acc, pref) => {
        return acc + (tags.some(t => t.includes(pref) || pref.includes(t)) ? 1 : 0);
      }, 0);
      return { popup: p, score };
    });
    scored.sort((a, b) => b.score - a.score);
    const top = scored.slice(0, 2).map(s => s.popup);
    return top.length > 0 ? top : list.slice(0, 2);
  }, [popupList, profile]);

  if (!recommended || recommended.length === 0) return null;

  const gotoLoginIfNeeded = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return true;
    }
    return false;
  };

  const getMainImage = (p: any) => p?.thumbnail || (Array.isArray(p?.gallery) && p.gallery[0]) || "";

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] px-4">
      <div className="bg-white rounded-2xl w-full max-w-[720px] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 sm:px-10 pt-8">
          <h2 className="font-['Black_Han_Sans:Regular',sans-serif] text-2xl sm:text-3xl md:text-4xl text-black">
            오늘의 잇다잉 <span className="text-[#eb0000]">Pick!!</span>
          </h2>
          <p className="mt-2 text-sm sm:text-base text-[#4d4d4d]">
            사용자님의 취향에 맞춘 잇다잉 Pick~!! 클릭해서 확인해보세요!
          </p>
        </div>
        {/* List */}
        <div className="p-6 sm:p-10 pt-6 space-y-8">
          {recommended.map((p) => (
            <div key={p.id} className="flex gap-5">
              <div className="w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] rounded-xl overflow-hidden flex-shrink-0">
                <ImageWithFallback
                  src={getMainImage(p)}
                  fallbackKey={p.id}
                  alt={p.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl sm:text-2xl font-extrabold text-black truncate">{p.title}</h3>
                <p className="text-sm text-[#4d4d4d] mt-1">{p.startDate} ~ {p.endDate}</p>
                <p className="text-sm text-[#4d4d4d] mt-3 line-clamp-3">
                  {p.description || "독특한 경험을 해보세요!"}
                </p>
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => {
                      if (gotoLoginIfNeeded()) return;
                      navigate("/mypage"); // 즐겨찾기 화면 등으로 연결 가능
                      onClose();
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[#eb0000] text-white hover:bg-[#cc0000] transition-colors"
                  >
                    관심등록
                  </button>
                  <button
                    onClick={() => { onPopupClick(p.id); onClose(); }}
                    className="px-5 py-2.5 rounded-xl bg-gray-300 text-black hover:bg-gray-400 transition-colors"
                  >
                    보러가기
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Footer */}
        <div className="flex items-center justify-between gap-3 bg-gray-100 px-6 sm:px-10 py-4">
          <button
            onClick={onDismissToday}
            className="text-sm sm:text-base text-black"
          >
            오늘 하루 보지않기
          </button>
          <button onClick={onClose} className="text-sm sm:text-base text-black">
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

export default RecommendationModal;
