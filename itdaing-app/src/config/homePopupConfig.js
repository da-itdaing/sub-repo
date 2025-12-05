/**
 * 홈페이지 팝업 노출 설정
 * 
 * 발표/데모 시 노출되는 팝업을 제한하려면 아래 설정을 수정하세요.
 * - WHITELIST_ENABLED: true로 설정하면 화이트리스트에 있는 팝업만 노출
 * - POPUP_WHITELIST: 노출할 팝업 ID 목록
 */

// 화이트리스트 활성화 여부 (true: 화이트리스트 팝업만 노출, false: 전체 노출)
export const WHITELIST_ENABLED = false;

// 노출할 팝업 ID 목록 (WHITELIST_ENABLED가 true일 때만 적용)
// 예: [1, 2, 3, 10, 15] - 해당 ID의 팝업만 홈페이지에 노출
export const POPUP_WHITELIST = [];

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

