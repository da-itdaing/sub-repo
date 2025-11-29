import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Map, Polygon, MapMarker, CustomOverlayMap } from "react-kakao-maps-sdk";
import { useToast } from "@/hooks/useToast";
import {
  createArea,
  listAreas,
  listCells,
  createCell,
  updateArea,
  deleteArea,
  deleteCell,
  parseGeoJsonPolygon,
  toGeoJsonPolygon,
} from "@/services/geoZoneService";

/**
 * 관리자 존 생성/관리 페이지
 * - KakaoMap에서 다각형(Polygon)으로 존(Zone/행사 영역) 등록
 * - 존 안에 셀(Cell/부스 위치) 추가
 * - 존/셀 수정 및 삭제 기능
 */

// 광주광역시 5개 구
const REGIONS = [
  { id: 26, name: "동구" },
  { id: 27, name: "서구" },
  { id: 28, name: "남구" },
  { id: 29, name: "북구" },
  { id: 30, name: "광산구" },
];

// 광주 중심 좌표
const GWANGJU_CENTER = { lat: 35.1595, lng: 126.8526 };

const AdminZoneCreatePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // 폼 상태
  const [zoneName, setZoneName] = useState("");
  const [selectedRegionId, setSelectedRegionId] = useState(REGIONS[0]?.id ?? null);
  const [maxCapacity, setMaxCapacity] = useState("");
  const [notice, setNotice] = useState("");

  // 지도 상태
  const [mapInstance, setMapInstance] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [polygonPath, setPolygonPath] = useState([]); // [{lat, lng}, ...]
  const [tempPath, setTempPath] = useState([]); // 그리는 중인 경로

  // 존 목록 상태
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);
  const [cells, setCells] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 셀 추가 모드
  const [isAddingCell, setIsAddingCell] = useState(false);
  const [newCellLabel, setNewCellLabel] = useState("");

  // 수정 모드
  const [editMode, setEditMode] = useState(false);

  // 존 목록 로드
  const loadAreas = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await listAreas({ page: 0, size: 100 });
      setAreas(data.items || []);
    } catch (err) {
      console.error("존 목록 로드 실패:", err);
      toast({ type: "error", message: "존 목록을 불러오는데 실패했습니다." });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // 셀 목록 로드
  const loadCells = useCallback(async (areaId) => {
    if (!areaId) {
      setCells([]);
      return;
    }
    try {
      const data = await listCells({ areaId, page: 0, size: 100 });
      setCells(data.items || []);
    } catch (err) {
      console.error("셀 목록 로드 실패:", err);
      // 셀 API가 없을 수 있으므로 에러 무시
      setCells([]);
    }
  }, []);

  // 초기 로드
  useEffect(() => {
    loadAreas();
  }, [loadAreas]);

  // 선택된 존 변경 시 셀 로드
  useEffect(() => {
    if (selectedArea) {
      loadCells(selectedArea.id);
      // 폴리곤 경로 설정
      const coords = parseGeoJsonPolygon(selectedArea.polygonGeoJson);
      setPolygonPath(coords);
    } else {
      setCells([]);
      setPolygonPath([]);
    }
  }, [selectedArea, loadCells]);

  // 지도 클릭 핸들러 (폴리곤 그리기 또는 셀 추가)
  const handleMapClick = useCallback(
    (_map, mouseEvent) => {
      const latlng = mouseEvent.latLng;
      const point = { lat: latlng.getLat(), lng: latlng.getLng() };

      if (isDrawing) {
        // 폴리곤 그리기 모드
        setTempPath((prev) => [...prev, point]);
      } else if (isAddingCell && selectedArea) {
        // 셀 추가 모드
        handleAddCell(point);
      }
    },
    [isDrawing, isAddingCell, selectedArea]
  );

  // 폴리곤 그리기 시작
  const handleStartDrawing = () => {
    setIsDrawing(true);
    setTempPath([]);
    setPolygonPath([]);
    setSelectedArea(null);
    setEditMode(false);
    toast({ type: "info", message: "지도를 클릭하여 존 영역을 그려주세요. 완료 후 '그리기 완료' 버튼을 눌러주세요." });
  };

  // 폴리곤 그리기 완료
  const handleFinishDrawing = () => {
    if (tempPath.length < 3) {
      toast({ type: "error", message: "최소 3개 이상의 점을 찍어주세요." });
      return;
    }
    setPolygonPath(tempPath);
    setTempPath([]);
    setIsDrawing(false);
    toast({ type: "success", message: "존 영역이 설정되었습니다. 정보를 입력하고 저장해주세요." });
  };

  // 폴리곤 그리기 취소
  const handleCancelDrawing = () => {
    setIsDrawing(false);
    setTempPath([]);
  };

  // 존 저장
  const handleSaveZone = async () => {
    if (!zoneName.trim()) {
      toast({ type: "error", message: "존 이름을 입력해주세요." });
      return;
    }
    if (polygonPath.length < 3) {
      toast({ type: "error", message: "존 영역을 먼저 그려주세요." });
      return;
    }

    setIsLoading(true);
    try {
      const geoJson = toGeoJsonPolygon(polygonPath);
      
      if (editMode && selectedArea) {
        // 수정 모드
        await updateArea(selectedArea.id, {
          name: zoneName,
          polygonGeoJson: geoJson,
          regionId: selectedRegionId,
          maxCapacity: maxCapacity ? parseInt(maxCapacity, 10) : null,
          notice: notice || null,
        });
        toast({ type: "success", message: "존이 수정되었습니다." });
      } else {
        // 생성 모드
        await createArea({
          name: zoneName,
          polygonGeoJson: geoJson,
          regionId: selectedRegionId,
          maxCapacity: maxCapacity ? parseInt(maxCapacity, 10) : null,
          notice: notice || null,
        });
        toast({ type: "success", message: "존이 생성되었습니다." });
      }

      // 상태 초기화 및 목록 새로고침
      resetForm();
      await loadAreas();
    } catch (err) {
      console.error("존 저장 실패:", err);
      toast({ type: "error", message: err.message || "존 저장에 실패했습니다." });
    } finally {
      setIsLoading(false);
    }
  };

  // 존 삭제
  const handleDeleteZone = async () => {
    if (!selectedArea) return;
    
    if (!window.confirm(`"${selectedArea.name}" 존을 삭제하시겠습니까? 관련된 모든 셀도 함께 삭제됩니다.`)) {
      return;
    }

    setIsLoading(true);
    try {
      await deleteArea(selectedArea.id);
      toast({ type: "success", message: "존이 삭제되었습니다." });
      resetForm();
      await loadAreas();
    } catch (err) {
      console.error("존 삭제 실패:", err);
      toast({ type: "error", message: err.message || "존 삭제에 실패했습니다." });
    } finally {
      setIsLoading(false);
    }
  };

  // 존 선택
  const handleSelectArea = (area) => {
    setSelectedArea(area);
    setZoneName(area.name);
    setSelectedRegionId(area.regionId || REGIONS[0].id);
    setMaxCapacity(area.maxCapacity?.toString() || "");
    setNotice(area.notice || "");
    setEditMode(false);
    setIsAddingCell(false);

    // 지도 중심 이동
    const coords = parseGeoJsonPolygon(area.polygonGeoJson);
    if (coords.length > 0 && mapInstance) {
      const center = coords.reduce(
        (acc, c) => ({ lat: acc.lat + c.lat / coords.length, lng: acc.lng + c.lng / coords.length }),
        { lat: 0, lng: 0 }
      );
      mapInstance.setCenter(new window.kakao.maps.LatLng(center.lat, center.lng));
    }
  };

  // 수정 모드 진입
  const handleEditMode = () => {
    if (!selectedArea) return;
    setEditMode(true);
    toast({ type: "info", message: "수정 모드입니다. 정보를 수정하고 저장해주세요." });
  };

  // 폼 초기화
  const resetForm = () => {
    setZoneName("");
    setSelectedRegionId(REGIONS[0]?.id ?? null);
    setMaxCapacity("");
    setNotice("");
    setPolygonPath([]);
    setTempPath([]);
    setSelectedArea(null);
    setCells([]);
    setIsDrawing(false);
    setIsAddingCell(false);
    setEditMode(false);
  };

  // 셀 추가 모드 토글
  const handleToggleAddCell = () => {
    if (!selectedArea) {
      toast({ type: "error", message: "먼저 존을 선택해주세요." });
      return;
    }
    setIsAddingCell(!isAddingCell);
    if (!isAddingCell) {
      toast({ type: "info", message: "지도에서 셀 위치를 클릭해주세요." });
    }
  };

  // 셀 추가
  const handleAddCell = async (point) => {
    if (!selectedArea) return;

    const label = newCellLabel.trim() || `C-${cells.length + 1}`;
    
    // 셀 위치를 GeoJSON Point 형식으로 변환
    // 백엔드에서 centroid 계산을 위해 Point 형식 사용
    const cellGeoJson = JSON.stringify({
      type: "Point",
      coordinates: [point.lng, point.lat], // GeoJSON은 [lng, lat] 순서
    });
    
    try {
      await createCell({
        areaId: selectedArea.id,
        ownerId: 1, // 기본 관리자 ID
        label,
        detailedAddress: "",
        geometryData: cellGeoJson,
        status: "APPROVED",
      });
      toast({ type: "success", message: `셀 "${label}"이 추가되었습니다.` });
      setNewCellLabel("");
      await loadCells(selectedArea.id);
    } catch (err) {
      console.error("셀 추가 실패:", err);
      toast({ type: "error", message: err.message || "셀 추가에 실패했습니다." });
    }
  };

  // 셀 삭제
  const handleDeleteCell = async (cellId, cellLabel) => {
    if (!window.confirm(`"${cellLabel}" 셀을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await deleteCell(cellId);
      toast({ type: "success", message: "셀이 삭제되었습니다." });
      await loadCells(selectedArea.id);
    } catch (err) {
      console.error("셀 삭제 실패:", err);
      toast({ type: "error", message: err.message || "셀 삭제에 실패했습니다." });
    }
  };

  // 구 이름 찾기
  const getRegionName = (regionId) => {
    return REGIONS.find((r) => r.id === regionId)?.name || "알 수 없음";
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-6 p-6 bg-gray-50">
      {/* Left: Zone Create Form + Map */}
      <div className="flex-[3] flex flex-col gap-4 min-w-0">
        {/* Header & Form */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {editMode ? "존 수정" : selectedArea ? "존 상세" : "존 생성"}
              </h1>
              <p className="mt-1 text-xs text-gray-500">
                {isDrawing
                  ? "지도를 클릭하여 존 영역의 꼭짓점을 찍어주세요."
                  : isAddingCell
                  ? "지도를 클릭하여 셀(부스) 위치를 지정해주세요."
                  : "지도에서 폴리곤을 그려 존 영역을 정의하고, 정보를 설정하세요."}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isDrawing ? (
                <>
                  <button
                    type="button"
                    onClick={handleCancelDrawing}
                    className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    onClick={handleFinishDrawing}
                    disabled={tempPath.length < 3}
                    className="px-4 py-2 text-sm font-semibold rounded-lg bg-[#eb0000] text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    그리기 완료 ({tempPath.length}점)
                  </button>
                </>
              ) : (
                <>
                  {selectedArea && !editMode && (
                    <>
                      <button
                        type="button"
                        onClick={handleEditMode}
                        className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        수정
                      </button>
                      <button
                        type="button"
                        onClick={handleDeleteZone}
                        className="px-4 py-2 text-sm font-medium rounded-lg border border-red-300 bg-white text-red-600 hover:bg-red-50 transition-colors"
                      >
                        삭제
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={handleStartDrawing}
                    className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    새 존 그리기
                  </button>
                  {(polygonPath.length >= 3 || editMode) && (
                    <button
                      type="button"
                      onClick={handleSaveZone}
                      disabled={isLoading}
                      className="px-4 py-2 text-sm font-semibold rounded-lg bg-[#eb0000] text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      {isLoading ? "저장 중..." : editMode ? "수정 저장" : "존 저장"}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Zone Name & Region Select */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                존 이름 *
              </label>
              <input
                type="text"
                value={zoneName}
                onChange={(e) => setZoneName(e.target.value)}
                placeholder="예: 충장로 패션 거리 존"
                disabled={selectedArea && !editMode && !isDrawing}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#eb0000]/40 disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                리전 선택 *
              </label>
              <select
                value={selectedRegionId ?? ""}
                onChange={(e) => setSelectedRegionId(Number(e.target.value))}
                disabled={selectedArea && !editMode && !isDrawing}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#eb0000]/40 disabled:bg-gray-100"
              >
                {REGIONS.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                최대 수용 인원
              </label>
              <input
                type="number"
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(e.target.value)}
                placeholder="예: 50"
                disabled={selectedArea && !editMode && !isDrawing}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#eb0000]/40 disabled:bg-gray-100"
              />
            </div>
          </div>

          {/* Notice */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              공지사항
            </label>
            <textarea
              value={notice}
              onChange={(e) => setNotice(e.target.value)}
              placeholder="존에 대한 추가 정보나 주의사항을 입력하세요."
              rows={2}
              disabled={selectedArea && !editMode && !isDrawing}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#eb0000]/40 disabled:bg-gray-100 resize-none"
            />
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden relative">
          <Map
            center={GWANGJU_CENTER}
            style={{ width: "100%", height: "100%" }}
            level={7}
            onClick={handleMapClick}
            onCreate={setMapInstance}
          >
            {/* 기존 존들의 폴리곤 (반투명) */}
            {areas
              .filter((a) => a.id !== selectedArea?.id)
              .map((area) => {
                const coords = parseGeoJsonPolygon(area.polygonGeoJson);
                if (coords.length < 3) return null;
                return (
                  <Polygon
                    key={area.id}
                    path={coords}
                    strokeWeight={1}
                    strokeColor="#999999"
                    strokeOpacity={0.5}
                    fillColor="#999999"
                    fillOpacity={0.1}
                  />
                );
              })}

            {/* 선택된/그리는 중인 폴리곤 */}
            {polygonPath.length >= 3 && (
              <Polygon
                path={polygonPath}
                strokeWeight={3}
                strokeColor="#eb0000"
                strokeOpacity={0.8}
                fillColor="#eb0000"
                fillOpacity={0.2}
              />
            )}

            {/* 그리는 중인 임시 폴리곤 */}
            {tempPath.length >= 2 && (
              <Polygon
                path={tempPath}
                strokeWeight={2}
                strokeColor="#eb0000"
                strokeOpacity={0.6}
                strokeStyle="dashed"
                fillColor="#eb0000"
                fillOpacity={0.1}
              />
            )}

            {/* 그리는 중인 점들 */}
            {tempPath.map((point, idx) => (
              <MapMarker
                key={`temp-${idx}`}
                position={point}
                image={{
                  src: "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png",
                  size: { width: 24, height: 35 },
                }}
              />
            ))}

            {/* 셀 마커 */}
            {cells.map((cell) => {
              let pos = null;
              try {
                const geo = JSON.parse(cell.geometryData || "{}");
                // GeoJSON Point 형식: { type: "Point", coordinates: [lng, lat] }
                if (geo.type === "Point" && geo.coordinates) {
                  pos = { lat: geo.coordinates[1], lng: geo.coordinates[0] };
                } else if (geo.lat && geo.lng) {
                  // 레거시 형식: { lat, lng }
                  pos = { lat: geo.lat, lng: geo.lng };
                }
              } catch {
                // 파싱 실패 시 무시
              }
              if (!pos) return null;

              return (
                <div key={cell.id}>
                  <MapMarker position={pos} />
                  <CustomOverlayMap position={pos} yAnchor={2.5}>
                    <div className="bg-white px-2 py-1 rounded shadow text-xs font-semibold border border-gray-200">
                      {cell.label}
                    </div>
                  </CustomOverlayMap>
                </div>
              );
            })}
          </Map>

          {/* 지도 위 안내 오버레이 */}
          {isDrawing && (
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow-md text-sm text-gray-700">
              🖱️ 지도를 클릭하여 꼭짓점을 찍으세요 ({tempPath.length}점)
            </div>
          )}
          {isAddingCell && (
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow-md text-sm text-gray-700 flex items-center gap-2">
              <span>📍 셀 추가 모드</span>
              <input
                type="text"
                value={newCellLabel}
                onChange={(e) => setNewCellLabel(e.target.value)}
                placeholder="셀 라벨"
                className="px-2 py-1 text-xs border rounded w-20"
              />
              <button
                onClick={() => setIsAddingCell(false)}
                className="text-xs text-red-500 hover:underline"
              >
                취소
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right: Zone/Cell List Panel */}
      <div className="flex-[1.2] flex flex-col gap-4 min-w-[320px]">
        {/* 존 목록 */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4 flex-1 overflow-hidden">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#eb0000]">존 목록</h2>
            <span className="text-xs text-gray-500">{areas.length}개</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2">
            {isLoading && areas.length === 0 ? (
              <div className="text-center text-gray-400 py-8">로딩 중...</div>
            ) : areas.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                등록된 존이 없습니다.
                <br />
                <span className="text-xs">새 존 그리기 버튼을 눌러 존을 생성하세요.</span>
              </div>
            ) : (
              areas.map((area) => (
                <button
                  key={area.id}
                  onClick={() => handleSelectArea(area)}
                  className={`w-full text-left p-3 rounded-xl border transition-colors ${
                    selectedArea?.id === area.id
                      ? "border-[#eb0000] bg-red-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="font-medium text-sm text-gray-900 truncate">
                    {area.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {getRegionName(area.regionId)} · {area.maxCapacity || "-"}명
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* 셀 목록 (존 선택 시) */}
        {selectedArea && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4 flex-1 overflow-hidden">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">
                셀 (부스) 목록
              </h2>
              <button
                onClick={handleToggleAddCell}
                className={`text-xs px-3 py-1 rounded-lg border transition-colors ${
                  isAddingCell
                    ? "border-red-300 bg-red-50 text-red-600"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                {isAddingCell ? "추가 취소" : "+ 셀 추가"}
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2">
              {cells.length === 0 ? (
                <div className="text-center text-gray-400 py-4 text-sm">
                  등록된 셀이 없습니다.
                  <br />
                  <span className="text-xs">+ 셀 추가 버튼을 눌러 부스 위치를 지정하세요.</span>
                </div>
              ) : (
                cells.map((cell) => (
                  <div
                    key={cell.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:bg-gray-50"
                  >
                    <div>
                      <div className="font-medium text-sm text-gray-900">
                        {cell.label}
                      </div>
                      <div className="text-xs text-gray-500">
                        {cell.status} · {cell.detailedAddress || "주소 없음"}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteCell(cell.id, cell.label)}
                      className="text-xs text-red-500 hover:underline"
                    >
                      삭제
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminZoneCreatePage;
