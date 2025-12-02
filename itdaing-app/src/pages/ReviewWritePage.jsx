import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Star, Plus, X, Camera } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { usePopupById } from '@/hooks/usePopups';
import { createReview } from '@/services/popupService';
import { ROUTES } from '@/routes/paths';
import { useToast } from '@/hooks/useToast';

// 키워드 옵션 리스트 (상수)
const REVIEW_KEYWORDS = [
  '판매하는 굿즈가 좋아요',
  '분위기가 좋아요',
  '지인에게 추천하고 싶어요',
  '재방문 하고 싶어요',
  '컨셉이 독특해요',
  '연인과 함께 하기 좋아요',
  '가족, 아이들과 함께 즐길 수 있어요',
  '예쁜 포토존이 있어요',
  '사진이 예쁘게 나와요',
  '직접 체험할 수 있어요',
  '반려동물과 같이 가기 좋아요',
  '시설이 깔끔해요',
  '안내가 친절해요',
  '인테리어가 예뻐요',
];

const ReviewWritePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const popupId = Number(id);
  const { data: popup, isLoading } = usePopupById(popupId);
  const { addToast } = useToast();

  const [rating, setRating] = useState(0);
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 키워드 토글 핸들러
  const handleKeywordToggle = (keyword) => {
    if (selectedKeywords.includes(keyword)) {
      setSelectedKeywords(selectedKeywords.filter((k) => k !== keyword));
    } else {
      if (selectedKeywords.length >= 5) {
        addToast({ title: '키워드는 최대 5개까지 선택 가능합니다.', variant: 'error' });
        return;
      }
      setSelectedKeywords([...selectedKeywords, keyword]);
    }
  };

  // 이미지 업로드 핸들러
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 3) {
      addToast({ title: '사진은 최대 3장까지 첨부 가능합니다.', variant: 'error' });
      return;
    }

    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages([...images, ...newImages]);
  };

  const handleRemoveImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      addToast({ title: '별점을 선택해주세요.', variant: 'error' });
      return;
    }
    if (selectedKeywords.length === 0) {
      addToast({ title: '좋았던 점을 최소 1개 선택해주세요.', variant: 'error' });
      return;
    }
    if (!content.trim()) {
      addToast({ title: '후기 내용을 입력해주세요.', variant: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      await createReview(popupId, {
        rating,
        content,
        keywords: selectedKeywords,
        images: images.map((img) => img.preview),
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header hideSearchBar />

      <main className="flex-1 w-full max-w-[600px] mx-auto px-5 pt-8 md:pt-12 pb-24">
        {/* Top Navigation */}
        <div className="flex items-center mb-6">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1">
            <ArrowLeft className="w-6 h-6 text-gray-900" />
          </button>
          <h1 className="text-lg font-bold text-gray-900 ml-2">팝업 스토어 후기를 남겨주세요</h1>
        </div>

        {/* 1. Star Rating */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-base font-bold text-gray-900">별점</h2>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  key={score}
                  type="button"
                  onClick={() => setRating(score)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-6 h-6 ${
                      score <= rating
                        ? 'text-[#eb0000] fill-[#eb0000]'
                        : 'text-gray-300 fill-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 2. Keywords Selection */}
        <div className="mb-8">
          <h2 className="text-base font-bold text-gray-900 mb-1">
            어떤 점이 좋았나요? <span className="text-[#eb0000]">*</span>
          </h2>
          <p className="text-xs text-gray-500 mb-3">좋았던 점을 골라주세요. (최소 1개 - 최대 5개)</p>

          <div className="flex flex-wrap gap-3">
            {REVIEW_KEYWORDS.map((keyword) => {
              const isSelected = selectedKeywords.includes(keyword);
              return (
                <button
                  key={keyword}
                  type="button"
                  onClick={() => handleKeywordToggle(keyword)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    isSelected
                      ? 'border-[#eb0000] bg-[#eb0000] text-white'
                      : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {keyword}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Content Input */}
        <div className="mb-6">
          <div className="relative w-full">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="내용을 입력하세요"
              className="w-full h-40 p-4 text-sm text-gray-900 border border-gray-300 rounded-lg resize-none focus:outline-none focus:border-gray-900"
              maxLength={150}
            />
            <span className="absolute bottom-3 right-3 text-xs text-gray-400">
              {content.length} / 150
            </span>
          </div>
        </div>

        {/* 4. Image Upload */}
        <div className="mb-10">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {/* Upload Button */}
            {images.length < 3 && (
              <label className="flex flex-col items-center justify-center w-24 h-24 border border-dashed border-gray-300 rounded-xl cursor-pointer shrink-0 hover:bg-gray-50 transition-colors bg-white">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <div className="flex flex-col items-center gap-1">
                  <Camera className="w-6 h-6 text-gray-400" />
                  <span className="text-[10px] text-gray-400 font-medium">
                    {images.length}/3
                  </span>
                </div>
              </label>
            )}

            {/* Image Previews */}
            {images.map((img, index) => (
              <div
                key={index}
                className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200 shrink-0 group"
              >
                <img
                  src={img.preview}
                  alt={`preview ${index}`}
                  className="w-full h-full object-cover"
                />
                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-1.5 right-1.5 w-5 h-5 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full py-3.5 bg-[#eb0000] text-white text-sm font-bold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? '저장 중...' : '저장하기'}
        </button>
      </main>

      <Footer />
    </div>
  );
};

export default ReviewWritePage;
