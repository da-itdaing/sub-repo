/**
 * 전역 입력 제한 상수
 * - 보안 및 데이터 일관성을 위한 입력 길이 제한
 * - 모든 입력 컴포넌트에서 이 상수를 참조해야 함
 */

export const INPUT_LIMITS = {
  // 일반 텍스트 필드
  DEFAULT: 500,           // 기본 입력 제한
  SHORT_TEXT: 50,         // 짧은 텍스트 (제목 등)
  MEDIUM_TEXT: 200,       // 중간 텍스트 (URL, 한줄 설명 등)
  LONG_TEXT: 2000,        // 긴 텍스트 (설명, 내용 등)
  
  // 특정 필드
  TITLE: 50,              // 제목/이름
  HASHTAGS: 100,          // 해시태그
  URL: 200,               // URL 필드
  DESCRIPTION: 2000,      // 설명/내용
  ADDRESS: 200,           // 주소
  PHONE: 20,              // 전화번호
  EMAIL: 100,             // 이메일
  
  // 채팅
  CHAT_MESSAGE: 1000,     // 챗봇 메시지
  
  // 검색
  SEARCH_QUERY: 100,      // 검색어
  
  // 리뷰/댓글
  REVIEW: 1000,           // 리뷰
  COMMENT: 500,           // 댓글
  
  // 파일
  MAX_FILE_SIZE_MB: 5,    // 파일 최대 크기 (MB)
  MAX_IMAGE_COUNT: 10,    // 최대 이미지 개수
};

/**
 * 입력값이 제한을 초과하는지 확인
 */
export const isOverLimit = (value, limit) => {
  return value && value.length > limit;
};

/**
 * 입력값을 제한에 맞게 자르기
 */
export const truncateToLimit = (value, limit) => {
  if (!value) return value;
  return value.slice(0, limit);
};

export default INPUT_LIMITS;

