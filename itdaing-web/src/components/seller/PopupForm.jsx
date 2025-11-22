import React, { useState, useEffect } from "react";
import { X, Calendar, MapPin } from "lucide-react";
import ImageUpload from "../custom-ui/ImageUpload.jsx";
import apiClient from "../../services/api.js";
import { Button } from "../ui/button.jsx";
import CellSelector from "./CellSelector.jsx";

export function PopupForm({ popupId, onClose, onSave }) {
  const [loading, setLoading] = useState(!!popupId);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    operatingTime: "",
    zoneCellId: null,
    categoryIds: [],
    targetCategoryIds: [],
    featureIds: [],
    styleIds: [],
    thumbnailImage: null,
    images: [],
  });
  const [error, setError] = useState(null);
  const [showCellSelector, setShowCellSelector] = useState(false);

  useEffect(() => {
    if (popupId) {
      loadPopup();
    }
  }, [popupId]);

  const loadPopup = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/popups/${popupId}`);
      if (response?.data?.success && response.data.data) {
        const popup = response.data.data;
        setFormData({
          title: popup.title || "",
          description: popup.description || "",
          startDate: popup.startDate || "",
          endDate: popup.endDate || "",
          operatingTime: popup.hours || "",
          zoneCellId: popup.cellId || null,
          categoryIds: popup.categoryIds || [],
          targetCategoryIds: [],
          featureIds: popup.featureIds || [],
          styleIds: [],
          thumbnailImage: popup.thumbnail ? {
            url: popup.thumbnail,
            key: null,
          } : null,
          images: (popup.gallery || []).map(url => ({
            url,
            key: null,
          })),
        });
      }
    } catch (err) {
      setError(err.message || "팝업 정보를 불러오는데 실패했습니다.");
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
        title: formData.title.trim(),
        description: formData.description.trim(),
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        operatingTime: formData.operatingTime.trim() || null,
        zoneCellId: formData.zoneCellId,
        categoryIds: formData.categoryIds,
        targetCategoryIds: formData.targetCategoryIds,
        featureIds: formData.featureIds,
        styleIds: formData.styleIds,
        thumbnailImage: formData.thumbnailImage,
        images: formData.images.map(img => ({ url: img.url, key: img.key })),
      };

      const url = popupId ? `/popups/${popupId}` : "/popups";
      const method = popupId ? "put" : "post";
      const response = await apiClient[method](url, request);

      if (response?.data?.success) {
        onSave?.();
        onClose?.();
      } else {
        throw new Error(response?.data?.error?.message || "저장에 실패했습니다.");
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message || "팝업 저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <p className="text-center text-gray-600">팝업 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {popupId ? "팝업 수정" : "신규 팝업 등록"}
          </h2>
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

          {/* 제목 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              팝업 제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
              placeholder="팝업 제목을 입력하세요"
              className="w-full h-10 rounded-lg border border-gray-300 px-4 text-sm focus:outline-none focus:border-[#eb0000]"
            />
          </div>

          {/* 설명 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              설명
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="팝업에 대한 설명을 입력하세요"
              rows={4}
              maxLength={3000}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:border-[#eb0000] resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.description.length}/3000자
            </p>
          </div>

          {/* 날짜 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                시작일
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                className="w-full h-10 rounded-lg border border-gray-300 px-4 text-sm focus:outline-none focus:border-[#eb0000]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                종료일
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                min={formData.startDate}
                className="w-full h-10 rounded-lg border border-gray-300 px-4 text-sm focus:outline-none focus:border-[#eb0000]"
              />
            </div>
          </div>

          {/* 운영 시간 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              운영 시간
            </label>
            <input
              type="text"
              value={formData.operatingTime}
              onChange={(e) =>
                setFormData({ ...formData, operatingTime: e.target.value })
              }
              placeholder="예: 매일 11:00-20:00"
              className="w-full h-10 rounded-lg border border-gray-300 px-4 text-sm focus:outline-none focus:border-[#eb0000]"
            />
          </div>

          {/* 썸네일 이미지 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              썸네일 이미지
            </label>
            <ImageUpload
              value={formData.thumbnailImage ? [formData.thumbnailImage] : []}
              onChange={(images) =>
                setFormData({ ...formData, thumbnailImage: images[0] || null })
              }
              maxImages={1}
              multiple={false}
            />
          </div>

          {/* 갤러리 이미지 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              갤러리 이미지 (최대 10개)
            </label>
            <ImageUpload
              value={formData.images}
              onChange={(images) =>
                setFormData({ ...formData, images })
              }
              maxImages={10}
              multiple={true}
            />
          </div>

          {/* 셀 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              셀 선택 <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
            <input
              type="number"
              value={formData.zoneCellId || ""}
              onChange={(e) =>
                setFormData({ ...formData, zoneCellId: e.target.value ? Number(e.target.value) : null })
              }
              required
                placeholder="셀 ID"
                className="flex-1 h-10 rounded-lg border border-gray-300 px-4 text-sm focus:outline-none focus:border-[#eb0000]"
            />
              <button
                type="button"
                onClick={() => setShowCellSelector(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-2"
              >
                <MapPin className="w-4 h-4" />
                지도에서 선택
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              지도에서 셀을 선택하거나 직접 ID를 입력할 수 있습니다.
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
              {saving ? "저장 중..." : popupId ? "수정" : "등록"}
            </Button>
          </div>
        </form>
      </div>

      {/* 셀 선택 모달 */}
      {showCellSelector && (
        <CellSelector
          selectedCellId={formData.zoneCellId}
          onSelect={(cellId) => {
            setFormData({ ...formData, zoneCellId: cellId });
            setShowCellSelector(false);
          }}
          onClose={() => setShowCellSelector(false)}
        />
      )}
    </div>
  );
}

export default PopupForm;

