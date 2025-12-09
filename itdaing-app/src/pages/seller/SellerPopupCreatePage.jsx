import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ROUTES } from '@/routes/paths';
import { MapPin, Calendar, Clock, Map as MapIcon, ChevronDown, Trash2, X, ArrowLeft, Users, TrendingUp, Store, ChevronRight } from 'lucide-react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { createPopup, updatePopup, deletePopup } from '@/services/sellerService';
import { uploadImage } from '@/services/uploadService';
import { useToast } from '@/hooks/useToast';
import { useMasterData } from '@/hooks/useMasterData';
import { listAreas, listCells, parseGeoJsonPolygon } from '@/services/geoZoneService';
import { Map, Polygon, MapMarker, CustomOverlayMap } from 'react-kakao-maps-sdk';
import { getPopupById } from '@/services/popupService';
import { INPUT_LIMITS } from '@/constants/inputLimits';

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
  
  // 카테고리 중복 제거 (DB에 중복 데이터가 있을 경우 대비)
  const uniqueCategories = useMemo(() => {
    const seen = new Set();
    return (categories || []).filter(cat => {
      if (seen.has(cat.name)) return false;
      seen.add(cat.name);
      return true;
    });
  }, [categories]);
  
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
  const [overlappingAreas, setOverlappingAreas] = useState([]); // 클릭 위치에서 겹치는 존들
  const [showOverlapMenu, setShowOverlapMenu] = useState(false); // 겹치는 존 메뉴 표시
  const [commercialData, setCommercialData] = useState(null); // 상권 정보 데이터
  const cellSectionRef = useRef(null); // 셀 선택 영역 ref (자동 스크롤용)
  const [locationStep, setLocationStep] = useState(1); // 1: 존 선택, 2: 셀 선택

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

  // 상권 데이터 로드
  useEffect(() => {
    fetch('/data/gwangju_commercial_data.json')
      .then(res => res.json())
      .then(data => setCommercialData(data))
      .catch(err => console.warn('상권 데이터 로드 실패:', err));
  }, []);

  // 존 선택 시 스텝 2로 이동 (자동 스크롤 제거 - 정보 패널이 우측에 보이므로)
  useEffect(() => {
    if (selectedArea) {
      setLocationStep(2);
    }
  }, [selectedArea]);

  // 선택된 존의 구/동 상권 정보 가져오기
  const getDistrictCommercialInfo = () => {
    if (!commercialData || !selectedArea) return null;
    
    // 존 이름이나 district에서 구 이름 추출
    const districtName = selectedArea.district || selectedArea.name;
    if (!districtName) return null;
    
    // 구 이름 매칭 (동구, 서구, 남구, 북구, 광산구)
    const districts = ['동구', '서구', '남구', '북구', '광산구'];
    const matchedDistrict = districts.find(d => districtName.includes(d));
    
    if (matchedDistrict && commercialData.districts?.[matchedDistrict]) {
      const districtData = commercialData.districts[matchedDistrict];
      
      // 동(neighborhood) 이름 매칭 시도
      // 존 이름이나 district에서 동 이름 추출 (예: "동명동", "충장동", "금남로")
      let matchedNeighborhood = null;
      let neighborhoodData = null;
      
      if (districtData.neighborhoods) {
        const neighborhoodNames = Object.keys(districtData.neighborhoods);
        // 존 이름에서 동 이름 찾기
        matchedNeighborhood = neighborhoodNames.find(dong => 
          selectedArea.name?.includes(dong) || districtName.includes(dong)
        );
        
        if (matchedNeighborhood) {
          neighborhoodData = districtData.neighborhoods[matchedNeighborhood];
        }
      }
      
      return {
        district: matchedDistrict,
        data: districtData,
        neighborhood: matchedNeighborhood,
        neighborhoodData: neighborhoodData
      };
    }
    return null;
  };

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

  // 존 선택/해제 토글 - 같은 존 클릭 시 해제
  const handleSelectArea = (area) => {
    if (isLocationLocked) return;
    
    // 같은 존 클릭 시 선택 해제
    if (selectedArea?.id === area.id) {
      setSelectedArea(null);
      setSelectedCell(null);
      setFormData((prev) => ({ ...prev, zoneCellId: null }));
      setShowMap(false);
      return;
    }
    
    setSelectedArea(area);
    setSelectedCell(null);
    setFormData((prev) => ({ ...prev, zoneCellId: null }));
    setShowMap(true); // 존 선택 시 셀 지도 자동 펼침
    setHoveredAreaId(null); // 호버 상태 리셋
    setShowOverlapMenu(false); // 겹침 메뉴 닫기
  };

  // 점이 폴리곤 내부에 있는지 확인 (Ray Casting 알고리즘)
  const isPointInPolygon = (point, polygon) => {
    if (!polygon || polygon.length < 3) return false;
    
    let inside = false;
    const { lat, lng } = point;
    
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].lng, yi = polygon[i].lat;
      const xj = polygon[j].lng, yj = polygon[j].lat;
      
      if (((yi > lat) !== (yj > lat)) && (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
    
    return inside;
  };

  // 클릭 위치에서 겹치는 존들 찾기
  const findOverlappingAreas = (clickLat, clickLng) => {
    const clickPoint = { lat: clickLat, lng: clickLng };
    const overlapping = areas.filter(area => {
      const coords = parseGeoJsonPolygon(area.polygonGeoJson);
      return coords.length >= 3 && isPointInPolygon(clickPoint, coords);
    });
    return overlapping;
  };

  // 폴리곤 클릭 핸들러 - 겹치는 존 처리
  const handlePolygonClick = (area, mouseEvent) => {
    if (isLocationLocked) return;
    
    // 클릭 위치 좌표 (카카오맵 이벤트에서)
    const latLng = mouseEvent?.latLng;
    if (!latLng) {
      handleSelectArea(area);
      return;
    }
    
    const clickLat = latLng.getLat();
    const clickLng = latLng.getLng();
    
    // 클릭 위치에서 겹치는 존들 찾기
    const overlapping = findOverlappingAreas(clickLat, clickLng);
    
    // 겹치는 존이 2개 이상이면 선택 메뉴 표시
    if (overlapping.length > 1) {
      setOverlappingAreas(overlapping);
      setShowOverlapMenu(true);
    } else {
      // 겹치는 존이 1개면 바로 선택
      handleSelectArea(area);
    }
  };

  // 셀 선택
  const handleSelectCell = (cell) => {
    if (isLocationLocked) return;
    // APPROVED 상태의 셀만 선택 가능
    if (cell?.status !== 'APPROVED') {
      addToast({
        title: '선택할 수 없는 셀입니다.',
        description: '승인된 셀만 선택할 수 있습니다.',
        variant: 'error',
      });
      return;
    }
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
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-gray-500">
              팝업명
              <span className="text-[#EB0000] ml-[3px]">*</span> 
            </label>
            <span className="text-[10px] text-gray-400">{formData.title.length}/{INPUT_LIMITS.TITLE}</span>
          </div>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            maxLength={INPUT_LIMITS.TITLE}
            placeholder="팝업의 제목을 입력해주세요."
            className="mt-1 w-full border-b border-gray-300 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </div>

        {/* 2. 존/셀 선택 (스텝 형태) */}
        <div className="space-y-4">
          {/* 스텝 인디케이터 */}
          <div className="flex items-center gap-2 mb-2">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              locationStep === 1 || !selectedArea 
                ? 'bg-[#EB0000] text-white' 
                : 'bg-green-100 text-green-700'
            }`}>
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                {selectedArea ? '✓' : '1'}
              </span>
              존 선택
            </div>
            <ChevronRight className="h-4 w-4 text-gray-300" />
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              locationStep === 2 && selectedArea
                ? selectedCell ? 'bg-green-100 text-green-700' : 'bg-[#EB0000] text-white'
                : 'bg-gray-100 text-gray-400'
            }`}>
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                {selectedCell ? '✓' : '2'}
              </span>
              셀 선택
            </div>
            
            {/* 선택 완료 표시 */}
            {selectedArea && selectedCell && (
              <div className="ml-auto flex items-center gap-1 text-xs text-green-600 font-medium">
                <span className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">✓</span>
                위치 선택 완료
              </div>
            )}
          </div>

          {/* Step 1: 존 선택 */}
          <div className={`rounded-xl border ${locationStep === 1 ? 'border-[#EB0000]/30 bg-[#EB0000]/5' : 'border-gray-200 bg-gray-50'} p-4`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  selectedArea ? 'bg-green-500 text-white' : 'bg-[#EB0000] text-white'
                }`}>
                  {selectedArea ? '✓' : '1'}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-800">존(Zone) 선택</h4>
                  <p className="text-[10px] text-gray-400">
                    {isLocationLocked ? '등록된 위치는 수정 불가' : '지도에서 운영할 구역 선택'}
                  </p>
                </div>
              </div>
              {!isLocationLocked && (
                <button
                  type="button"
                  onClick={() => setShowZoneMap(!showZoneMap)}
                  className="flex items-center gap-1 text-xs text-[#EB0000] hover:underline"
                >
                  <MapIcon className="h-4 w-4" />
                  {showZoneMap ? '접기' : '펼치기'}
                </button>
              )}
            </div>
          
          {/* 존 선택 지도 + 정보 패널 (좌우 분할) */}
          {showZoneMap && !isLocationLocked && areas.length > 0 && (
            <div className="mt-3 flex flex-col lg:flex-row gap-3">
              {/* 왼쪽: 지도 영역 */}
              <div className="flex-1 min-w-0">
                <div className="h-[300px] lg:h-[350px] rounded-lg overflow-hidden border border-gray-200 relative">
                  <Map
                    center={selectedArea ? (() => {
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
                    level={selectedArea ? 5 : 8}
                    onClick={() => setShowOverlapMenu(false)}
                  >
                  {/* 모든 존 폴리곤 표시 */}
                  {areas
                    .sort((a, b) => {
                      const aScore = (hoveredAreaId === a.id ? 2 : 0) + (selectedArea?.id === a.id ? 1 : 0);
                      const bScore = (hoveredAreaId === b.id ? 2 : 0) + (selectedArea?.id === b.id ? 1 : 0);
                      return aScore - bScore;
                    })
                    .map((area) => {
                    const coords = parseGeoJsonPolygon(area.polygonGeoJson);
                    if (coords.length < 3) return null;
                    
                    const isSelected = selectedArea?.id === area.id;
                    const isHovered = hoveredAreaId === area.id;
                    
                    const center = coords.reduce(
                      (acc, c) => ({ lat: acc.lat + c.lat / coords.length, lng: acc.lng + c.lng / coords.length }),
                      { lat: 0, lng: 0 }
                    );
                    
                    return (
                      <div key={area.id}>
                        <Polygon
                          path={coords}
                          strokeWeight={isSelected ? 3 : isHovered ? 3 : 1.5}
                          strokeColor={isSelected ? '#EB0000' : isHovered ? '#3B82F6' : '#6B7280'}
                          strokeOpacity={1}
                          fillColor={isSelected ? '#EB0000' : isHovered ? '#3B82F6' : '#9CA3AF'}
                          fillOpacity={isSelected ? 0.4 : isHovered ? 0.35 : 0.12}
                          onClick={(_, mouseEvent) => handlePolygonClick(area, mouseEvent)}
                          onMouseover={() => setHoveredAreaId(area.id)}
                          onMouseout={() => setHoveredAreaId(null)}
                          zIndex={isHovered ? 10 : isSelected ? 5 : 1}
                        />
                        
                        {/* 간단한 라벨 (선택/호버 시) */}
                        {(isSelected || isHovered) && (
                          <CustomOverlayMap position={center} yAnchor={0.5} zIndex={isHovered ? 100 : 20}>
                            <div 
                              onClick={() => isSelected ? handleSelectArea(area) : handlePolygonClick(area, null)}
                              onMouseEnter={() => setHoveredAreaId(area.id)}
                              onMouseLeave={() => setHoveredAreaId(null)}
                              className={`cursor-pointer px-3 py-1.5 rounded-lg shadow-lg text-xs font-bold transition-all ${
                                isSelected 
                                  ? 'bg-[#EB0000] text-white border-2 border-white' 
                                  : 'bg-blue-500 text-white border-2 border-white'
                              }`}
                            >
                              {isSelected ? '✓ ' : ''}{area.name}
                              {isSelected && <span className="ml-1 text-[10px] opacity-80">(클릭해제)</span>}
                            </div>
                          </CustomOverlayMap>
                        )}
                      </div>
                    );
                  })}
                </Map>
                
                {/* 안내 메시지 */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm rounded-full px-4 py-1.5 text-[11px] text-white shadow-lg">
                  🗺️ 존 클릭하여 선택 · 다시 클릭하여 해제
                </div>
                
                {/* 겹치는 존 선택 메뉴 */}
                {showOverlapMenu && overlappingAreas.length > 1 && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl border border-gray-200 p-3 z-50 min-w-[200px]">
                    <p className="text-xs font-semibold text-gray-700 mb-2 pb-2 border-b">
                      📍 이 위치에 {overlappingAreas.length}개 존이 겹쳐있습니다
                    </p>
                    <div className="space-y-1 max-h-[200px] overflow-y-auto">
                      {overlappingAreas.map((area) => (
                        <button
                          key={area.id}
                          type="button"
                          onClick={() => {
                            handleSelectArea(area);
                            setShowOverlapMenu(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${
                            selectedArea?.id === area.id
                              ? 'bg-[#EB0000]/10 text-[#EB0000] font-semibold'
                              : 'hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{area.name}</span>
                            {selectedArea?.id === area.id && <span>✓</span>}
                          </div>
                          {area.district && (
                            <span className="text-[10px] text-gray-400">{area.district}</span>
                          )}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowOverlapMenu(false)}
                      className="w-full mt-2 pt-2 border-t text-xs text-gray-500 hover:text-gray-700"
                    >
                      닫기
                    </button>
                  </div>
                )}
                
                  {/* 지도 범례 */}
                  <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-sm rounded-lg px-2 py-1.5 text-[9px] shadow-sm border border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <div className="w-2.5 h-2.5 rounded bg-[#EB0000]/40 border border-[#EB0000]" />
                        <span>선택</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2.5 h-2.5 rounded bg-blue-500/35 border border-blue-500" />
                        <span>호버</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 오른쪽: 존 정보 + 상권 정보 패널 */}
              <div className="w-full lg:w-80 shrink-0">
                {/* 선택된 존 정보 패널 + 상권 정보 */}
                {selectedArea && (() => {
                  const commercialInfo = getDistrictCommercialInfo();
                  return (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-full max-h-[350px] overflow-y-auto">
                      {/* 헤더 */}
                      <div className="bg-gradient-to-r from-[#EB0000] to-[#FF4444] px-3 py-2 flex items-center justify-between sticky top-0 z-10">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                            <MapPin className="h-3 w-3 text-white" />
                          </div>
                          <div className="text-white">
                            <h4 className="font-bold text-sm">{selectedArea.name}</h4>
                            {selectedArea.district && (
                              <p className="text-[10px] text-white/80">{selectedArea.district}</p>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSelectArea(selectedArea)}
                          className="px-2 py-1 text-[10px] text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors"
                        >
                          해제
                        </button>
                      </div>
                    
                      {/* 존 기본 정보 */}
                      <div className="p-3 border-b border-gray-100">
                        <div className="grid grid-cols-3 gap-1.5 text-xs">
                          {selectedArea.status && (
                            <div className="bg-gray-50 rounded-lg px-2 py-1.5">
                              <span className="text-gray-400 text-[9px]">상태</span>
                              <p className={`font-semibold text-[11px] ${
                                selectedArea.status === 'APPROVED' || selectedArea.status === 'AVAILABLE' ? 'text-green-600' : 
                                selectedArea.status === 'PENDING' ? 'text-yellow-600' : 'text-gray-600'
                              }`}>
                                {selectedArea.status === 'APPROVED' || selectedArea.status === 'AVAILABLE' ? '✓ 운영중' : 
                                 selectedArea.status === 'PENDING' ? '⏳ 준비중' : selectedArea.status}
                              </p>
                            </div>
                          )}
                          {selectedArea.maxCapacity && (
                            <div className="bg-gray-50 rounded-lg px-2 py-1.5">
                              <span className="text-gray-400 text-[9px]">최대</span>
                              <p className="font-semibold text-gray-700 text-[11px]">{selectedArea.maxCapacity}개</p>
                            </div>
                          )}
                          {cells && (
                            <div className="bg-gray-50 rounded-lg px-2 py-1.5">
                              <span className="text-gray-400 text-[9px]">빈 셀</span>
                              <p className="font-semibold text-blue-600 text-[11px]">
                                {cells.filter(c => c.status === 'AVAILABLE').length}/{cells.length}개
                              </p>
                            </div>
                          )}
                        </div>
                        
                        {selectedArea.notice && (
                          <div className="mt-2 bg-amber-50 rounded-lg px-2 py-1.5 border border-amber-100">
                            <span className="text-amber-600 text-[9px] font-medium">📢</span>
                            <p className="text-[10px] text-amber-700 mt-0.5 line-clamp-2">{selectedArea.notice}</p>
                          </div>
                        )}
                      </div>
                    
                      {/* 상권 정보 (commercialData에서 가져옴) */}
                      {commercialInfo && (
                        <div className="p-3 bg-blue-50/50">
                          <div className="flex items-center gap-1.5 mb-2">
                            <Store className="h-3.5 w-3.5 text-blue-600" />
                            <h5 className="text-[11px] font-semibold text-gray-800">
                              {commercialInfo.neighborhood ? `${commercialInfo.neighborhood} 상권` : `${commercialInfo.district} 상권`}
                            </h5>
                          </div>
                          
                          {/* 동(neighborhood) 상세 정보가 있는 경우 - 우선 표시 */}
                          {commercialInfo.neighborhoodData ? (
                            <div className="space-y-1.5 text-[10px]">
                              {/* 유동인구 정보 */}
                              <div className="flex gap-1.5">
                                {commercialInfo.neighborhoodData.population && (
                                  <div className="flex-1 bg-white rounded px-2 py-1.5 border border-blue-100">
                                    <span className="text-gray-400 text-[9px]">거주</span>
                                    <p className="font-semibold text-gray-700">
                                      {commercialInfo.neighborhoodData.population.toLocaleString()}명
                                    </p>
                                  </div>
                                )}
                                {commercialInfo.neighborhoodData.floating_population && (
                                  <div className="flex-[2] bg-white rounded px-2 py-1.5 border border-blue-100">
                                    <span className="text-gray-400 text-[9px]">유동인구 (주말)</span>
                                    <p className="font-semibold text-gray-700">
                                      {(commercialInfo.neighborhoodData.floating_population.weekend_avg / 1000).toFixed(0)}천명
                                    </p>
                                  </div>
                                )}
                              </div>
                              
                              {/* 피크 시간대 */}
                              {commercialInfo.neighborhoodData.floating_population?.peak_hours && (
                                <div className="bg-white rounded px-2 py-1.5 border border-blue-100">
                                  <span className="text-gray-400 text-[9px]">⏰ 피크 시간</span>
                                  <p className="font-medium text-gray-700">
                                    {commercialInfo.neighborhoodData.floating_population.peak_hours.join(', ')}
                                  </p>
                                </div>
                              )}
                              
                              {/* 지역 특성 */}
                              {commercialInfo.neighborhoodData.characteristics && (
                                <div className="flex flex-wrap gap-1">
                                  {commercialInfo.neighborhoodData.characteristics.slice(0, 4).map((char, i) => (
                                    <span key={i} className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[9px]">
                                      {char}
                                    </span>
                                  ))}
                                </div>
                              )}
                              
                              {/* 추천 업종 (동 레벨) */}
                              {commercialInfo.neighborhoodData.commercial_info?.recommended_business && (
                                <div className="mt-2 p-2 bg-green-50 rounded border border-green-100">
                                  <div className="text-green-600 text-[9px] font-medium mb-1">
                                    💡 추천 업종
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {commercialInfo.neighborhoodData.commercial_info.recommended_business.slice(0, 4).map((biz, i) => (
                                      <span key={i} className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[9px]">
                                        {biz}
                                      </span>
                                    ))}
                                  </div>
                                  {commercialInfo.neighborhoodData.commercial_info.avg_rent_per_pyeong && (
                                    <p className="mt-1 text-[9px] text-gray-500">
                                      임대료: {commercialInfo.neighborhoodData.commercial_info.avg_rent_per_pyeong.toLocaleString()}원/평
                                    </p>
                                  )}
                                  {commercialInfo.neighborhoodData.commercial_info.competition_level && (
                                    <p className="text-[9px] text-gray-500">
                                      경쟁도: {commercialInfo.neighborhoodData.commercial_info.competition_level}
                                    </p>
                                  )}
                                </div>
                              )}
                              
                              {/* 주변 시설 */}
                              {commercialInfo.neighborhoodData.nearby_facilities && (
                                <div className="mt-1.5 p-2 bg-gray-50 rounded border border-gray-100">
                                  <span className="text-gray-500 text-[9px]">🏢 주변 시설</span>
                                  <p className="text-[10px] text-gray-600 mt-0.5">
                                    {commercialInfo.neighborhoodData.nearby_facilities.slice(0, 3).join(', ')}
                                  </p>
                                </div>
                              )}
                              
                              {/* 지역 이벤트 */}
                              {commercialInfo.neighborhoodData.events && (
                                <div className="mt-1.5 p-2 bg-purple-50 rounded border border-purple-100">
                                  <span className="text-purple-600 text-[9px]">🎉 지역 이벤트</span>
                                  <p className="text-[10px] text-purple-700 mt-0.5">
                                    {commercialInfo.neighborhoodData.events.slice(0, 2).join(', ')}
                                  </p>
                                </div>
                              )}
                            </div>
                          ) : (
                            /* 구(district) 레벨 정보만 있는 경우 - 기존 로직 */
                            <div className="space-y-1.5 text-[10px]">
                              {/* 인구 + 주요상권 */}
                              <div className="flex gap-1.5">
                                {commercialInfo.data.total_population && (
                                  <div className="flex-1 bg-white rounded px-2 py-1.5 border border-blue-100">
                                    <span className="text-gray-400 text-[9px]">거주</span>
                                    <p className="font-semibold text-gray-700">
                                      {(commercialInfo.data.total_population / 1000).toFixed(0)}천명
                                    </p>
                                  </div>
                                )}
                                {commercialInfo.data.main_commercial_areas && (
                                  <div className="flex-[2] bg-white rounded px-2 py-1.5 border border-blue-100">
                                    <span className="text-gray-400 text-[9px]">주요 상권</span>
                                    <p className="font-medium text-gray-700 truncate">
                                      {commercialInfo.data.main_commercial_areas.slice(0, 2).join(', ')}
                                    </p>
                                  </div>
                                )}
                              </div>
                              
                              {/* 지역 특성 */}
                              {commercialInfo.data.characteristics && (
                                <div className="flex flex-wrap gap-1">
                                  {commercialInfo.data.characteristics.slice(0, 3).map((char, i) => (
                                    <span key={i} className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[9px]">
                                      {char}
                                    </span>
                                  ))}
                                </div>
                              )}
                              
                              {/* 추천 업종 (구 레벨) */}
                              {commercialInfo.data.neighborhoods && Object.keys(commercialInfo.data.neighborhoods).length > 0 && (() => {
                                const firstNeighborhood = Object.values(commercialInfo.data.neighborhoods)[0];
                                const commercialDetail = firstNeighborhood?.commercial_info;
                                return commercialDetail?.recommended_business ? (
                                  <div className="mt-2 p-2 bg-green-50 rounded border border-green-100">
                                    <div className="text-green-600 text-[9px] font-medium mb-1">
                                      💡 추천 업종
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                      {commercialDetail.recommended_business.slice(0, 4).map((biz, i) => (
                                        <span key={i} className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[9px]">
                                          {biz}
                                        </span>
                                      ))}
                                    </div>
                                    {commercialDetail.avg_rent_per_pyeong && (
                                      <p className="mt-1 text-[9px] text-gray-500">
                                        임대료: {commercialDetail.avg_rent_per_pyeong.toLocaleString()}원/평
                                      </p>
                                    )}
                                  </div>
                                ) : null;
                              })()}
                            </div>
                          )}
                        </div>
                      )}
                    
                      {/* 상권 정보 없을 때 */}
                      {!commercialInfo && (
                        <div className="p-3 bg-gray-50 text-center">
                          <p className="text-[10px] text-gray-400">
                            상권 정보 준비 중
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })()}
                
                {/* 존 미선택 시 안내 */}
                {!selectedArea && (
                  <div className="h-full min-h-[200px] lg:min-h-[350px] bg-gray-50 rounded-xl border border-dashed border-gray-200 flex flex-col items-center justify-center p-4 text-center">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                      <MapPin className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500 font-medium">
                      존을 선택해주세요
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      지도에서 원하는 존을 클릭하면<br/>상권 정보를 확인할 수 있습니다
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          
            {/* 존 선택 드롭다운 (지도 대안) */}
            {!showZoneMap && (
              <div className="mt-3">
                <label className="text-xs text-gray-500">또는 드롭다운으로 선택</label>
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
            )}
          </div>

          {/* Step 2: 셀 선택 */}
          <div 
            ref={cellSectionRef}
            className={`rounded-xl border ${locationStep === 2 && selectedArea ? 'border-[#EB0000]/30 bg-[#EB0000]/5' : 'border-gray-200 bg-gray-50'} p-4 transition-all ${!selectedArea ? 'opacity-50' : ''}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  selectedCell ? 'bg-green-500 text-white' : selectedArea ? 'bg-[#EB0000] text-white' : 'bg-gray-300 text-gray-500'
                }`}>
                  {selectedCell ? '✓' : '2'}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-800">셀(부스) 선택</h4>
                  <p className="text-[10px] text-gray-400">
                    {!selectedArea ? '먼저 존을 선택해주세요' : selectedCell ? `${selectedCell.label || selectedCell.name} 선택됨` : '부스를 배치할 셀 선택'}
                  </p>
                </div>
              </div>
              {selectedArea && (
                <button
                  type="button"
                  onClick={() => setShowMap(!showMap)}
                  className="flex items-center gap-1 text-xs text-[#EB0000] hover:underline"
                >
                  <MapIcon className="h-4 w-4" />
                  {showMap ? '지도 숨기기' : '지도로 선택'}
                </button>
              )}
            </div>

            {/* 셀 선택 드롭다운 */}
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
                  {cells
                    .filter((cell) => cell.status === 'APPROVED')
                    .map((cell) => (
                    <option key={cell.id} value={cell.id}>
                      {cell.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* 셀 지도 (토글) */}
            {showMap && selectedArea && (
              <div className="mt-3 h-[250px] rounded-lg overflow-hidden border border-gray-200 relative">
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
            
            {/* 선택된 셀 정보 */}
            {selectedCell && (
              <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs">✓</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{selectedCell.label || selectedCell.name}</p>
                      {selectedCell.detailedAddress && (
                        <p className="text-xs text-gray-500">📍 {selectedCell.detailedAddress}</p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCell(null);
                      setFormData((prev) => ({ ...prev, zoneCellId: null }));
                    }}
                    disabled={isLocationLocked}
                    className="text-xs text-gray-500 hover:text-red-500 disabled:text-gray-300"
                  >
                    선택 해제
                  </button>
                </div>
              </div>
            )}
          </div>
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
            <div className="flex items-center gap-2 mt-2">
              <Clock className="h-4 w-4 text-gray-400 shrink-0" />
              <select
                value={formData.openingHours?.split(' - ')[0] || '10:00'}
                onChange={(e) => {
                  const endTime = formData.openingHours?.split(' - ')[1] || '22:00';
                  setFormData(prev => ({ ...prev, openingHours: `${e.target.value} - ${endTime}` }));
                }}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-[#EB0000] focus:outline-none"
              >
                {Array.from({ length: 24 }, (_, i) => {
                  const hour = i.toString().padStart(2, '0');
                  return (
                    <option key={`start-${hour}`} value={`${hour}:00`}>{hour}:00</option>
                  );
                })}
              </select>
              <span className="text-gray-400">~</span>
              <select
                value={formData.openingHours?.split(' - ')[1] || '22:00'}
                onChange={(e) => {
                  const startTime = formData.openingHours?.split(' - ')[0] || '10:00';
                  setFormData(prev => ({ ...prev, openingHours: `${startTime} - ${e.target.value}` }));
                }}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-[#EB0000] focus:outline-none"
              >
                {Array.from({ length: 24 }, (_, i) => {
                  const hour = i.toString().padStart(2, '0');
                  return (
                    <option key={`end-${hour}`} value={`${hour}:00`}>{hour}:00</option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>

        {/* 4. 팝업 카테고리 (단일) */}
        <div>
          <label className="mb-3 block text-xs font-semibold text-gray-500">카테고리
            <span className="text-[#EB0000] ml-[3px]">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {uniqueCategories.map((cat) => (
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

        {/* 5. 스타일 (드롭다운 순위 선택) */}
        <div>
          <label className="mb-2 block text-xs font-semibold text-gray-500">
            분위기/스타일
            <span className="text-[#EB0000] ml-[3px]">*</span>
            <span className="text-[#8d8d8d] ml-[3px]">(1~3순위)</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2].map((idx) => (
              <div key={`style-${idx}`}>
                <label className="text-[10px] text-gray-400 mb-1 block">{idx + 1}순위{idx === 0 && <span className="text-[#EB0000]">*</span>}</label>
                <select
                  value={formData.styleIds[idx] || ''}
                  onChange={(e) => {
                    const newValue = e.target.value ? Number(e.target.value) : null;
                    setFormData(prev => {
                      const newIds = [...prev.styleIds];
                      if (newValue) {
                        newIds[idx] = newValue;
                      } else {
                        newIds.splice(idx, 1);
                      }
                      return { ...prev, styleIds: newIds.filter(Boolean) };
                    });
                  }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-[#EB0000] focus:outline-none"
                >
                  <option value="">선택</option>
                  {styles?.filter(s => !formData.styleIds.includes(s.id) || formData.styleIds[idx] === s.id)
                    .map((style) => (
                      <option key={style.id} value={style.id}>{style.name}</option>
                    ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* 6. 편의/특징 (드롭다운 순위 선택) */}
        <div>
          <label className="mb-2 block text-xs font-semibold text-gray-500">
            편의/특징
            <span className="text-[#EB0000] ml-[3px]">*</span>
            <span className="text-[#8d8d8d] ml-[3px]">(1~3순위)</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2].map((idx) => (
              <div key={`feature-${idx}`}>
                <label className="text-[10px] text-gray-400 mb-1 block">{idx + 1}순위{idx === 0 && <span className="text-[#EB0000]">*</span>}</label>
                <select
                  value={formData.featureIds[idx] || ''}
                  onChange={(e) => {
                    const newValue = e.target.value ? Number(e.target.value) : null;
                    setFormData(prev => {
                      const newIds = [...prev.featureIds];
                      if (newValue) {
                        newIds[idx] = newValue;
                      } else {
                        newIds.splice(idx, 1);
                      }
                      return { ...prev, featureIds: newIds.filter(Boolean) };
                    });
                  }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-[#EB0000] focus:outline-none"
                >
                  <option value="">선택</option>
                  {features?.filter(f => !formData.featureIds.includes(f.id) || formData.featureIds[idx] === f.id)
                    .map((feat) => (
                      <option key={feat.id} value={feat.id}>{feat.name}</option>
                    ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* 7. 해시태그 & 링크 */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-500">해시태그</label>
              <span className="text-[10px] text-gray-400">{formData.hashtags.length}/{INPUT_LIMITS.HASHTAGS}</span>
            </div>
            <input
              type="text"
              name="hashtags"
              value={formData.hashtags}
              onChange={handleChange}
              maxLength={INPUT_LIMITS.HASHTAGS}
              placeholder="#데이트 #핫플 (공백으로 구분)"
              className="mt-1 w-full border-b border-gray-300 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-500">홈페이지 URL</label>
              <span className="text-[10px] text-gray-400">{formData.homepageUrl.length}/{INPUT_LIMITS.URL}</span>
            </div>
            <input
              type="url"
              name="homepageUrl"
              value={formData.homepageUrl}
              onChange={handleChange}
              maxLength={INPUT_LIMITS.URL}
              placeholder="https://"
              className="mt-1 w-full border-b border-gray-300 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-500">SNS URL</label>
              <span className="text-[10px] text-gray-400">{formData.snsUrl.length}/{INPUT_LIMITS.URL}</span>
            </div>
            <input
              type="url"
              name="snsUrl"
              value={formData.snsUrl}
              onChange={handleChange}
              maxLength={INPUT_LIMITS.URL}
              placeholder="https://instagram.com/..."
              className="mt-1 w-full border-b border-gray-300 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        {/* 8. 팝업 소개 */}
        <div>
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-gray-500">
              팝업소개
              <span className="text-[#EB0000] ml-[3px]">*</span>
            </label>
            <span className="text-[10px] text-gray-400">{formData.description.length}/{INPUT_LIMITS.DESCRIPTION}</span>
          </div>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={6}
            required
            maxLength={INPUT_LIMITS.DESCRIPTION}
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
                <span className="text-[10px] text-gray-400 ml-2">(최대 5MB)</span>
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

              {/* 새 썸네일 미리보기 */}
              {formData.thumbnail && (
                <div className="mt-3 flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 p-3">
                  <img
                    src={URL.createObjectURL(formData.thumbnail)}
                    alt="새 썸네일 미리보기"
                    className="h-20 w-20 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-blue-700">새 이미지 미리보기</p>
                    <p className="text-[10px] text-blue-500 mt-0.5">{formData.thumbnail.name}</p>
                    <p className="text-[10px] text-gray-400">{(formData.thumbnail.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, thumbnail: null }))}
                    className="rounded-full bg-white p-1 text-gray-400 transition hover:bg-gray-100 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* 기존 썸네일 */}
              {existingThumbnail && !formData.thumbnail && (
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
              <label className="text-xs font-semibold text-gray-500">
                추가 이미지
                <span className="text-[10px] text-gray-400 ml-2">(최대 10장, 각 5MB)</span>
              </label>
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

              {/* 새 이미지 미리보기 */}
              {formData.images.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-blue-700 mb-2">새 이미지 미리보기 ({formData.images.length}장)</p>
                  <div className="grid grid-cols-3 gap-2 md:grid-cols-4">
                    {formData.images.map((file, idx) => (
                      <div key={`new-${idx}`} className="relative overflow-hidden rounded-lg border border-blue-200 bg-blue-50">
                        <img 
                          src={URL.createObjectURL(file)} 
                          alt={`새 이미지 ${idx + 1}`} 
                          className="h-20 w-full object-cover" 
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              images: prev.images.filter((_, i) => i !== idx)
                            }));
                          }}
                          className="absolute right-1 top-1 rounded-full bg-white/90 p-0.5 text-gray-500 hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-1 py-0.5">
                          <p className="text-[8px] text-white truncate">{file.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 기존 이미지 */}
              {existingImages.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-gray-500 mb-2">현재 등록된 이미지 ({existingImages.length}장)</p>
                  <div className="grid grid-cols-3 gap-2 md:grid-cols-4">
                    {existingImages.map((image) => (
                      <div key={image.key} className="relative overflow-hidden rounded-lg border border-gray-200">
                        <img src={image.url} alt="등록된 이미지" className="h-20 w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveExistingImage(image.key)}
                          className="absolute right-1 top-1 rounded-full bg-white/90 p-0.5 text-gray-500 hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
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
