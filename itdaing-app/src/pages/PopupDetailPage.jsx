import { useParams } from 'react-router-dom';
import { MapPin, Calendar, Clock, Star } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BottomNav from '@/components/layout/BottomNav';
import KakaoMap from '@/components/map/KakaoMap';
import { usePopupById, usePopupReviews } from '@/hooks/usePopups';
import { getImageUrl, getImageUrls } from '@/utils/imageUtils';

const PopupDetailPage = () => {
  const { id } = useParams();

  // 팝업 상세 조회
  const { data: popup, isLoading } = usePopupById(id);

  // 리뷰 조회
  const { data: reviews = [] } = usePopupReviews(id);

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
            className="w-full h-[400px] object-cover rounded-xl"
            onError={(e) => {
              e.target.src = '/placeholder-popup.png';
            }}
          />
        </div>

        {/* Basic Info */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold mb-4">{popup.title}</h1>
          
          <div className="space-y-3 text-gray-700">
            {popup.address && (
              <div className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
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
          <h2 className="text-xl font-bold mb-4">리뷰 ({reviews.length})</h2>
          
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

