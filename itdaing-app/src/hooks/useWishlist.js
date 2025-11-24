import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyWishlist, addToWishlist, removeFromWishlist } from '@/services/wishlistService';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/useToast';
import { useFavoriteStore } from '@/store/favoriteStore';

/**
 * 위시리스트 조회 훅
 * @param {Object} params - 페이지네이션 파라미터
 */
export const useMyWishlist = (params = { page: 0, size: 40 }) => {
  const { isAuthenticated, role } = useAuthStore();
  const setFavorites = useFavoriteStore((state) => state.setFavorites);
  const clearFavorites = useFavoriteStore((state) => state.clearFavorites);
  const { addToast } = useToast();
  const isConsumer = isAuthenticated && role === 'CONSUMER';

  const queryResult = useQuery({
    queryKey: ['my-wishlist', params],
    queryFn: () => getMyWishlist(params),
    enabled: isConsumer,
    retry: false,
    onError: (error) => {
      addToast({
        title: '관심 목록을 불러오지 못했습니다.',
        description: error?.message || '잠시 후 다시 시도해주세요.',
        variant: 'error',
      });
    },
  });

  useEffect(() => {
    if (!isConsumer) {
      clearFavorites();
      return;
    }
    const items = queryResult.data?.content ?? [];
    if (items.length === 0) {
      setFavorites([]);
      return;
    }
    const ids = items
      .map((item) => {
        if (!item) return null;
        if (item.popup?.id) return item.popup.id;
        return item.id ?? item.popupId ?? null;
      })
      .filter((id) => id != null);
    setFavorites(ids);
  }, [isConsumer, queryResult.data, clearFavorites, setFavorites]);

  return queryResult;
};

/**
 * 위시리스트 추가 mutation
 */
export const useAddToWishlist = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (popupId) => addToWishlist(popupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['popups'] });
      addToast({ title: '관심 목록에 추가되었습니다.' });
    },
    onError: (error) => {
      console.error('Add to wishlist error:', error);
      addToast({
        title: '관심 목록 추가 실패',
        description: error.message || '다시 시도해주세요.',
        variant: 'error',
      });
    },
  });
};

/**
 * 위시리스트 제거 mutation
 */
export const useRemoveFromWishlist = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (popupId) => removeFromWishlist(popupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['popups'] });
      addToast({ title: '관심 목록에서 제거되었습니다.' });
    },
    onError: (error) => {
      console.error('Remove from wishlist error:', error);
      addToast({
        title: '관심 목록 제거 실패',
        description: error.message || '다시 시도해주세요.',
        variant: 'error',
      });
    },
  });
};

