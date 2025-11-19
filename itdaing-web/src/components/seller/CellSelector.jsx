// 판매자용 셀 선택 컴포넌트 (react-kakao-maps-sdk 최적화 버전)
import { useEffect, useState, useRef } from "react";
import { Map, Polygon, MapMarker } from "react-kakao-maps-sdk";
import { geoService } from "../../services/geoService";
import { geoJSONToCoords, createMarkerImage } from "../../utils/mapUtils";

const CENTER = { lat: 35.14667451156048, lng: 126.92227158987355 };

export default function CellSelector({ selectedCellId, onSelect, onClose }) {
  const [zones, setZones] = useState([]);
  const [cells, setCells] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);
  
  const onSelectRef = useRef(onSelect);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  // 존/셀 데이터 로드
  useEffect(() => {
    setLoading(true);
    geoService.getZones()
      .then(data => {
        const allCells = [];
        const allZones = [];
        
        data.forEach(zoneData => {
          const coords = geoJSONToCoords(zoneData.polygonGeoJson);
          
          if (coords.length > 0) {
            allZones.push({
              id: zoneData.id,
              name: zoneData.name,
              coordinates: coords
            });
          }

          if (zoneData.cells && Array.isArray(zoneData.cells)) {
            zoneData.cells.forEach(cellData => {
              if (cellData.lat != null && cellData.lng != null) {
                allCells.push({
                  id: cellData.id,
                  label: cellData.label || `셀 ${cellData.id}`,
                  lat: cellData.lat,
                  lng: cellData.lng,
                  zoneId: zoneData.id,
                  zoneName: zoneData.name
                });
              }
            });
          }
        });
        
        setZones(allZones);
        setCells(allCells);
      })
      .catch(err => {
        console.error('셀 데이터 로드 실패:', err);
        setError('셀 데이터를 불러오는데 실패했습니다.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // 선택된 셀로 지도 중심 이동
  useEffect(() => {
    if (mapInstance && selectedCellId && cells.length > 0) {
      const cell = cells.find(c => c.id === selectedCellId);
      if (cell) {
        const kakao = window.kakao;
        mapInstance.setCenter(new kakao.maps.LatLng(cell.lat, cell.lng));
        mapInstance.setLevel(3);
      }
    }
  }, [mapInstance, selectedCellId, cells]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <p className="text-gray-600">셀 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            닫기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">셀 선택</h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            지도에서 셀을 클릭하여 선택하세요 (총 {cells.length}개)
          </p>
        </div>

        {/* 지도 */}
        <div className="flex-1 p-4 overflow-hidden">
          <Map
            center={CENTER}
            level={4}
            style={{ width: '100%', height: '100%', borderRadius: '0.5rem' }}
            onCreate={setMapInstance}
          >
            {/* 존 폴리곤 표시 (배경) */}
            {zones.map(zone => (
              <Polygon
                key={zone.id}
                path={zone.coordinates}
                strokeColor="#0047FF"
                strokeWeight={2}
                fillColor="#99BBFF"
                fillOpacity={0.2}
              />
            ))}
            
            {/* 셀 마커 표시 */}
            {cells.map(cell => (
              <MapMarker
                key={cell.id}
                position={{ lat: cell.lat, lng: cell.lng }}
                title={cell.label}
                image={createMarkerImage(
                  cell.id === selectedCellId ? '#FF0000' : '#eb0000',
                  cell.id === selectedCellId ? { width: 40, height: 52 } : { width: 32, height: 42 }
                )}
                onClick={() => onSelectRef.current?.(cell.id)}
              />
            ))}
          </Map>
        </div>

        {/* 하단: 셀 목록 */}
        <div className="p-4 border-t border-gray-200 max-h-48 overflow-y-auto bg-gray-50">
          <h3 className="font-semibold text-sm text-gray-700 mb-2">셀 목록</h3>
          <div className="grid grid-cols-2 gap-2">
            {cells.map(cell => (
              <button
                key={cell.id}
                onClick={() => onSelectRef.current?.(cell.id)}
                className={`p-2 rounded text-left text-sm transition-colors ${
                  cell.id === selectedCellId
                    ? 'bg-[#eb0000] text-white'
                    : 'bg-white border border-gray-300 hover:bg-gray-100'
                }`}
              >
                <div className="font-medium">{cell.label}</div>
                <div className="text-xs opacity-80">{cell.zoneName}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 푸터 */}
        <div className="p-4 border-t border-gray-200 flex justify-between items-center bg-gray-50">
          <div className="text-sm text-gray-600">
            {selectedCellId ? (
              <span className="font-medium text-[#eb0000]">
                선택됨: {cells.find(c => c.id === selectedCellId)?.label}
              </span>
            ) : (
              <span>셀을 선택해주세요</span>
            )}
          </div>
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-[#eb0000] text-white rounded-lg hover:bg-[#cc0000] transition-colors"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
