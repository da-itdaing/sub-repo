import { useState } from "react";
import ZoneDrawingMap from "@/components/map/ZoneDrawingMap";

/**
 * 관리자 존 생성 페이지 (Step 1: UI Only)
 * - UI 및 레이아웃만 구현
 * - 비즈니스 로직, API 호출, Drawing 관련 로직은 이후 단계에서 추가
 */

const REGIONS = [
  { id: 1, name: "동구" },
  { id: 2, name: "서구" },
  { id: 3, name: "남구" },
  { id: 4, name: "북구" },
  { id: 5, name: "광산구" },
];

const AdminZoneCreatePage = () => {
  // UI 전용 폼 상태
  const [zoneName, setZoneName] = useState("");
  const [selectedRegionId, setSelectedRegionId] = useState(REGIONS[0]?.id ?? null);

  // UI 상에서만 사용하는 버튼 핸들러 (실제 로직은 후속 단계에서 구현)
  const handleStartDrawing = () => {
    // TODO: 이후 Drawing 시작 로직 연결
  };

  const handleSaveZone = () => {
    // TODO: 이후 존 저장 로직(API 호출, GeoJSON 변환 등) 연결
  };

  // ZoneDrawingMap으로부터 폴리곤 좌표를 전달받는 콜백 (현재는 placeholder)
  const handlePolygonComplete = () => {
    // TODO: 이후 폴리곤 좌표 상태 관리 및 검증 로직 추가
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-6 p-6 bg-gray-50">
      {/* Left: Zone Create Form + Map */}
      <div className="flex-[3] flex flex-col gap-4 min-w-0">
        {/* Header & Form */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">존 생성</h1>
              <p className="mt-1 text-xs text-gray-500">
                지도에서 폴리곤을 그려 존 영역을 정의하고, 리전 정보를 설정하세요.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleStartDrawing}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Start Drawing
              </button>
              <button
                type="button"
                onClick={handleSaveZone}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-[#eb0000] text-white hover:bg-red-700 transition-colors"
              >
                Save Zone
              </button>
            </div>
          </div>

          {/* Zone Name & Region Select */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                존 이름
              </label>
              <input
                type="text"
                value={zoneName}
                onChange={(e) => setZoneName(e.target.value)}
                placeholder="예: 충장로 패션 거리 존"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#eb0000]/40"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                리전 선택
              </label>
              <select
                value={selectedRegionId ?? ""}
                onChange={(e) => setSelectedRegionId(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#eb0000]/40"
              >
                {REGIONS.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <ZoneDrawingMap onPolygonComplete={handlePolygonComplete} />
        </div>
      </div>

      {/* Right: Static Zone/Cell List Panel */}
      <div className="flex-[1.2] flex flex-col gap-4 min-w-[320px]">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4 h-full">
          <h2 className="text-xl font-bold text-[#eb0000]">존 / 셀 정보</h2>
          <div className="flex-1 flex flex-col gap-4 text-sm text-gray-500">
            <div className="border border-dashed border-gray-200 rounded-xl p-4 bg-gray-50/60 flex-1 flex flex-col items-center justify-center">
              <p className="font-medium text-gray-600 mb-1">Zone list will appear here</p>
              <p className="text-xs text-gray-400">
                생성된 존이 이 패널에 리스트 형태로 표시됩니다.
              </p>
            </div>
            <div className="border border-dashed border-gray-200 rounded-xl p-4 bg-gray-50/60 flex-1 flex flex-col items-center justify-center">
              <p className="font-medium text-gray-600 mb-1">Cell list will appear here</p>
              <p className="text-xs text-gray-400">
                선택한 존에 속한 셀 정보가 여기에 표시될 예정입니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminZoneCreatePage;
