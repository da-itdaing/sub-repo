import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ROUTES } from '@/routes/paths';
import { MapPin, Calendar, Clock, Map as MapIcon, ChevronDown, Trash2, X, ArrowLeft } from 'lucide-react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { createPopup, updatePopup, deletePopup } from '@/services/sellerService';
import { uploadImage } from '@/services/uploadService';
import { useToast } from '@/hooks/useToast';
import { useMasterData } from '@/hooks/useMasterData';
import { listAreas, listCells, parseGeoJsonPolygon } from '@/services/geoZoneService';
import { Map, Polygon, MapMarker, CustomOverlayMap } from 'react-kakao-maps-sdk';
import { getPopupById } from '@/services/popupService';

// 광주 중심 좌표
const GWANGJU_CENTER = { lat: 35.1595, lng: 126.8526 };
const getTodayDateString = () => new Date().toISOString().split('T')[0];

const normalizeImage = (image) => {
  if (!image) return null;
  if (typeof image === 'string') {
    return { url: image, key: image };
  }
  if (image.url) {
    return {
      url: image.url,
      key: image.key || image.url,
    };
  }
  if (image.thumbnailUrl) {
    return {
      url: image.thumbnailUrl,
      key: image.key || image.thumbnailUrl,
    };
  }
  return null;
};

const normalizeImageList = (list = []) => {
  if (!Array.isArray(list)) return [];
  return list
    .map((item, idx) => {
      if (typeof item === 'string') {
        return { url: item, key: `${item}-${idx}` };
      }
      if (item?.url) {
        return { url: item.url, key: item.key || item.url || `${idx}` };
      }
      if (item?.thumbnailUrl) {
        return { url: item.thumbnailUrl, key: item.key || item.thumbnailUrl || `${idx}` };
      }
      return null;
    })
    .filter(Boolean);
};

const toDateValue = (value) => {
  if (!value) return getTodayDateString();
  if (value.includes('T')) {
    return value.split('T')[0];
  }
  return value;
};

/**
 * 다양한 API 에러 응답 형태를 단일 메시지로 정규화
 * 우선순위:
 * 1) error.response.data.error.message (axios 기반 API)
 * 2) error.response.data.message (axios 단순 구조)
 * 3) error.error.message (fetch 기반 API - { success: false, error: { message } })
 * 4) error.message (일반 Error 객체)
 * 5) error가 문자열이면 그대로 사용
 * 6) fallback 메시지
 */
const extractErrorMessage = (error) => {
  // null/undefined 체크
  if (!error) {
    return '오류가 발생했습니다.';
  }

  // 문자열 타입이면 그대로 반환
  if (typeof error === 'string') {
    return error;
  }

  // axios 기반 API 응답 (error.response.data.error.message)
  if (error?.response?.data?.error?.message) {
    return error.response.data.error.message;
  }

  // axios 기반 API 응답 (error.response.data.message)
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  // fetch 기반 API 응답 ({ success: false, error: { message } })
  if (error?.error?.message) {
    return error.error.message;
  }

  // 일반 Error 객체
  if (error?.message) {
    return error.message;
  }

  // fallback
  return '오류가 발생했습니다.';
};

const MIN_STYLE_SELECTION = 1;
const MAX_STYLE_SELECTION = 3;
const MIN_FEATURE_SELECTION = 1;
const MAX_FEATURE_SELECTION = 3;

