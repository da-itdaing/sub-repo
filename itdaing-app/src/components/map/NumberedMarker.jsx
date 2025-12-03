import { MapMarker, CustomOverlayMap } from 'react-kakao-maps-sdk';

/**
 * 통일된 번호 마커 컴포넌트
 * - 소비자/판매자/관리자 모든 곳에서 동일한 디자인 사용
 * - 번호가 포함된 원형 마커 + 라벨 오버레이
 */
const NumberedMarker = ({
  position,
  index,
  label,
  isSelected = false,
  onClick,
  showLabel = true,
  status, // 'APPROVED' | 'PENDING' | 'REJECTED' | null
  tooltipContent, // 호버 시 표시할 추가 정보
}) => {
  // 상태에 따른 색상
  const getStatusColor = () => {
    if (isSelected) return { bg: '#EB0000', border: '#c90000', text: 'white' };
    switch (status) {
      case 'APPROVED':
        return { bg: '#10B981', border: '#059669', text: 'white' };
      case 'PENDING':
        return { bg: '#F59E0B', border: '#D97706', text: 'white' };
      case 'REJECTED':
        return { bg: '#EF4444', border: '#DC2626', text: 'white' };
      default:
        return { bg: '#EB0000', border: '#c90000', text: 'white' };
    }
  };

  const colors = getStatusColor();

  // 카카오맵 기본 마커 대신 숫자 스프라이트 마커 사용
  const markerImage = {
    src: 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_number_blue.png',
    size: { width: 36, height: 37 },
    options: {
      spriteSize: { width: 36, height: 691 },
      spriteOrigin: { x: 0, y: ((index % 10) * 46) + 10 },
      offset: { x: 13, y: 37 },
    },
  };

  // 선택된 경우 빨간색 마커 사용
  const selectedMarkerImage = {
    src: 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_number_custom.png',
    size: { width: 36, height: 37 },
    options: {
      spriteSize: { width: 36, height: 691 },
      spriteOrigin: { x: 0, y: ((index % 10) * 46) + 10 },
      offset: { x: 13, y: 37 },
    },
  };

  return (
    <>
      <MapMarker
        position={position}
        onClick={onClick}
        clickable={!!onClick}
        image={isSelected ? selectedMarkerImage : markerImage}
      />
      {showLabel && label && (
        <CustomOverlayMap position={position} yAnchor={2.8}>
          <div
            onClick={onClick}
            className={`cursor-pointer px-2 py-1 rounded-lg shadow-md text-xs font-semibold transition-all ${
              isSelected
                ? 'bg-[#EB0000] text-white ring-2 ring-[#EB0000]/30'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-[#EB0000] hover:shadow-lg'
            }`}
            title={tooltipContent}
          >
            {label}
          </div>
        </CustomOverlayMap>
      )}
    </>
  );
};

/**
 * 상태 표시 마커 (관리자용)
 * - 승인/대기/거절 상태를 아이콘으로 표시
 */
export const StatusMarker = ({
  position,
  label,
  status = 'PENDING',
  isSelected = false,
  onClick,
  showLabel = true,
}) => {
  const getStatusStyle = () => {
    switch (status) {
      case 'APPROVED':
        return {
          bg: 'bg-green-500',
          border: 'border-green-600',
          icon: '✓',
          text: '승인됨',
        };
      case 'PENDING':
        return {
          bg: 'bg-yellow-500',
          border: 'border-yellow-600',
          icon: '⏳',
          text: '대기중',
        };
      case 'REJECTED':
        return {
          bg: 'bg-red-500',
          border: 'border-red-600',
          icon: '✕',
          text: '거절됨',
        };
      default:
        return {
          bg: 'bg-gray-500',
          border: 'border-gray-600',
          icon: '•',
          text: '미정',
        };
    }
  };

  const style = getStatusStyle();

  return (
    <>
      {/* 상태 아이콘 마커 */}
      <CustomOverlayMap position={position} yAnchor={1}>
        <div
          onClick={onClick}
          className={`cursor-pointer w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg border-2 transition-transform ${
            style.bg
          } ${style.border} ${isSelected ? 'scale-125 ring-4 ring-[#EB0000]/30' : 'hover:scale-110'}`}
          title={style.text}
        >
          {style.icon}
        </div>
      </CustomOverlayMap>
      {/* 라벨 */}
      {showLabel && label && (
        <CustomOverlayMap position={position} yAnchor={-0.3}>
          <div
            onClick={onClick}
            className={`cursor-pointer px-2 py-0.5 rounded text-[10px] font-medium shadow-sm whitespace-nowrap ${
              isSelected
                ? 'bg-[#EB0000] text-white'
                : 'bg-white text-gray-700 border border-gray-200'
            }`}
          >
            {label}
          </div>
        </CustomOverlayMap>
      )}
    </>
  );
};

