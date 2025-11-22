import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  ArrowUp,
  Heart,
  Loader2,
  MapPin,
  Share2,
  Star,
  X,
} from 'lucide-react';
import KakaoMap from '../map/KakaoMap.jsx';
import {
  usePopupById,
  useSellerById,
  useReviewsByPopupId,
} from '../../hooks/usePopups.js';
import { useAuth } from '../../context/AuthContext.jsx';

function formatDateRange(start, end) {
  if (!start || !end) {
    return '일정 정보가 없습니다.';
  }
  return `${start} ~ ${end}`;
}

function formatOperatingHours(operatingHours) {
  if (!operatingHours || operatingHours.length === 0) {
    return '운영 시간 정보가 없습니다.';
  }
  return operatingHours.map(item => `${item.day} ${item.time}`).join(' / ');
}

function getFallbackImage() {
  return 'https://images.unsplash.com/photo-1555099962-4199c345e5dd?w=800&h=600&fit=crop';
}

function getFallbackAvatar() {
  return 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop';
}

function ReviewSummary({ average, total, breakdown }) {
  return (
    <section className="bg-white border-b border-gray-200 pb-10">
      <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="flex items-center justify-center gap-1 text-[#eb0000]">
            {[1, 2, 3, 4, 5].map(value => (
              <Star
                key={value}
                className="w-6 h-6"
                fill={value <= Math.round(average) ? '#EB0000' : 'none'}
                stroke="#EB0000"
              />
            ))}
          </div>
          <p className="font-['Pretendard:Medium',sans-serif] text-sm text-[#4d4d4d]">
            {total > 0 ? `평균 ${average.toFixed(1)}점 · 후기 ${total}개` : '아직 후기가 없습니다.'}
          </p>
        </div>

        <div className="flex-1 space-y-3 w-full">
          {breakdown.map(item => (
            <div key={item.score} className="flex items-center gap-3">
              <span className="w-12 text-sm font-semibold text-gray-900">
                {item.score}점
              </span>
              <div className="flex-1 h-3 bg-gray-200 rounded-full">
                <div
                  className="h-3 bg-[#eb0000] rounded-full"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
              <span className="w-12 text-right text-xs text-gray-500">
                {item.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

ReviewSummary.propTypes = {
  average: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  breakdown: PropTypes.arrayOf(
    PropTypes.shape({
      score: PropTypes.number.isRequired,
      percentage: PropTypes.number.isRequired,
    }),
  ).isRequired,
};

export default function PopupDetailPage({
  popupId,
  onClose,
  onMyPageClick,
  onNearbyExploreClick,
  isLoggedIn,
  onLoginClick,
  onPopupClick,
  showReviewWriteOnMount,
}) {
  const { isAuthenticated } = useAuth();
  const authCheck = isLoggedIn ?? isAuthenticated;

  const {
    popup,
    loading: popupLoading,
    error: popupError,
  } = usePopupById(popupId);
  const sellerId = popup?.sellerId ?? 0;
  const {
    seller,
    loading: sellerLoading,
    error: sellerError,
  } = useSellerById(sellerId);
  const {
    reviews,
    loading: reviewsLoading,
    error: reviewsError,
    average,
  } = useReviewsByPopupId(popupId);

  const [activeTab, setActiveTab] = useState('overview');
  const [favoriteCount, setFavoriteCount] = useState(popup?.favoriteCount ?? 0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showReviewInfo, setShowReviewInfo] = useState(Boolean(showReviewWriteOnMount));
  const [shareStatus, setShareStatus] = useState('');

  useEffect(() => {
    setFavoriteCount(popup?.favoriteCount ?? 0);
    setIsFavorite(false);
  }, [popup?.favoriteCount, popupId]);

  const ratingBreakdown = useMemo(() => {
    if (!reviews || reviews.length === 0) {
      return [5, 4, 3, 2, 1].map(score => ({ score, percentage: 0 }));
    }
    const total = reviews.length;
    return [5, 4, 3, 2, 1].map(score => {
      const count = reviews.filter(item => item.rating === score).length;
      return {
        score,
        percentage: Math.round((count / total) * 100),
      };
    });
  }, [reviews]);

  const handleToggleFavorite = () => {
    if (!authCheck) {
      onLoginClick?.();
      return;
    }
    setIsFavorite(prev => !prev);
    setFavoriteCount(prev => prev + (isFavorite ? -1 : 1));
  };

  const handleShare = async () => {
    if (!popup) return;
    if (typeof window === 'undefined') {
      setShareStatus('브라우저 환경에서만 공유가 가능합니다.');
      setTimeout(() => setShareStatus(''), 3_000);
      return;
    }
    const sharePayload = {
      title: popup.title ?? 'Da - It daing 팝업',
      text: popup.description ?? '흥미로운 팝업을 확인해보세요!',
      url: window.location.href,
    };
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share(sharePayload);
      } else if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(sharePayload.url);
        setShareStatus('링크가 복사되었습니다.');
        setTimeout(() => setShareStatus(''), 3_000);
      } else {
        setShareStatus('공유 기능을 지원하지 않는 브라우저입니다.');
        setTimeout(() => setShareStatus(''), 3_000);
      }
    } catch (error) {
      console.error('Share failed', error);
      setShareStatus('공유 중 오류가 발생했습니다.');
      setTimeout(() => setShareStatus(''), 3_000);
    }
  };

  const handleWriteReview = () => {
    if (!authCheck) {
      onLoginClick?.();
      return;
    }
    setShowReviewInfo(true);
  };

  const scrollToTop = () => {
    if (typeof window === 'undefined') return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isLoading = popupLoading || sellerLoading || reviewsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        <Loader2 className="w-6 h-6 mr-2 animate-spin" />
        팝업 정보를 불러오는 중입니다...
      </div>
    );
  }

  if (popupError) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        팝업 정보를 불러오지 못했습니다.
      </div>
    );
  }

  if (!popup) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        팝업을 찾을 수 없습니다.
      </div>
    );
  }

  const displayImage = popup.thumbnail || getFallbackImage();
  const sellerAvatar = seller?.profileImage || getFallbackAvatar();

  return (
    <div className="bg-white relative min-h-screen pb-24 pt-16 sm:pt-20 md:pt-24">
      <div className="max-w-[930px] mx-auto px-4">
        <header className="flex items-center justify-between py-4">
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="닫기"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleToggleFavorite}
              className="flex items-center gap-1.5 hover:opacity-90 transition-opacity"
            >
              <Heart
                className="w-5 h-5"
                fill={isFavorite ? '#FF0000' : 'none'}
                stroke={isFavorite ? '#FF0000' : '#111827'}
              />
              <span className="text-sm font-medium text-gray-800">{favoriteCount}</span>
            </button>

            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <MapPin className="w-5 h-5" />
              <span>{popup.viewCount ?? 0}</span>
            </div>

            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-1.5 hover:opacity-90 transition-opacity"
            >
              <Share2 className="w-5 h-5" />
              <span className="text-sm font-medium text-gray-800">공유</span>
            </button>
          </div>
        </header>

        {shareStatus && (
          <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700" role="status">
            {shareStatus}
          </div>
        )}

        <div className="rounded-2xl overflow-hidden shadow-sm bg-gray-50 mb-8">
          <img
            src={displayImage}
            alt={popup.title}
            className="w-full h-64 sm:h-80 object-cover"
          />
        </div>

        <section className="mb-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-1 space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">{popup.title}</h1>
              <p className="text-sm text-gray-600">{formatDateRange(popup.startDate, popup.endDate)}</p>
              <p className="text-sm text-gray-700 flex items-start gap-2">
                <MapPin className="w-5 h-5 text-[#eb0000] mt-0.5" />
                <span>{popup.address ?? popup.locationName ?? '주소 정보 없음'}</span>
              </p>
              <p className="text-sm text-gray-700">{formatOperatingHours(popup.operatingHours)}</p>
              {popup.styleTags && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {popup.styleTags.map(tag => (
                    <span
                      key={tag}
                      className="rounded-full border border-[#eb0000] px-3 py-1 text-xs text-gray-800"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {seller && (
              <button
                type="button"
                onClick={() => onPopupClick?.(popup.id)}
                className="hidden sm:flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                aria-label="판매자 정보 보기"
              >
                <img
                  src={sellerAvatar}
                  alt={seller.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
                <div className="text-center text-sm text-gray-800">
                  <p className="font-semibold">{seller.name}</p>
                  <p className="text-xs text-gray-500">{seller.category ?? '카테고리 미정'}</p>
                </div>
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className={`flex-1 min-w-[120px] h-12 rounded-full border text-sm font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'border-[#eb0000] text-[#eb0000]'
                  : 'border-gray-300 hover:border-[#eb0000] hover:text-[#eb0000]'
              }`}
              onClick={() => setActiveTab('overview')}
            >
              설명
            </button>
            <button
              type="button"
              className={`flex-1 min-w-[120px] h-12 rounded-full border text-sm font-medium transition-colors ${
                activeTab === 'map'
                  ? 'border-[#eb0000] text-[#eb0000]'
                  : 'border-gray-300 hover:border-[#eb0000] hover:text-[#eb0000]'
              }`}
              onClick={() => setActiveTab('map')}
            >
              지도
            </button>
            <button
              type="button"
              className={`flex-1 min-w-[120px] h-12 rounded-full border text-sm font-medium transition-colors ${
                activeTab === 'reviews'
                  ? 'border-[#eb0000] text-[#eb0000]'
                  : 'border-gray-300 hover:border-[#eb0000] hover:text-[#eb0000]'
              }`}
              onClick={() => setActiveTab('reviews')}
            >
              후기
            </button>
          </div>
        </section>

        {activeTab === 'overview' && (
          <section className="space-y-6">
            <article className="bg-[#fbfbfb] rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">상세 소개</h2>
              <p className="text-sm leading-relaxed whitespace-pre-line text-gray-700">
                {popup.description || '설명 정보가 준비 중입니다.'}
              </p>
            </article>

            {sellerError ? null : seller && (
              <article className="border rounded-2xl p-5 flex gap-4 items-center">
                <img
                  src={sellerAvatar}
                  alt={seller.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">판매자</p>
                  <p className="text-base font-semibold text-gray-900">{seller.name}</p>
                  {seller.description && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {seller.description}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={onMyPageClick}
                    className="rounded-full border border-gray-300 px-4 py-2 text-xs hover:border-[#eb0000] hover:text-[#eb0000] transition-colors"
                  >
                    마이페이지
                  </button>
                  <button
                    type="button"
                    onClick={onNearbyExploreClick}
                    className="rounded-full border border-gray-300 px-4 py-2 text-xs hover:border-[#eb0000] hover:text-[#eb0000] transition-colors"
                  >
                    근처 탐색
                  </button>
                </div>
              </article>
            )}
          </section>
        )}

        {activeTab === 'map' && (
          <section className="space-y-4">
            <div className="rounded-2xl overflow-hidden shadow-sm">
              {popup.latitude != null && popup.longitude != null ? (
                <KakaoMap
                  center={{ lat: popup.latitude, lng: popup.longitude }}
                  markers={[
                    {
                      id: popup.id,
                      lat: popup.latitude,
                      lng: popup.longitude,
                      label: popup.title,
                    },
                  ]}
                  height="h-80"
                  level={3}
                  showControls
                />
              ) : (
                <div className="h-80 flex items-center justify-center bg-gray-100 text-gray-500">
                  위치 정보가 없습니다.
                </div>
              )}
            </div>
            <div className="space-y-2 text-sm text-gray-700">
              <p>{popup.address ?? popup.locationName ?? '주소 정보 없음'}</p>
              <button
                type="button"
                onClick={onNearbyExploreClick}
                className="inline-flex items-center gap-1 text-[#eb0000] hover:underline"
              >
                근처 탐색하기
              </button>
            </div>
          </section>
        )}

        {activeTab === 'reviews' && (
          <section className="space-y-6">
            {reviewsError && (
              <p className="text-sm text-red-600">후기 정보를 불러오지 못했습니다.</p>
            )}
            <ReviewSummary average={average} total={reviews.length} breakdown={ratingBreakdown} />

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleWriteReview}
                className="flex-1 sm:flex-none rounded-full bg-[#eb0000] px-5 py-2 text-sm font-semibold text-white hover:bg-[#cc0000] transition-colors"
              >
                후기 작성하기
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className="flex-1 sm:flex-none rounded-full border border-gray-300 px-5 py-2 text-sm hover:border-[#eb0000] hover:text-[#eb0000] transition-colors"
              >
                상세 정보로 이동
              </button>
            </div>

            {showReviewInfo && (
              <div className="rounded-lg border border-[#eb0000] bg-red-50 px-4 py-3 text-sm text-[#9a1f1f]">
                후기 작성 기능은 준비 중입니다. 빠른 시일 내에 제공해 드릴게요!
              </div>
            )}

            <div className="space-y-6">
              {reviews.length === 0 && (
                <p className="text-sm text-gray-500">아직 등록된 후기가 없습니다.</p>
              )}
              {reviews.map(review => (
                <article key={review.id} className="border-b border-gray-200 pb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={review.userImage || getFallbackAvatar()}
                      alt={review.userName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{review.userName}</p>
                      <p className="text-xs text-gray-500">{review.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mb-2 text-[#eb0000]">
                    {[1, 2, 3, 4, 5].map(value => (
                      <Star
                        key={value}
                        className="w-4 h-4"
                        fill={value <= review.rating ? '#EB0000' : 'none'}
                        stroke="#EB0000"
                      />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-line">
                    {review.content}
                  </p>
                  {review.images && review.images.length > 0 && (
                    <div className="mt-3">
                      <img
                        src={review.images[0]}
                        alt="리뷰 이미지"
                        className="w-48 h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}
      </div>

      <button
        type="button"
        onClick={scrollToTop}
        className="fixed bottom-16 right-6 w-14 h-14 bg-[#eb0000] text-white rounded-full shadow-xl hover:bg-[#cc0000] transition-colors flex items-center justify-center"
        aria-label="위로 이동"
      >
        <ArrowUp className="w-6 h-6" />
      </button>
    </div>
  );
}

PopupDetailPage.propTypes = {
  popupId: PropTypes.number.isRequired,
  onClose: PropTypes.func,
  onMyPageClick: PropTypes.func,
  onNearbyExploreClick: PropTypes.func,
  isLoggedIn: PropTypes.bool,
  onLoginClick: PropTypes.func,
  onPopupClick: PropTypes.func,
  showReviewWriteOnMount: PropTypes.bool,
};

PopupDetailPage.defaultProps = {
  onClose: undefined,
  onMyPageClick: undefined,
  onNearbyExploreClick: undefined,
  isLoggedIn: undefined,
  onLoginClick: undefined,
  onPopupClick: undefined,
  showReviewWriteOnMount: false,
};
