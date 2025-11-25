const ChatbotContent = ({ className = '' }) => {
  return (
    <section className={`text-center space-y-4 ${className}`}>
      <p className="text-sm text-primary font-semibold tracking-wide uppercase">Chatbot Beta</p>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900">AI 챗봇을 준비중이에요</h1>
      <p className="text-gray-600">
        광주 팝업 정보와 사용자 문의를 돕기 위한 AI 챗봇 기능을 개발하고 있어요. 곧 더 빠르게 정보를 찾을 수 있도록
        도와드릴게요!
      </p>
      <div className="mt-8 p-6 border border-dashed border-primary/40 rounded-2xl bg-primary/5 text-gray-700">
        <p className="font-semibold">뭐가 달라질까요?</p>
        <ul className="mt-3 space-y-2 text-sm text-gray-600 text-left">
          <li>• 팝업 일정, 위치, 편의시설을 바로 확인</li>
          <li>• 나에게 맞는 추천 코스를 대화로 탐색</li>
          <li>• 24시간 빠른 문의 응답</li>
        </ul>
      </div>
    </section>
  );
};

export default ChatbotContent;
