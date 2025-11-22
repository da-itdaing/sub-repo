/**
 * JWT 토큰 localStorage 관리 유틸리티
 */

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

/**
 * Access Token을 가져옵니다
 * @returns {string | null}
 */
export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

/**
 * Refresh Token을 가져옵니다
 * @returns {string | null}
 */
export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * Access Token과 Refresh Token을 저장합니다
 * @param {string} accessToken 
 * @param {string} refreshToken 
 */
export function setTokens(accessToken, refreshToken) {
  if (accessToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  }
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

/**
 * Access Token만 저장합니다
 * @param {string} accessToken 
 */
export function setAccessToken(accessToken) {
  if (accessToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  }
}

/**
 * 모든 토큰을 삭제합니다
 */
export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

/**
 * 토큰이 존재하는지 확인합니다
 * @returns {boolean}
 */
export function hasTokens() {
  return !!getAccessToken();
}

