// 관리자용 존/셀 관리 컴포넌트 (react-kakao-maps-sdk + Drawing Library)
import { useEffect, useRef, useState } from "react";
import { Map, Polygon } from "react-kakao-maps-sdk";
import { useDrawingManager } from "../../hooks/useDrawingManager";
import { extractPath, pointInPolygon, coordsToGeoJSON, geoJSONToCoords } from "../../utils/mapUtils";
import { geoService } from "../../services/geoService";

const CENTER = { lat: 35.14667451156048, lng: 126.92227158987355 };
const COLORS = ["#FF4B4B", "#FF8F1F", "#2ECC71", "#2980FF", "#9B59B6"];

export default function ZoneManage() {
  const [map, setMap] = useState(null);
  const [zones, setZones] = useState([]);
  const [cells, setCells] = useState([]);
  const [selectedZoneId, setSelectedZoneId] = useState(null);
  const [mode, setMode] = useState(null); // 'zone' | 'cell' | null
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ref로 최신 상태 추적 (이벤트 리스너에서 사용)
  const zonesRef = useRef([]);
  const selectedZoneIdRef = useRef(null);

  useEffect(() => {
    zonesRef.current = zones;
  }, [zones]);

  useEffect(() => {
    selectedZoneIdRef.current = selectedZoneId;
  }, [selectedZoneId]);

  // DrawingManager Hook 사용
  const { isReady, currentOverlay, startDrawing, cancel, removeOverlay } = 
    useDrawingManager(map, {
      onComplete: (overlay) => handleDrawComplete(overlay)
    });

  // 그리기 완료 시 검증
  const handleDrawComplete = (polygon) => {
    const pathArr = extractPath(polygon);
    
    if (pathArr.length > 6) {
      alert("최대 6개의 점까지만 가능합니다!");
      removeOverlay(polygon);
      return;
    }
    
    // 셀 그리기 중이면 존 내부 여부 검사
    if (mode === 'cell') {
      const zone = zonesRef.current.find(z => z.id === selectedZoneIdRef.current);
      
      if (!zone) {
        alert("셀을 설정할 존을 먼저 선택해주세요!");
        removeOverlay(polygon);
        return;
      }
      
      const coords = pathArr.map(p => ({ 
        lat: typeof p.getLat === 'function' ? p.getLat() : p.lat,
        lng: typeof p.getLng === 'function' ? p.getLng() : p.lng
      }));
      
      const allInside = coords.every(c => pointInPolygon(c, zone.coordinates));
      if (!allInside) {
        alert("셀은 선택된 존 내부에서만 그릴 수 있습니다!");
        removeOverlay(polygon);
        return;
      }
    }
  };

  // 기존 존/셀 데이터 로드
  useEffect(() => {
    if (!map) return;
    
    setLoading(true);
    geoService.getZones()
      .then(data => {
        const loadedZones = [];
        const loadedCells = [];

        data.forEach(zoneData => {
          const coords = geoJSONToCoords(zoneData.polygonGeoJson);
          
          if (coords.length > 0) {
            loadedZones.push({
              id: zoneData.id,
              name: zoneData.name,
              coordinates: coords,
              regionId: zoneData.regionId,
            });

            // 셀 데이터 로드
            if (zoneData.cells && Array.isArray(zoneData.cells)) {
              zoneData.cells.forEach((cellData, idx) => {
                const cellCoords = cellData.polygonGeoJson 
                  ? geoJSONToCoords(cellData.polygonGeoJson)
                  : [];
                
                if (cellCoords.length > 0) {
                  loadedCells.push({
                    id: cellData.id,
                    zoneId: zoneData.id,
                    name: cellData.label || `셀-${idx + 1}`,
                    coordinates: cellCoords,
                    lat: cellData.lat,
                    lng: cellData.lng,
                  });
                }
              });
            }
          }
        });

        setZones(loadedZones);
        setCells(loadedCells);
      })
      .catch(err => {
        console.error('존/셀 데이터 로드 실패:', err);
        alert('존/셀 데이터를 불러오는데 실패했습니다.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [map]);

  // 존 저장
  const saveZone = async () => {
    if (!currentOverlay || mode !== 'zone') {
      return alert("존을 먼저 그려주세요!");
    }
    
    const pathArr = extractPath(currentOverlay);
    const coords = pathArr.map(p => ({
      lat: typeof p.getLat === 'function' ? p.getLat() : p.lat,
      lng: typeof p.getLng === 'function' ? p.getLng() : p.lng,
    }));
    
    const geoJson = coordsToGeoJSON(coords);
    
    try {
      setSaving(true);
      const saved = await geoService.createArea({
        name: `존-${zones.length + 1}`,
        regionId: 1, // 광주광역시
        polygonGeoJson: geoJson
      });
      
      // 폴리곤을 읽기 전용으로 변경
      currentOverlay.setOptions({
        editable: false,
        draggable: false,
        strokeColor: '#0047FF',
        fillColor: '#99BBFF',
        fillOpacity: 0.4
      });
      currentOverlay.setEditable(false);
      currentOverlay.setDraggable(false);
      
      // 클릭 이벤트 추가
      window.kakao.maps.event.addListener(currentOverlay, 'click', () => {
        setSelectedZoneId(saved.id);
      });
      
      setZones(prev => [...prev, {
        id: saved.id,
        name: saved.name,
        coordinates: coords,
        regionId: saved.regionId,
        polygon: currentOverlay
      }]);
      
      setSelectedZoneId(saved.id);
      cancel();
      setMode(null);
      alert("존 저장 완료!");
    } catch (err) {
      console.error('존 저장 실패:', err);
      alert("존 저장 실패: " + (err.message || '알 수 없는 오류'));
    } finally {
      setSaving(false);
    }
  };

  // 셀 저장
  const saveCell = async () => {
    if (!currentOverlay || mode !== 'cell') {
      return alert("셀을 먼저 그려주세요!");
    }
    
    const zone = zones.find(z => z.id === selectedZoneId);
    if (!zone) {
      return alert("존이 선택되지 않았습니다!");
    }
    
    const pathArr = extractPath(currentOverlay);
    const coords = pathArr.map(p => ({
      lat: typeof p.getLat === 'function' ? p.getLat() : p.lat,
      lng: typeof p.getLng === 'function' ? p.getLng() : p.lng,
    }));
    
    // 셀의 중심점 계산
    const latSum = coords.reduce((sum, c) => sum + c.lat, 0);
    const lngSum = coords.reduce((sum, c) => sum + c.lng, 0);
    const centerLat = latSum / coords.length;
    const centerLng = lngSum / coords.length;
    
    const geoJson = coordsToGeoJSON(coords);
    
    try {
      setSaving(true);
      const saved = await geoService.createCell({
        zoneAreaId: zone.id,
        label: `셀-${cells.filter(c => c.zoneId === zone.id).length + 1}`,
        lat: centerLat,
        lng: centerLng,
        polygonGeoJson: geoJson
      });
      
      const colorIndex = cells.length % COLORS.length;
      
      // 폴리곤을 읽기 전용으로 변경
      currentOverlay.setOptions({
        editable: false,
        draggable: false,
        strokeColor: COLORS[colorIndex],
        fillColor: COLORS[colorIndex],
        fillOpacity: 0.45,
        strokeWeight: 3
      });
      currentOverlay.setEditable(false);
      currentOverlay.setDraggable(false);
      
      setCells(prev => [...prev, {
        id: saved.id,
        zoneId: zone.id,
        name: saved.label,
        coordinates: coords,
        lat: centerLat,
        lng: centerLng,
        polygon: currentOverlay
      }]);
      
      cancel();
      setMode(null);
      alert("셀 저장 완료!");
    } catch (err) {
      console.error('셀 저장 실패:', err);
      alert("셀 저장 실패: " + (err.message || '알 수 없는 오류'));
    } finally {
      setSaving(false);
    }
  };

  // 존 삭제
  const deleteZone = async (zoneId) => {
    const zone = zones.find(z => z.id === zoneId);
    if (!zone) return;
    
    const zoneCells = cells.filter(c => c.zoneId === zoneId);
    const confirmMsg = zoneCells.length > 0
      ? `${zone.name}을 삭제하면 관련된 ${zoneCells.length}개의 셀도 함께 삭제됩니다. 계속하시겠습니까?`
      : `${zone.name}을 삭제하시겠습니까?`;
    
    if (!confirm(confirmMsg)) return;
    
    try {
      await geoService.deleteArea(zoneId);
      
      // 지도에서 폴리곤 제거
      if (zone.polygon) {
        zone.polygon.setMap(null);
      }
      
      // 관련 셀 제거
      zoneCells.forEach(cell => {
        if (cell.polygon) {
          cell.polygon.setMap(null);
        }
      });
      
      setZones(prev => prev.filter(z => z.id !== zoneId));
      setCells(prev => prev.filter(c => c.zoneId !== zoneId));
      
      if (selectedZoneId === zoneId) {
        setSelectedZoneId(null);
      }
      
      alert("존 삭제 완료!");
    } catch (err) {
      console.error('존 삭제 실패:', err);
      alert("존 삭제 실패: " + (err.message || '알 수 없는 오류'));
    }
  };

  // 셀 삭제
  const deleteCell = async (cellId) => {
    const cell = cells.find(c => c.id === cellId);
    if (!cell) return;
    
    if (!confirm(`${cell.name}을 삭제하시겠습니까?`)) return;
    
    try {
      await geoService.deleteCell(cellId);
      
      // 지도에서 폴리곤 제거
      if (cell.polygon) {
        cell.polygon.setMap(null);
      }
      
      setCells(prev => prev.filter(c => c.id !== cellId));
      alert("셀 삭제 완료!");
    } catch (err) {
      console.error('셀 삭제 실패:', err);
      alert("셀 삭제 실패: " + (err.message || '알 수 없는 오류'));
    }
  };

  // 임시 드래프트 삭제
  const deleteDraft = () => {
    if (currentOverlay) {
      removeOverlay(currentOverlay);
    }
    cancel();
    setMode(null);
  };

  return (
    <div className="flex gap-4 p-6 bg-gray-50 min-h-screen">
      {/* 왼쪽: 지도 */}
      <div className="flex-1">
        <h2 className="text-2xl font-bold mb-4">존 / 셀 관리</h2>
        
        {/* 컨트롤 버튼 */}
        <div className="mb-4 flex flex-wrap gap-2">
          <button 
            onClick={() => { setMode('zone'); startDrawing(); }} 
            disabled={!isReady || saving}
            className="px-4 py-2 bg-[#0047FF] text-white rounded-lg hover:bg-[#0039CC] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            🎨 존 그리기
          </button>
          
          <button 
            onClick={saveZone}
            disabled={!currentOverlay || mode !== 'zone' || saving}
            className="px-4 py-2 bg-[#2196F3] text-white rounded-lg hover:bg-[#1976D2] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            💾 존 저장
          </button>
          
          <button 
            onClick={() => { setMode('cell'); startDrawing(); }}
            disabled={!isReady || !selectedZoneId || saving}
            className="px-4 py-2 bg-[#43A047] text-white rounded-lg hover:bg-[#2E7D32] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            🧩 셀 그리기
          </button>
          
          <button 
            onClick={saveCell}
            disabled={!currentOverlay || mode !== 'cell' || saving}
            className="px-4 py-2 bg-[#2E7D32] text-white rounded-lg hover:bg-[#1B5E20] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            💾 셀 저장
          </button>
          
          {currentOverlay && (
            <button 
              onClick={deleteDraft}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              🗑️ 임시 작업 삭제
            </button>
          )}
        </div>

        {/* 상태 표시 */}
        {!isReady && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
            ⚠️ DrawingManager가 초기화되지 않았습니다. 잠시 후 다시 시도해주세요.
          </div>
        )}
        
        {selectedZoneId && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
            ℹ️ 선택된 존: {zones.find(z => z.id === selectedZoneId)?.name}
          </div>
        )}
        
        {mode && (
          <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg text-sm text-purple-800">
            ✏️ {mode === 'zone' ? '존' : '셀'} 그리기 모드 활성화
          </div>
        )}

        {/* 지도 */}
        <div className="bg-white rounded-lg overflow-hidden shadow-lg border border-gray-200">
          <Map
            center={CENTER}
            level={4}
            style={{ width: '100%', height: '600px' }}
            onCreate={setMap}
          >
            {/* 존 표시 */}
            {zones.map(zone => (
              <Polygon
                key={zone.id}
                path={zone.coordinates}
                strokeColor={zone.id === selectedZoneId ? '#FF3366' : '#0047FF'}
                strokeWeight={zone.id === selectedZoneId ? 5 : 3}
                fillColor="#99BBFF"
                fillOpacity={0.4}
                onClick={() => setSelectedZoneId(zone.id)}
              />
            ))}
            
            {/* 셀 표시 */}
            {cells.map((cell, idx) => (
              <Polygon
                key={cell.id}
                path={cell.coordinates}
                strokeColor={COLORS[idx % COLORS.length]}
                strokeWeight={3}
                fillColor={COLORS[idx % COLORS.length]}
                fillOpacity={0.45}
              />
            ))}
          </Map>
        </div>
      </div>
      
      {/* 오른쪽: 존/셀 목록 */}
      <div className="w-80 bg-white border border-gray-200 rounded-lg p-4 overflow-y-auto shadow-lg" style={{ maxHeight: '680px' }}>
        <h3 className="font-bold text-lg mb-3 text-gray-800">📌 존 목록 ({zones.length})</h3>
        
        {zones.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            등록된 존이 없습니다.
          </p>
        ) : (
          zones.map(zone => (
            <div 
              key={zone.id} 
              className={`p-3 mb-2 rounded-lg border transition-colors ${
                zone.id === selectedZoneId 
                  ? 'bg-blue-100 border-blue-300' 
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <div className="font-medium text-gray-900">{zone.name}</div>
              <div className="text-xs text-gray-600 mt-1">
                좌표: {zone.coordinates.length}개
              </div>
              <div className="text-xs text-gray-600">
                셀: {cells.filter(c => c.zoneId === zone.id).length}개
              </div>
              <div className="flex gap-2 mt-2">
                <button 
                  onClick={() => setSelectedZoneId(zone.id)} 
                  className="text-xs px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  선택
                </button>
                <button 
                  onClick={() => deleteZone(zone.id)} 
                  className="text-xs px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  삭제
                </button>
              </div>
            </div>
          ))
        )}
        
        <h3 className="font-bold text-lg mt-6 mb-3 text-gray-800">🧩 셀 목록 ({cells.length})</h3>
        
        {cells.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            등록된 셀이 없습니다.
          </p>
        ) : (
          cells.map((cell, idx) => (
            <div 
              key={cell.id} 
              className="p-3 mb-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                />
                <div className="font-medium text-gray-900">{cell.name}</div>
              </div>
              <div className="text-xs text-gray-600 mt-1">
                존: {zones.find(z => z.id === cell.zoneId)?.name || '알 수 없음'}
              </div>
              <div className="text-xs text-gray-600">
                위치: {cell.lat.toFixed(5)}, {cell.lng.toFixed(5)}
              </div>
              <button 
                onClick={() => deleteCell(cell.id)} 
                className="text-xs px-3 py-1 bg-red-400 text-white rounded hover:bg-red-500 transition-colors mt-2"
              >
                삭제
              </button>
            </div>
          ))
        )}
        
        {/* 사용 안내 */}
        <div className="mt-6 p-3 bg-gray-100 rounded-lg text-xs text-gray-700">
          <p className="font-semibold mb-2">사용 방법</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>존 그리기로 영역 그리기</li>
            <li>존 저장 버튼 클릭</li>
            <li>존 선택 후 셀 그리기</li>
            <li>셀은 반드시 존 내부에만 그려야 함</li>
            <li>셀 저장 버튼 클릭</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
