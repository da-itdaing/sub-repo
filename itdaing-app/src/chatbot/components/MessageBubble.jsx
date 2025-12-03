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
 * 마크다운 텍스트 정제 - 깨진 포맷 수정
 * LLM 응답에서 자주 발생하는 포맷 문제 해결
 */
const sanitizeMarkdown = (text) => {
  if (!text) return '';
  
  let result = text;
  
  // 핵심: 챗봇 응답에서 자주 사용되는 키워드 앞에 줄바꿈 추가
  const listKeywords = [
    '위치', '운영', '기간', '특징', '주소', '대여료', '시간', 
    '가격', '요금', '입장료', '날짜', '장소', '안내', '참고',
    '영업', '오픈', '마감', '휴무', '예약', '문의', '연락처'
  ];
  
  // 1. "문자열- 키워드:" 패턴을 "문자열\n- 키워드:" 로 변환
  // 예: "E-5- 운영:" → "E-5\n- 운영:"
  for (const kw of listKeywords) {
    // 키워드 앞에 "-"가 있고, 그 앞에 줄바꿈이 아닌 문자가 있으면 줄바꿈 추가
    const regex = new RegExp(`([^\\n])-\\s*(${kw}):`, 'g');
    result = result.replace(regex, '$1\n- $2:');
  }
  
  // 2. 줄 시작의 "-한글" 패턴을 "- 한글" 형태로 정리 (공백 추가)
  result = result.replace(/^-([가-힣])/gm, '- $1');
  
  // 3. 붙어있는 리스트 항목 수정: "-영문" → "- 영문"
  result = result.replace(/^-([^\s-])/gm, '- $1');
  
  // 4. 여러 개의 연속 빈 줄을 하나로 통합
  result = result.replace(/\n{3,}/g, '\n\n');
  
  // 5. 리스트 항목 앞의 불필요한 공백(1-3칸) 제거
  result = result.replace(/^\s{1,3}(-|\d+\.)/gm, '$1');
  
  // 6. 굵은 글씨 뒤에 바로 리스트가 오면 줄바꿈 추가
  result = result.replace(/\*\*([^*]+)\*\*\s*\n-/g, '**$1**\n\n-');
  
  // 7. "•", "·", "▪" 등의 리스트 마커를 "-" 리스트로 변환
  result = result.replace(/^[•·▪►▸]\s*/gm, '- ');
  
  // 8. 이모지 깨짐 수정 (불완전한 UTF-8)
  result = result.replace(/[\uFFFD]/g, '');
  
  // 9. 제목 뒤 바로 리스트가 오면 줄바꿈 추가
  result = result.replace(/([가-힣]+(축제|마켓|페스타|박람회|전시회|야시장))\s*-\s*([가-힣]+):/g, '$1\n- $3:');
  
  return result.trim();
};

/**
 * 간단한 마크다운 파싱
 */
const parseMarkdown = (text) => {
  if (!text) return '';

  // 먼저 텍스트 정제
  const sanitized = sanitizeMarkdown(text);
  const lines = sanitized.split('\n');
  const parsed = [];

  for (let line of lines) {
    // **bold**
    line = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-800">$1</strong>');
    // `code`
    line = line.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-rose-50 text-rose-600 rounded text-[13px] font-mono">$1</code>');
    // [링크](url)
    line = line.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-rose-500 underline underline-offset-2 hover:text-rose-600 transition-colors">$1</a>');

    // 리스트 처리 (- 또는 숫자. 로 시작)
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
 * 스트리밍 커서 - 텍스트가 입력되고 있음을 표시
 * v14: 실제 토큰 스트리밍 중 깜빡이는 커서
 */
const StreamingCursor = () => (
  <span className="inline-block w-0.5 h-4 bg-rose-500 animate-pulse ml-0.5 align-text-bottom" />
);

/**
 * 메시지 말풍선
 * v14: showCursor prop 추가 - 스트리밍 중 커서 표시
 */
const MessageBubble = ({ message, showCursor = false }) => {
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
          <div className="space-y-1">
            <span dangerouslySetInnerHTML={{ __html: htmlContent }} />
            {showCursor && <StreamingCursor />}
          </div>
        ) : (
          <div className="whitespace-pre-wrap font-medium">{message.text}</div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
