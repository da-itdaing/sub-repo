import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import StarRatingInput from '@/components/ui/StarRatingInput';
import ImageUploader from '@/components/common/ImageUploader';
import { usePopupById } from '@/hooks/usePopups';
import { createReview } from '@/services/popupService';
import { ROUTES } from '@/routes/paths';
import { useToast } from '@/hooks/useToast';

const ReviewWritePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const popupId = Number(id);
  const { data: popup, isLoading } = usePopupById(popupId);
  const { addToast } = useToast();
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (rating === 0) {
      addToast({ title: '평점을 선택해주세요.', variant: 'error' });
      return;
    }
    if (!content.trim()) {
      addToast({ title: '리뷰 내용을 입력해주세요.', variant: 'error' });
      return;
    }
    setIsSubmitting(true);
    try {
      await createReview(popupId, {
        rating,
        content,
        images,
      });
      addToast({ title: '후기가 등록되었습니다.' });
      navigate(ROUTES.popupDetail(popupId));
    } catch (error) {
      console.error('review submit error', error);
      addToast({
        title: '후기 등록 실패',
        description: error.message || '다시 시도해주세요.',
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(ROUTES.popupDetail(popupId));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-gray-600">후기 작성 화면을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header hideSearchBar />
      <main className="flex-1 py-10">
        <div className="w-full max-w-[520px] md:max-w-3xl mx-auto px-5">
          <div className="rounded-3xl bg-white p-6 shadow-md ring-1 ring-gray-100 md:p-8">
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex items-center gap-1 text-sm text-gray-500 transition hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              상세 페이지로 돌아가기
            </button>

            <h1 className="mt-4 text-2xl font-bold text-gray-900">후기 작성하기</h1>
            <p className="text-sm text-gray-500">방문하신 경험을 솔직하게 공유해주세요.</p>

            {popup && (
              <div className="mt-6 rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-600">
                <p className="font-semibold text-gray-900">{popup.title}</p>
                {popup.address && <p className="mt-1">{popup.address}</p>}
                {popup.startDate && popup.endDate && (
                  <p className="mt-1 text-xs text-gray-500">
                    {popup.startDate} ~ {popup.endDate}
                  </p>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <StarRatingInput
                value={rating}
                onChange={setRating}
                label="평점 선택"
                helperText="별을 클릭하여 평점을 매겨주세요 (1~5점)"
              />

              <ImageUploader images={images} onChange={setImages} />

              <div>
                <p className="text-sm font-semibold text-gray-800 mb-2">후기 내용</p>
                <textarea
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  rows={6}
                  maxLength={800}
                  placeholder="좋았던 점, 아쉬웠던 점 등 방문 경험을 자유롭게 작성해주세요."
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-800 focus:border-primary focus:outline-none"
                />
                <p className="mt-1 text-xs text-gray-400 text-right">{content.length} / 800</p>
              </div>

              <div className="flex flex-col gap-3 md:flex-row md:justify-end">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 md:w-auto md:px-6"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:opacity-50 md:w-auto md:px-6"
                >
                  {isSubmitting ? '등록 중...' : '후기 등록'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ReviewWritePage;

