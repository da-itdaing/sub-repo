/**
 * 챗봇 API 클라이언트
 * - 스트리밍 응답 처리
 * - AbortController를 통한 요청 취소 지원
 */

const CHATBOT_BASE_PATH = '/ai/api/chat';

/**
 * API 요청 본문 생성
 * @param {Object} params
 * @param {string} params.message - 사용자 메시지
 * @param {string} params.sessionId - 세션 ID
 * @param {string} params.threadId - 스레드 ID
 * @param {string} params.userId - 사용자 ID (로그인 또는 게스트)
 */
const buildRequestBody = ({ message, sessionId, threadId, userId }) => ({
  user_id: userId || 'web-guest',
  session_id: sessionId ?? null,
  message,
  thread_id: threadId ?? null,
  restart_thread: false,
});

/**
 * 챗봇 스트리밍 메시지 전송
 * @param {Object} params
 * @param {'consumer' | 'seller'} params.mode - 챗봇 모드
 * @param {string} params.message - 사용자 메시지
 * @param {string} params.sessionId - 세션 ID
 * @param {string} params.threadId - 스레드 ID (멀티턴 대화용)
 * @param {string} params.userId - 사용자 ID (로그인 또는 게스트)
 * @param {AbortSignal} params.signal - 요청 취소용 시그널
 * @param {Function} params.onDelta - 스트리밍 delta 콜백
 */
export async function streamChatMessage({
  mode = 'consumer',
  message,
  sessionId,
  threadId,
  userId,
  signal,
  onDelta,
}) {
  if (!message?.trim()) return;

  const endpoint =
    mode === 'seller'
      ? `${CHATBOT_BASE_PATH}/seller/async/stream`
      : `${CHATBOT_BASE_PATH}/consumer/async/stream`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(buildRequestBody({ message, sessionId, threadId, userId })),
    signal, // AbortController signal 전달
  });

  if (!response.ok || !response.body) {
    throw new Error(`chatbot stream failed (${response.status})`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        // 스트림 종료 시 남은 버퍼 처리
        buffer += decoder.decode();
        break;
      }

      buffer += decoder.decode(value, { stream: true });

      // 줄 단위로 파싱 (NDJSON 형식)
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        try {
          const json = JSON.parse(trimmed);
          onDelta?.(json);
        } catch {
          // JSON 파싱 실패는 무시 (불완전한 청크일 수 있음)
        }
      }
    }

    // 마지막 버퍼 처리
    const finalChunk = buffer.trim();
    if (finalChunk) {
      try {
        const json = JSON.parse(finalChunk);
        onDelta?.(json);
      } catch {
        // 마지막 청크 파싱 실패 무시
      }
    }
  } finally {
    // 리더 정리 (취소 시에도 실행)
    reader.releaseLock();
  }
}
