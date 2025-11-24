import { useQuery } from '@tanstack/react-query';
import { getPopups, getPopupById, getPopupReviews, searchPopups } from '@/services/popupService';
import { normalizePopup, isPopupActive } from '@/utils/popupUtils';

/**
 * 팝업 목록 조회 훅
 * @param {Object} options - 추가 파라미터 (예: includeEnded)
 */
export const usePopups = (options = {}) => {
  return useQuery({
    queryKey: ['popups', options],
    queryFn: async () => {
      const data = await getPopups(options);
      const normalized = (data ?? []).map(normalizePopup);
      if (options.includeEnded) {
        return normalized;
      }
      return normalized.filter(isPopupActive);
    },
    staleTime: 5 * 60 * 1000, // 5분
  });
};

/**
 * 팝업 상세 조회 훅
 * @param {number} popupId 
 */
export const usePopupById = (popupId) => {
  return useQuery({
    queryKey: ['popup', popupId],
    queryFn: () => getPopupById(popupId),
    enabled: !!popupId && popupId > 0,
  });
};

/**
 * 팝업 리뷰 조회 훅
 * @param {number} popupId 
 */
export const usePopupReviews = (popupId) => {
  return useQuery({
    queryKey: ['popup-reviews', popupId],
    queryFn: () => getPopupReviews(popupId),
    enabled: !!popupId && popupId > 0,
  });
};

/**
 * 팝업 검색 훅
 * @param {Object} searchParams - 검색 파라미터
 */
export const useSearchPopups = (searchParams = {}) => {
  const hasParams = Object.keys(searchParams || {}).length > 0;
  return useQuery({
    queryKey: ['popups-search', searchParams],
    queryFn: () => searchPopups(searchParams),
    enabled: hasParams,
  });
};