/**
 * 셀 선택 마커 (판매자 팝업 등록용)
 * - 호버 시 셀 정보 표시
 * - 클릭으로 선택
 */
export const CellMarker = ({
  position,
  cell,
  isSelected = false,
  isHovered = false,
  onClick,
  onHover,
  onLeave,
}) => {
  const hasPopup = cell.hasPopup || cell.popupCount > 0;
  const isAvailable = cell.status === 'APPROVED' && !hasPopup;

  const getStyle = () => {
    if (isSelected) {
      return {
        markerBg: 'bg-[#EB0000]',
        markerText: 'text-white',
        labelBg: 'bg-[#EB0000]',
        labelText: 'text-white',
      };
    }
    if (!isAvailable) {
      return {
        markerBg: 'bg-gray-400',
        markerText: 'text-white',
        labelBg: 'bg-gray-100',
        labelText: 'text-gray-500',
      };
    }
    return {
      markerBg: 'bg-blue-500',
      markerText: 'text-white',
      labelBg: 'bg-white',
      labelText: 'text-gray-700',
    };
  };

  const style = getStyle();

  return (
    <>
      {/* 마커 원 */}
      <CustomOverlayMap position={position} yAnchor={1}>
        <div
          onClick={onClick}
          onMouseEnter={onHover}
          onMouseLeave={onLeave}
          className={`cursor-pointer w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-lg border-2 border-white transition-all ${
            style.markerBg
          } ${style.markerText} ${isSelected || isHovered ? 'scale-125' : 'hover:scale-110'}`}
        >
          {cell.label?.replace(/[^0-9]/g, '') || '•'}
        </div>
      </CustomOverlayMap>

      {/* 라벨 + 호버 정보 */}
      <CustomOverlayMap position={position} yAnchor={-0.5}>
        <div
          onClick={onClick}
          onMouseEnter={onHover}
          onMouseLeave={onLeave}
          className={`cursor-pointer transition-all ${
            isHovered || isSelected ? 'opacity-100' : 'opacity-80'
          }`}
        >
          {/* 기본 라벨 */}
          <div
            className={`px-2 py-0.5 rounded text-[10px] font-medium shadow-sm whitespace-nowrap border ${
              style.labelBg
            } ${style.labelText} ${isSelected ? 'border-[#EB0000]' : 'border-gray-200'}`}
          >
            {cell.label}
            {!isAvailable && <span className="ml-1 text-[8px]">(예약됨)</span>}
          </div>

          {/* 호버 시 상세 정보 */}
          {isHovered && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-40 p-2 bg-white rounded-lg shadow-xl border border-gray-200 text-xs z-50">
              <p className="font-semibold text-gray-800 mb-1">{cell.label}</p>
              <p className="text-gray-500">
                상태: {cell.status === 'APPROVED' ? '승인됨' : cell.status === 'PENDING' ? '대기중' : '거절됨'}
              </p>
              {cell.detailedAddress && (
                <p className="text-gray-500 truncate">주소: {cell.detailedAddress}</p>
              )}
              <p className={`mt-1 font-medium ${isAvailable ? 'text-green-600' : 'text-red-500'}`}>
                {isAvailable ? '✓ 선택 가능' : '✕ 이미 사용중'}
              </p>
            </div>
          )}
        </div>
      </CustomOverlayMap>
    </>
  );
};

export default NumberedMarker;

