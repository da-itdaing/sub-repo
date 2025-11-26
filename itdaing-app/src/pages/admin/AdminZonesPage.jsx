import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, Polygon, MapMarker } from 'react-kakao-maps-sdk';
import { Plus, CheckCircle, XCircle, MapPin } from 'lucide-react';
import clsx from 'clsx';
import { ROUTES } from '@/routes/paths';

// Mock Data for Zones and Cells
const MOCK_ZONES = [
  {
    id: 1,
    name: '충장로 패션의 거리',
    district: '동구',
    color: '#FF4B4B',
    path: [
      { lat: 35.1485, lng: 126.9135 },
      { lat: 35.1485, lng: 126.9165 },
      { lat: 35.1465, lng: 126.9165 },
      { lat: 35.1465, lng: 126.9135 },
    ],
  },
  {
    id: 2,
    name: '상무지구 먹자골목',
    district: '서구',
    color: '#2980FF',
    path: [
      { lat: 35.1535, lng: 126.8515 },
      { lat: 35.1535, lng: 126.8545 },
      { lat: 35.1515, lng: 126.8545 },
      { lat: 35.1515, lng: 126.8515 },
    ],
  },
];

const MOCK_CELLS = [
  {
    id: 101,
    zoneId: 1,
    name: 'A-1 구역',
    status: 'AVAILABLE', // AVAILABLE, UNAVAILABLE
    capacity: 10,
    category: '패션',
    address: '광주광역시 동구 충장로 1가 1',
    precautions: '화기 엄금, 소음 주의',
    path: [
      { lat: 35.1480, lng: 126.9140 },
      { lat: 35.1480, lng: 126.9150 },
      { lat: 35.1470, lng: 126.9150 },
      { lat: 35.1470, lng: 126.9140 },
    ],
  },
  {
    id: 102,
    zoneId: 1,
    name: 'A-2 구역',
    status: 'UNAVAILABLE',
    capacity: 5,
    category: '음식',
    address: '광주광역시 동구 충장로 1가 2',
    precautions: '쓰레기 처리 필수',
    path: [
      { lat: 35.1480, lng: 126.9150 },
      { lat: 35.1480, lng: 126.9160 },
      { lat: 35.1470, lng: 126.9160 },
      { lat: 35.1470, lng: 126.9150 },
    ],
  },
];

const DISTRICTS = [
  { name: '동구', center: { lat: 35.1461, lng: 126.9231 } },
  { name: '서구', center: { lat: 35.1520, lng: 126.8900 } },
  { name: '남구', center: { lat: 35.1329, lng: 126.9025 } },
  { name: '북구', center: { lat: 35.1741, lng: 126.9121 } },
  { name: '광산구', center: { lat: 35.1395, lng: 126.7937 } },
];

