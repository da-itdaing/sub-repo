// TODO: 실제 챗봇 백엔드 API 스펙에 맞게 구현 예정
// 공통 Axios 인스턴스를 통해 메시지 전송 / 세션 관리 등을 담당한다.

// import client from '@/api/client';

// 예시 형태만 정의 (아직 호출하지 않음)
export const sendChatMessage = async ({ sessionId, message }) => {
  // 추후 구현 시 아래 주석을 참고해서 작성
  // const response = await client.post('/api/chatbot/messages', {
  //   sessionId,
  //   message,
  // });
  // return response.data;

  // 현재는 목업 동작만 반환
  return Promise.resolve({
    sessionId: sessionId ?? 'mock-session-id',
    reply: '챗봇 백엔드 연동 전입니다. 곧 응답이 연결될 예정이에요.',
  });
};


