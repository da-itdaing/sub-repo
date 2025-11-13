import React, { useState } from "react";
import { reviewService } from "../../services/reviewService";
import { ImageUploader } from "../common/ImageUploader";

interface ReviewWritePageProps {
  popupId: number;
  reviewId?: number;
  initialRating?: number;
  initialContent?: string;
  initialImages?: string[];
  onBack: () => void;
  onMyPageClick?: () => void;
  onNearbyExploreClick?: () => void;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ReviewWritePage({
  popupId,
  reviewId,
  initialRating,
  initialContent,
  initialImages,
  onBack,
  onMyPageClick,
  onNearbyExploreClick,
  onClose,
  onSuccess,
}: ReviewWritePageProps) {
  const [content, setContent] = useState(initialContent || "");
  const [rating, setRating] = useState(initialRating || 3);
  const [imageUrls, setImageUrls] = useState<string[]>(initialImages || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!content.trim()) {
      setError("후기 내용을 입력해주세요.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (reviewId) {
        // Update existing review
        await reviewService.updateReview(reviewId, {
          rating: rating as 1 | 2 | 3 | 4 | 5,
          content: content.trim(),
          imageUrls: imageUrls,
        });
      } else {
        // Create new review
        await reviewService.createReview(popupId, {
          rating: rating as 1 | 2 | 3 | 4 | 5,
          content: content.trim(),
          imageUrls: imageUrls,
        });
      }
      onSuccess?.();
      if (!reviewId) {
        onMyPageClick?.();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : (reviewId ? "후기 수정에 실패했습니다." : "후기 작성에 실패했습니다."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-6 pt-24">
      <div className="max-w-[640px] mx-auto space-y-4">
        <h1 className="text-xl font-bold">{reviewId ? "후기 수정" : "후기 작성"}</h1>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              onClick={() => setRating(i)}
              className={`w-8 h-8 rounded ${
                i <= rating ? "bg-[#eb0000] text-white" : "bg-gray-200"
              }`}
            >
              {i}
            </button>
          ))}
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-40 border rounded p-3 focus:outline-none focus:border-[#eb0000]"
          placeholder="후기를 입력하세요"
          maxLength={150}
        />
        <div className="text-sm text-gray-500">{content.length}/150</div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            이미지 (선택사항)
          </label>
          <ImageUploader
            category="REVIEW"
            resourceId={reviewId}
            multiple={true}
            maxFiles={5}
            onUploadComplete={(urls) => {
              setImageUrls((prev) => [...prev, ...urls]);
            }}
            existingImages={imageUrls}
            onRemoveExisting={(url) => {
              setImageUrls((prev) => prev.filter(u => u !== url));
            }}
          />
        </div>
        <div className="flex gap-3">
          <button onClick={onBack} className="px-4 py-2 rounded bg-gray-200" disabled={loading}>
            뒤로
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded bg-[#eb0000] text-white disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "저장 중..." : "저장"}
          </button>
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-100" disabled={loading}>
            닫기
          </button>
          <button
            onClick={onNearbyExploreClick}
            className="px-4 py-2 rounded bg-gray-100"
            disabled={loading}
          >
            근처 탐색
          </button>
        </div>
      </div>
    </div>
  );
}
export default ReviewWritePage;
