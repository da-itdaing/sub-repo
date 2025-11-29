import PropTypes from "prop-types";
import KakaoMap from "./KakaoMap";
import useZoneDrawing from "@/hooks/map/useZoneDrawing";
import { convertKakaoPathToLatLng } from "@/hooks/map/usePolygonConverter";

/**
 * 존/폴리곤 그리기 전용 Kakao Map 래퍼 컴포넌트 (Step 2: Drawing Logic 포함)
 * - Kakao DrawingManager 초기화
 * - Polygon 그리기 시작/리셋 버튼을 통해 제어
 * - 그려진 폴리곤의 path를 {lat,lng} 배열로 변환하여 상위 콜백으로 전달
 */
const ZoneDrawingMap = ({ onPolygonComplete }) => {
  const { initializeDrawingManager, startDrawing } = useZoneDrawing({
    // Step 3: Kakao raw path → {lat,lng} 배열로 변환 후 상위로 전달
    onPolygonComplete: (rawPathArray) => {
      const latlngArray = convertKakaoPathToLatLng(rawPathArray || []);
      if (typeof onPolygonComplete === "function") {
        onPolygonComplete(latlngArray);
      }
    },
  });

  return (
    <div className="w-full h-full relative">
      {/* 지도 상단 컨트롤 영역 */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <button
          type="button"
          onClick={startDrawing}
          className="px-4 py-2 text-xs font-medium rounded-lg border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
        >
          Draw Polygon
        </button>
      </div>

      {/* Kakao Map 컨테이너 */}
      <KakaoMap
        height="100%"
        level={6}
        markers={[]}
        onMapReady={(map) => {
          // 지도 생성 완료 시 DrawingManager 초기화
          initializeDrawingManager(map);
        }}
      />
    </div>
  );
};

ZoneDrawingMap.propTypes = {
  // 폴리곤 완료 시 [{lat, lng}, ...] 배열을 인자로 전달하는 콜백
  onPolygonComplete: PropTypes.func,
};

export default ZoneDrawingMap;