const SellerPopupFormPage = ({
  mode,
  popupIdOverride = null,
  onSuccessOverride = null,
  hideActionButtons = false,
  formRef = null,
  onSubmitStateChange = null,
}) => {
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const routePopupId = params.popupId;
  const popupId = popupIdOverride ?? routePopupId;
  const isEditMode = mode === 'edit';
  const activePopupId = isEditMode ? popupId : null;
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const { categories, features, styles } = useMasterData();
  const isLocationLocked = isEditMode;
  
  // URL 쿼리 파라미터에서 zoneId 읽기 (챗봇에서 이동 시 사용)
  const initialZoneId = searchParams.get('zoneId');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const updateSubmittingState = (value) => {
    setIsSubmitting(value);
    if (typeof onSubmitStateChange === 'function') {
      onSubmitStateChange(value);
    }
  };
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
  const [existingThumbnail, setExistingThumbnail] = useState(null);
  const [existingImages, setExistingImages] = useState([]);
  const [pendingCellId, setPendingCellId] = useState(null);
  const [prefillDone, setPrefillDone] = useState(false);

  // 존/셀 선택 상태
  const [selectedArea, setSelectedArea] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [hoveredCellId, setHoveredCellId] = useState(null); // 호버된 셀 ID
  const [showZoneMap, setShowZoneMap] = useState(true); // 존 선택 지도 표시 (기본 펼침)
  const [hoveredAreaId, setHoveredAreaId] = useState(null); // 호버된 존 ID

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

  // 편집 모드일 때 팝업 상세 조회
  const { data: popupDetail, isLoading: isLoadingPopup } = useQuery({
    queryKey: ['sellerPopupDetail', activePopupId],
    queryFn: () => getPopupById(activePopupId),
    enabled: isEditMode && Boolean(activePopupId),
  });

  // 셀 선택 시 formData 업데이트
  useEffect(() => {
    if (selectedCell) {
      setFormData((prev) => ({ ...prev, zoneCellId: selectedCell.id }));
    }
  }, [selectedCell]);

  const popupMutation = useMutation({
    mutationFn: (payload) =>
      isEditMode ? updatePopup(Number(activePopupId), payload) : createPopup(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myPopups'] });
      queryClient.invalidateQueries({ queryKey: ['sellerDashboard'] });
      addToast({
        title: isEditMode ? '팝업이 수정되었습니다.' : '팝업이 성공적으로 등록되었습니다.',
        description: isEditMode ? '관리자 검수를 거쳐 반영됩니다.' : '관리자 승인 후 게시됩니다.',
      });
      if (typeof onSuccessOverride === 'function') {
        onSuccessOverride();
      } else {
        navigate(ROUTES.seller.popups);
      }
    },
    onError: (error) => {
      console.error(error);
      const message = extractErrorMessage(error);
      addToast({
        title: isEditMode ? '수정에 실패했습니다.' : '등록 실패',
        description: message,
        variant: 'error',
      });
    },
    onSettled: () => {
      updateSubmittingState(false);
    },
  });

  const deletePopupMutation = useMutation({
    mutationFn: () => deletePopup(Number(activePopupId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myPopups'] });
      queryClient.invalidateQueries({ queryKey: ['sellerDashboard'] });
      addToast({ title: '팝업이 삭제되었습니다.' });
      navigate(ROUTES.seller.popups);
    },
    onError: (error) => {
      console.error(error);
      const message = extractErrorMessage(error);
      addToast({ title: '삭제 실패', description: message, variant: 'error' });
    },
  });

  // 편집 모드 초기 데이터 세팅
  useEffect(() => {
    if (!isEditMode || !popupDetail || prefillDone) return;

    const styleIds = (() => {
      if (Array.isArray(popupDetail.styleIds) && popupDetail.styleIds.length > 0) {
        return popupDetail.styleIds;
      }
      if (!Array.isArray(popupDetail.styleTags) || !styles) return [];
      return popupDetail.styleTags
        .map((tag) => styles.find((style) => style.name === tag)?.id)
        .filter(Boolean);
    })();

    setFormData((prev) => ({
      ...prev,
      title: popupDetail.title || '',
      description: popupDetail.description || '',
      startDate: toDateValue(popupDetail.startDate),
      endDate: toDateValue(popupDetail.endDate || popupDetail.startDate),
      openingHours: popupDetail.operatingTime || popupDetail.hours || '',
      categoryId: popupDetail.categoryIds?.[0] ? String(popupDetail.categoryIds[0]) : '',
      styleIds,
      featureIds: popupDetail.featureIds || [],
      hashtags: Array.isArray(popupDetail.hashtags)
        ? popupDetail.hashtags.join(' ')
        : popupDetail.hashtags || '',
      homepageUrl: popupDetail.homepageUrl || '',
      snsUrl: popupDetail.snsUrl || '',
      zoneCellId: popupDetail.cellId || prev.zoneCellId,
    }));

    const thumbnail = normalizeImage(
      popupDetail.thumbnailImage || popupDetail.thumbnail || popupDetail.thumbnailImageUrl,
    );
    if (thumbnail) {
      setExistingThumbnail(thumbnail);
    }

    setExistingImages(
      normalizeImageList(popupDetail.gallery || popupDetail.images || popupDetail.imageUrls || []),
    );

    if (popupDetail.cellId) {
      setPendingCellId(popupDetail.cellId);
    }

    setPrefillDone(true);
  }, [isEditMode, popupDetail, styles, prefillDone]);

  // 편집 모드: 존 자동 선택
  useEffect(() => {
    if (!isEditMode || !popupDetail || !areas.length) return;
    const areaId = popupDetail.zoneId || popupDetail.areaId;
    if (!areaId) return;
    const area = areas.find((item) => item.id === areaId);
    if (area) {
      setSelectedArea(area);
    }
  }, [areas, isEditMode, popupDetail]);
  
  // URL 쿼리 파라미터에서 zoneId로 존 자동 선택 (챗봇에서 이동 시)
  // initialZoneId가 변경되면 항상 해당 존으로 변경 (이미 페이지에 있는 상태에서도)
  useEffect(() => {
    if (isEditMode || !initialZoneId || !areas.length) return;
    const zoneIdNum = Number(initialZoneId);
    if (!Number.isFinite(zoneIdNum)) return;
    
    // 이미 같은 존이 선택되어 있으면 스킵
    if (selectedArea?.id === zoneIdNum) return;
    
    const area = areas.find((item) => item.id === zoneIdNum);
    if (area) {
      setSelectedArea(area);
      setSelectedCell(null); // 셀은 리셋
      setShowMap(true); // 지도도 자동으로 펼침
      addToast({
        title: `${area.name} 존이 선택되었습니다.`,
        description: '부스(셀) 위치를 선택해주세요.',
      });
    }
  }, [areas, initialZoneId, isEditMode, addToast]); // selectedArea를 의존성에서 제거

  // 편집 모드: 셀 자동 선택
  useEffect(() => {
    if (!pendingCellId || !cells.length) return;
    const cell = cells.find((item) => item.id === pendingCellId);
    if (cell) {
      setSelectedCell(cell);
      setPendingCellId(null);
    }
  }, [cells, pendingCellId]);

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
      setExistingThumbnail(null);
      setFormData((prev) => ({ ...prev, thumbnail: files[0] }));
    }
    if (name === 'images') {
      setFormData((prev) => ({ ...prev, images: Array.from(files) }));
    }
  };

  const handleRemoveExistingImage = (imageKey) => {
    setExistingImages((prev) => prev.filter((image) => image.key !== imageKey));
  };

  const handleRemoveThumbnail = () => {
    setExistingThumbnail(null);
    setFormData((prev) => ({ ...prev, thumbnail: null }));
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
      const exists = current.includes(id);
      if (exists) {
        return {
          ...prev,
          [field]: current.filter((item) => item !== id),
        };
      }

      const maxCount = field === 'styleIds' ? MAX_STYLE_SELECTION : MAX_FEATURE_SELECTION;
      if (current.length >= maxCount) {
        addToast({
          title:
            field === 'styleIds'
              ? `스타일은 최대 ${MAX_STYLE_SELECTION}개까지 선택할 수 있습니다.`
              : `편의/특징은 최대 ${MAX_FEATURE_SELECTION}개까지 선택할 수 있습니다.`,
          variant: 'error',
        });
        return prev;
      }

      return {
        ...prev,
        [field]: [...current, id],
      };
    });
  };

  const validateSelections = () => {
    if (!formData.categoryId) {
      addToast({
        title: '카테고리를 선택해주세요.',
        description: '최소 1개의 카테고리를 선택해야 합니다.',
        variant: 'error',
      });
      return false;
    }

    if (formData.styleIds.length < MIN_STYLE_SELECTION) {
      addToast({
        title: '스타일을 선택해주세요.',
        description: `스타일은 최소 ${MIN_STYLE_SELECTION}개 이상 선택해야 합니다.`,
        variant: 'error',
      });
      return false;
    }

    if (formData.styleIds.length > MAX_STYLE_SELECTION) {
      addToast({
        title: '스타일 선택 초과',
        description: `스타일은 최대 ${MAX_STYLE_SELECTION}개까지 선택 가능합니다.`,
        variant: 'error',
      });
      return false;
    }

    if (formData.featureIds.length < MIN_FEATURE_SELECTION) {
      addToast({
        title: '편의/특징을 선택해주세요.',
        description: `편의/특징은 최소 ${MIN_FEATURE_SELECTION}개 이상 선택해야 합니다.`,
        variant: 'error',
      });
      return false;
    }

    if (formData.featureIds.length > MAX_FEATURE_SELECTION) {
      addToast({
        title: '편의/특징 선택 초과',
        description: `편의/특징은 최대 ${MAX_FEATURE_SELECTION}개까지 선택 가능합니다.`,
        variant: 'error',
      });
      return false;
    }

    return true;
  };

  // 존 선택 - 셀 지도 자동 표시 (존 지도는 유지하여 다른 존도 선택 가능)
  const handleSelectArea = (area) => {
    if (isLocationLocked) return;
    setSelectedArea(area);
    setSelectedCell(null);
    setFormData((prev) => ({ ...prev, zoneCellId: null }));
    setShowMap(true); // 존 선택 시 셀 지도 자동 펼침
    // 존 지도는 유지 (다른 존 선택 가능하도록)
    setHoveredAreaId(null); // 호버 상태 리셋
  };

  // 셀 선택
  const handleSelectCell = (cell) => {
    if (isLocationLocked) return;
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

    if (!validateSelections()) {
      return;
    }

    updateSubmittingState(true);

    try {
      let thumbnailImage = existingThumbnail || null;
      if (formData.thumbnail) {
        const uploadRes = await uploadImage(formData.thumbnail);
        thumbnailImage = {
          url: uploadRes.url,
          key: uploadRes.key,
        };
      }

      const uploadedImages = [];
      if (formData.images.length > 0) {
        for (const file of formData.images) {
          const uploadRes = await uploadImage(file);
          uploadedImages.push({
            url: uploadRes.url,
            key: uploadRes.key,
          });
        }
      }

      if (!thumbnailImage) {
        addToast({
          title: '썸네일 이미지를 선택해주세요.',
          description: '최소 1개의 썸네일 이미지를 등록해야 합니다.',
          variant: 'error',
        });
        updateSubmittingState(false);
        return;
      }

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
        images: [...existingImages, ...uploadedImages],
        homepageUrl: formData.homepageUrl || null,
        snsUrl: formData.snsUrl || null,
        hashtags: formData.hashtags || null,
      };
      console.log('[SellerPopupForm] submit payload', requestData);
      popupMutation.mutate(requestData);
    } catch (error) {
      console.error('Upload failed:', error);
      addToast({
        title: '이미지 업로드 실패',
        description: extractErrorMessage(error),
        variant: 'error',
      });
      updateSubmittingState(false);
    }
  };

  const handleDelete = () => {
    if (!isEditMode || !activePopupId || deletePopupMutation.isPending) return;
    const confirmed = window.confirm('선택한 팝업을 삭제할까요? 삭제된 팝업은 복구할 수 없습니다.');
    if (!confirmed) return;
    deletePopupMutation.mutate();
  };

  // 공통 버튼 스타일
  const getButtonStyle = (isSelected) =>
    `rounded-full px-4 py-2 text-sm font-medium transition-colors border ${
      isSelected
        ? 'bg-[#EB0000] text-white border-[#EB0000]'
        : 'bg-white text-[oklch(0.373_0.034_259.733)] border-[oklch(0.373_0.034_259.733)]'
    }`;

  if (isEditMode && !activePopupId) {
    return (
      <div className="p-12 text-center text-red-500">
        유효하지 않은 접근입니다. 다시 시도해주세요.
      </div>
    );
  }

  if (isEditMode && isLoadingPopup) {
    return (
      <div className="p-12 text-center text-gray-500">
        등록된 팝업 정보를 불러오는 중입니다...
      </div>
    );
  }

  if (isEditMode && !popupDetail && !isLoadingPopup) {
    return (
      <div className="p-12 text-center text-red-500">
        해당 팝업 정보를 찾을 수 없습니다.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section className="relative rounded-3xl border border-white/80 bg-white p-6 shadow-sm shadow-slate-200/60">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50"
          aria-label="뒤로가기"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <div className="pr-12">
          <h2 className="mt-2 text-2xl font-semibold text-gray-900">
            {isEditMode ? '등록한 팝업을 확인하고 수정하세요' : '팝업 정보를 입력해주세요'}
          </h2>
          <p className="text-sm text-gray-500">
            {isEditMode ? '입력값을 수정하거나 필요시 팝업을 삭제할 수 있습니다.' : '승인까지 평균 2일이 소요됩니다.'}
          </p>

          {isEditMode && popupDetail && (
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-500">
              <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 font-semibold text-gray-700">
                승인 상태 · {popupDetail.status || 'PENDING'}
              </span>
              {popupDetail.startDate && popupDetail.endDate && (
                <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 font-semibold text-gray-700">
                  {toDateValue(popupDetail.startDate)} ~ {toDateValue(popupDetail.endDate)}
                </span>
              )}
            </div>
          )}
        </div>
      </section>

      <form
        ref={formRef || null}
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
          <div className="flex items-center justify-between">
            <div>
              <label className="text-xs font-semibold text-gray-500">
                부스 위치 선택 
                <span className="text-[#EB0000] ml-[3px]">*</span>
              </label>
              <p className="text-xs text-gray-400 mt-1">
                {isLocationLocked
                  ? '등록된 부스 위치는 수정할 수 없습니다.'
                  : '지도에서 존을 클릭하여 선택하고, 해당 존 안에서 부스(셀)를 선택해주세요.'}
              </p>
            </div>
            {!isLocationLocked && (
              <button
                type="button"
                onClick={() => setShowZoneMap(!showZoneMap)}
                className="flex items-center gap-1 text-xs text-[#EB0000] hover:underline"
              >
                <MapIcon className="h-4 w-4" />
                {showZoneMap ? '지도 숨기기' : '지도로 선택'}
              </button>
            )}
          </div>
          
          {/* 존 선택 지도 - 폴리곤 표시, 호버 시 정보 표시 */}
          {showZoneMap && !isLocationLocked && areas.length > 0 && (
            <div className="mt-3 h-[300px] rounded-lg overflow-hidden border border-gray-200 relative">
              <Map
                center={selectedArea ? (() => {
                  // 선택된 존이 있으면 해당 존 중심으로 이동
                  const coords = parseGeoJsonPolygon(selectedArea.polygonGeoJson);
                  if (coords.length > 0) {
                    return coords.reduce(
                      (acc, c) => ({ lat: acc.lat + c.lat / coords.length, lng: acc.lng + c.lng / coords.length }),
                      { lat: 0, lng: 0 }
                    );
                  }
                  return GWANGJU_CENTER;
                })() : GWANGJU_CENTER}
                style={{ width: '100%', height: '100%' }}
                level={selectedArea ? 6 : 8}
              >
                {/* 모든 존 폴리곤 표시 - 선택/호버 상태에 따라 z-index 조절 */}
                {areas
                  .sort((a, b) => {
                    // 호버된 존 > 선택된 존 > 나머지 순으로 정렬 (나중에 그려져서 위에 표시)
                    const aScore = (hoveredAreaId === a.id ? 2 : 0) + (selectedArea?.id === a.id ? 1 : 0);
                    const bScore = (hoveredAreaId === b.id ? 2 : 0) + (selectedArea?.id === b.id ? 1 : 0);
                    return aScore - bScore;
                  })
                  .map((area) => {
                  const coords = parseGeoJsonPolygon(area.polygonGeoJson);
                  if (coords.length < 3) return null;
                  
                  const isSelected = selectedArea?.id === area.id;
                  const isHovered = hoveredAreaId === area.id;
                  
                  // 존 중심점 계산
                  const center = coords.reduce(
                    (acc, c) => ({ lat: acc.lat + c.lat / coords.length, lng: acc.lng + c.lng / coords.length }),
                    { lat: 0, lng: 0 }
                  );
                  
                  return (
                    <div key={area.id}>
                      {/* 존 폴리곤 - 클릭 가능, zIndex로 겹침 처리 */}
                      <Polygon
                        path={coords}
                        strokeWeight={isSelected ? 3 : isHovered ? 3 : 1.5}
                        strokeColor={isSelected ? '#EB0000' : isHovered ? '#3B82F6' : '#6B7280'}
                        strokeOpacity={1}
                        fillColor={isSelected ? '#EB0000' : isHovered ? '#3B82F6' : '#9CA3AF'}
                        fillOpacity={isSelected ? 0.4 : isHovered ? 0.35 : 0.15}
                        onClick={() => handleSelectArea(area)}
                        onMouseover={() => setHoveredAreaId(area.id)}
                        onMouseout={() => setHoveredAreaId(null)}
                        zIndex={isHovered ? 10 : isSelected ? 5 : 1}
                      />
                      
                      {/* 선택된 존 라벨 */}
                      {isSelected && !isHovered && (
                        <CustomOverlayMap position={center} yAnchor={0.5} zIndex={20}>
                          <div 
                            className="px-3 py-1.5 rounded-lg shadow-lg text-xs font-bold bg-[#EB0000] text-white border-2 border-white cursor-pointer"
                            onMouseEnter={() => setHoveredAreaId(area.id)}
                          >
                            ✓ {area.name}
                          </div>
                        </CustomOverlayMap>
                      )}
                      
                      {/* 호버 시 존 정보 카드 (선택 여부 상관없이) */}
                      {isHovered && (
                        <CustomOverlayMap position={center} yAnchor={0.5} zIndex={100}>
                          <div 
                            onClick={() => !isSelected && handleSelectArea(area)}
                            onMouseEnter={() => setHoveredAreaId(area.id)}
                            onMouseLeave={() => setHoveredAreaId(null)}
                            className={`cursor-pointer bg-white rounded-xl shadow-2xl p-3 text-xs w-56 transform transition-all ${
                              isSelected ? 'border-2 border-[#EB0000]' : 'border border-blue-300'
                            }`}
                          >
                            {/* 헤더 */}
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                  isSelected ? 'bg-[#EB0000]' : 'bg-blue-500'
                                }`}>
                                  <MapPin className="h-3.5 w-3.5 text-white" />
                                </div>
                                <p className="font-bold text-gray-800">{area.name}</p>
                              </div>
                              {isSelected && (
                                <span className="px-2 py-0.5 bg-[#EB0000] text-white rounded-full text-[10px] font-medium">
                                  선택됨
                                </span>
                              )}
                            </div>
                            
                            {/* 존 상세 정보 */}
                            <div className="space-y-1.5 text-gray-600 mb-3 bg-gray-50 rounded-lg p-2">
                              {area.district && (
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-400 text-[10px] w-12">위치</span>
                                  <span className="font-medium">{area.district}</span>
                                </div>
                              )}
                              {area.status && (
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-400 text-[10px] w-12">상태</span>
                                  <span className={`font-medium ${
                                    area.status === 'APPROVED' ? 'text-green-600' : 
                                    area.status === 'PENDING' ? 'text-yellow-600' : 'text-gray-600'
                                  }`}>
                                    {area.status === 'APPROVED' ? '운영중' : area.status === 'PENDING' ? '준비중' : area.status}
                                  </span>
                                </div>
                              )}
                              {area.maxCapacity && (
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-400 text-[10px] w-12">수용</span>
                                  <span className="font-medium">최대 {area.maxCapacity}개 부스</span>
                                </div>
                              )}
                              {area.notice && (
                                <div className="flex items-start gap-2">
                                  <span className="text-gray-400 text-[10px] w-12 shrink-0">안내</span>
                                  <span className="text-gray-500 line-clamp-2">{area.notice}</span>
                                </div>
                              )}
                              {area.description && (
                                <div className="flex items-start gap-2">
                                  <span className="text-gray-400 text-[10px] w-12 shrink-0">설명</span>
                                  <span className="text-gray-500 line-clamp-2">{area.description}</span>
                                </div>
                              )}
                              {/* 추가 정보가 없을 경우 기본 메시지 */}
                              {!area.district && !area.maxCapacity && !area.notice && !area.description && (
                                <p className="text-gray-400 text-center py-1">상세 정보가 없습니다</p>
                              )}
                            </div>
                            
                            {/* 버튼 */}
                            {isSelected ? (
                              <div className="text-center text-[#EB0000] font-medium py-1">
                                ✓ 현재 선택된 존입니다
                              </div>
                            ) : (
                              <button
                                type="button"
                                className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                              >
                                이 존 선택하기
                              </button>
                            )}
                          </div>
                        </CustomOverlayMap>
                      )}
                    </div>
                  );
                })}
              </Map>
              
              {/* 안내 메시지 */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm rounded-full px-4 py-1.5 text-[11px] text-white shadow-lg">
                🗺️ 존 영역에 마우스를 올려 정보 확인 · 클릭하여 선택
              </div>
              
              {/* 선택된 존 표시 (우측 상단) */}
              {selectedArea && (
                <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 text-xs shadow-md border border-[#EB0000]/30">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#EB0000]" />
                    <span className="font-medium text-gray-700">선택: {selectedArea.name}</span>
                  </div>
                </div>
              )}
              
              {/* 지도 범례 */}
              <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 text-[10px] shadow-sm border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-[#EB0000]/40 border-2 border-[#EB0000]" />
                    <span className="font-medium">선택됨</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-blue-500/35 border-2 border-blue-500" />
                    <span>호버</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-gray-200/50 border border-gray-400" />
                    <span>클릭 가능</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* 존/셀 선택 드롭다운 (지도 아래 또는 지도 숨김 시) */}
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
                  disabled={isLocationLocked}
                  className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2 pr-8 text-sm focus:border-[#EB0000] focus:outline-none focus:ring-1 focus:ring-[#EB0000] disabled:bg-gray-100 disabled:text-gray-400"
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
                  disabled={!selectedArea || isLocationLocked}
                  className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2 pr-8 text-sm focus:border-[#EB0000] focus:outline-none focus:ring-1 focus:ring-[#EB0000] disabled:bg-gray-100 disabled:text-gray-400"
                >
                  <option value="">
                    {isLoadingCells
                      ? '로딩 중...'
                      : selectedArea
                        ? isLocationLocked
                          ? '셀을 수정할 수 없습니다'
                          : '셀을 선택하세요'
                        : '먼저 존을 선택하세요'}
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
                  onClick={() => {
                    if (isLocationLocked) return;
                    setShowMap(!showMap);
                  }}
                  disabled={isLocationLocked}
                  className="flex items-center gap-1 text-xs text-[#EB0000] hover:underline disabled:text-gray-400 disabled:hover:no-underline"
                >
                  <MapIcon className="h-4 w-4" />
                  {showMap ? '셀 지도 숨기기' : isLocationLocked ? '위치 수정 불가' : '셀 지도 보기'}
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

                {/* 셀 마커 - 호버 시 정보 표시 */}
                {cells.map((cell, index) => {
                  const pos = getCellPosition(cell);
                  if (!pos) return null;
                  const isSelected = selectedCell?.id === cell.id;
                  const isHovered = hoveredCellId === cell.id;
                  const hasPopup = cell.hasPopup || cell.popupCount > 0;
                  const isAvailable = cell.status === 'APPROVED' && !hasPopup;

                  return (
                    <div key={cell.id}>
                      {/* 숫자 마커 */}
                      <MapMarker
                        position={pos}
                        onClick={() => !isLocationLocked && handleSelectCell(cell)}
                        clickable={!isLocationLocked}
                        image={{
                          src: isSelected 
                            ? 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_number_blue.png'
                            : 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_number_blue.png',
                          size: { width: 36, height: 37 },
                          options: {
                            spriteSize: { width: 36, height: 691 },
                            spriteOrigin: { x: 0, y: ((index % 10) * 46) + 10 },
                            offset: { x: 13, y: 37 },
                          },
                        }}
                      />
                      
                      {/* 라벨 + 호버 정보 */}
                      <CustomOverlayMap position={pos} yAnchor={2.5}>
                        <div
                          onClick={() => !isLocationLocked && handleSelectCell(cell)}
                          onMouseEnter={() => setHoveredCellId(cell.id)}
                          onMouseLeave={() => setHoveredCellId(null)}
                          className="relative"
                        >
                          {/* 기본 라벨 */}
                          <div
                            className={`cursor-pointer px-2 py-1 rounded shadow text-xs font-semibold border transition-all ${
                              isSelected
                                ? 'bg-[#EB0000] text-white border-[#EB0000] scale-110'
                                : isHovered
                                  ? 'bg-blue-500 text-white border-blue-500 scale-105'
                                  : isAvailable
                                    ? 'bg-white text-gray-700 border-gray-200 hover:border-[#EB0000]'
                                    : 'bg-gray-200 text-gray-500 border-gray-300'
                            }`}
                          >
                            {cell.label}
                            {!isAvailable && !isSelected && <span className="ml-1 text-[8px]">예약됨</span>}
                          </div>

                          {/* 호버 시 상세 정보 툴팁 */}
                          {isHovered && (
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-44 p-3 bg-white rounded-lg shadow-xl border border-gray-200 text-xs z-50">
                              <p className="font-bold text-gray-800 mb-1.5">{cell.label}</p>
                              <div className="space-y-1 text-gray-600">
                                <p className="flex items-center gap-1">
                                  <span className={`w-2 h-2 rounded-full ${
                                    cell.status === 'APPROVED' ? 'bg-green-500' : 
                                    cell.status === 'PENDING' ? 'bg-yellow-500' : 'bg-red-500'
                                  }`} />
                                  상태: {cell.status === 'APPROVED' ? '승인됨' : cell.status === 'PENDING' ? '대기중' : '거절됨'}
                                </p>
                                {cell.detailedAddress && (
                                  <p className="truncate">📍 {cell.detailedAddress}</p>
                                )}
                                {hasPopup && (
                                  <p className="text-amber-600">⚠️ 이미 팝업이 등록되어 있습니다</p>
                                )}
                              </div>
                              <div className={`mt-2 pt-2 border-t border-gray-100 font-semibold ${
                                isAvailable ? 'text-green-600' : 'text-red-500'
                              }`}>
                                {isAvailable ? '✓ 클릭하여 선택' : '✕ 선택 불가'}
                              </div>
                            </div>
                          )}
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
                  {formData.thumbnail ? formData.thumbnail.name : existingThumbnail ? '현재 이미지를 유지합니다.' : '파일을 선택하세요'}
                </div>
                <label className="cursor-pointer rounded-lg bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600">
                  첨부
                  <input
                    type="file"
                    name="thumbnail"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    required={!isEditMode}
                  />
                </label>
              </div>

              {existingThumbnail && (
                <div className="mt-3 flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
                  <img
                    src={existingThumbnail.url}
                    alt="현재 썸네일"
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                  <div className="flex-1 text-xs text-gray-500">현재 등록된 썸네일입니다.</div>
                  <button
                    type="button"
                    onClick={handleRemoveThumbnail}
                    className="rounded-full bg-white p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500">추가 이미지</label>
              <div className="mt-2 flex items-center gap-3">
                <div className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-500 truncate">
                  {formData.images.length > 0
                    ? `${formData.images.length}개 파일 선택됨`
                    : existingImages.length > 0
                      ? '현재 이미지를 유지합니다.'
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

              {existingImages.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
                  {existingImages.map((image) => (
                    <div key={image.key} className="relative overflow-hidden rounded-xl border">
                      <img src={image.url} alt="등록된 이미지" className="h-28 w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingImage(image.key)}
                        className="absolute right-2 top-2 rounded-full bg-white/80 p-1 text-gray-500 hover:bg-white"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {!hideActionButtons && (
          <div className="flex flex-col gap-3 pt-6 md:flex-row md:justify-end">
            <Link
              to={ROUTES.seller.popups}
              className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              목록으로
            </Link>

            {isEditMode && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deletePopupMutation.isPending}
                className="inline-flex items-center justify-center rounded-xl border border-red-200 px-6 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {deletePopupMutation.isPending ? '삭제 중...' : '팝업 삭제'}
              </button>
            )}

            <button
              type="submit"
              disabled={isSubmitting || popupMutation.isPending || !formData.zoneCellId}
              className="inline-flex items-center justify-center rounded-xl bg-[#EB0000] px-8 py-3 text-base font-bold text-white shadow-md hover:bg-[#c90000] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {popupMutation.isPending || isSubmitting
                ? isEditMode
                  ? '수정 중...'
                  : '등록 중...'
                : isEditMode
                  ? '수정하기'
                  : '등록하기'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

const SellerPopupCreatePage = () => {
  return <SellerPopupFormPage mode="create" />;
};

const SellerPopupEditPage = () => {
  return <SellerPopupFormPage mode="edit" />;
};

export default SellerPopupCreatePage;
export { SellerPopupEditPage, SellerPopupFormPage };
