import clsx from 'clsx';

/**
 * 커스텀 봇 아이콘 - 더 세련된 디자인
 */
const BotIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className="h-5 w-5"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* 얼굴 */}
    <rect x="4" y="6" width="16" height="14" rx="4" fill="white" />
    {/* 눈 */}
    <circle cx="9" cy="12" r="2" fill="#EB0000" />
    <circle cx="15" cy="12" r="2" fill="#EB0000" />
    {/* 안테나 */}
    <path
      d="M12 6V3M12 3L10 5M12 3L14 5"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* 입 - 미소 */}
    <path
      d="M9 16C9 16 10.5 17.5 12 17.5C13.5 17.5 15 16 15 16"
      stroke="#EB0000"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

/**
 * 간단한 마크다운 파싱
 */
const parseMarkdown = (text) => {
  if (!text) return '';

  const lines = text.split('\n');
  const parsed = [];

  for (let line of lines) {
    // **bold**
    line = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-800">$1</strong>');
    // `code`
    line = line.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-rose-50 text-rose-600 rounded text-[13px] font-mono">$1</code>');
    // [링크](url)
    line = line.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-rose-500 underline underline-offset-2 hover:text-rose-600 transition-colors">$1</a>');

    // 리스트 처리
    const listMatch = line.match(/^(\s*)([\d]+\.|-)\s+(.+)$/);
    if (listMatch) {
      const [, , marker, content] = listMatch;
      const isOrdered = /^\d+\./.test(marker);
      const bullet = isOrdered ? `<span class="text-rose-500 font-medium">${marker}</span>` : '<span class="text-rose-400">•</span>';
      parsed.push(`<div class="flex gap-2.5 py-0.5"><span class="shrink-0 w-4 text-right">${bullet}</span><span class="text-gray-600 leading-relaxed">${content}</span></div>`);
    } else if (line.trim()) {
      parsed.push(`<p class="leading-relaxed text-gray-600">${line}</p>`);
    } else {
      parsed.push('<div class="h-2"></div>');
    }
  }

  return parsed.join('');
};

/**
 * 메시지 말풍선
 */
const MessageBubble = ({ message }) => {
  const isBot = message.sender === 'BOT';
  const htmlContent = isBot ? parseMarkdown(message.text) : null;

  return (
    <div className={clsx('flex gap-2.5', isBot ? 'justify-start' : 'justify-end')}>
      {/* 봇 아바타 - 그라데이션 배경 */}
      {isBot && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-rose-500 to-red-600 shadow-sm shadow-rose-200">
          <BotIcon />
        </div>
      )}

      {/* 말풍선 */}
      <div
        className={clsx(
          'max-w-[80%] text-[14px] leading-[1.6]',
          isBot
            ? 'bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm ring-1 ring-gray-100'
            : 'bg-linear-to-br from-rose-500 to-red-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-md shadow-rose-200/50',
        )}
      >
        {isBot ? (
          <div className="space-y-1" dangerouslySetInnerHTML={{ __html: htmlContent }} />
        ) : (
          <div className="whitespace-pre-wrap font-medium">{message.text}</div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
