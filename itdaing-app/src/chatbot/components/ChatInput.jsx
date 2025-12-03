import { useRef, useState, useCallback, useEffect, useImperativeHandle, forwardRef } from 'react';
import { ArrowUp, CornerDownLeft } from 'lucide-react';
import { INPUT_LIMITS } from '@/constants/inputLimits';

/**
 * 터치 디바이스 감지 (모바일/태블릿)
 * - 'ontouchstart' in window: 터치 이벤트 지원 여부
 * - navigator.maxTouchPoints: 멀티터치 포인트 수
 */
const isTouchDevice = () => {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

/**
 * 채팅 입력창 - 모던 & 미니멀
 * - ref를 통해 외부에서 focus() 호출 가능
 * - 입력 길이 제한: 1000자
 * - 모바일: 줄바꿈 버튼 표시 (Shift+Enter 대체)
 */
const ChatInput = forwardRef(({ onSend, disabled, mode = 'consumer' }, ref) => {
  const [text, setText] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const MAX_LENGTH = INPUT_LIMITS.CHAT_MESSAGE;
  const textareaRef = useRef(null);

  // 컴포넌트 마운트 시 디바이스 타입 감지
  useEffect(() => {
    setIsMobile(isTouchDevice());
  }, []);

  // 외부에서 focus 호출 가능하도록 expose
  useImperativeHandle(ref, () => ({
    focus: () => {
      textareaRef.current?.focus();
    },
  }));

  // disabled가 false로 바뀌면 (응답 완료) 자동 포커스
  useEffect(() => {
    if (!disabled && textareaRef.current) {
      // 약간의 딜레이 후 포커스 (모바일 키보드 이슈 방지)
      const timer = setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [disabled]);

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  }, []);

  const handleChange = (e) => {
    const value = e.target.value;
    // 최대 길이 제한
    if (value.length <= MAX_LENGTH) {
      setText(value);
    adjustHeight();
    }
  };

  const handleSubmit = useCallback(
    (e) => {
      e?.preventDefault();
      const trimmed = text.trim();
      if (!trimmed || disabled) return;

      onSend(trimmed);
      setText('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    },
    [text, disabled, onSend],
  );

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  /**
   * 모바일용 줄바꿈 삽입
   * - 현재 커서 위치에 줄바꿈 문자 삽입
   */
  const handleInsertNewline = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = text.substring(0, start) + '\n' + text.substring(end);

    if (newText.length <= MAX_LENGTH) {
      setText(newText);
      // 커서 위치를 줄바꿈 다음으로 이동
      requestAnimationFrame(() => {
        textarea.selectionStart = start + 1;
        textarea.selectionEnd = start + 1;
        adjustHeight();
        textarea.focus();
      });
    }
  }, [text, MAX_LENGTH, adjustHeight]);

  const canSubmit = text.trim().length > 0 && !disabled;

  // 모드에 따른 색상 테마
  const themeColors = mode === 'seller' 
    ? {
        ring: 'focus-within:ring-blue-400',
        button: 'from-blue-500 to-cyan-600',
        shadow: 'shadow-blue-200/50 hover:shadow-blue-300/50',
      }
    : {
        ring: 'focus-within:ring-rose-400',
        button: 'from-rose-500 to-red-600',
        shadow: 'shadow-rose-200/50 hover:shadow-rose-300/50',
      };

  return (
    <div className="bg-white border-t border-rose-100/50 px-4 py-3 safe-area-pb">
      <form onSubmit={handleSubmit} className="relative">
        <div className={`flex items-end gap-2 bg-gray-50 rounded-2xl p-1.5 ring-1 ring-gray-200 focus-within:ring-2 ${themeColors.ring} focus-within:bg-white transition-all`}>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="메시지를 입력하세요..."
            disabled={disabled}
            rows={1}
            maxLength={MAX_LENGTH}
            className="flex-1 resize-none bg-transparent px-3 py-2.5 text-[14px] text-gray-800 placeholder:text-gray-400 focus:outline-none disabled:opacity-50"
            style={{ minHeight: '40px', maxHeight: '120px' }}
          />
          
          {/* 모바일 전용 줄바꿈 버튼 */}
          {isMobile && (
            <button
              type="button"
              onClick={handleInsertNewline}
              disabled={disabled}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all disabled:opacity-50"
              aria-label="줄바꿈"
              title="줄바꿈"
            >
              <CornerDownLeft className="h-4 w-4" strokeWidth={2} />
            </button>
          )}
          
          <button
            type="submit"
            disabled={!canSubmit}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${
              canSubmit
                ? `bg-gradient-to-br ${themeColors.button} text-white shadow-md ${themeColors.shadow} active:scale-95`
                : 'bg-gray-200 text-gray-400'
            }`}
          >
            <ArrowUp className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>
      </form>
      
      {/* 안내 텍스트 + 글자수 */}
      <div className="flex items-center justify-between mt-2 px-1">
        <span className="text-[10px] text-gray-300">
          {isMobile ? (
            // 모바일: 줄바꿈 버튼 안내
            <span className="flex items-center gap-1">
              <CornerDownLeft className="h-3 w-3" /> 줄바꿈
            </span>
          ) : (
            // 데스크톱: 키보드 단축키 안내
            'Enter 전송 • Shift+Enter 줄바꿈'
          )}
        </span>
        <span className={`text-[10px] ${text.length > MAX_LENGTH * 0.9 ? 'text-red-400' : 'text-gray-300'}`}>
          {text.length}/{MAX_LENGTH}
        </span>
      </div>
    </div>
  );
});

ChatInput.displayName = 'ChatInput';

export default ChatInput;
