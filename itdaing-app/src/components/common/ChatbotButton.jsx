import { useCallback, useState } from 'react';
import { MessageCircle, X, Bot } from 'lucide-react';

/**
 * 공통 챗봇 버튼 UI 컴포넌트
 * - 기본 동작은 내부 상태(open)에 따라 미니 패널을 열고 닫는 것
 * - onClickOverride prop이 전달되면, 패널 대신 해당 콜백을 우선 실행한다.
 */
const ChatbotButton = ({ mode = 'floating', onClickOverride }) => {
  const [open, setOpen] = useState(false);

  const toggleOpen = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  const handleMockReply = useCallback(() => {
    alert('챗봇 기능이 여기에 연결됩니다.');
  }, []);

  // 1. 헤더 모드 (판매자 페이지 등)
  if (mode === 'header') {
    const handleClick = onClickOverride ?? toggleOpen;

    return (
      <div className="relative">
        <button
          type="button"
          onClick={handleClick}
          className="rounded-2xl border border-gray-200 p-2 text-gray-600 transition hover:border-gray-300 hover:text-primary"
          aria-label="챗봇 열기"
        >
          <Bot className="h-5 w-5" />
        </button>

        {/* onClickOverride가 있는 경우에는 내부 패널은 사용하지 않는다 */}
        {onClickOverride ? null : open && (
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
                <p>• 처음인데 어디서 시작하면 좋을까?</p>
                <p>• 사람 많은 존 추천해줘</p>
                <p>• 입점하려면 어떻게 해?</p>
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
  const handleFloatingClick = onClickOverride ?? toggleOpen;

  return (
    <div className="fixed bottom-20 md:bottom-24 left-1/2 -translate-x-1/2 w-full max-w-[540px] md:max-w-[1200px] px-5 md:px-8 pointer-events-none z-40">
      <div className="flex justify-end">
        <div className="relative pointer-events-auto">
          {/* onClickOverride가 있는 경우에는 내부 패널은 사용하지 않는다 */}
          {onClickOverride ? null : open && (
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
                <p>• 수공예품 파는 곳 없어?</p>
                <p>• 동구 쪽에 갈만한 곳 없으려나?</p>
                <p>• 강아지 데려갈 수 있는 곳!</p>
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
            onClick={handleFloatingClick}
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
