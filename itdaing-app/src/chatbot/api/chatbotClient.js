const CHATBOT_BASE_PATH = '/ai/api/chat';

const buildRequestBody = ({ message, sessionId, threadId }) => ({
  user_id: 'web-guest',
  session_id: sessionId ?? null,
  message,
  thread_id: threadId ?? null,
  restart_thread: false,
});

export async function streamChatMessage({
  mode = 'consumer',
  message,
  sessionId,
  threadId,
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
    body: JSON.stringify(buildRequestBody({ message, sessionId, threadId })),
  });

  if (!response.ok || !response.body) {
    throw new Error(`chatbot stream failed (${response.status})`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      buffer += decoder.decode();
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        const json = JSON.parse(trimmed);
        onDelta?.(json);
      } catch (error) {
        console.error('Failed to parse chatbot delta', error, line);
      }
    }
  }

  const finalChunk = buffer.trim();
  if (finalChunk) {
    try {
      const json = JSON.parse(finalChunk);
      onDelta?.(json);
    } catch (error) {
      console.error('Failed to parse final chatbot delta', error, finalChunk);
    }
  }
}


