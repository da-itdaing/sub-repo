import React, { useEffect, useState } from "react";
import { popupService, PopupSummary } from "../../services/popupService";
import { geoService, AreaResponse, CellResponse } from "../../services/geoService";
import { KakaoMapCellSelector } from "../admin/KakaoMapCellSelector";
import { MapPin } from "lucide-react";
import { ImageWithFallback } from "../common/ImageWithFallback";

interface NearbyExplorePageProps { 
  onMainClick?:()=>void; 
  onMyPageClick?:()=>void; 
  isLoggedIn?:boolean; 
  onLoginClick?:()=>void; 
  onLogoutClick?:()=>void; 
  onPopupClick?:(id:number)=>void;
}

export function NearbyExplorePage({ onMainClick, onMyPageClick, isLoggedIn, onLoginClick, onLogoutClick, onPopupClick }: NearbyExplorePageProps){
  const [popups, setPopups] = useState<PopupSummary[]>([]);
  const [areas, setAreas] = useState<AreaResponse[]>([]);
  const [cells, setCells] = useState<CellResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAreaId, setSelectedAreaId] = useState<number | undefined>(undefined);

  useEffect(() => {
    Promise.all([
      popupService.getPopups(),
      geoService.getAreas(undefined, 0, 100),
      geoService.getCells(undefined, undefined, 'APPROVED', 0, 100),
    ]).then(([popupsData, areasResp, cellsResp]) => {
      setPopups(popupsData);
      setAreas(areasResp.items);
      setCells(cellsResp.items);
    }).catch(err => {
      console.error('Failed to load data:', err);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  // 팝업의 cellId로 Cell 찾기
  const popupCells = cells.filter(cell => 
    popups.some(popup => popup.cellId === cell.id)
  );

  return (
    <div className="min-h-screen bg-white pt-24 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">주변 탐색</h1>
        <p className="text-sm text-[#4d4d4d] mb-6">지도에서 팝업 위치를 확인하고 클릭하여 상세 정보를 볼 수 있습니다.</p>
        
        {loading ? (
          <div className="h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">데이터를 불러오는 중...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Area 선택 드롭다운 */}
            {areas.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  구역 선택
                </label>
                <select
                  value={selectedAreaId || ''}
                  onChange={(e) => setSelectedAreaId(e.target.value ? Number(e.target.value) : undefined)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#eb0000]"
                >
                  <option value="">전체 구역</option>
                  {areas.map(area => (
                    <option key={area.id} value={area.id}>
                      {area.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* 지도 */}
            <div className="h-[600px] rounded-lg overflow-hidden border border-gray-300">
              <KakaoMapCellSelector
                areas={areas}
                cells={popupCells}
                selectedAreaId={selectedAreaId}
                onAreaSelect={setSelectedAreaId}
                onCellClick={(cellId) => {
                  const popup = popups.find(p => p.cellId === cellId);
                  if (popup) {
                    onPopupClick?.(popup.id);
                  }
                }}
                height="100%"
              />
            </div>

            {/* 팝업 목록 */}
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-4">주변 팝업 ({popups.length}개)</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {popups.map(popup => {
                  const cell = cells.find(c => c.id === popup.cellId);
                  return (
                    <div
                      key={popup.id}
                      onClick={() => onPopupClick?.(popup.id)}
                      className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 hover:shadow-md transition cursor-pointer"
                    >
                      <ImageWithFallback
                        src={popup.thumbnail || popup.gallery?.[0]}
                        fallbackKey={popup.id}
                        alt={popup.title}
                        className="w-full h-40 object-cover rounded-lg mb-3"
                      />
                      <h3 className="font-semibold text-gray-900 mb-1">{popup.title}</h3>
                      {cell && (
                        <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                          <MapPin className="size-4" />
                          <span>{cell.detailedAddress || `${cell.lat.toFixed(4)}, ${cell.lng.toFixed(4)}`}</span>
                        </div>
                      )}
                      <p className="text-xs text-gray-500">
                        {popup.startDate} ~ {popup.endDate}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default NearbyExplorePage;
