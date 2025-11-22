import { useQuery } from '@tanstack/react-query';
import { getCategories, getRegions, getStyles, getFeatures } from '@/services/masterService';

/**
 * 카테고리 목록 조회 훅
 */
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: 60 * 60 * 1000, // 1시간
  });
};

/**
 * 지역 목록 조회 훅
 */
export const useRegions = () => {
  return useQuery({
    queryKey: ['regions'],
    queryFn: getRegions,
    staleTime: 60 * 60 * 1000, // 1시간
  });
};

/**
 * 스타일 목록 조회 훅
 */
export const useStyles = () => {
  return useQuery({
    queryKey: ['styles'],
    queryFn: getStyles,
    staleTime: 60 * 60 * 1000, // 1시간
  });
};

/**
 * 특징 목록 조회 훅
 */
export const useFeatures = () => {
  return useQuery({
    queryKey: ['features'],
    queryFn: getFeatures,
    staleTime: 60 * 60 * 1000, // 1시간
  });
};

/**
 * 모든 마스터 데이터 조회 훅
 */
export const useMasterData = () => {
  const categories = useCategories();
  const regions = useRegions();
  const styles = useStyles();
  const features = useFeatures();

  return {
    categories: categories.data || [],
    regions: regions.data || [],
    styles: styles.data || [],
    features: features.data || [],
    isLoading: categories.isLoading || regions.isLoading || styles.isLoading || features.isLoading,
    error: categories.error || regions.error || styles.error || features.error,
  };
};

