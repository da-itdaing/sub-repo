import clsx from 'clsx';
import { Bot, User } from 'lucide-react';

/**
 * 개별 메시지 말풍선
 */
const MessageBubble = ({ message }) => {
  const isBot = message.sender === 'BOT';

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
        {message.text}
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

