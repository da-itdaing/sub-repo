/**
 * 홈페이지 팝업 노출 설정
 * 
 * 발표/데모 시 노출되는 팝업을 제한하려면 아래 설정을 수정하세요.
 * - WHITELIST_ENABLED: true로 설정하면 화이트리스트에 있는 팝업만 노출
 * - POPUP_WHITELIST: 노출할 팝업 ID 목록
 */

// 화이트리스트 활성화 여부 (true: 화이트리스트 팝업만 노출, false: 전체 노출)
export const WHITELIST_ENABLED = true;

// 노출할 팝업 ID 목록 (WHITELIST_ENABLED가 true일 때만 적용)
// seed_mainhome_flea.py 스크립트로 삽입된 플리마켓 데이터 ID (2025-12-05 업데이트)
export const POPUP_WHITELIST = [
  1934, 1935, 1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944, 1945,
  1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953, 1954, 1955, 1956, 1957,
  1958, 1959, 1960, 1961, 1962, 1963, 1964, 1965, 1966, 1967, 1968, 1969,
  1970, 1971, 1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979
];

/**
 * 캐러셀 설정
 * 
 * 메인 홈 캐러셀에 노출할 팝업 ID 목록
 * - CAROUSEL_IDS: 캐러셀에 표시할 팝업 ID (순서대로 표시)
 * - 빈 배열이면 기존 로직대로 인기 팝업 표시
 * 
 * 아래 ID를 수정하여 캐러셀에 표시할 팝업을 선택하세요:
 * - 대인예술시장 만원의 행복: 1934
 * - 남도달밤야시장 시즌3탄: 1935
 * - 주말은 청춘: 1936
 * - 아트&플리마켓: 1937
 * - 완전럭키비키잖아: 1938
 * - 지구농장터: 1939
 * - 충장로 플리마켓: 1959
 * - 동명동 예술골목 플리마켓: 1961
 * - 송정역시장 플리마켓: 1955
 * - 아시아 컬처마켓: 1954
 */
export const CAROUSEL_IDS = [1934, 1935, 1936, 1937, 1938];

/**
 * 캐러셀 필터 함수
 * @param {Array} popups - 팝업 목록
 * @returns {Array} - 캐러셀용 팝업 목록
 */
export const getCarouselPopups = (popups) => {
  if (!CAROUSEL_IDS || CAROUSEL_IDS.length === 0) {
    // 캐러셀 ID가 비어있으면 기존 로직 (인기순 상위 5개)
    return [...popups].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0)).slice(0, 5);
  }
  // 캐러셀 ID 순서대로 팝업 정렬
  const carouselMap = new Map(popups.map(p => [p.id, p]));
  return CAROUSEL_IDS
    .filter(id => carouselMap.has(id))
    .map(id => carouselMap.get(id));
};

/**
 * 화이트리스트 필터 함수
 * @param {Array} popups - 팝업 목록
 * @returns {Array} - 필터링된 팝업 목록
 */
export const filterByWhitelist = (popups) => {
  if (!WHITELIST_ENABLED || POPUP_WHITELIST.length === 0) {
    return popups;
  }
  return popups.filter((popup) => POPUP_WHITELIST.includes(popup.id));
};

