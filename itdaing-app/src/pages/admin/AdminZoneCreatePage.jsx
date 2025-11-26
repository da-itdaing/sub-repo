import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map } from 'react-kakao-maps-sdk';
import { ArrowLeft, Save, Trash2, Map as MapIcon, Grid, Check, X } from 'lucide-react';
import { ROUTES } from '@/routes/paths';

const AdminZoneCreatePage = () => {
  const navigate = useNavigate();
  const mapInstanceRef = useRef(null);
  const managerRef = useRef(null);
  const draftPolygonRef = useRef(null);
  const modeRef = useRef(null); // "zone", "cell", null

  // State
  const [zones, setZones] = useState([]);
  const [cells, setCells] = useState([]);
  const [selectedZoneId, setSelectedZoneId] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Refs for event listeners
  const zonesRef = useRef([]);
  const selectedZoneIdRef = useRef(null);

  useEffect(() => {
    zonesRef.current = zones;
  }, [zones]);

  useEffect(() => {
    selectedZoneIdRef.current = selectedZoneId;
  }, [selectedZoneId]);

  // Helper: Extract path from polygon
  const extractPath = (poly) => {
    if (!poly) return [];
    try {
      const path = poly.getPath();
      const pathArr = path.map((pt) => ({
        lat: pt.getLat(),
        lng: pt.getLng(),
      }));
      return pathArr;
    } catch (e) {
      console.error('Error extracting path:', e);
      return [];
    }
  };

  // Helper: Point in Polygon check
  const pointInPolygon = (pt, polyCoords) => {
    const x = pt.lng;
    const y = pt.lat;
    let inside = false;
    for (let i = 0, j = polyCoords.length - 1; i < polyCoords.length; j = i++) {
      const xi = polyCoords[i].lng, yi = polyCoords[i].lat;
      const xj = polyCoords[j].lng, yj = polyCoords[j].lat;
      const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  };

  // Capture drawn polygon
  const captureDraftPolygon = (poly, manager) => {
    if (!poly) return;

    // If drawing a cell, validate it's inside the selected zone
    if (modeRef.current === 'cell') {
      const currentZoneId = selectedZoneIdRef.current;
      const currentZones = zonesRef.current;
      const targetZone = currentZones.find((z) => z.id === currentZoneId);

      if (!targetZone) {
        alert('선택된 존이 없습니다.');
        manager.cancel();
        return;
      }

      const cellPath = extractPath(poly);
      const allPointsInside = cellPath.every((pt) => pointInPolygon(pt, targetZone.path));

      if (!allPointsInside) {
        alert('셀은 선택된 존 내부에 있어야 합니다.');
        manager.cancel(); // Remove invalid polygon
        return;
      }
    }

    draftPolygonRef.current = poly;
  };

  // Initialize Drawing Manager when map is ready
  const handleMapCreate = (map) => {
    mapInstanceRef.current = map;

    if (!window.kakao || !window.kakao.maps || !window.kakao.maps.drawing) return;

    const options_manager = {
      map: map,
      drawingMode: [window.kakao.maps.drawing.OverlayType.POLYGON],
      guideTooltip: ['draw', 'drag', 'edit'],
      polygonOptions: {
        draggable: true,
        removable: true,
        editable: true,
        strokeColor: '#39f',
        fillColor: '#39f',
        fillOpacity: 0.5,
        hintStrokeStyle: 'dash',
        hintStrokeOpacity: 0.5,
      },
    };

    const manager = new window.kakao.maps.drawing.DrawingManager(options_manager);
    managerRef.current = manager;

    // Event Listeners
    manager.addListener('drawend', (data) => {
      const poly = data.target;
      captureDraftPolygon(poly, manager);
    });

    manager.addListener('cancel', () => {
      draftPolygonRef.current = null;
      setIsDrawing(false);
    });
  };

  // Actions
  const startZoneDrawing = () => {
    if (isDrawing) return;
    modeRef.current = 'zone';
    setIsDrawing(true);
    managerRef.current.select(window.kakao.maps.drawing.OverlayType.POLYGON);
  };

  const startCellDrawing = () => {
    if (isDrawing) return;
    if (!selectedZoneId) {
      alert('셀을 추가할 존을 먼저 선택해주세요.');
      return;
    }
    modeRef.current = 'cell';
    setIsDrawing(true);
    managerRef.current.select(window.kakao.maps.drawing.OverlayType.POLYGON);
  };

  const saveCurrentDrawing = () => {
    if (!draftPolygonRef.current) {
      alert('그려진 영역이 없습니다.');
      return;
    }

    const path = extractPath(draftPolygonRef.current);
    
    if (modeRef.current === 'zone') {
      const newZone = {
        id: Date.now(),
        name: `새 존 ${zones.length + 1}`,
        path: path,
        color: '#FF4B4B', // Default color
      };
      setZones([...zones, newZone]);
      
      // Draw permanent polygon on map
      new window.kakao.maps.Polygon({
        map: mapInstanceRef.current,
        path: path.map(p => new window.kakao.maps.LatLng(p.lat, p.lng)),
        strokeWeight: 3,
        strokeColor: '#FF4B4B',
        strokeOpacity: 0.8,
        fillColor: '#FF4B4B',
        fillOpacity: 0.2,
      });
    } else if (modeRef.current === 'cell') {
      const newCell = {
        id: Date.now(),
        zoneId: selectedZoneId,
        name: `새 셀 ${cells.length + 1}`,
        path: path,
        status: 'AVAILABLE',
      };
      setCells([...cells, newCell]);

      // Draw permanent polygon on map
      new window.kakao.maps.Polygon({
        map: mapInstanceRef.current,
        path: path.map(p => new window.kakao.maps.LatLng(p.lat, p.lng)),
        strokeWeight: 2,
        strokeColor: '#22c55e',
        strokeOpacity: 0.9,
        fillColor: '#4ade80',
        fillOpacity: 0.5,
      });
    }

    // Cleanup
    managerRef.current.remove(draftPolygonRef.current);
    draftPolygonRef.current = null;
    setIsDrawing(false);
    modeRef.current = null;
  };

  const cancelDrawing = () => {
    if (draftPolygonRef.current) {
      managerRef.current.remove(draftPolygonRef.current);
    }
    managerRef.current.cancel();
    draftPolygonRef.current = null;
    setIsDrawing(false);
    modeRef.current = null;
  };

  const handleSaveAll = () => {
    // Here you would send `zones` and `cells` to the backend
    console.log('Saving:', { zones, cells });
    alert('저장되었습니다 (Mock)');
    navigate(ROUTES.admin.zones);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-6 p-6 bg-gray-50">
      {/* Left: Map Area */}
      <div className="flex-[3] flex flex-col gap-4 min-w-0 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(ROUTES.admin.zones)}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">구역/셀 설정</h1>
          </div>
          
          <div className="flex gap-2">
            {isDrawing ? (
              <>
                <button
                  onClick={saveCurrentDrawing}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  그리기 완료
                </button>
                <button
                  onClick={cancelDrawing}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium shadow-sm"
                >
                  <X className="w-4 h-4" />
                  취소
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={startZoneDrawing}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium shadow-sm"
                >
                  <MapIcon className="w-4 h-4" />
                  존 추가
                </button>
                <button
                  onClick={startCellDrawing}
                  disabled={!selectedZoneId}
                  className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors font-medium shadow-sm ${
                    selectedZoneId 
                      ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50' 
                      : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                  셀 추가
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
          <Map
            center={{ lat: 35.1461, lng: 126.9231 }}
            style={{ width: '100%', height: '100%' }}
            level={3}
            onCreate={handleMapCreate}
          />
          
          {isDrawing && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm z-10">
              {modeRef.current === 'zone' ? '지도를 클릭하여 존 영역을 그려주세요' : '선택된 존 내부에 셀 영역을 그려주세요'}
            </div>
          )}
        </div>
      </div>

      {/* Right: Sidebar */}
      <div className="flex-[1] flex flex-col gap-4 min-w-[300px]">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">목록 관리</h2>
          <button
            onClick={handleSaveAll}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
          >
            <Save className="w-4 h-4" />
            전체 저장
          </button>
        </div>

        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-4 overflow-y-auto space-y-6">
          {/* Zones List */}
          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">존 (Zones)</h3>
            {zones.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">등록된 존이 없습니다.</p>
            ) : (
              <div className="space-y-2">
                {zones.map((zone) => (
                  <div 
                    key={zone.id}
                    onClick={() => setSelectedZoneId(zone.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedZoneId === zone.id
                        ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-200'
                        : 'bg-white border-gray-200 hover:border-blue-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-medium ${selectedZoneId === zone.id ? 'text-blue-700' : 'text-gray-700'}`}>
                        {zone.name}
                      </span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setZones(zones.filter(z => z.id !== zone.id));
                          if (selectedZoneId === zone.id) setSelectedZoneId(null);
                        }}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cells List */}
          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">셀 (Cells)</h3>
            {cells.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">등록된 셀이 없습니다.</p>
            ) : (
              <div className="space-y-2">
                {cells.map((cell) => {
                  const parentZone = zones.find(z => z.id === cell.zoneId);
                  return (
                    <div 
                      key={cell.id}
                      className="p-3 rounded-lg border border-gray-200 bg-white"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium text-gray-700 block">{cell.name}</span>
                          <span className="text-xs text-gray-400">
                            {parentZone ? parentZone.name : 'Unknown Zone'}
                          </span>
                        </div>
                        <button 
                          onClick={() => setCells(cells.filter(c => c.id !== cell.id))}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminZoneCreatePage;
