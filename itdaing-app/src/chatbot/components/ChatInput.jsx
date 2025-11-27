import { useState } from 'react';
import { SendHorizontal } from 'lucide-react';

/**
 * 채팅 입력창
 */
const ChatInput = ({ onSend, disabled }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() || disabled) return;
    onSend(text);
    setText('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-gray-100 bg-white p-4"
    >
      <div className="relative flex items-center">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="궁금한 점을 물어보세요..."
          disabled={disabled}
          className="w-full rounded-full border border-gray-200 bg-gray-50 py-3 pl-5 pr-12 text-sm focus:border-[#EB0000] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#EB0000]"
        />
        <button
          type="submit"
          disabled={!text.trim() || disabled}
          className="absolute right-2 p-2 text-[#EB0000] hover:text-[#c90000] disabled:opacity-30"
        >
          <SendHorizontal className="h-5 w-5" />
        </button>
      </div>
    </form>
  );
};

export default ChatInput;