const AdminZonesPage = () => {
  const navigate = useNavigate();
  // State
  const [selectedDistrict, setSelectedDistrict] = useState('동구');
  const [mapCenter, setMapCenter] = useState(DISTRICTS[0].center);
  const [selectedCell, setSelectedCell] = useState(null);
  const [zones, setZones] = useState(MOCK_ZONES);
  const [cells, setCells] = useState(MOCK_CELLS);

  // Form State for Detail Panel
  const [editForm, setEditForm] = useState({
    status: 'AVAILABLE',
    capacity: 0,
    category: '',
    precautions: '',
  });

  // Update map center when district changes
  useEffect(() => {
    const district = DISTRICTS.find((d) => d.name === selectedDistrict);
    if (district) {
      setMapCenter(district.center);
    }
  }, [selectedDistrict]);

  // Update form when cell selected
  useEffect(() => {
    if (selectedCell) {
      setEditForm({
        status: selectedCell.status,
        capacity: selectedCell.capacity,
        category: selectedCell.category,
        precautions: selectedCell.precautions,
      });
    }
  }, [selectedCell]);

  const handleCellClick = (cell) => {
    setSelectedCell(cell);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!selectedCell) return;
    
    setCells((prev) =>
      prev.map((c) =>
        c.id === selectedCell.id
          ? { ...c, ...editForm }
          : c
      )
    );
    alert('구역 정보가 수정되었습니다.');
  };

  const handleDelete = () => {
    if (!selectedCell) return;
    if (window.confirm('정말 이 구역을 삭제하시겠습니까?')) {
      setCells((prev) => prev.filter((c) => c.id !== selectedCell.id));
      setSelectedCell(null);
      alert('구역이 삭제되었습니다.');
    }
  };

  const availableCount = cells.filter(c => c.status === 'AVAILABLE').length;
  const unavailableCount = cells.filter(c => c.status === 'UNAVAILABLE').length;

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-6 p-6 bg-gray-50">
      {/* Left: Zone Management (Larger) */}
      <div className="flex-[3] flex flex-col gap-4 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">구역 관리</h1>
          <button 
            onClick={() => navigate(ROUTES.admin.zoneCreate)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            새 구역 추가
          </button>
        </div>

        {/* Controls & Status */}
        <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex gap-4">
            <div className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-gray-600">이용 가능</span>
              </div>
              <span className="text-lg font-bold text-gray-900">{availableCount}</span>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-500" />
                <span className="text-sm font-medium text-gray-600">이용 불가</span>
              </div>
              <span className="text-lg font-bold text-gray-900">{unavailableCount}</span>
            </div>
          </div>

          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 min-w-[120px]"
          >
            {DISTRICTS.map((d) => (
              <option key={d.name} value={d.name}>
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
            level={5}
          >
            {/* Render Zones */}
            {zones.map((zone) => (
              <Polygon
                key={zone.id}
                path={zone.path}
                strokeWeight={3}
                strokeColor={zone.color}
                strokeOpacity={0.8}
                fillColor={zone.color}
                fillOpacity={0.2}
              />
            ))}

            {/* Render Cells */}
            {cells.map((cell) => (
              <Polygon
                key={cell.id}
                path={cell.path}
                strokeWeight={2}
                strokeColor={cell.status === 'AVAILABLE' ? '#22c55e' : '#ef4444'}
                strokeOpacity={0.9}
                fillColor={cell.status === 'AVAILABLE' ? '#4ade80' : '#f87171'}
                fillOpacity={selectedCell?.id === cell.id ? 0.8 : 0.5}
                onClick={() => handleCellClick(cell)}
                onMouseOver={() => document.body.style.cursor = 'pointer'}
                onMouseOut={() => document.body.style.cursor = 'default'}
              />
            ))}
          </Map>
          
          {/* Map Overlay Info */}
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-md z-10 border border-gray-200">
            <p className="text-sm font-medium text-gray-600">
              <MapPin className="w-4 h-4 inline-block mr-1 text-primary" />
              {selectedDistrict}
            </p>
          </div>
        </div>
      </div>

      {/* Right: Zone Details (Smaller) */}
      <div className="flex-[1.2] flex flex-col gap-4 min-w-[320px]">
        <h2 className="text-xl font-bold text-red-600">구역 상세사항</h2>
        
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6 overflow-y-auto">
          {selectedCell ? (
            <div className="space-y-6">
              {/* Mini Map for Cell */}
              <div className="w-full h-48 bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                <Map
                  center={selectedCell.path[0]}
                  style={{ width: '100%', height: '100%' }}
                  level={3}
                  draggable={false}
                  zoomable={false}
                >
                  <Polygon
                    path={selectedCell.path}
                    strokeWeight={2}
                    strokeColor="#ef4444"
                    fillColor="#fca5a5"
                    fillOpacity={0.6}
                  />
                  <MapMarker position={selectedCell.path[0]} />
                </Map>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">할당 구역</label>
                  <input
                    type="text"
                    value={selectedCell.address}
                    readOnly
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">구역 상태</label>
                    <select
                      name="status"
                      value={editForm.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none"
                    >
                      <option value="AVAILABLE">이용 가능</option>
                      <option value="UNAVAILABLE">이용 불가</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">최대 수용 인원</label>
                    <div className="relative">
                      <input
                        type="number"
                        name="capacity"
                        value={editForm.capacity}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none"
                      />
                      <span className="absolute right-3 top-2 text-sm text-gray-400">명</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">권장 카테고리</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {['공연/전시', '건강', '반려동물', '뷰티', '스포츠', '악세사리', '음식', '키즈', '패션'].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setEditForm(prev => ({ ...prev, category: cat }))}
                        className={clsx(
                          "px-3 py-1 rounded-full text-xs font-medium transition-colors border",
                          editForm.category === cat
                            ? "bg-red-600 text-white border-red-600"
                            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">구역 유의사항</label>
                  <textarea
                    name="precautions"
                    value={editForm.precautions}
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
                  className="flex-1 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  수정
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                >
                  삭제
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <MapPin className="w-12 h-12 mb-3 opacity-20" />
              <p>지도에서 구역을 선택해주세요</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminZonesPage;
