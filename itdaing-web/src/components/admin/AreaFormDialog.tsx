import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { geoService, CreateAreaRequest, UpdateAreaRequest, AreaResponse } from '../../services/geoService';
import { KakaoMapAreaEditor } from './KakaoMapAreaEditor';

interface AreaFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (createdAreaId?: number) => void;
  area?: AreaResponse | null;
}

export function AreaFormDialog({ isOpen, onClose, onSuccess, area }: AreaFormDialogProps) {
  const [name, setName] = useState('');
  const [polygonGeoJson, setPolygonGeoJson] = useState('');
  const [status, setStatus] = useState<'AVAILABLE' | 'UNAVAILABLE' | 'HIDDEN'>('AVAILABLE');
  const [maxCapacity, setMaxCapacity] = useState<number | undefined>(undefined);
  const [notice, setNotice] = useState('');
  const [regionId, setRegionId] = useState<number | undefined>(undefined);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (area) {
      setName(area.name);
      setPolygonGeoJson(area.polygonGeoJson || '');
      setStatus(area.status);
      setMaxCapacity(area.maxCapacity);
      setNotice(area.notice || '');
      setRegionId(area.regionId);
    } else {
      setName('');
      setPolygonGeoJson('');
      setStatus('AVAILABLE');
      setMaxCapacity(undefined);
      setNotice('');
      setRegionId(undefined);
    }
  }, [area, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('구역 이름을 입력해주세요.');
      return;
    }

    if (!polygonGeoJson.trim()) {
      toast.error('폴리곤을 그려주세요.');
      return;
    }

    try {
      setSaving(true);
      if (area) {
        // 수정
        const updateReq: UpdateAreaRequest = {
          name,
          polygonGeoJson,
          status,
          maxCapacity,
          notice,
          regionId,
        };
        await geoService.updateArea(area.id, updateReq);
        toast.success('구역이 수정되었습니다.');
        onSuccess();
      } else {
        // 생성
        const createReq: CreateAreaRequest = {
          name,
          polygonGeoJson,
          status,
          maxCapacity,
          notice,
          regionId,
        };
        const createdArea = await geoService.createArea(createReq);
        toast.success('구역이 생성되었습니다.');
        onSuccess(createdArea.id);
      }
      onClose();
    } catch (error: any) {
      toast.error(error.message || '구역 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {area ? '구역 수정' : '구역 생성'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              구역 이름 *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              폴리곤 그리기 *
            </label>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <KakaoMapAreaEditor
                initialPolygon={polygonGeoJson}
                onPolygonComplete={setPolygonGeoJson}
                height="400px"
              />
            </div>
            {polygonGeoJson && (
              <p className="mt-2 text-xs text-gray-500">폴리곤이 그려졌습니다.</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                상태
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="AVAILABLE">사용 가능</option>
                <option value="UNAVAILABLE">사용 불가</option>
                <option value="HIDDEN">숨김</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                최대 수용 인원
              </label>
              <input
                type="number"
                value={maxCapacity || ''}
                onChange={(e) => setMaxCapacity(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              공지사항
            </label>
            <textarea
              value={notice}
              onChange={(e) => setNotice(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-[#111827] text-white rounded-lg hover:bg-[#0f172a] transition disabled:opacity-50"
            >
              {saving ? '저장 중...' : area ? '수정' : '생성'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

