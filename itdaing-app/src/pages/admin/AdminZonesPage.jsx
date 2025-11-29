import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, Polygon, MapMarker, CustomOverlayMap } from 'react-kakao-maps-sdk';
import { Plus, CheckCircle, XCircle, MapPin, RefreshCw } from 'lucide-react';
import clsx from 'clsx';
import { ROUTES } from '@/routes/paths';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/useToast';
import {
  listAreas,
  listCells,
  updateCell,
  deleteCell,
  parseGeoJsonPolygon,
} from '@/services/geoZoneService';

// 광주광역시 5개 구
const DISTRICTS = [
  { id: 26, name: '동구', center: { lat: 35.1461, lng: 126.9231 } },
  { id: 27, name: '서구', center: { lat: 35.1520, lng: 126.8900 } },
  { id: 28, name: '남구', center: { lat: 35.1329, lng: 126.9025 } },
  { id: 29, name: '북구', center: { lat: 35.1741, lng: 126.9121 } },
  { id: 30, name: '광산구', center: { lat: 35.1395, lng: 126.7937 } },
];

// 광주 중심 좌표
const GWANGJU_CENTER = { lat: 35.1595, lng: 126.8526 };

// 존별 색상 생성
const ZONE_COLORS = [
  '#FF4B4B', '#2980FF', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
];

const AdminZonesPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  // State
  const [selectedDistrict, setSelectedDistrict] = useState(DISTRICTS[0]);
  const [mapCenter, setMapCenter] = useState(GWANGJU_CENTER);
  const [selectedArea, setSelectedArea] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);

  // Form State for Cell Edit
  const [editForm, setEditForm] = useState({
    status: 'APPROVED',
    maxCapacity: 0,
    notice: '',
  });

  // 존(Area) 목록 조회
  const { data: areasData, isLoading: isLoadingAreas, refetch: refetchAreas } = useQuery({
    queryKey: ['geoAreas'],
    queryFn: () => listAreas({ page: 0, size: 200 }),
    staleTime: 5 * 60 * 1000,
  });
  const areas = areasData?.items || [];

  // 선택된 존의 셀 목록 조회
  const { data: cellsData, isLoading: isLoadingCells, refetch: refetchCells } = useQuery({
    queryKey: ['geoCells', selectedArea?.id],
    queryFn: () => listCells({ areaId: selectedArea.id, page: 0, size: 100 }),
    enabled: !!selectedArea?.id,
    staleTime: 5 * 60 * 1000,
  });
  const cells = cellsData?.items || [];

  // 셀 수정 Mutation
  const updateCellMutation = useMutation({
    mutationFn: ({ cellId, data }) => updateCell(cellId, data),
    onSuccess: () => {
      addToast({ title: '셀 정보가 수정되었습니다.' });
      refetchCells();
    },
    onError: (error) => {
      addToast({ title: '수정 실패', description: error.message, variant: 'error' });
    },
  });

  // 셀 삭제 Mutation
  const deleteCellMutation = useMutation({
    mutationFn: (cellId) => deleteCell(cellId),
    onSuccess: () => {
      addToast({ title: '셀이 삭제되었습니다.' });
      setSelectedCell(null);
      refetchCells();
    },
    onError: (error) => {
      addToast({ title: '삭제 실패', description: error.message, variant: 'error' });
    },
  });

  // 구 선택 시 지도 중심 이동
  useEffect(() => {
    if (selectedDistrict) {
      setMapCenter(selectedDistrict.center);
    }
  }, [selectedDistrict]);

  // 셀 선택 시 폼 업데이트
  useEffect(() => {
    if (selectedCell) {
      setEditForm({
        status: selectedCell.status || 'APPROVED',
        maxCapacity: selectedCell.maxCapacity || 0,
        notice: selectedCell.notice || '',
      });
    }
  }, [selectedCell]);

  // 존 선택
  const handleAreaClick = useCallback((area) => {
    setSelectedArea(area);
    setSelectedCell(null);
    
    // 존 중심으로 지도 이동
    const coords = parseGeoJsonPolygon(area.polygonGeoJson);
    if (coords.length > 0) {
      const center = coords.reduce(
        (acc, c) => ({ lat: acc.lat + c.lat / coords.length, lng: acc.lng + c.lng / coords.length }),
        { lat: 0, lng: 0 }
      );
      setMapCenter(center);
    }
  }, []);

  // 셀 선택
  const handleCellClick = useCallback((cell) => {
    setSelectedCell(cell);
  }, []);

  // 폼 입력 변경
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  // 셀 저장
  const handleSave = () => {
    if (!selectedCell) return;
    updateCellMutation.mutate({
      cellId: selectedCell.id,
      data: {
        status: editForm.status,
        maxCapacity: editForm.maxCapacity ? parseInt(editForm.maxCapacity, 10) : null,
        notice: editForm.notice || null,
      },
    });
  };

  // 셀 삭제
  const handleDelete = () => {
    if (!selectedCell) return;
    if (window.confirm(`"${selectedCell.label}" 셀을 삭제하시겠습니까?`)) {
      deleteCellMutation.mutate(selectedCell.id);
    }
  };

  // 셀 위치 파싱
  const getCellPosition = (cell) => {
    if (!cell?.geometryData) return null;
    try {
      const geo = JSON.parse(cell.geometryData);
      if (geo.type === 'Point' && geo.coordinates) {
        return { lat: geo.coordinates[1], lng: geo.coordinates[0] };
      }
      if (geo.lat && geo.lng) {
        return { lat: geo.lat, lng: geo.lng };
      }
    } catch {
      // 파싱 실패 시 무시
    }
    return null;
  };

  // 통계
  const approvedCells = cells.filter((c) => c.status === 'APPROVED').length;
  const pendingCells = cells.filter((c) => c.status === 'PENDING').length;

  // 선택된 구에 속한 존만 필터링
  const filteredAreas = areas.filter((a) => a.regionId === selectedDistrict.id);

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-6 p-6 bg-gray-50">
      {/* Left: Zone Management */}
      <div className="flex-[3] flex flex-col gap-4 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">존/셀 관리</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                refetchAreas();
                refetchCells();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              새로고침
            </button>
          <button 
            onClick={() => navigate(ROUTES.admin.zoneCreate)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
              새 존 추가
          </button>
          </div>
        </div>

        {/* Controls & Status */}
        <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex gap-4">
            <div className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-gray-600">승인됨</span>
              </div>
              <span className="text-lg font-bold text-gray-900">{approvedCells}</span>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-medium text-gray-600">대기중</span>
              </div>
              <span className="text-lg font-bold text-gray-900">{pendingCells}</span>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-200 rounded-lg">
              <span className="text-sm font-medium text-gray-600">존 수</span>
              <span className="text-lg font-bold text-gray-900">{filteredAreas.length}</span>
            </div>
          </div>

          <select
            value={selectedDistrict.id}
            onChange={(e) => {
              const district = DISTRICTS.find((d) => d.id === Number(e.target.value));
              if (district) {
                setSelectedDistrict(district);
                setSelectedArea(null);
                setSelectedCell(null);
              }
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 min-w-[120px]"
          >
            {DISTRICTS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* Main Map */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
          <Map
            center={mapCenter}
            style={{ width: '100%', height: '100%' }}
            level={6}
          >
            {/* 존 폴리곤 렌더링 */}
            {filteredAreas.map((area, idx) => {
              const coords = parseGeoJsonPolygon(area.polygonGeoJson);
              if (coords.length < 3) return null;
              const color = ZONE_COLORS[idx % ZONE_COLORS.length];
              const isSelected = selectedArea?.id === area.id;

              return (
              <Polygon
                  key={area.id}
                  path={coords}
                  strokeWeight={isSelected ? 4 : 2}
                  strokeColor={color}
                  strokeOpacity={0.9}
                  fillColor={color}
                  fillOpacity={isSelected ? 0.4 : 0.15}
                  onClick={() => handleAreaClick(area)}
              />
              );
            })}

            {/* 선택된 존의 셀 마커 */}
            {selectedArea && cells.map((cell) => {
              const pos = getCellPosition(cell);
              if (!pos) return null;
              const isSelected = selectedCell?.id === cell.id;
              const isApproved = cell.status === 'APPROVED';

              return (
                <div key={cell.id}>
                  <MapMarker
                    position={pos}
                onClick={() => handleCellClick(cell)}
                    image={{
                      src: isApproved
                        ? 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png'
                        : 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png',
                      size: { width: 32, height: 35 },
                    }}
                  />
                  <CustomOverlayMap position={pos} yAnchor={2.5}>
                    <div
                      onClick={() => handleCellClick(cell)}
                      className={clsx(
                        'cursor-pointer px-2 py-1 rounded shadow text-xs font-semibold border',
                        isSelected
                          ? 'bg-[#EB0000] text-white border-[#EB0000]'
                          : isApproved
                          ? 'bg-white text-gray-700 border-gray-200 hover:border-[#EB0000]'
                          : 'bg-yellow-50 text-yellow-700 border-yellow-300'
                      )}
                    >
                      {cell.label}
                    </div>
                  </CustomOverlayMap>
                </div>
              );
            })}
          </Map>
          
          {/* Map Overlay Info */}
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-md z-10 border border-gray-200">
            <p className="text-sm font-medium text-gray-600">
              <MapPin className="w-4 h-4 inline-block mr-1 text-primary" />
              {selectedDistrict.name}
              {selectedArea && ` > ${selectedArea.name}`}
            </p>
          </div>

          {/* 존 목록 오버레이 */}
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-md z-10 border border-gray-200 max-h-[200px] overflow-y-auto">
            <div className="p-2 border-b border-gray-200">
              <p className="text-xs font-semibold text-gray-500">존 목록</p>
            </div>
            <div className="p-2 space-y-1">
              {filteredAreas.length === 0 ? (
                <p className="text-xs text-gray-400 p-2">등록된 존이 없습니다.</p>
              ) : (
                filteredAreas.map((area, idx) => (
                  <button
                    key={area.id}
                    onClick={() => handleAreaClick(area)}
                    className={clsx(
                      'w-full text-left px-3 py-2 rounded text-xs transition-colors flex items-center gap-2',
                      selectedArea?.id === area.id
                        ? 'bg-red-50 text-red-700'
                        : 'hover:bg-gray-50 text-gray-700'
                    )}
                  >
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: ZONE_COLORS[idx % ZONE_COLORS.length] }}
                    />
                    {area.name}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right: Cell Details */}
      <div className="flex-[1.2] flex flex-col gap-4 min-w-[320px]">
        <h2 className="text-xl font-bold text-red-600">셀 상세정보</h2>
        
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6 overflow-y-auto">
          {selectedCell ? (
            <div className="space-y-6">
              {/* Mini Map for Cell */}
              <div className="w-full h-48 bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                {(() => {
                  const pos = getCellPosition(selectedCell);
                  if (!pos) return <div className="h-full flex items-center justify-center text-gray-400">위치 정보 없음</div>;
                  return (
                <Map
                      center={pos}
                  style={{ width: '100%', height: '100%' }}
                  level={3}
                  draggable={false}
                  zoomable={false}
                >
                      <MapMarker position={pos} />
                </Map>
                  );
                })()}
              </div>

              {/* Cell Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">셀 라벨</label>
                  <input
                    type="text"
                    value={selectedCell.label || ''}
                    readOnly
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">소속 존</label>
                  <input
                    type="text"
                    value={selectedCell.areaName || selectedArea?.name || ''}
                    readOnly
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">상태</label>
                    <select
                      name="status"
                      value={editForm.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none"
                    >
                      <option value="APPROVED">승인됨</option>
                      <option value="PENDING">대기중</option>
                      <option value="REJECTED">거절됨</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">최대 수용</label>
                    <div className="relative">
                      <input
                        type="number"
                        name="maxCapacity"
                        value={editForm.maxCapacity}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none"
                      />
                      <span className="absolute right-3 top-2 text-sm text-gray-400">명</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">유의사항</label>
                  <textarea
                    name="notice"
                    value={editForm.notice}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none resize-none"
                    placeholder="유의사항을 입력하세요"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={handleSave}
                  disabled={updateCellMutation.isPending}
                  className="flex-1 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {updateCellMutation.isPending ? '저장 중...' : '수정'}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteCellMutation.isPending}
                  className="flex-1 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {deleteCellMutation.isPending ? '삭제 중...' : '삭제'}
                </button>
              </div>
            </div>
          ) : selectedArea ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <MapPin className="w-12 h-12 mb-3 opacity-20" />
              <p className="text-center">
                <span className="font-medium text-gray-600">{selectedArea.name}</span>
                <br />
                지도에서 셀을 선택해주세요
              </p>
              <p className="text-xs mt-2">총 {cells.length}개 셀</p>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <MapPin className="w-12 h-12 mb-3 opacity-20" />
              <p>지도에서 존을 선택해주세요</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminZonesPage;
