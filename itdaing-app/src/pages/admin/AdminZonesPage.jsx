import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Map, Polygon, MapMarker, CustomOverlayMap } from 'react-kakao-maps-sdk';
import { Plus, CheckCircle, XCircle, MapPin, RefreshCw, Trash2, Edit3, PlusCircle } from 'lucide-react';
import clsx from 'clsx';
import { ROUTES } from '@/routes/paths';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/useToast';
import { useAuthStore } from '@/store/authStore';
import {
  listAreas,
  listCells,
  updateCell,
  deleteCell,
  createCell,
  updateArea,
  deleteArea,
  parseGeoJsonPolygon,
  toGeoJsonPolygon,
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

// 커스텀 마커 SVG 생성 함수
const createMarkerSvg = (status) => {
  const isApproved = status === 'APPROVED';
  const isPending = status === 'PENDING';

  // 승인: 초록색 체크 마커, 대기: 주황색 시계 마커, 거절: 빨간색 X 마커
  const bgColor = isApproved ? '#10B981' : isPending ? '#F59E0B' : '#EF4444';
  const icon = isApproved
    ? '<path d="M15 22l-4-4 1.4-1.4 2.6 2.6 6.6-6.6L23 14z" fill="white"/>' // 체크 마크
    : isPending
      ? '<circle cx="18" cy="18" r="5" fill="none" stroke="white" stroke-width="1.5"/><path d="M18 15v4l2 1" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round"/>' // 시계
      : '<path d="M16 16l4 4m0-4l-4 4" stroke="white" stroke-width="2" stroke-linecap="round"/>'; // X

  const statusText = isApproved ? '승인' : isPending ? '대기' : '거절';

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="50" viewBox="0 0 40 50">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.3"/>
        </filter>
      </defs>
      <path d="M20 48 C20 48, 5 30, 5 18 C5 9.7 11.7 3 20 3 C28.3 3 35 9.7 35 18 C35 30, 20 48, 20 48Z" 
            fill="${bgColor}" filter="url(#shadow)"/>
      <circle cx="20" cy="18" r="10" fill="white" opacity="0.2"/>
      <g transform="translate(2, 0)">${icon}</g>
      <text x="20" y="32" text-anchor="middle" fill="white" font-size="6" font-weight="bold">${statusText}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.trim())}`;
};

// 미리 생성된 마커 이미지 URL
const MARKER_IMAGES = {
  APPROVED: createMarkerSvg('APPROVED'),
  PENDING: createMarkerSvg('PENDING'),
  REJECTED: createMarkerSvg('REJECTED'),
};

const AdminZonesPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const user = useAuthStore((state) => state.user);

  // 대시보드에서 전달된 초기 선택 상태
  const initialDistrictId = location.state?.selectedDistrictId;
  const initialAreaId = location.state?.selectedAreaId;
  const initialDistrict = initialDistrictId
    ? DISTRICTS.find(d => d.id === initialDistrictId) || DISTRICTS[0]
    : DISTRICTS[0];

  // State
  const [selectedDistrict, setSelectedDistrict] = useState(initialDistrict);
  const [mapCenter, setMapCenter] = useState(initialDistrict.center);
  const [selectedArea, setSelectedArea] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);
  const [pendingAreaId, setPendingAreaId] = useState(initialAreaId); // 초기 선택할 area ID

  // Form State for Cell Edit
  const [editForm, setEditForm] = useState({
    status: 'APPROVED',
    maxCapacity: 0,
    notice: '',
  });

  // 셀 위치 수정 모드
  const [cellLocationEditMode, setCellLocationEditMode] = useState(false);
  const [newCellLocation, setNewCellLocation] = useState({ lat: '', lng: '', address: '' });

  // 셀 추가 모달 상태
  const [cellAddModalOpen, setCellAddModalOpen] = useState(false);
  const [newCellForm, setNewCellForm] = useState({
    label: '',
    detailedAddress: '',
    lat: '',
    lng: '',
    maxCapacity: 1,
    notice: '',
  });

  // 존 수정 모달 상태
  const [areaEditModalOpen, setAreaEditModalOpen] = useState(false);
  const [editAreaForm, setEditAreaForm] = useState({
    name: '',
    maxCapacity: 0,
    notice: '',
  });

  // 존 폴리곤 편집 모드
  const [polygonEditMode, setPolygonEditMode] = useState(false);
  const [editingPolygonCoords, setEditingPolygonCoords] = useState([]); // [{lat, lng}, ...]
  const [draggingVertexIndex, setDraggingVertexIndex] = useState(null);

  // 셀 상태 필터 ('all' | 'APPROVED' | 'PENDING' | 'REJECTED')
  const [cellStatusFilter, setCellStatusFilter] = useState('all');

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

  // 셀 생성 Mutation
  const createCellMutation = useMutation({
    mutationFn: (data) => createCell(data),
    onSuccess: () => {
      addToast({ title: '셀이 생성되었습니다.' });
      setCellAddModalOpen(false);
      setNewCellForm({ label: '', detailedAddress: '', lat: '', lng: '', maxCapacity: 1, notice: '' });
      refetchCells();
    },
    onError: (error) => {
      addToast({ title: '셀 생성 실패', description: error.message, variant: 'error' });
    },
  });

  // 존 수정 Mutation
  const updateAreaMutation = useMutation({
    mutationFn: ({ areaId, data }) => updateArea(areaId, data),
    onSuccess: () => {
      addToast({ title: '존 정보가 수정되었습니다.' });
      setAreaEditModalOpen(false);
      refetchAreas();
    },
    onError: (error) => {
      addToast({ title: '존 수정 실패', description: error.message, variant: 'error' });
    },
  });

  // 존 삭제 Mutation
  const deleteAreaMutation = useMutation({
    mutationFn: (areaId) => deleteArea(areaId),
    onSuccess: () => {
      addToast({ title: '존이 삭제되었습니다.' });
      setSelectedArea(null);
      setSelectedCell(null);
      refetchAreas();
    },
    onError: (error) => {
      addToast({ title: '존 삭제 실패', description: error.message, variant: 'error' });
    },
  });

  // 구 선택 시 지도 중심 이동
  useEffect(() => {
    if (selectedDistrict) {
      setMapCenter(selectedDistrict.center);
    }
  }, [selectedDistrict]);

  // 대시보드에서 전달된 초기 area 선택
  useEffect(() => {
    if (pendingAreaId && areas.length > 0) {
      const targetArea = areas.find(a => a.id === pendingAreaId);
      if (targetArea) {
        handleAreaClick(targetArea);
        setPendingAreaId(null); // 한 번만 실행
      }
    }
  }, [pendingAreaId, areas]);

  // 셀 선택 시 폼 업데이트
  useEffect(() => {
    if (selectedCell) {
      setEditForm({
        status: selectedCell.status || 'APPROVED',
        maxCapacity: selectedCell.maxCapacity || 0,
        notice: selectedCell.notice || '',
      });
      // 위치 수정 모드 초기화
      setCellLocationEditMode(false);
      const pos = getCellPosition(selectedCell);
      if (pos) {
        setNewCellLocation({ lat: pos.lat.toFixed(6), lng: pos.lng.toFixed(6), address: selectedCell.detailedAddress || '' });
      } else {
        setNewCellLocation({ lat: '', lng: '', address: '' });
      }
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

  // 셀 저장 (위치 포함)
  const handleSave = () => {
    if (!selectedCell) return;

    const updateData = {
      status: editForm.status,
      maxCapacity: editForm.maxCapacity ? parseInt(editForm.maxCapacity, 10) : null,
      notice: editForm.notice || null,
    };

    // 위치가 변경된 경우 geometryData와 detailedAddress도 업데이트
    if (cellLocationEditMode && newCellLocation.lat && newCellLocation.lng) {
      updateData.geometryData = JSON.stringify({
        type: 'Point',
        coordinates: [parseFloat(newCellLocation.lng), parseFloat(newCellLocation.lat)],
      });
      updateData.detailedAddress = newCellLocation.address || null;
    }

    updateCellMutation.mutate({
      cellId: selectedCell.id,
      data: updateData,
    });
    setCellLocationEditMode(false);
  };

  // 셀 삭제
  const handleDelete = () => {
    if (!selectedCell) return;
    if (window.confirm(`"${selectedCell.label}" 셀을 삭제하시겠습니까?`)) {
      deleteCellMutation.mutate(selectedCell.id);
    }
  };

  // 셀 추가 모달 열기
  const openCellAddModal = () => {
    if (!selectedArea) {
      addToast({ title: '먼저 존을 선택해주세요.', variant: 'error' });
      return;
    }
    setNewCellForm({ label: '', detailedAddress: '', lat: '', lng: '', maxCapacity: 1, notice: '' });
    setCellAddModalOpen(true);
  };

  // 셀 생성 처리
  const handleCreateCell = () => {
    if (!selectedArea) return;
    if (!newCellForm.label.trim()) {
      addToast({ title: '셀 라벨을 입력해주세요.', variant: 'error' });
      return;
    }
    if (!newCellForm.lat || !newCellForm.lng) {
      addToast({ title: '위치(위도/경도)를 입력해주세요.', variant: 'error' });
      return;
    }

    // geometryData 생성 (Point GeoJSON)
    const geometryData = JSON.stringify({
      type: 'Point',
      coordinates: [parseFloat(newCellForm.lng), parseFloat(newCellForm.lat)],
    });

    createCellMutation.mutate({
      areaId: selectedArea.id,
      ownerId: user?.id || 1,
      label: newCellForm.label.trim(),
      detailedAddress: newCellForm.detailedAddress.trim() || null,
      geometryData,
      status: 'APPROVED',
      maxCapacity: parseInt(newCellForm.maxCapacity, 10) || 1,
      notice: newCellForm.notice.trim() || null,
    });
  };

  // 존 수정 모달 열기
  const openAreaEditModal = () => {
    if (!selectedArea) return;
    setEditAreaForm({
      name: selectedArea.name || '',
      maxCapacity: selectedArea.maxCapacity || 0,
      notice: selectedArea.notice || '',
    });
    // 폴리곤 좌표 로드
    const coords = parseGeoJsonPolygon(selectedArea.polygonGeoJson);
    // 마지막 좌표가 첫 번째와 같으면 제거 (닫힌 폴리곤)
    if (coords.length > 1 && 
        coords[0].lat === coords[coords.length - 1].lat && 
        coords[0].lng === coords[coords.length - 1].lng) {
      coords.pop();
    }
    setEditingPolygonCoords(coords);
    setPolygonEditMode(false);
    setAreaEditModalOpen(true);
  };

  // 존 수정 처리
  const handleUpdateArea = () => {
    if (!selectedArea) return;
    
    // 폴리곤 편집 모드였으면 편집된 좌표로 GeoJSON 생성
    let polygonGeoJson = selectedArea.polygonGeoJson;
    if (polygonEditMode && editingPolygonCoords.length >= 3) {
      polygonGeoJson = toGeoJsonPolygon(editingPolygonCoords);
    }
    
    updateAreaMutation.mutate({
      areaId: selectedArea.id,
      data: {
        name: editAreaForm.name.trim(),
        maxCapacity: parseInt(editAreaForm.maxCapacity, 10) || null,
        notice: editAreaForm.notice.trim() || null,
        regionId: selectedArea.regionId,
        polygonGeoJson,
      },
    });
  };

  // 폴리곤 꼭짓점 드래그 핸들러
  const handleVertexDrag = (index, newPosition) => {
    setEditingPolygonCoords(prev => {
      const updated = [...prev];
      updated[index] = { lat: newPosition.getLat(), lng: newPosition.getLng() };
      return updated;
    });
  };

  // 폴리곤 꼭짓점 추가 (두 점 사이 클릭)
  const handleAddVertex = (afterIndex, position) => {
    setEditingPolygonCoords(prev => {
      const updated = [...prev];
      updated.splice(afterIndex + 1, 0, { lat: position.lat, lng: position.lng });
      return updated;
    });
  };

  // 폴리곤 꼭짓점 삭제
  const handleRemoveVertex = (index) => {
    if (editingPolygonCoords.length <= 3) {
      addToast({ title: '최소 3개의 꼭짓점이 필요합니다.', variant: 'error' });
      return;
    }
    setEditingPolygonCoords(prev => prev.filter((_, i) => i !== index));
  };

  // 존 삭제 처리
  const handleDeleteArea = () => {
    if (!selectedArea) return;
    if (window.confirm(`"${selectedArea.name}" 존을 삭제하시겠습니까?\n포함된 모든 셀도 함께 삭제됩니다.`)) {
      deleteAreaMutation.mutate(selectedArea.id);
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

  // 상태별 필터링된 셀 목록
  const filteredCells = cellStatusFilter === 'all'
    ? cells
    : cells.filter((c) => c.status === cellStatusFilter);

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-6 p-6 bg-gray-50">
      {/* Left: Zone Management */}
      <div className="flex-[3] flex flex-col gap-4 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">존/셀 관리</h1>
          <div className="flex items-center gap-2">
            {/* <button
              onClick={() => {
                refetchAreas();
                refetchCells();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              새로고침
            </button> */}
            <button
              onClick={openCellAddModal}
              disabled={!selectedArea}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PlusCircle className="w-4 h-4" />
              새 셀 추가
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
            <button
              onClick={() => setCellStatusFilter(cellStatusFilter === 'APPROVED' ? 'all' : 'APPROVED')}
              className={clsx(
                'flex items-center gap-3 px-4 py-2 rounded-lg transition-colors cursor-pointer',
                cellStatusFilter === 'APPROVED'
                  ? 'bg-green-50 border-2 border-green-400'
                  : 'bg-white border border-gray-200 hover:bg-gray-50'
              )}
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-gray-600">승인됨</span>
              </div>
              <span className="text-lg font-bold text-gray-900">{approvedCells}</span>
            </button>
            <button
              onClick={() => setCellStatusFilter(cellStatusFilter === 'PENDING' ? 'all' : 'PENDING')}
              className={clsx(
                'flex items-center gap-3 px-4 py-2 rounded-lg transition-colors cursor-pointer',
                cellStatusFilter === 'PENDING'
                  ? 'bg-yellow-50 border-2 border-yellow-400'
                  : 'bg-white border border-gray-200 hover:bg-gray-50'
              )}
            >
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-medium text-gray-600">대기중</span>
              </div>
              <span className="text-lg font-bold text-gray-900">{pendingCells}</span>
            </button>
            <button
              onClick={() => setCellStatusFilter('all')}
              className={clsx(
                'flex items-center gap-3 px-4 py-2 rounded-lg transition-colors cursor-pointer',
                cellStatusFilter === 'all'
                  ? 'bg-gray-100 border-2 border-gray-400'
                  : 'bg-white border border-gray-200 hover:bg-gray-50'
              )}
            >
              <span className="text-sm font-medium text-gray-600">전체</span>
              <span className="text-lg font-bold text-gray-900">{cells.length}</span>
            </button>
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
                      src: MARKER_IMAGES[cell.status] || MARKER_IMAGES.PENDING,
                      size: { width: 40, height: 50 },
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

      {/* Right: Cell List & Details */}
      <div className="flex-[1.2] flex flex-col gap-4 min-w-[320px]">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-red-600">
            {selectedCell ? '셀 상세정보' : selectedArea ? '셀 목록' : '존/셀 관리'}
          </h2>
          {selectedCell && (
            <button
              onClick={() => setSelectedCell(null)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              ← 목록으로
            </button>
          )}
        </div>

        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          {selectedCell ? (
            /* 셀 상세 정보 */
            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-6">
                {/* Mini Map for Cell - 위치 수정 모드 지원 */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-500">셀 위치</label>
                    <button
                      type="button"
                      onClick={() => setCellLocationEditMode(!cellLocationEditMode)}
                      className={clsx(
                        'text-xs font-medium px-2 py-1 rounded',
                        cellLocationEditMode 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'text-blue-600 hover:bg-blue-50'
                      )}
                    >
                      {cellLocationEditMode ? '✓ 수정 중' : '📍 위치 변경'}
                    </button>
                  </div>
                  <div className={clsx(
                    'w-full bg-gray-100 rounded-xl overflow-hidden border',
                    cellLocationEditMode ? 'h-56 border-blue-400 ring-2 ring-blue-200' : 'h-40 border-gray-200'
                  )}>
                    {(() => {
                      const currentPos = cellLocationEditMode && newCellLocation.lat && newCellLocation.lng
                        ? { lat: parseFloat(newCellLocation.lat), lng: parseFloat(newCellLocation.lng) }
                        : getCellPosition(selectedCell);
                      if (!currentPos && !cellLocationEditMode) {
                        return <div className="h-full flex items-center justify-center text-gray-400">위치 정보 없음</div>;
                      }
                      return (
                        <Map
                          center={currentPos || selectedDistrict.center}
                          style={{ width: '100%', height: '100%' }}
                          level={3}
                          draggable={cellLocationEditMode}
                          zoomable={cellLocationEditMode}
                          onClick={cellLocationEditMode ? (_map, mouseEvent) => {
                            const latlng = mouseEvent.latLng;
                            const lat = latlng.getLat();
                            const lng = latlng.getLng();
                            setNewCellLocation(prev => ({ ...prev, lat: lat.toFixed(6), lng: lng.toFixed(6) }));
                            
                            // 카카오 주소 검색 API로 도로명 주소 조회
                            if (window.kakao?.maps?.services) {
                              const geocoder = new window.kakao.maps.services.Geocoder();
                              geocoder.coord2Address(lng, lat, (result, status) => {
                                if (status === window.kakao.maps.services.Status.OK && result[0]) {
                                  const address = result[0].road_address
                                    ? result[0].road_address.address_name
                                    : result[0].address.address_name;
                                  setNewCellLocation(prev => ({ ...prev, address }));
                                }
                              });
                            }
                          } : undefined}
                        >
                          {currentPos && <MapMarker position={currentPos} />}
                        </Map>
                      );
                    })()}
                  </div>
                  {cellLocationEditMode && (
                    <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                      <p className="text-xs text-blue-700 mb-1">📍 지도를 클릭하여 새 위치를 선택하세요</p>
                      {newCellLocation.lat && newCellLocation.lng && (
                        <p className="text-xs text-gray-600">
                          좌표: {newCellLocation.lat}, {newCellLocation.lng}
                        </p>
                      )}
                      {newCellLocation.address && (
                        <p className="text-xs text-gray-600 mt-0.5">주소: {newCellLocation.address}</p>
                      )}
                    </div>
                  )}
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
                      rows={3}
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
            </div>
          ) : selectedArea ? (
            /* 셀 목록 */
            <div className="flex flex-col h-full">
              {/* 존 정보 헤더 */}
              <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{selectedArea.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">총 {cells.length}개 셀</p>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={openAreaEditModal}
                      className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                      title="존 수정"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={handleDeleteArea}
                      disabled={deleteAreaMutation.isPending}
                      className="p-1.5 bg-rose-100 text-rose-600 rounded-lg hover:bg-rose-200 disabled:opacity-50"
                      title="존 삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* 셀 리스트 */}
              <div className="flex-1 overflow-y-auto">
                {isLoadingCells ? (
                  <div className="p-6 text-center text-gray-400 text-sm">로딩 중...</div>
                ) : cells.length === 0 ? (
                  <div className="p-6 text-center text-gray-400">
                    <MapPin className="w-10 h-10 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">등록된 셀이 없습니다.</p>
                    <button
                      onClick={openCellAddModal}
                      className="mt-3 text-xs text-blue-600 hover:underline"
                    >
                      + 새 셀 추가하기
                    </button>
                  </div>
                ) : filteredCells.length === 0 ? (
                  <div className="p-6 text-center text-gray-400">
                    <p className="text-sm">해당 상태의 셀이 없습니다.</p>
                    <button
                      onClick={() => setCellStatusFilter('all')}
                      className="mt-2 text-xs text-blue-600 hover:underline"
                    >
                      전체 보기
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {filteredCells.map((cell) => {
                      const isApproved = cell.status === 'APPROVED';
                      const isPendingStatus = cell.status === 'PENDING';

                      return (
                        <div
                          key={cell.id}
                          onClick={() => handleCellClick(cell)}
                          className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors flex items-center gap-3"
                        >
                          {/* 상태 표시 */}
                          <div
                            className={clsx(
                              'w-2 h-2 rounded-full flex-shrink-0',
                              isApproved ? 'bg-green-500' : isPendingStatus ? 'bg-yellow-500' : 'bg-red-500'
                            )}
                          />

                          {/* 셀 정보 */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {cell.label || `셀 #${cell.id}`}
                            </p>
                            {cell.detailedAddress && (
                              <p className="text-xs text-gray-500 truncate">
                                {cell.detailedAddress}
                              </p>
                            )}
                          </div>

                          {/* 상태 칩 */}
                          <span
                            className={clsx(
                              'text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0',
                              isApproved
                                ? 'bg-green-50 text-green-700'
                                : isPendingStatus
                                  ? 'bg-yellow-50 text-yellow-700'
                                  : 'bg-red-50 text-red-700'
                            )}
                          >
                            {isApproved ? '승인' : isPendingStatus ? '대기' : '거절'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 셀 추가 버튼 */}
              {cells.length > 0 && (
                <div className="p-3 border-t border-gray-100">
                  <button
                    onClick={openCellAddModal}
                    className="w-full py-2 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 font-medium"
                  >
                    + 새 셀 추가
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* 존 미선택 */
            <div className="h-full flex flex-col items-center justify-center text-gray-400 p-6">
              <MapPin className="w-12 h-12 mb-3 opacity-20" />
              <p className="text-center text-sm">지도에서 존을 선택해주세요</p>
              <p className="text-xs mt-1">존을 선택하면 셀 목록이 표시됩니다</p>
            </div>
          )}
        </div>
      </div>

      {/* 셀 추가 모달 - 지도 클릭으로 위치 선택 */}
      {cellAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900">새 셀 추가</h3>
            <p className="mt-1 text-xs text-gray-500">
              {selectedArea?.name}에 새로운 셀(부스)을 추가합니다. 지도를 클릭하여 위치를 선택하세요.
            </p>

            {/* 지도로 위치 선택 */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📍 위치 선택 (지도 클릭) *
              </label>
              <div className="h-[200px] rounded-lg overflow-hidden border border-gray-200">
                <Map
                  center={selectedArea ? (() => {
                    const coords = parseGeoJsonPolygon(selectedArea.polygonGeoJson);
                    if (coords.length > 0) {
                      return coords.reduce(
                        (acc, c) => ({ lat: acc.lat + c.lat / coords.length, lng: acc.lng + c.lng / coords.length }),
                        { lat: 0, lng: 0 }
                      );
                    }
                    return selectedDistrict.center;
                  })() : selectedDistrict.center}
                  style={{ width: '100%', height: '100%' }}
                  level={4}
                  onClick={(_map, mouseEvent) => {
                    const latlng = mouseEvent.latLng;
                    const lat = latlng.getLat();
                    const lng = latlng.getLng();

                    // 좌표 업데이트
                    setNewCellForm(prev => ({ ...prev, lat: lat.toFixed(6), lng: lng.toFixed(6) }));

                    // 카카오 주소 검색 API로 도로명 주소 조회
                    if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
                      const geocoder = new window.kakao.maps.services.Geocoder();
                      geocoder.coord2Address(lng, lat, (result, status) => {
                        if (status === window.kakao.maps.services.Status.OK && result[0]) {
                          const address = result[0].road_address
                            ? result[0].road_address.address_name
                            : result[0].address.address_name;
                          setNewCellForm(prev => ({ ...prev, detailedAddress: address }));
                        }
                      });
                    }
                  }}
                >
                  {/* 선택된 존 폴리곤 표시 */}
                  {selectedArea && (() => {
                    const coords = parseGeoJsonPolygon(selectedArea.polygonGeoJson);
                    if (coords.length >= 3) {
                      return (
                        <Polygon
                          path={coords}
                          strokeWeight={2}
                          strokeColor="#eb0000"
                          strokeOpacity={0.6}
                          fillColor="#eb0000"
                          fillOpacity={0.1}
                        />
                      );
                    }
                    return null;
                  })()}

                  {/* 선택한 위치 마커 */}
                  {newCellForm.lat && newCellForm.lng && (
                    <MapMarker
                      position={{ lat: parseFloat(newCellForm.lat), lng: parseFloat(newCellForm.lng) }}
                    />
                  )}
                </Map>
              </div>
              {newCellForm.lat && newCellForm.lng && (
                <p className="mt-1 text-xs text-green-600">
                  ✓ 선택된 좌표: {newCellForm.lat}, {newCellForm.lng}
                </p>
              )}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">셀 라벨 *</label>
                <input
                  type="text"
                  value={newCellForm.label}
                  onChange={(e) => setNewCellForm(prev => ({ ...prev, label: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  placeholder="예: A-1, B구역 1번"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">최대 수용 인원</label>
                <input
                  type="number"
                  value={newCellForm.maxCapacity}
                  onChange={(e) => setNewCellForm(prev => ({ ...prev, maxCapacity: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  placeholder="1"
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                도로명 주소 <span className="text-xs text-gray-400">(지도 클릭 시 자동 입력)</span>
              </label>
              <input
                type="text"
                value={newCellForm.detailedAddress}
                onChange={(e) => setNewCellForm(prev => ({ ...prev, detailedAddress: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none bg-gray-50"
                placeholder="지도를 클릭하면 자동으로 입력됩니다"
              />
            </div>

            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">유의사항</label>
              <textarea
                value={newCellForm.notice}
                onChange={(e) => setNewCellForm(prev => ({ ...prev, notice: e.target.value }))}
                rows={2}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none resize-none"
                placeholder="셀 운영 관련 유의사항"
              />
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCellAddModalOpen(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleCreateCell}
                disabled={createCellMutation.isPending}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {createCellMutation.isPending ? '생성 중...' : '셀 생성'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 존 수정 모달 - 폴리곤 편집 지원 */}
      {areaEditModalOpen && selectedArea && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
          <div className={clsx(
            'rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto',
            polygonEditMode ? 'w-full max-w-4xl' : 'w-full max-w-md'
          )}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">존 정보 수정</h3>
                <p className="mt-1 text-xs text-gray-500">
                  {polygonEditMode 
                    ? '지도에서 꼭짓점(●)을 드래그하여 영역을 수정하세요. 꼭짓점 우클릭으로 삭제합니다.'
                    : '존의 기본 정보와 영역을 수정합니다.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPolygonEditMode(!polygonEditMode)}
                className={clsx(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                  polygonEditMode 
                    ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-300' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {polygonEditMode ? '✓ 영역 편집 중' : '📐 영역 편집'}
              </button>
            </div>

            <div className={clsx('mt-4', polygonEditMode ? 'grid grid-cols-2 gap-6' : '')}>
              {/* 폴리곤 편집 지도 */}
              {polygonEditMode && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    영역 편집 <span className="text-xs text-gray-400">(꼭짓점 드래그로 수정)</span>
                  </label>
                  <div className="h-[350px] rounded-xl overflow-hidden border-2 border-blue-300 ring-2 ring-blue-100">
                    <Map
                      center={editingPolygonCoords.length > 0 
                        ? editingPolygonCoords.reduce(
                            (acc, c) => ({ 
                              lat: acc.lat + c.lat / editingPolygonCoords.length, 
                              lng: acc.lng + c.lng / editingPolygonCoords.length 
                            }),
                            { lat: 0, lng: 0 }
                          )
                        : selectedDistrict.center}
                      style={{ width: '100%', height: '100%' }}
                      level={4}
                    >
                      {/* 편집 중인 폴리곤 */}
                      {editingPolygonCoords.length >= 3 && (
                        <Polygon
                          path={editingPolygonCoords}
                          strokeWeight={3}
                          strokeColor="#2563eb"
                          strokeOpacity={0.9}
                          fillColor="#3b82f6"
                          fillOpacity={0.3}
                        />
                      )}

                      {/* 꼭짓점 마커 (드래그 가능) */}
                      {editingPolygonCoords.map((coord, idx) => (
                        <MapMarker
                          key={`vertex-${idx}`}
                          position={coord}
                          draggable={true}
                          onDragEnd={(marker) => handleVertexDrag(idx, marker.getPosition())}
                          onClick={() => {}}
                          onRightClick={() => handleRemoveVertex(idx)}
                          image={{
                            src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
                                <circle cx="10" cy="10" r="8" fill="#2563eb" stroke="white" stroke-width="2"/>
                                <text x="10" y="14" text-anchor="middle" fill="white" font-size="8" font-weight="bold">${idx + 1}</text>
                              </svg>
                            `)}`,
                            size: { width: 20, height: 20 },
                          }}
                        />
                      ))}
                    </Map>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-gray-500">꼭짓점: {editingPolygonCoords.length}개</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          // 중앙에 새 꼭짓점 추가
                          if (editingPolygonCoords.length >= 2) {
                            const lastIdx = editingPolygonCoords.length - 1;
                            const midLat = (editingPolygonCoords[lastIdx].lat + editingPolygonCoords[0].lat) / 2;
                            const midLng = (editingPolygonCoords[lastIdx].lng + editingPolygonCoords[0].lng) / 2;
                            handleAddVertex(lastIdx, { lat: midLat, lng: midLng });
                          }
                        }}
                        className="text-blue-600 hover:underline"
                      >
                        + 꼭짓점 추가
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const coords = parseGeoJsonPolygon(selectedArea.polygonGeoJson);
                          if (coords.length > 1 && 
                              coords[0].lat === coords[coords.length - 1].lat && 
                              coords[0].lng === coords[coords.length - 1].lng) {
                            coords.pop();
                          }
                          setEditingPolygonCoords(coords);
                        }}
                        className="text-gray-500 hover:underline"
                      >
                        ↺ 초기화
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 기본 정보 폼 */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">존 이름 *</label>
                  <input
                    type="text"
                    value={editAreaForm.name}
                    onChange={(e) => setEditAreaForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
                    placeholder="존 이름"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">최대 수용 인원</label>
                  <input
                    type="number"
                    value={editAreaForm.maxCapacity}
                    onChange={(e) => setEditAreaForm(prev => ({ ...prev, maxCapacity: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">유의사항</label>
                  <textarea
                    value={editAreaForm.notice}
                    onChange={(e) => setEditAreaForm(prev => ({ ...prev, notice: e.target.value }))}
                    rows={polygonEditMode ? 4 : 3}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none resize-none"
                    placeholder="존 운영 관련 유의사항"
                  />
                </div>

                {/* 폴리곤 미리보기 (편집 모드 아닐 때) */}
                {!polygonEditMode && editingPolygonCoords.length >= 3 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">현재 영역</label>
                    <div className="h-32 rounded-lg overflow-hidden border border-gray-200">
                      <Map
                        center={editingPolygonCoords.reduce(
                          (acc, c) => ({ 
                            lat: acc.lat + c.lat / editingPolygonCoords.length, 
                            lng: acc.lng + c.lng / editingPolygonCoords.length 
                          }),
                          { lat: 0, lng: 0 }
                        )}
                        style={{ width: '100%', height: '100%' }}
                        level={5}
                        draggable={false}
                        zoomable={false}
                      >
                        <Polygon
                          path={editingPolygonCoords}
                          strokeWeight={2}
                          strokeColor="#eb0000"
                          fillColor="#eb0000"
                          fillOpacity={0.2}
                        />
                      </Map>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setAreaEditModalOpen(false);
                  setPolygonEditMode(false);
                }}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleUpdateArea}
                disabled={updateAreaMutation.isPending}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {updateAreaMutation.isPending ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminZonesPage;