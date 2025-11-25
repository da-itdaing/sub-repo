import { useCallback, useState } from 'react';
import { MessageCircle, X, Bot } from 'lucide-react';

const ChatbotButton = ({ mode = 'floating' }) => {
  const [open, setOpen] = useState(false);

  const toggleOpen = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  const handleMockReply = useCallback(() => {
    alert('챗봇 기능이 여기에 연결됩니다.');
  }, []);

  // 1. 헤더 모드 (판매자 페이지 등)
  if (mode === 'header') {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={toggleOpen}
          className="rounded-2xl border border-gray-200 p-2 text-gray-600 transition hover:border-gray-300 hover:text-primary"
          aria-label="챗봇 열기"
        >
          <Bot className="h-5 w-5" />
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-2 w-80 z-50 bg-white rounded-2xl shadow-xl border border-gray-100 origin-top-right">
             <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <p className="text-sm font-semibold text-gray-900">다잇다잉 챗봇</p>
                <p className="text-xs text-gray-500">무엇을 도와드릴까요?</p>
              </div>
              <button
                type="button"
                onClick={toggleOpen}
                className="p-1 text-gray-400 hover:text-gray-600"
                aria-label="챗봇 닫기"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-5 py-4 space-y-3 text-sm text-gray-700">
              <p>• 오늘 열리는 팝업 알려줘</p>
              <p>• 내 팝업 노출 통계 보여줘</p>
              <p>• 팝업 등록 가이드 알려줘</p>
            </div>

            <div className="px-5 pb-5">
              <button
                type="button"
                onClick={handleMockReply}
                className="w-full rounded-xl bg-[#EB0000] text-white text-sm font-semibold py-3 hover:bg-[#d60000] transition-colors"
              >
                챗봇 시작하기
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 2. 플로팅 모드 (소비자 메인 페이지 등)
  return (
    <div className="fixed bottom-20 md:bottom-24 left-1/2 -translate-x-1/2 w-full max-w-[540px] md:max-w-[1200px] px-5 md:px-8 pointer-events-none z-40">
      <div className="flex justify-end">
        <div className="relative pointer-events-auto">
          {open && (
            <div className="absolute bottom-16 right-0 w-72 max-w-[calc(100vw-2.5rem)] md:max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-100">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div>
                  <p className="text-sm font-semibold text-gray-900">다잇다잉 챗봇</p>
                  <p className="text-xs text-gray-500">무엇을 도와드릴까요?</p>
                </div>
                <button
                  type="button"
                  onClick={toggleOpen}
                  className="p-1 text-gray-400 hover:text-gray-600"
                  aria-label="챗봇 닫기"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="px-5 py-4 space-y-3 text-sm text-gray-700">
                <p>• 오늘 열리는 팝업 알려줘</p>
                <p>• 광산구에서 진행 중인 이벤트 추천해줘</p>
                <p>• 내 관심사에 맞는 팝업 찾아줘</p>
              </div>

              <div className="px-5 pb-5">
                <button
                  type="button"
                  onClick={handleMockReply}
                  className="w-full rounded-xl bg-[#EB0000] text-white text-sm font-semibold py-3 hover:bg-[#d60000] transition-colors"
                >
                  챗봇 시작하기
                </button>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={toggleOpen}
            className="w-12 h-12 md:w-14 md:h-14 bg-[#EB0000] text-white rounded-full shadow-lg hover:bg-[#d60000] transition-colors flex items-center justify-center"
            aria-label="챗봇 열기"
            aria-expanded={open}
          >
            <MessageCircle className="w-6 h-6 md:w-7 md:h-7" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatbotButton;
