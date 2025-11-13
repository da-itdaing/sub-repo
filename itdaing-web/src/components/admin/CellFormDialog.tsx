import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { geoService, CreateCellRequest, UpdateCellRequest, CellResponse, AreaResponse } from '../../services/geoService';
import { KakaoMapCellSelector } from './KakaoMapCellSelector';

interface CellFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  cell?: CellResponse | null;
  areas: AreaResponse[];
  defaultAreaId?: number;
}

export function CellFormDialog({ isOpen, onClose, onSuccess, cell, areas, defaultAreaId }: CellFormDialogProps) {
  const [areaId, setAreaId] = useState<number | undefined>(undefined);
  const [ownerId, setOwnerId] = useState<number | undefined>(undefined);
  const [label, setLabel] = useState('');
  const [detailedAddress, setDetailedAddress] = useState('');
  const [lat, setLat] = useState<number | undefined>(undefined);
  const [lng, setLng] = useState<number | undefined>(undefined);
  const [status, setStatus] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'HIDDEN'>('PENDING');
  const [maxCapacity, setMaxCapacity] = useState<number | undefined>(undefined);
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (cell) {
      setAreaId(cell.areaId);
      setOwnerId(cell.ownerId);
      setLabel(cell.label || '');
      setDetailedAddress(cell.detailedAddress || '');
      setLat(cell.lat);
      setLng(cell.lng);
      setStatus(cell.status);
      setMaxCapacity(cell.maxCapacity);
      setNotice(cell.notice || '');
    } else {
      // 새 Cell 생성 시 defaultAreaId가 있으면 자동 선택
      setAreaId(defaultAreaId);
      setOwnerId(undefined);
      setLabel('');
      setDetailedAddress('');
      setLat(undefined);
      setLng(undefined);
      setStatus('PENDING');
      setMaxCapacity(undefined);
      setNotice('');
    }
  }, [cell, isOpen, defaultAreaId]);

  const handleMapClick = (clickedLat: number, clickedLng: number) => {
    setLat(clickedLat);
    setLng(clickedLng);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!areaId) {
      toast.error('구역을 선택해주세요.');
      return;
    }

    if (!ownerId) {
      toast.error('소유자 ID를 입력해주세요.');
      return;
    }

    if (lat === undefined || lng === undefined) {
      toast.error('지도에서 위치를 클릭해주세요.');
      return;
    }

    try {
      setSaving(true);
      if (cell) {
        // 수정
        const updateReq: UpdateCellRequest = {
          areaId,
          ownerId,
          label: label || undefined,
          detailedAddress: detailedAddress || undefined,
          lat,
          lng,
          status,
          maxCapacity,
          notice: notice || undefined,
        };
        await geoService.updateCell(cell.id, updateReq);
        toast.success('셀이 수정되었습니다.');
      } else {
        // 생성
        const createReq: CreateCellRequest = {
          areaId,
          ownerId,
          label: label || undefined,
          detailedAddress: detailedAddress || undefined,
          lat,
          lng,
          status,
          maxCapacity,
          notice: notice || undefined,
        };
        await geoService.createCell(createReq);
        toast.success('셀이 생성되었습니다.');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || '셀 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const selectedArea = areas.find(a => a.id === areaId);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {cell ? '셀 수정' : '셀 생성'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                구역 *
              </label>
              <select
                value={areaId || ''}
                onChange={(e) => setAreaId(Number(e.target.value) || undefined)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">구역 선택</option>
                {areas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                소유자 ID *
              </label>
              <input
                type="number"
                value={ownerId || ''}
                onChange={(e) => setOwnerId(Number(e.target.value) || undefined)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              위치 선택 * (지도에서 클릭)
            </label>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <KakaoMapCellSelector
                areas={areas}
                selectedAreaId={areaId}
                onAreaSelect={setAreaId}
                onMapClick={handleMapClick}
                center={lat && lng ? { lat, lng } : undefined}
                height="400px"
              />
            </div>
            {lat !== undefined && lng !== undefined && (
              <div className="mt-2 text-sm text-gray-600">
                선택된 좌표: ({lat.toFixed(6)}, {lng.toFixed(6)})
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                라벨
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                상태
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="PENDING">대기 중</option>
                <option value="APPROVED">승인됨</option>
                <option value="REJECTED">거부됨</option>
                <option value="HIDDEN">숨김</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              상세 주소
            </label>
            <input
              type="text"
              value={detailedAddress}
              onChange={(e) => setDetailedAddress(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
              {saving ? '저장 중...' : cell ? '수정' : '생성'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

