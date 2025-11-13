import React, { useState, useEffect } from "react";
import { popupService, PopupCreateRequest } from "../../services/popupService";
import { PopupSummary } from "../../types/popup";
import { masterService } from "../../services/masterService";
import { geoService, AreaResponse, CellResponse } from "../../services/geoService";
import { KakaoMapCellSelector } from "../admin/KakaoMapCellSelector";
import { ImageUploader } from "../common/ImageUploader";
import { X, Calendar, MapPin } from "lucide-react";

interface PopupFormProps {
  popup?: PopupSummary;
  onClose: () => void;
  onSuccess?: () => void;
}

export function PopupForm({ popup, onClose, onSuccess }: PopupFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Array<{ id: number; name: string }>>([]);
  const [features, setFeatures] = useState<Array<{ id: number; name: string }>>([]);
  const [styles, setStyles] = useState<Array<{ id: number; name: string }>>([]);
  const [areas, setAreas] = useState<AreaResponse[]>([]);
  const [cells, setCells] = useState<CellResponse[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState<number | undefined>(undefined);
  const [showMapSelector, setShowMapSelector] = useState(false);
  const [formData, setFormData] = useState<PopupCreateRequest>({
    title: popup?.title || "",
    description: popup?.description || "",
    startDate: popup?.startDate || "",
    endDate: popup?.endDate || "",
    operatingTime: popup?.hours || "",
    zoneCellId: popup?.cellId || 0,
    categoryIds: popup?.categoryIds || [],
    targetCategoryIds: [],
    featureIds: popup?.featureIds || [],
    styleIds: [],
    thumbnailImageUrl: popup?.thumbnail || "",
    imageUrls: popup?.gallery || [],
  });

  useEffect(() => {
    let mounted = true;
    Promise.all([
      masterService.getCategories(),
      masterService.getFeatures(),
      masterService.getStyles(),
      geoService.getAreas(undefined, 0, 100),
      geoService.getCells(undefined, undefined, undefined, 0, 100),
    ]).then(([cats, feats, stys, areasResp, cellsResp]) => {
      if (mounted) {
        setCategories(cats);
        setFeatures(feats);
        setStyles(stys);
        setAreas(areasResp.items);
        setCells(cellsResp.items);
        // 팝업이 있고 cellId가 있으면 해당 Cell의 Area 찾기
        if (popup?.cellId) {
          const cell = cellsResp.items.find(c => c.id === popup.cellId);
          if (cell) {
            setSelectedAreaId(cell.areaId);
          }
        }
      }
    }).catch(err => {
      if (mounted) {
        console.error("Failed to load data:", err);
      }
    });
    return () => {
      mounted = false;
    };
  }, [popup]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError("팝업 제목을 입력해주세요.");
      return;
    }
    if (!formData.startDate || !formData.endDate) {
      setError("시작일과 종료일을 입력해주세요.");
      return;
    }
    if (formData.zoneCellId <= 0) {
      setError("셀을 선택해주세요. (현재는 카카오맵 연동 대기 중)");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (popup) {
        await popupService.updatePopup(popup.id, formData);
      } else {
        await popupService.createPopup(formData);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : (popup ? "팝업 수정에 실패했습니다." : "팝업 등록에 실패했습니다."));
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = <T extends number>(
    current: T[],
    value: T,
    setter: (val: T[]) => void
  ) => {
    if (current.includes(value)) {
      setter(current.filter(v => v !== value));
    } else {
      setter([...current, value]);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-3xl mx-auto max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">{popup ? "팝업 수정" : "팝업 등록"}</h2>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-600 transition"
        >
          <X className="size-5" />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            팝업 제목 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#eb0000]"
            required
            placeholder="팝업스토어 이름"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            설명
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#eb0000]"
            rows={4}
            placeholder="팝업스토어에 대한 설명을 입력하세요"
            maxLength={3000}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              시작일 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#eb0000]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              종료일 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#eb0000]"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            운영 시간
          </label>
          <input
            type="text"
            value={formData.operatingTime}
            onChange={(e) => setFormData({ ...formData, operatingTime: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#eb0000]"
            placeholder="예: 10:00 - 20:00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            위치 선택 (셀) <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setShowMapSelector(!showMapSelector)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition flex items-center gap-2"
            >
              <MapPin className="size-4" />
              {formData.zoneCellId > 0 
                ? `선택된 셀 ID: ${formData.zoneCellId}`
                : '지도에서 셀 선택하기'}
            </button>
            {showMapSelector && (
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <KakaoMapCellSelector
                  areas={areas}
                  cells={cells}
                  selectedAreaId={selectedAreaId}
                  onAreaSelect={setSelectedAreaId}
                  onCellClick={(cellId) => {
                    setFormData({ ...formData, zoneCellId: cellId });
                    setShowMapSelector(false);
                  }}
                  height="400px"
                />
              </div>
            )}
            {formData.zoneCellId > 0 && (
              <p className="text-xs text-green-600 mt-1">
                ✓ 셀 ID {formData.zoneCellId}가 선택되었습니다.
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            카테고리
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleSelection(formData.categoryIds || [], cat.id, (val) => setFormData({ ...formData, categoryIds: val }))}
                className={`px-3 py-1 rounded-full text-sm border transition ${
                  (formData.categoryIds || []).includes(cat.id)
                    ? "bg-[#eb0000] text-white border-[#eb0000]"
                    : "bg-white text-gray-700 border-gray-300 hover:border-[#eb0000]"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            편의시설
          </label>
          <div className="flex flex-wrap gap-2">
            {features.map(feat => (
              <button
                key={feat.id}
                type="button"
                onClick={() => toggleSelection(formData.featureIds || [], feat.id, (val) => setFormData({ ...formData, featureIds: val }))}
                className={`px-3 py-1 rounded-full text-sm border transition ${
                  (formData.featureIds || []).includes(feat.id)
                    ? "bg-[#eb0000] text-white border-[#eb0000]"
                    : "bg-white text-gray-700 border-gray-300 hover:border-[#eb0000]"
                }`}
              >
                {feat.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            썸네일 이미지
          </label>
          <ImageUploader
            category="POPUP_THUMBNAIL"
            resourceId={popup?.id}
            multiple={false}
            maxFiles={1}
            onUploadComplete={(urls) => {
              if (urls.length > 0) {
                setFormData({ ...formData, thumbnailImageUrl: urls[0] });
              }
            }}
            existingImages={formData.thumbnailImageUrl ? [formData.thumbnailImageUrl] : []}
            onRemoveExisting={() => {
              setFormData({ ...formData, thumbnailImageUrl: "" });
            }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            갤러리 이미지
          </label>
          <ImageUploader
            category="POPUP_GALLERY"
            resourceId={popup?.id}
            multiple={true}
            maxFiles={10}
            onUploadComplete={(urls) => {
              setFormData({ ...formData, imageUrls: [...(formData.imageUrls || []), ...urls] });
            }}
            existingImages={formData.imageUrls || []}
            onRemoveExisting={(url) => {
              setFormData({ ...formData, imageUrls: (formData.imageUrls || []).filter(u => u !== url) });
            }}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            disabled={loading}
          >
            취소
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-[#eb0000] text-white rounded-lg hover:bg-[#d10000] transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "저장 중..." : (popup ? "수정" : "등록")}
          </button>
        </div>
      </form>
    </div>
  );
}

