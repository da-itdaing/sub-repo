import apiClient from '@/api/client';

/**
 * 검색어 자동완성 API (임시: searchPopups 활용)
 * 실제로는 전용 엔드포인트(/popups/suggestions)가 권장됨
 * @param {string} keyword 
 * @returns {Promise<Array>} 추천 검색어 목록
 */
export const getSearchSuggestions = async (keyword) => {
  try {
    // 임시로 검색 API를 사용하여 결과의 제목만 추출
    const response = await apiClient.get('/popups/search', {
      params: { keyword, size: 5 },
    });
    
    const items = Array.isArray(response?.content) 
      ? response.content 
      : Array.isArray(response) 
        ? response 
        : [];

    return items.map(item => ({
      id: item.id,
      title: item.title,
      category: item.category || '팝업'
    }));
  } catch (error) {
    console.error('Failed to fetch suggestions:', error);
    return [];
  }
};

