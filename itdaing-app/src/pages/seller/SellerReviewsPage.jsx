import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, ChevronLeft, ChevronRight, Star, MessageSquare } from 'lucide-react';
import { getMyPopups, getPopupReviews } from '@/services/sellerService';

const RATING_FILTERS = [
  { key: 'latest', label: '최신순' },
  { key: '5', label: '5점' },
  { key: '4', label: '4점' },
  { key: '3', label: '3점' },
  { key: '2', label: '2점' },
  { key: '1', label: '1점' },
];

const ITEMS_PER_PAGE = 10;

const SellerReviewsPage = () => {
  const [selectedPopupId, setSelectedPopupId] = useState('all');
  const [isRatingDropdownOpen, setIsRatingDropdownOpen] = useState(false);
  const [ratingFilter, setRatingFilter] = useState('latest');
  const [currentPage, setCurrentPage] = useState(1);

  // 내 팝업 목록 조회
  const { data: popups = [], isLoading: isLoadingPopups } = useQuery({
    queryKey: ['myPopups'],
    queryFn: getMyPopups,
    staleTime: 5 * 60 * 1000,
  });

  // 선택된 팝업의 리뷰 조회 (전체 선택 시 모든 팝업 리뷰 합산)
  const { data: reviewsData = [], isLoading: isLoadingReviews } = useQuery({
    queryKey: ['popupReviews', selectedPopupId, popups.map(p => p.id)],
    queryFn: async () => {
      if (selectedPopupId === 'all') {
        // 모든 팝업의 리뷰를 병합
        const allReviews = await Promise.all(
          popups.map(async (popup) => {
            try {
              const reviews = await getPopupReviews(popup.id);
              return (Array.isArray(reviews) ? reviews : []).map((r) => ({
                ...r,
                popupId: popup.id,
                popupTitle: popup.title,
              }));
            } catch {
              return [];
            }
          })
        );
        return allReviews.flat();
      } else {
        const popup = popups.find((p) => String(p.id) === selectedPopupId);
        try {
          const reviews = await getPopupReviews(selectedPopupId);
          return (Array.isArray(reviews) ? reviews : []).map((r) => ({
            ...r,
            popupId: popup?.id,
            popupTitle: popup?.title,
          }));
        } catch {
          return [];
        }
      }
    },
    enabled: popups.length > 0,
    staleTime: 2 * 60 * 1000,
  });

  // 팝업 옵션 목록 구성
  const popupOptions = useMemo(() => {
    const options = [{ id: 'all', title: '전체' }];
    popups.forEach((p) => options.push({ id: String(p.id), title: p.title }));
    return options;
  }, [popups]);

  // 필터링된 리뷰
  const filteredReviews = useMemo(() => {
    let list = [...reviewsData];
    
    // 별점 필터
    if (ratingFilter !== 'latest') {
      list = list.filter((r) => String(r.rating) === ratingFilter);
    }
    
    // 최신순 정렬
    list.sort((a, b) => {
      const dateA = a.date || a.createdAt || '';
      const dateB = b.date || b.createdAt || '';
      return new Date(dateB) - new Date(dateA);
    });
    
    return list;
  }, [reviewsData, ratingFilter]);

  // 평균 평점 계산
  const averageRating = useMemo(() => {
    if (filteredReviews.length === 0) return 0;
    const sum = filteredReviews.reduce((acc, r) => acc + (r.rating || 0), 0);
    return (sum / filteredReviews.length).toFixed(1);
  }, [filteredReviews]);

  // 별점 분포 계산
  const ratingCounts = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    filteredReviews.forEach((r) => {
      if (r.rating >= 1 && r.rating <= 5) {
        counts[r.rating] += 1;
      }
    });
    return counts;
  }, [filteredReviews]);

  const totalReviews = filteredReviews.length;

  // 페이지네이션
  const totalPages = Math.ceil(totalReviews / ITEMS_PER_PAGE);
  const paginatedReviews = filteredReviews.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleChangePopup = (event) => {
    setSelectedPopupId(event.target.value);
    setCurrentPage(1);
  };

  const handleSelectRatingFilter = (key) => {
    setRatingFilter(key);
    setIsRatingDropdownOpen(false);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
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

  const isLoading = isLoadingPopups || isLoadingReviews;

  if (isLoadingPopups) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">팝업 정보를 불러오는 중...</div>
      </div>
    );
  }

  if (!popups.length) {
    return (
      <div className="space-y-6">
        <section className="rounded-3xl border border-white/80 bg-white p-6 shadow-sm shadow-slate-200/60">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <MessageSquare className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              등록된 팝업이 없습니다
            </h3>
            <p className="text-sm text-gray-500">
              팝업을 등록하면 리뷰를 확인할 수 있습니다.
            </p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 타이틀 & 팝업 선택 영역 */}
      <section className="rounded-3xl border border-white/80 bg-white p-6 shadow-sm shadow-slate-200/60">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-bold text-[#EB0000]">리뷰 관리</h2>
            <div className="relative w-full max-w-xs">
              <select
                value={selectedPopupId}
                onChange={handleChangePopup}
                className="w-full appearance-none rounded-full border border-gray-300 py-2 pl-4 pr-10 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              >
                {popupOptions.map((popup) => (
                  <option key={popup.id} value={popup.id}>
                    {popup.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
            </div>
          </div>
          <div className="h-0 w-0 md:h-auto md:w-auto" />
        </div>
      </section>

      {/* 리뷰 요약 지표 영역 */}
      <section className="rounded-3xl border border-white/80 bg-white p-6 shadow-sm shadow-slate-200/60">
        <div className="flex flex-col gap-4 md:flex-row">
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

          {/* 별점 분포 카드 */}
          <div className="rounded-2xl border border-gray-200 bg-gray-50 px-6 py-4 md:flex-1">
            <p className="mb-2 text-xs font-semibold text-gray-500">별점 분포</p>
            <div className="space-y-1.5">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = ratingCounts[rating];
                const ratio = totalReviews ? (count / totalReviews) * 100 : 0;
                return (
                  <div key={rating} className="flex items-center gap-2">
                    <span className="flex w-10 items-center gap-0.5 text-xs text-gray-500">
                      {rating}
                      <Star className="h-3 w-3 text-[#EB0000]" fill="#EB0000" />
                    </span>
                    <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full rounded-full bg-[#EB0000] transition-all"
                        style={{ width: `${ratio}%` }}
                      />
                    </div>
                    <span className="w-6 text-right text-xs text-gray-500">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 리뷰 리스트 영역 */}
      <section className="rounded-3xl border border-white/80 bg-white p-6 shadow-sm shadow-slate-200/60">
        {/* 상단 정렬 셀렉트 */}
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
                  정렬 기준
                </div>
                <div className="px-4 py-3 space-y-2 text-sm">
                  {RATING_FILTERS.map((filter) => (
                    <button
                      key={filter.key}
                      type="button"
                      onClick={() => handleSelectRatingFilter(filter.key)}
                      className={`flex w-full items-center justify-between gap-2 py-1 text-left hover:bg-gray-50 rounded-md px-2 ${
                        ratingFilter === filter.key ? 'bg-gray-100' : ''
                      }`}
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
        {isLoading ? (
          <div className="py-16 text-center text-sm text-gray-500">
            리뷰를 불러오는 중...
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {paginatedReviews.length === 0 ? (
              <div className="py-16 text-center text-sm text-gray-500">
                아직 등록된 리뷰가 없습니다.
              </div>
            ) : (
              paginatedReviews.map((review) => (
                <div key={review.id} className="grid gap-4 py-6 md:grid-cols-[auto,1fr,auto]">
                  {/* 왼쪽: 프로필 + 평점 + 내용 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      {review.author?.profileImageUrl ? (
                        <img
                          src={review.author.profileImageUrl}
                          alt={review.author.nickname || '리뷰어'}
                          className="h-16 w-16 rounded-full object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-semibold">
                          {(review.author?.nickname || '?')[0]}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-gray-900">
                          {review.author?.nickname || '익명'}
                        </p>
                        {review.popupTitle && selectedPopupId === 'all' && (
                          <span className="text-xs text-gray-400 truncate max-w-[150px]">
                            • {review.popupTitle}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        {renderStars(review.rating || 0)}
                      </div>
                      <p className="mt-3 text-sm text-gray-700 whitespace-pre-line">
                        {review.content}
                      </p>
                    </div>
                  </div>

                  {/* 가운데: 이미지 프리뷰 */}
                  <div className="flex flex-wrap gap-3 md:justify-center">
                    {review.images && review.images.length > 0 ? (
                      review.images.slice(0, 3).map((img, idx) => (
                        <div
                          key={idx}
                          className="h-20 w-20 rounded-xl border border-gray-200 bg-gray-50 overflow-hidden"
                        >
                          <img
                            src={typeof img === 'string' ? img : img.url}
                            alt={`리뷰 이미지 ${idx + 1}`}
                            className="h-full w-full object-cover"
                          />
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
                    {review.date || review.createdAt?.split('T')[0] || '-'}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 하단 페이지네이션 */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span>
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default SellerReviewsPage;
