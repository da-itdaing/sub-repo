import { create } from 'zustand';

/**
 * 전역 위시리스트 상태 관리 (Zustand)
 * - 백엔드 위시 데이터와 동기화하여 카드/캐러셀/상세 페이지 간 상태를 통합
 */
export const useFavoriteStore = create((set, get) => ({
  favoriteIds: new Set(),
  hydrated: false,
  setFavorites: (ids = []) =>
    set(() => ({
      favoriteIds: new Set(ids.filter((id) => id != null)),
      hydrated: true,
    })),
  clearFavorites: () =>
    set(() => ({
      favoriteIds: new Set(),
      hydrated: false,
    })),
  addFavorite: (id) => {
    if (id == null) return;
    set((state) => {
      if (state.favoriteIds.has(id)) {
        return state;
      }
      const next = new Set(state.favoriteIds);
      next.add(id);
      return { favoriteIds: next };
    });
  },
  removeFavorite: (id) => {
    if (id == null) return;
    set((state) => {
      if (!state.favoriteIds.has(id)) {
        return state;
      }
      const next = new Set(state.favoriteIds);
      next.delete(id);
      return { favoriteIds: next };
    });
  },
  hasFavorite: (id) => get().favoriteIds.has(id),
}));

