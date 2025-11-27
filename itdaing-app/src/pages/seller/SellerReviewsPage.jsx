import { useMemo, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { ROUTES } from '@/routes/paths';

const MOCK_POPUPS = [
  { id: 'all', title: '전체' },
  { id: 'popup-1', title: '여울원 팝업 IN 광주' },
  { id: 'popup-2', title: '충장 라온 페스타' },
  { id: 'popup-3', title: '[중장년 남성] 집밥에 진심인 남자들 : 제철 남도밥상' },
];

const MOCK_REVIEWS = [
  {
    id: 1,
    popupId: 'popup-2',
    rating: 5,
    nickname: '저녁산책할까요',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    content: '공예품이 친절하고 사장님이 귀여워요.',
    images: [1, 2],
    createdAt: '2025. 10. 25.',
  },
  {
    id: 2,
    popupId: 'popup-1',
    rating: 4,
    nickname: '튀밥',
    avatarUrl:
      'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&w=200&q=80',
    content: '다 너무 예쁜데 재고 조금만 더 쌓아주시면 안 될까요 ㅠㅠ',
    images: [1],
    createdAt: '2025. 10. 24.',
  },
  {
    id: 3,
    popupId: 'popup-3',
    rating: 5,
    nickname: '까아악',
    avatarUrl:
      'https://images.unsplash.com/photo-1518105779142-d975f22f1b0b?auto=format&fit=crop&w=200&q=80',
    content: '반장하세요~~',
    images: [],
    createdAt: '2025. 10. 24.',
  },
];

const RATING_FILTERS = [
  { key: 'latest', label: '최신순' },
  { key: '5', label: '5점' },
  { key: '4', label: '4점' },
  { key: '3', label: '3점' },
  { key: '2', label: '2점' },
  { key: '1', label: '1점' },
];

const SellerReviewsPage = () => {
  const [selectedPopupId, setSelectedPopupId] = useState('all');
  const [isRatingDropdownOpen, setIsRatingDropdownOpen] = useState(false);
  const [ratingFilter, setRatingFilter] = useState('latest');

  const filteredReviews = useMemo(() => {
    let list = MOCK_REVIEWS;
    if (selectedPopupId !== 'all') {
      list = list.filter((r) => r.popupId === selectedPopupId);
    }
    if (ratingFilter !== 'latest') {
      list = list.filter((r) => String(r.rating) === ratingFilter);
    }
    return list;
  }, [selectedPopupId, ratingFilter]);

  const averageRating = useMemo(() => {
    if (filteredReviews.length === 0) return 0;
    const sum = filteredReviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / filteredReviews.length).toFixed(1);
  }, [filteredReviews]);

  const ratingCounts = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    filteredReviews.forEach((r) => {
      counts[r.rating] += 1;
    });
    return counts;
  }, [filteredReviews]);

  const totalReviews = filteredReviews.length;

  const handleChangePopup = (event) => {
    setSelectedPopupId(event.target.value);
  };

  const handleSelectRatingFilter = (key) => {
    setRatingFilter(key);
    setIsRatingDropdownOpen(false);
  };

  const renderStars = (value) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className="h-4 w-4"
            fill={star <= value ? '#EB0000' : '#F9D5D5'}
            stroke={star <= value ? '#EB0000' : '#F97373'}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 상단 필터 & 셀렉트 */}
      <section className="rounded-3xl border border-white/80 bg-white p-6 shadow-sm shadow-slate-200/60">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-gray-900">리뷰 관리</h2>

          <div className="flex items-center gap-3">
            {/* <span className="text-sm font-medium text-gray-700">팝업 선택</span> */}
            <select
              value={selectedPopupId}
              onChange={handleChangePopup}
              className="min-w-[200px] rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {MOCK_POPUPS.map((popup) => (
                <option key={popup.id} value={popup.id}>
                  {popup.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 요약 카드 */}
        <div className="mt-6 flex flex-col gap-4 md:flex-row">
          {/* 평균 평점 카드 */}
          <div className="rounded-2xl border border-gray-200 bg-gray-50 px-6 py-4 text-center md:w-64">
            <p className="text-sm font-semibold text-gray-500">평균 평점</p>
            <div className="mt-3 flex flex-col items-center gap-1.5">
              {renderStars(Math.round(averageRating))}
              <p className="mt-1 text-3xl font-bold text-gray-900">{averageRating}</p>
            </div>
          </div>

          {/* 총 리뷰 수 카드 */}
          <div className="rounded-2xl border border-gray-200 bg-gray-50 px-6 py-4 text-center md:w-64">
            <p className="text-sm font-semibold text-gray-500">총 리뷰 수</p>
            <p className="mt-3 text-4xl font-bold text-gray-900">{totalReviews}</p>
          </div>

          {/* 별점 분포 카드 (가로로 더 넓게) */}
          <div className="rounded-2xl border border-gray-200 bg-gray-50 px-6 py-4 md:flex-1">
            <p className="text-xs font-semibold text-gray-500 mb-2">별점 분포</p>
            <div className="space-y-1.5">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = ratingCounts[rating];
                const ratio = totalReviews ? (count / totalReviews) * 100 : 0;
                return (
                  <div key={rating} className="flex items-center gap-2">
                    <span className="w-10 text-xs text-gray-500 flex items-center gap-0.5">
                      {rating}
                      <Star className="h-3 w-3 text-[#EB0000]" fill="#EB0000" />
                    </span>
                    <div className="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#EB0000] transition-all"
                        style={{ width: `${ratio}%` }}
                      />
                    </div>
                    <span className="w-6 text-xs text-gray-500 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 리뷰 리스트 영역 */}
      <section className="rounded-3xl border border-white/80 bg-white p-6 shadow-sm shadow-slate-200/60">
        {/* 상단 정렬 셀렉트 (두 번째 이미지) */}
        <div className="flex items-center justify-end mb-4">
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsRatingDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 rounded-xl border border-[#EB0000] px-3 py-1.5 text-sm font-medium text-gray-900"
            >
              <span>
                {ratingFilter === 'latest' ? '최신순' : `${ratingFilter}점`}
              </span>
              <ChevronDown
                className={`h-4 w-4 text-[#EB0000] transition-transform ${
                  isRatingDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isRatingDropdownOpen && (
              <div className="absolute right-0 top-full z-10 mt-1 w-56 rounded-2xl border border-[#EB0000] bg-white shadow-lg">
                <div className="border-b border-dashed border-gray-200 px-4 py-3 text-sm font-semibold">
                  최신순
                </div>
                <div className="px-4 py-3 space-y-2 text-sm">
                  {RATING_FILTERS.map((filter) => (
                    <button
                      key={filter.key}
                      type="button"
                      onClick={() => handleSelectRatingFilter(filter.key)}
                      className="flex w-full items-center justify-between gap-2 py-1 text-left hover:bg-gray-50 rounded-md"
                    >
                      {filter.key === 'latest' ? (
                        <span className="text-gray-900 font-medium">최신순</span>
                      ) : (
                        <>
                          {renderStars(Number(filter.key))}
                          <span className="text-xs text-gray-400 ml-2">
                            {ratingCounts[Number(filter.key)]}
                          </span>
                        </>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 리뷰 리스트 */}
        <div className="divide-y divide-gray-100">
          {filteredReviews.length === 0 ? (
            <div className="py-16 text-center text-sm text-gray-500">
              아직 등록된 리뷰가 없습니다.
            </div>
          ) : (
            filteredReviews.map((review) => (
              <div key={review.id} className="grid gap-4 py-6 md:grid-cols-[auto,1fr,auto]">
                {/* 왼쪽: 프로필 + 평점 + 내용 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <img
                      src={review.avatarUrl}
                      alt={review.nickname}
                      className="h-16 w-16 rounded-full object-cover border border-gray-200"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{review.nickname}</p>
                    <div className="mt-1 flex items-center gap-2">
                      {renderStars(review.rating)}
                    </div>
                    <p className="mt-3 text-sm text-gray-700 whitespace-pre-line">
                      {review.content}
                    </p>
                  </div>
                </div>

                {/* 가운데: 이미지 프리뷰 */}
                <div className="flex flex-wrap gap-3 md:justify-center">
                  {review.images.length > 0 ? (
                    review.images.map((imgIdx) => (
                      <div
                        key={imgIdx}
                        className="flex h-20 w-20 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-400"
                      >
                        <span className="text-xs">이미지</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-dashed border-gray-200 text-gray-300 text-xs">
                      이미지 없음
                    </div>
                  )}
                </div>

                {/* 오른쪽: 날짜 */}
                <div className="flex items-start justify-end text-xs text-gray-500">
                  {review.createdAt}
                </div>
              </div>
            ))
          )}
        </div>

        {/* 하단 페이지네이션 (간단 Mock) */}
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
          <button className="p-1 text-gray-400 hover:text-gray-600">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span>1 / 1</span>
          <button className="p-1 text-gray-400 hover:text-gray-600">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </div>
  );
};

export default SellerReviewsPage;


