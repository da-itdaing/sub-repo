import { useState, useMemo, useRef, useEffect } from 'react';
import { Star, ChevronDown } from 'lucide-react';

const ReviewTab = ({ popup, reviews, onWriteClick }) => {
  const [sortOption, setSortOption] = useState('latest');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const summary = popup?.reviewSummary || { average: 0, total: 0, distribution: [] };
  const distribution = [...(summary.distribution || [])].reverse();
  const totalCount = summary.total || 1;

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 정렬
  const sortedReviews = useMemo(() => {
    if (!reviews || reviews.length === 0) return [];

    return [...reviews].sort((a, b) => {
      if (sortOption === 'latest') {
        const dateA = new Date(a.date || a.createdAt);
        const dateB = new Date(b.date || b.createdAt);
        return dateB - dateA;
      }
      if (sortOption === 'ratingHigh') return b.rating - a.rating;
      if (sortOption === 'ratingLow') return a.rating - b.rating;
      return 0;
    });
  }, [reviews, sortOption]);

  const sortLabel = {
    latest: '최신순',
    ratingHigh: '별점 높은 순',
    ratingLow: '별점 낮은 순',
  };

  return (
    <div className="pt-6 pb-20 max-w-[960px] mx-auto px-6">

      {/* ⭐ 리뷰 통계 — 좌우정렬 + 중앙정렬 */}
      {summary.total > 0 && (
        <div className="flex items-center justify-center gap-8 md:gap-16 mb-10">

          {/* ⭐ 큰 별 평점 */}
          <div className="flex flex-col items-center">
            <div className="flex gap-1.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-8 h-8 ${
                    i < Math.round(summary.average)
                      ? 'text-[#eb0000] fill-[#eb0000]'
                      : 'text-gray-200 fill-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* 📊 그래프 — 막대 굵게 (h-3) */}
          <div className="flex flex-col gap-2">
            {[5, 4, 3, 2, 1].map((score, index) => {
              const count = distribution[index] || 0;
              const percentage = (count / totalCount) * 100;

              return (
                <div key={score} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-900 w-6 text-right">
                    {score}점
                  </span>

                  <div className="w-56 h-5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#ff0f0f] to-[#e67777]"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ✏ 후기 작성 + 정렬 */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <button
          type="button"
          onClick={onWriteClick}
          className="px-4 py-2 bg-[#eb0000] text-white text-xs font-bold rounded hover:bg-red-700 transition-colors"
        >
          후기 작성하기
        </button>

        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded text-xs text-gray-600 bg-white hover:bg-gray-50"
          >
            {sortLabel[sortOption]}
            <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-100 rounded shadow-lg py-1">
              {Object.keys(sortLabel).map((key) => (
                <button
                  key={key}
                  onClick={() => {
                    setSortOption(key);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 ${
                    sortOption === key ? 'text-[#eb0000] font-bold' : 'text-gray-600'
                  }`}
                >
                  {sortLabel[key]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 📄 후기 목록 */}
      {sortedReviews.length > 0 ? (
        <div className="space-y-8">
          {sortedReviews.map((review) => (
            <div key={review.id} className="border-b border-gray-100 pb-8 last:border-0 last:pb-0">
              
              <div className="flex items-start gap-7 mb-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0">
                  {review.author?.profileImage ? (
                    <img
                      src={review.author.profileImage}
                      alt="profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${review.author?.name || review.consumerName}`}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-900">
                      {review.author?.name || review.consumerName || '익명'}
                    </span>
                    <span className="text-[11px] text-gray-400 mt-0.5">
                      {review.date || (review.createdAt ? review.createdAt.split('T')[0].replace(/-/g, '.') : '')}
                    </span>
                  </div>

                  <div className="flex gap-0.5 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < review.rating
                            ? 'text-[#eb0000] fill-[#eb0000]'
                            : 'text-gray-200 fill-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap mb-4">
                {review.content}
              </p>

              {review.imageUrls && review.imageUrls.length > 0 && (
                <div className="mt-3">
                  <img
                    src={review.imageUrls[0]}
                    alt="review attachment"
                    className="w-40 h-40 object-cover rounded-lg border border-gray-100"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}

            </div>
          ))}
        </div>
      ) : (
        <div className="py-10 text-center bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">아직 등록된 후기가 없습니다.</p>
          <p className="text-xs text-gray-400 mt-1">첫 번째 후기를 남겨주세요!</p>
        </div>
      )}
    </div>
  );
};

export default ReviewTab;
