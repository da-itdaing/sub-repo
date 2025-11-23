import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapPin, Calendar, Clock, Star, Heart, Pencil } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BottomNav from '@/components/layout/BottomNav';
import KakaoMap from '@/components/map/KakaoMap';
import { usePopupById, usePopupReviews } from '@/hooks/usePopups';
import { getImageUrl, getImageUrls } from '@/utils/imageUtils';
import { addToWishlist, removeFromWishlist } from '@/services/wishlistService';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/useToast';
import { useLoginPrompt } from '@/hooks/useLoginPrompt';
import { ROUTES } from '@/routes/paths';

const PopupDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const { addToast } = useToast();
  const { openLoginPrompt } = useLoginPrompt();
  const role = useAuthStore((state) => state.role);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);

  // 팝업 상세 조회
  const { data: popup, isLoading } = usePopupById(id);

  // 리뷰 조회
  const { data: reviews = [] } = usePopupReviews(id);

  useEffect(() => {
    setIsFavorite(Boolean(popup?.isFavorite));
  }, [popup?.isFavorite]);

  const handleFavoriteToggle = async () => {
    if (!popup?.id) return;
    if (!isAuthenticated) {
      const shouldLogin = await openLoginPrompt({
        description: '관심 팝업은 로그인 후 이용 가능합니다.\n지금 로그인하시겠습니까?',
      });
      if (shouldLogin) navigate(ROUTES.login);
      return;
    }

    if (role && role !== 'CONSUMER') {
      addToast({
        title: '관심 팝업은 소비자 계정에서만 이용 가능합니다.',
        variant: 'error',
      });
      return;
    }
    if (isFavoriteLoading) return;
    setIsFavoriteLoading(true);
    try {
      if (isFavorite) {
        await removeFromWishlist(popup.id);
        addToast({ title: '관심 목록에서 제거되었습니다.' });
      } else {
        await addToWishlist(popup.id);
        addToast({ title: '관심 목록에 추가되었습니다.' });
      }
      setIsFavorite((prev) => !prev);
      queryClient.invalidateQueries({ queryKey: ['my-wishlist'] });
    } catch (error) {
      console.error('popup detail wishlist error', error);
      addToast({
        title: '관심 목록 처리 실패',
        description: error.message || '다시 시도해주세요.',
        variant: 'error',
      });
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  const handleReviewWrite = async () => {
    if (!popup?.id) return;
    if (!isAuthenticated) {
      const shouldLogin = await openLoginPrompt({
        title: '후기 작성 전 로그인',
        description: '후기 작성은 로그인 후 이용 가능합니다.\n지금 로그인하시겠습니까?',
      });
      if (shouldLogin) navigate(ROUTES.login);
      return;
    }
    if (role && role !== 'CONSUMER') {
      addToast({
        title: '후기 작성은 소비자 계정에서만 이용 가능합니다.',
        variant: 'error',
      });
      return;
    }
    navigate(ROUTES.reviewWrite(popup.id));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!popup) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">팝업을 찾을 수 없습니다.</p>
      </div>
    );
  }

  const gallery = getImageUrls(popup.gallery || popup.imageUrls || []);
  const mainImage = gallery[0] || getImageUrl(popup.thumbnail || popup.thumbnailImageUrl, '/placeholder-popup.png');

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 md:px-6 lg:px-8 py-8">
        {/* Image Gallery */}
        <div className="mb-8">
          <img
            src={mainImage}
            alt={popup.title}
            className="w-full h-[260px] rounded-3xl object-cover md:h-[420px]"
            onError={(e) => {
              e.target.src = '/placeholder-popup.png';
            }}
          />
        </div>

        {/* Basic Info */}
        <div className="bg-white rounded-3xl shadow-md p-5 mb-6 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{popup.title}</h1>
              {popup.subtitle && <p className="text-gray-500">{popup.subtitle}</p>}
            </div>
            <button
              type="button"
              onClick={handleFavoriteToggle}
              disabled={isFavoriteLoading}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                isFavorite ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Heart
                className={`h-4 w-4 ${isFavorite ? 'fill-primary text-primary' : 'text-gray-500'}`}
              />
              {isFavorite ? '관심 등록됨' : '관심 팝업'}
            </button>
          </div>

          <div className="mt-4 space-y-3 text-gray-700">
            {popup.address && (
              <div className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <span>{popup.address}</span>
              </div>
            )}
            
            {(popup.startDate || popup.endDate) && (
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                <span>{popup.startDate} ~ {popup.endDate}</span>
              </div>
            )}
            
            {popup.hours && (
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <span>{popup.hours}</span>
              </div>
            )}
          </div>

          {/* Rating */}
          {popup.reviewSummary && popup.reviewSummary.average > 0 && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t">
              <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
              <span className="text-2xl font-bold">{popup.reviewSummary.average.toFixed(1)}</span>
              <span className="text-gray-500">({popup.reviewSummary.total}개 리뷰)</span>
            </div>
          )}
        </div>

        {/* Map */}
        {popup.latitude && popup.longitude && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">위치</h2>
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
              height="300px"
              level={3}
            />
          </div>
        )}

        {/* Description */}
        {popup.description && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">상세 정보</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{popup.description}</p>
          </div>
        )}

        {/* Reviews */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
            <h2 className="text-xl font-bold">리뷰 ({reviews.length})</h2>
            <button
              type="button"
              onClick={handleReviewWrite}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              <Pencil className="h-4 w-4" />
              후기 작성하기
            </button>
          </div>
          
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border-b pb-4 last:border-b-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold">{review.author?.name || review.consumerName}</span>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="ml-1 text-sm">{review.rating}</span>
                    </div>
                  </div>
                  <p className="text-gray-700">{review.content}</p>
                  <span className="text-sm text-gray-500">{review.date || review.createdAt}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">아직 리뷰가 없습니다.</p>
          )}
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default PopupDetailPage;

