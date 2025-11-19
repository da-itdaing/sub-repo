/**
 * 토큰 저장소 관리 유틸리티
 * 모든 토큰 접근은 이 유틸리티를 통해서만 수행합니다.
 */

const ACCESS_TOKEN_KEY = "itdaing_access_token";
const REFRESH_TOKEN_KEY = "itdaing_refresh_token";

/**
 * Access Token 조회
 */
export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

/**
 * Refresh Token 조회
 */
export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * Access Token 저장
 */
export function setAccessToken(token) {
  if (token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }
}

/**
 * Refresh Token 저장
 */
export function setRefreshToken(token) {
  if (token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

/**
 * 두 토큰을 한 번에 설정
 */
export function setTokens(accessToken, refreshToken) {
  setAccessToken(accessToken);
  setRefreshToken(refreshToken);
}

/**
 * 모든 토큰 제거
 */
export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

/**
 * 인증 상태 확인 (Access Token 존재 여부)
 */
export function isAuthenticated() {
  return !!getAccessToken();
}

