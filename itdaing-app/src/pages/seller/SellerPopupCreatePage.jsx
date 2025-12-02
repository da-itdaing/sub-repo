import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/routes/paths';
import { MapPin, Calendar, Clock, Map as MapIcon, ChevronDown } from 'lucide-react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { createPopup } from '@/services/sellerService';
import { uploadImage } from '@/services/uploadService';
import { useToast } from '@/hooks/useToast';
import { useMasterData } from '@/hooks/useMasterData';
import { listAreas, listCells, parseGeoJsonPolygon } from '@/services/geoZoneService';
import { Map, Polygon, MapMarker, CustomOverlayMap } from 'react-kakao-maps-sdk';

// 광주 중심 좌표
const GWANGJU_CENTER = { lat: 35.1595, lng: 126.8526 };
const getTodayDateString = () => new Date().toISOString().split('T')[0];

const SellerPopupCreatePage = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const { categories, features, styles } = useMasterData();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(() => ({
    title: '',
    zoneCellId: null, // 셀 ID (필수)
    startDate: getTodayDateString(),
    endDate: getTodayDateString(),
    openingHours: '',
    categoryId: '',
    styleIds: [],
    featureIds: [],
    hashtags: '',
    description: '',
    thumbnail: null,
    images: [],
    homepageUrl: '',
    snsUrl: '',
  }));

  // 존/셀 선택 상태
  const [selectedArea, setSelectedArea] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);
  const [showMap, setShowMap] = useState(false);

  // 존 목록 조회
  const { data: areasData, isLoading: isLoadingAreas } = useQuery({
    queryKey: ['geoAreas'],
    queryFn: () => listAreas({ page: 0, size: 100 }),
    staleTime: 5 * 60 * 1000, // 5분 캐시
  });
  const areas = areasData?.items || [];

  // 선택된 존의 셀 목록 조회
  const { data: cellsData, isLoading: isLoadingCells } = useQuery({
    queryKey: ['geoCells', selectedArea?.id],
    queryFn: () => listCells({ areaId: selectedArea.id, page: 0, size: 100 }),
    enabled: !!selectedArea?.id,
    staleTime: 5 * 60 * 1000,
  });
  const cells = cellsData?.items || [];

  // 셀 선택 시 formData 업데이트
  useEffect(() => {
    if (selectedCell) {
      setFormData((prev) => ({ ...prev, zoneCellId: selectedCell.id }));
    }
  }, [selectedCell]);

  const createPopupMutation = useMutation({
    mutationFn: createPopup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myPopups'] });
      queryClient.invalidateQueries({ queryKey: ['sellerDashboard'] });
      addToast({ title: '팝업이 성공적으로 등록되었습니다.', description: '관리자 승인 후 게시됩니다.' });
      navigate(ROUTES.seller.popups);
    },
    onError: (error) => {
      console.error(error);
      addToast({ title: '등록 실패', description: error.message, variant: 'error' });
      setIsSubmitting(false);
    },
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === 'startDate') {
      setFormData((prev) => ({
        ...prev,
        startDate: value,
        endDate: prev.endDate && prev.endDate < value ? value : prev.endDate,
      }));
      return;
    }

    if (name === 'endDate') {
      setFormData((prev) => {
        if (value < prev.startDate) {
          addToast({
            title: '종료일을 확인해주세요.',
            description: '종료일은 시작일 이후 날짜여야 합니다.',
            variant: 'error',
          });
          return prev;
        }
        return { ...prev, endDate: value };
      });
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (event) => {
    const { name, files } = event.target;
    if (name === 'thumbnail' && files.length > 0) {
      setFormData((prev) => ({ ...prev, thumbnail: files[0] }));
    }
    if (name === 'images') {
      setFormData((prev) => ({ ...prev, images: Array.from(files) }));
    }
  };

  const toggleCategory = (id) => {
    setFormData((prev) => ({
      ...prev,
      categoryId: prev.categoryId === id ? '' : id,
    }));
  };

  const toggleArrayItem = (field, id) => {
    setFormData((prev) => {
      const current = prev[field] || [];
      return {
        ...prev,
        [field]: current.includes(id)
          ? current.filter((item) => item !== id)
          : [...current, id],
      };
    });
  };

  // 존 선택
  const handleSelectArea = (area) => {
    setSelectedArea(area);
    setSelectedCell(null);
    setFormData((prev) => ({ ...prev, zoneCellId: null }));
  };

  // 셀 선택
  const handleSelectCell = (cell) => {
    setSelectedCell(cell);
  };

  // 셀 위치 파싱
  const getCellPosition = (cell) => {
    if (!cell?.geometryData) return null;
    try {
      const geo = JSON.parse(cell.geometryData);
      if (geo.type === 'Point' && geo.coordinates) {
        return { lat: geo.coordinates[1], lng: geo.coordinates[0] };
      }
      if (geo.lat && geo.lng) {
        return { lat: geo.lat, lng: geo.lng };
      }
    } catch {
      // 파싱 실패 시 무시
    }
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    // 셀 선택 검증
    if (!formData.zoneCellId) {
      addToast({ title: '셀을 선택해주세요.', description: '지도에서 부스 위치를 선택해야 합니다.', variant: 'error' });
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. 이미지 업로드
      let thumbnailImage = null;
      if (formData.thumbnail) {
        const uploadRes = await uploadImage(formData.thumbnail);
        thumbnailImage = {
          url: uploadRes.url,
          key: uploadRes.key,
        };
      }

      const images = [];
      if (formData.images.length > 0) {
        for (const file of formData.images) {
          const uploadRes = await uploadImage(file);
          images.push({
            url: uploadRes.url,
            key: uploadRes.key,
          });
        }
      }

      // 2. API 요청 데이터 구성 (PopupCreateRequest)
      const requestData = {
        title: formData.title,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        operatingTime: formData.openingHours,
        zoneCellId: formData.zoneCellId,
        categoryIds: formData.categoryId ? [Number(formData.categoryId)] : [],
        targetCategoryIds: [],
        styleIds: formData.styleIds,
        featureIds: formData.featureIds,
        thumbnailImage,
        images,
      };

      createPopupMutation.mutate(requestData);

    } catch (error) {
      console.error('Upload failed:', error);
      addToast({ title: '이미지 업로드 실패', description: '다시 시도해주세요.', variant: 'error' });
      setIsSubmitting(false);
    }
  };

  // 공통 버튼 스타일
  const getButtonStyle = (isSelected) =>
    `rounded-full px-4 py-2 text-sm font-medium transition-colors border ${
      isSelected
        ? 'bg-[#EB0000] text-white border-[#EB0000]'
        : 'bg-white text-[oklch(0.373_0.034_259.733)] border-[oklch(0.373_0.034_259.733)]'
    }`;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section className="rounded-3xl border border-white/80 bg-white p-6 shadow-sm shadow-slate-200/60">
        {/* <p className="text-xs uppercase tracking-wide text-gray-400">새 팝업 등록</p> */}
        <h2 className="mt-2 text-2xl font-semibold text-gray-900">팝업 정보를 입력해주세요</h2>
        <p className="text-sm text-gray-500">승인까지 평균 2일이 소요됩니다.</p>
      </section>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-3xl border border-white/80 bg-white p-6 shadow-sm shadow-slate-200/60"
      >
        {/* 1. 팝업명 */}
        <div>
          <label className="text-xs font-semibold text-gray-500">
            팝업명
            <span className="text-[#EB0000] ml-[3px]">*</span> 
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="팝업의 제목을 입력해주세요."
            className="mt-1 w-full border-b border-gray-300 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </div>

        {/* 2. 존/셀 선택 (지도) */}
        <div>
          <label className="text-xs font-semibold text-gray-500">
            부스 위치 선택 
            <span className="text-[#EB0000] ml-[3px]">*</span>
          </label>
          <p className="text-xs text-gray-400 mt-1">
            행사가 열리는 존을 선택하고, 해당 존 안에서 부스(셀) 위치를 선택해주세요.
          </p>
          
          {/* 존 선택 드롭다운 */}
          <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs text-gray-500">존 선택</label>
              <div className="relative mt-1">
                <select
                  value={selectedArea?.id || ''}
                  onChange={(e) => {
                    const area = areas.find((a) => a.id === Number(e.target.value));
                    handleSelectArea(area);
                  }}
                  className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2 pr-8 text-sm focus:border-[#EB0000] focus:outline-none focus:ring-1 focus:ring-[#EB0000]"
                >
                  <option value="">존을 선택하세요</option>
                  {areas.map((area) => (
                    <option key={area.id} value={area.id}>
                      {area.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500">셀(부스) 선택</label>
              <div className="relative mt-1">
                <select
                  value={selectedCell?.id || ''}
                  onChange={(e) => {
                    const cell = cells.find((c) => c.id === Number(e.target.value));
                    handleSelectCell(cell);
                  }}
                  disabled={!selectedArea}
                  className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2 pr-8 text-sm focus:border-[#EB0000] focus:outline-none focus:ring-1 focus:ring-[#EB0000] disabled:bg-gray-100 disabled:text-gray-400"
                >
                  <option value="">
                    {isLoadingCells ? '로딩 중...' : selectedArea ? '셀을 선택하세요' : '먼저 존을 선택하세요'}
                  </option>
                  {cells.map((cell) => (
                    <option key={cell.id} value={cell.id}>
                      {cell.label} {cell.status !== 'APPROVED' && `(${cell.status})`}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* 선택된 존/셀 정보 */}
          {selectedArea && (
            <div className="mt-3 rounded-lg bg-gray-50 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{selectedArea.name}</p>
                  {selectedCell && (
                    <p className="text-xs text-[#EB0000] mt-1">
                      선택된 부스: {selectedCell.label}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowMap(!showMap)}
                  className="flex items-center gap-1 text-xs text-[#EB0000] hover:underline"
                >
                  <MapIcon className="h-4 w-4" />
                  {showMap ? '지도 숨기기' : '지도 보기'}
                </button>
              </div>
            </div>
          )}

          {/* 지도 (토글) */}
          {showMap && selectedArea && (
            <div className="mt-3 h-[300px] rounded-lg overflow-hidden border border-gray-200">
              <Map
                center={(() => {
                  const coords = parseGeoJsonPolygon(selectedArea.polygonGeoJson);
                  if (coords.length > 0) {
                    return coords.reduce(
                      (acc, c) => ({ lat: acc.lat + c.lat / coords.length, lng: acc.lng + c.lng / coords.length }),
                      { lat: 0, lng: 0 }
                    );
                  }
                  return GWANGJU_CENTER;
                })()}
                style={{ width: '100%', height: '100%' }}
                level={5}
              >
                {/* 존 폴리곤 */}
                {(() => {
                  const coords = parseGeoJsonPolygon(selectedArea.polygonGeoJson);
                  if (coords.length >= 3) {
                    return (
                      <Polygon
                        path={coords}
                        strokeWeight={2}
                        strokeColor="#eb0000"
                        strokeOpacity={0.8}
                        fillColor="#eb0000"
                        fillOpacity={0.15}
                      />
                    );
                  }
                  return null;
                })()}

                {/* 셀 마커 */}
                {cells.map((cell) => {
                  const pos = getCellPosition(cell);
                  if (!pos) return null;
                  const isSelected = selectedCell?.id === cell.id;

                  return (
                    <div key={cell.id}>
                      <MapMarker
                        position={pos}
                        onClick={() => handleSelectCell(cell)}
                        image={
                          isSelected
                            ? undefined
                            : {
                                src: 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png',
                                size: { width: 32, height: 35 },
                              }
                        }
                      />
                      <CustomOverlayMap position={pos} yAnchor={2.5}>
                        <div
                          onClick={() => handleSelectCell(cell)}
                          className={`cursor-pointer px-2 py-1 rounded shadow text-xs font-semibold border ${
                            isSelected
                              ? 'bg-[#EB0000] text-white border-[#EB0000]'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-[#EB0000]'
                          }`}
                        >
                          {cell.label}
                        </div>
                      </CustomOverlayMap>
                    </div>
                  );
                })}
              </Map>
            </div>
          )}
        </div>

        {/* 3. 팝업 기간 & 운영 시간 */}
        <div>
          <label className="text-xs font-semibold text-gray-500">
            팝업기간
            <span className="text-[#EB0000] ml-[3px]">*</span>
          </label>
          <div className="mt-1 flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[140px]">
              <Calendar className="absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                className="w-full border-b border-gray-300 py-2 pl-6 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <span className="text-gray-400">~</span>
            <div className="relative flex-1 min-w-[140px]">
              <Calendar className="absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
                className="w-full border-b border-gray-300 py-2 pl-6 text-sm focus:border-primary focus:outline-none"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="text-xs font-semibold text-gray-500">운영 시간</label>
            <div className="relative mt-1">
                <Clock className="absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="openingHours"
                  value={formData.openingHours}
                  onChange={handleChange}
                  placeholder="예: 10:00 - 22:00"
                  className="w-full border-b border-gray-300 py-2 pl-6 text-sm focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 4. 팝업 카테고리 (단일) */}
        <div>
          <label className="mb-3 block text-xs font-semibold text-gray-500">카테고리
            <span className="text-[#EB0000] ml-[3px]">*</span>
            (최소 한개 선택)
          </label>
          <div className="flex flex-wrap gap-2">
            {categories?.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleCategory(cat.id)}
                className={getButtonStyle(formData.categoryId === cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* 5. 스타일 (다중) */}
        <div>
          <label className="mb-3 block text-xs font-semibold text-gray-500">
            분위기/스타일
            <span className="text-[#EB0000] ml-[3px]">*</span> 
            <span className="text-[#8d8d8d] ml-[3px]">(최소 1개 - 최대 3개 선택)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {styles?.map((style) => (
              <button
                key={style.id}
                type="button"
                onClick={() => toggleArrayItem('styleIds', style.id)}
                className={getButtonStyle(formData.styleIds.includes(style.id))}
              >
                {style.name}
              </button>
            ))}
          </div>
        </div>

        {/* 6. 편의/특징 (다중) */}
        <div>
          <label className="mb-3 block text-xs font-semibold text-gray-500">
            편의/특징
            <span className="text-[#EB0000] ml-[3px]">*</span> 
            <span className="text-[#8d8d8d] ml-[3px]">(최소 1개 - 최대 3개 선택)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {features?.map((feat) => (
              <button
                key={feat.id}
                type="button"
                onClick={() => toggleArrayItem('featureIds', feat.id)}
                className={getButtonStyle(formData.featureIds.includes(feat.id))}
              >
                {feat.name}
              </button>
            ))}
          </div>
        </div>

        {/* 7. 해시태그 & 링크 */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-gray-500">해시태그</label>
            <input
              type="text"
              name="hashtags"
              value={formData.hashtags}
              onChange={handleChange}
              placeholder="#데이트 #핫플 (공백으로 구분)"
              className="mt-1 w-full border-b border-gray-300 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <div>
             <label className="text-xs font-semibold text-gray-500">홈페이지 URL</label>
             <input
               type="text"
               name="homepageUrl"
               value={formData.homepageUrl}
               onChange={handleChange}
               placeholder="https://"
               className="mt-1 w-full border-b border-gray-300 py-2 text-sm focus:border-primary focus:outline-none"
             />
          </div>
          <div>
             <label className="text-xs font-semibold text-gray-500">SNS URL</label>
             <input
               type="text"
               name="snsUrl"
               value={formData.snsUrl}
               onChange={handleChange}
               placeholder="https://instagram.com/..."
               className="mt-1 w-full border-b border-gray-300 py-2 text-sm focus:border-primary focus:outline-none"
             />
          </div>
        </div>

        {/* 8. 팝업 소개 */}
        <div>
          <label className="text-xs font-semibold text-gray-500">
            팝업소개
            <span className="text-[#EB0000] ml-[3px]">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={6}
            required
            placeholder="팝업에 대한 설명을 상세하게 작성해 주세요."
            className="mt-2 w-full rounded-2xl border border-gray-200 bg-white p-4 text-sm focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* 9. 첨부파일 */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400">첨부파일</h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-gray-500">
                썸네일 이미지
                <span className="text-[#EB0000] ml-[3px]">*</span>
              </label>
              <div className="mt-2 flex items-center gap-3">
                <div className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-500 truncate">
                  {formData.thumbnail ? formData.thumbnail.name : '파일을 선택하세요'}
                </div>
                <label className="cursor-pointer rounded-lg bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600">
                  첨부
                  <input
                    type="file"
                    name="thumbnail"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    required
                  />
                </label>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500">추가 이미지</label>
              <div className="mt-2 flex items-center gap-3">
                <div className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-500 truncate">
                  {formData.images.length > 0
                    ? `${formData.images.length}개 파일 선택됨`
                    : '파일을 선택하세요'}
                </div>
                <label className="cursor-pointer rounded-lg bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600">
                  첨부
                  <input
                    type="file"
                    name="images"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-6">
          <button
            type="submit"
            disabled={isSubmitting || !formData.zoneCellId}
            className="w-full rounded-lg bg-[#EB0000] py-3 text-base font-bold text-white shadow-md hover:bg-[#c90000] md:w-auto md:px-12 disabled:opacity-70"
          >
            {isSubmitting ? '등록 중...' : '작성'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SellerPopupCreatePage;
