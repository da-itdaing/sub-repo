import { useRef, useState, useCallback, useEffect, useImperativeHandle, forwardRef } from 'react';
import { ArrowUp } from 'lucide-react';

/**
 * 채팅 입력창 - 모던 & 미니멀
 * - ref를 통해 외부에서 focus() 호출 가능
 */
const ChatInput = forwardRef(({ onSend, disabled }, ref) => {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

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
    setText(e.target.value);
    adjustHeight();
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

  const canSubmit = text.trim().length > 0 && !disabled;

  return (
    <div className="bg-white border-t border-rose-100/50 px-4 py-3 safe-area-pb">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-end gap-2 bg-gray-50 rounded-2xl p-1.5 ring-1 ring-gray-200 focus-within:ring-2 focus-within:ring-rose-400 focus-within:bg-white transition-all">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="메시지를 입력하세요..."
            disabled={disabled}
            rows={1}
            className="flex-1 resize-none bg-transparent px-3 py-2.5 text-[14px] text-gray-800 placeholder:text-gray-400 focus:outline-none disabled:opacity-50"
            style={{ minHeight: '40px', maxHeight: '120px' }}
          />
          <button
            type="submit"
            disabled={!canSubmit}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${
              canSubmit
                ? 'bg-linear-to-br from-rose-500 to-red-600 text-white shadow-md shadow-rose-200/50 hover:shadow-lg hover:shadow-rose-300/50 active:scale-95'
                : 'bg-gray-200 text-gray-400'
            }`}
          >
            <ArrowUp className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>
      </form>
      
      {/* 안내 텍스트 */}
      <div className="flex items-center justify-center gap-4 mt-2">
        <span className="text-[10px] text-gray-300">
          Enter 전송 • Shift+Enter 줄바꿈
        </span>
      </div>
    </div>
  );
};

ChatInput.displayName = 'ChatInput';

export default ChatInput;
