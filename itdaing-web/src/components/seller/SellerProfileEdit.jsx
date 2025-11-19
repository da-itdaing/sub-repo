import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import ImageUpload from "../common/ImageUpload";
import { sellerService } from "../../services/sellerService";
import { Button } from "../ui/button";

export function SellerProfileEdit({ sellerId, onClose, onSave }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    profileImage: null,
    introduction: "",
    activityRegion: "",
    snsUrl: "",
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProfile();
  }, [sellerId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const profile = await sellerService.getMyProfile();
      setFormData({
        profileImage: profile.profileImage ? {
          url: profile.profileImage.url,
          key: profile.profileImage.key,
        } : null,
        introduction: profile.introduction || "",
        activityRegion: profile.activityRegion || "",
        snsUrl: profile.snsUrl || "",
      });
    } catch (err) {
      setError(err.message || "프로필을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const request = {
        profileImage: formData.profileImage,
        introduction: formData.introduction.trim(),
        activityRegion: formData.activityRegion.trim(),
        snsUrl: formData.snsUrl.trim() || null,
      };

      await sellerService.updateMyProfile(request);
      onSave?.();
      onClose?.();
    } catch (err) {
      setError(err.message || "프로필 수정에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <p className="text-center text-gray-600">프로필을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">프로필 수정</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* 프로필 이미지 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              프로필 이미지
            </label>
            <ImageUpload
              value={formData.profileImage ? [formData.profileImage] : []}
              onChange={(images) =>
                setFormData({ ...formData, profileImage: images[0] || null })
              }
              maxImages={1}
              multiple={false}
            />
          </div>

          {/* 활동 지역 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              활동 지역 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.activityRegion}
              onChange={(e) =>
                setFormData({ ...formData, activityRegion: e.target.value })
              }
              required
              placeholder="예: 광주/남구"
              className="w-full h-10 rounded-lg border border-gray-300 px-4 text-sm focus:outline-none focus:border-[#eb0000]"
            />
          </div>

          {/* SNS URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SNS URL
            </label>
            <input
              type="url"
              value={formData.snsUrl}
              onChange={(e) =>
                setFormData({ ...formData, snsUrl: e.target.value })
              }
              placeholder="https://instagram.com/your_account"
              className="w-full h-10 rounded-lg border border-gray-300 px-4 text-sm focus:outline-none focus:border-[#eb0000]"
            />
          </div>

          {/* 소개 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              소개
            </label>
            <textarea
              value={formData.introduction}
              onChange={(e) =>
                setFormData({ ...formData, introduction: e.target.value })
              }
              placeholder="자신을 소개해주세요"
              rows={4}
              maxLength={1000}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:border-[#eb0000] resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.introduction.length}/1000자
            </p>
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="flex-1 bg-[#eb0000] hover:bg-[#d10000] text-white"
            >
              {saving ? "저장 중..." : "저장"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SellerProfileEdit;

