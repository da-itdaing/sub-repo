import clsx from 'clsx';
import { Bot, User } from 'lucide-react';

/**
 * 간단한 마크다운 렌더링 헬퍼
 * - **text** → <strong class="font-semibold">text</strong>
 * - 리스트(1., 2., -) → 들여쓰기/불릿
 * - 줄바꿈 보존
 */
const parseMarkdown = (text) => {
  if (!text) return '';

  const lines = text.split('\n');
  const parsed = [];

  for (let line of lines) {
    // **bold** 처리
    line = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>');

    // 리스트 항목 처리 (예: "1. ", "2. ", "- ")
    const listMatch = line.match(/^(\s*)([\d]+\.|-)\s+(.+)$/);
    if (listMatch) {
      const [, , marker, content] = listMatch;
      const isOrdered = /^\d+\./.test(marker);
      const bullet = isOrdered ? `${marker}` : '•';
      parsed.push(
        `<div class="ml-3 my-1.5 flex gap-2"><span class="text-gray-600 font-medium shrink-0">${bullet}</span><span class="flex-1">${content}</span></div>`
      );
    } else if (line.trim()) {
      parsed.push(`<div class="my-1">${line}</div>`);
    } else {
      parsed.push('<div class="my-0.5"></div>');
    }
  }

  return parsed.join('');
};

/**
 * 개별 메시지 말풍선
 */
const MessageBubble = ({ message }) => {
  const isBot = message.sender === 'BOT';
  const htmlContent = isBot ? parseMarkdown(message.text) : null;

  return (
    <div className={clsx('flex gap-3', isBot ? 'justify-start' : 'justify-end')}>
      {/* 봇 프로필 아이콘 */}
      {isBot && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-[#EB0000]">
          <Bot className="h-5 w-5" />
        </div>
      )}

      <div
        className={clsx(
          'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm',
          isBot
            ? 'rounded-tl-none bg-white text-gray-800 border border-gray-100'
            : 'rounded-tr-none bg-[#EB0000] text-white'
        )}
      >
        {isBot ? (
          <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
        ) : (
          <div>{message.text}</div>
        )}
      </div>

      {/* 유저일 때 (선택사항) */}
      {!isBot && (
        <div className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 md:flex">
          <User className="h-5 w-5" />
        </div>
      )}
    </div>
  );
};

export default MessageBubble;

