import { useEffect, useRef, useState } from "react";
import { Map } from "react-kakao-maps-sdk";
import { v4 as uuid } from "uuid";
import { X } from "lucide-react";

export default function AdminZoneCreatePage() {
  const mapRef = useRef(null);
  const managerRef = useRef(null);
  const draftPolygonRef = useRef(null);

  const [zones, setZones] = useState([]);
  const [cells, setCells] = useState([]);

  const [mode, setMode] = useState(null); // "zone" | "cell" | null
  const selectedZoneIdRef = useRef(null);

  /** --------------------------------
   * DrawingManager 초기화
   -------------------------------- */
  const initializeDrawingManager = (map) => {
    if (!window.kakao || !window.kakao.maps || managerRef.current) return;

    managerRef.current = new window.kakao.maps.drawing.DrawingManager({
      map,
      drawingMode: [],
      polygonOptions: {
        draggable: true,
        removable: true,
        editable: true,
        strokeWeight: 2,
        strokeColor: "#eb0000",
        fillColor: "#eb0000",
        fillOpacity: 0.2,
      },
    });

    // 도형 그리기 완료 시
    window.kakao.maps.event.addListener(
      managerRef.current,
      "drawend",
      (data) => {
        draftPolygonRef.current = data.target;
      }
    );
  };

  /** --------------------------------
   * 도형 그리기 시작
   -------------------------------- */
  const startDrawing = () => {
    if (!managerRef.current) return;

    // 기존 임시 도형 제거
    if (draftPolygonRef.current) {
      draftPolygonRef.current.setMap(null);
      draftPolygonRef.current = null;
    }

    managerRef.current.select(window.kakao.maps.drawing.OverlayType.POLYGON);
  };

  /** --------------------------------
   * 존 추가
   -------------------------------- */
  const handleAddZone = () => {
    setMode("zone");
    startDrawing();
  };

  /** --------------------------------
   * 셀 추가
   -------------------------------- */
  const handleAddCell = () => {
    if (!zones.length) {
      alert("먼저 존을 하나 이상 생성해 주세요.");
      return;
    }

    if (!selectedZoneIdRef.current && zones.length > 0) {
      selectedZoneIdRef.current = zones[zones.length - 1].id;
    }

    setMode("cell");
    startDrawing();
  };

  /** --------------------------------
   * 존 선택 → 셀 추가 가능
   -------------------------------- */
  const handleSelectZone = (zoneId) => {
    selectedZoneIdRef.current = zoneId;
  };

  /** --------------------------------
   * 🔥 모든 path 타입을 안전하게 변환하는 함수
   -------------------------------- */
  const normalizePath = (rawPath) => {
    return rawPath.map((p) => {
      // Case 1: LatLng 인스턴스
      if (p.getLat && p.getLng) {
        return { lat: p.getLat(), lng: p.getLng() };
      }

      // Case 2: DrawingManager editable polygon → {Ma, La}
      if ("Ma" in p && "La" in p) {
        return { lat: p.Ma, lng: p.La };
      }

      // Case 3: 일반 {lat, lng}
      if ("lat" in p && "lng" in p) {
        return { lat: p.lat, lng: p.lng };
      }

      console.warn("Unknown path point type:", p);
      return { lat: 0, lng: 0 };
    });
  };

  /** --------------------------------
   * 도형 저장
   -------------------------------- */
  const saveCurrentDrawing = (type) => {
    const currentType = type || mode;
    if (!currentType) {
      alert("먼저 존/셀 추가를 선택해주세요.");
      return;
    }

    const tempPoly = draftPolygonRef.current;
    if (!tempPoly) {
      alert("먼저 도형을 그려주세요.");
      return;
    }

    // 저장 전에 꼭 편집 종료
    tempPoly.setEditable(false);

    // 🔥 핵심: 어떤 타입이든 path 배열로 변환
    const raw = tempPoly.getPath();
    const rawArray = raw.getArray ? raw.getArray() : raw; // MVCArray → Array
    const path = normalizePath(rawArray);

    // 임시 도형 제거
    tempPoly.setMap(null);
    draftPolygonRef.current = null;

    // 최종 확정 polygon 생성
    const map = mapRef.current;
    const finalPoly = new window.kakao.maps.Polygon({
      map,
      path: path.map((p) => new window.kakao.maps.LatLng(p.lat, p.lng)),
      strokeWeight: 2,
      strokeColor: "#EB0000",
      fillColor: "#EB0000",
      fillOpacity: 0.25,
    });

    finalPoly.setDraggable(false);
    finalPoly.setEditable(false);

    const id = uuid();

    if (currentType === "zone") {
      setZones((prev) => [
        ...prev,
        {
          id,
          name: `존 ${prev.length + 1}`,
          path,
          poly: finalPoly,
        },
      ]);

      selectedZoneIdRef.current = id;
    }

    if (currentType === "cell") {
      if (!selectedZoneIdRef.current) {
        alert("저장할 존이 선택되지 않았습니다.");
        return;
      }

      setCells((prev) => [
        ...prev,
        {
          id,
          zoneId: selectedZoneIdRef.current,
          name: `셀 ${prev.length + 1}`,
          path,
          poly: finalPoly,
        },
      ]);
    }

    managerRef.current.cancel();
    setMode(null);
  };

  /** --------------------------------
   * 존 삭제
   -------------------------------- */
  const deleteZone = (zoneId) => {
    const zone = zones.find((z) => z.id === zoneId);
    if (!zone) return;

    zone.poly.setMap(null);

    const linkedCells = cells.filter((c) => c.zoneId === zoneId);
    linkedCells.forEach((c) => c.poly.setMap(null));

    setCells((prev) => prev.filter((c) => c.zoneId !== zoneId));
    setZones((prev) => prev.filter((z) => z.id !== zoneId));

    if (selectedZoneIdRef.current === zoneId) {
      selectedZoneIdRef.current = null;
    }
  };

  /** --------------------------------
   * 셀 삭제
   -------------------------------- */
  const deleteCell = (cellId) => {
    const cell = cells.find((c) => c.id === cellId);
    if (!cell) return;

    cell.poly.setMap(null);
    setCells((prev) => prev.filter((c) => c.id !== cellId));
  };

  return (
    <div className="w-full h-full flex">
      {/* 지도 */}
      <div className="flex-1 relative">
        <Map
          onCreate={(map) => {
            mapRef.current = map;
            initializeDrawingManager(map);
          }}
          center={{ lat: 35.1595, lng: 126.8526 }}
          style={{ width: "100%", height: "100%" }}
          level={7}
        />

        {/* 지도 위 버튼 */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-3 z-50">
          <button
            onClick={handleAddZone}
            className="px-4 py-2 bg-white rounded-xl shadow font-semibold"
          >
            존 추가
          </button>

          <button
            onClick={() => saveCurrentDrawing("zone")}
            className="px-4 py-2 bg-white rounded-xl shadow font-semibold"
          >
            존 저장
          </button>

          <button
            onClick={handleAddCell}
            disabled={!zones.length}
            className={`px-4 py-2 rounded-xl shadow font-semibold ${
              zones.length
                ? "bg-white"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            셀 추가
          </button>

          <button
            onClick={() => saveCurrentDrawing("cell")}
            className="px-4 py-2 bg-white rounded-xl shadow font-semibold"
          >
            셀 저장
          </button>
        </div>
      </div>

      {/* 오른쪽 목록 */}
      <div className="w-[340px] border-l p-4 overflow-auto bg-white">
        <h2 className="text-xl font-bold mb-3">존 목록</h2>

        {zones.map((z) => (
          <div
            key={z.id}
            className="p-3 border rounded-lg mb-2 flex items-center justify-between hover:bg-gray-100"
          >
            <span className="cursor-pointer" onClick={() => handleSelectZone(z.id)}>
              {z.name}
            </span>

            <button
              className="p-1 text-gray-500 hover:text-red-500"
              onClick={() => deleteZone(z.id)}
            >
              <X size={16} />
            </button>
          </div>
        ))}

        {selectedZoneIdRef.current && (
          <>
            <h2 className="text-xl font-bold mt-6 mb-3">셀 목록</h2>

            {cells
              .filter((c) => c.zoneId === selectedZoneIdRef.current)
              .map((c) => (
                <div
                  key={c.id}
                  className="p-3 border rounded-lg mb-2 flex items-center justify-between hover:bg-gray-100"
                >
                  <span>{c.name}</span>

                  <button
                    className="p-1 text-gray-500 hover:text-red-500"
                    onClick={() => deleteCell(c.id)}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
          </>
        )}
      </div>
    </div>
  );
}
