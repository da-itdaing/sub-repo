import clsx from 'clsx';
import { Sparkles, Store } from 'lucide-react';

// 모드별 색상 테마
const THEME_COLORS = {
  consumer: {
    iconBg: 'from-rose-400 to-pink-500',
    iconShadow: 'shadow-rose-200',
    accentColor: '#F43F5E',
    userBg: 'from-rose-500 to-pink-600',
    userShadow: 'shadow-rose-200/50',
    cursor: 'bg-rose-500',
    codeBg: 'bg-rose-50 text-rose-600',
    link: 'text-rose-500 hover:text-rose-600',
    listBullet: 'text-rose-400',
    listNumber: 'text-rose-500',
    Icon: Sparkles,
  },
  seller: {
    iconBg: 'from-blue-400 to-indigo-500',
    iconShadow: 'shadow-blue-200',
    accentColor: '#3B82F6',
    userBg: 'from-blue-500 to-indigo-600',
    userShadow: 'shadow-blue-200/50',
    cursor: 'bg-blue-500',
    codeBg: 'bg-blue-50 text-blue-600',
    link: 'text-blue-500 hover:text-blue-600',
    listBullet: 'text-blue-400',
    listNumber: 'text-blue-500',
    Icon: Store,
  },
};

/**
 * 친근한 버디 아이콘 - 심플한 스마일 캐릭터
 */
const BuddyIcon = ({ accentColor = '#F43F5E' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className="h-5 w-5"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* 얼굴 - 둥근 원 */}
    <circle cx="12" cy="12" r="9" fill="white" />
    {/* 볼터치 */}
    <circle cx="7" cy="13" r="1.5" fill={accentColor} opacity="0.3" />
    <circle cx="17" cy="13" r="1.5" fill={accentColor} opacity="0.3" />
    {/* 눈 - 반짝이는 눈 */}
    <circle cx="9" cy="10" r="1.5" fill="#1F2937" />
    <circle cx="15" cy="10" r="1.5" fill="#1F2937" />
    <circle cx="9.5" cy="9.5" r="0.5" fill="white" />
    <circle cx="15.5" cy="9.5" r="0.5" fill="white" />
    {/* 입 - 활짝 웃는 미소 */}
    <path
      d="M8 14C8 14 9.5 16.5 12 16.5C14.5 16.5 16 14 16 14"
      stroke="#1F2937"
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
  
  // 0. 핵심: 마켓 정보 블록 사이에 줄바꿈 추가
  // 패턴: "- 특징: ...내용...**새마켓이름**" 또는 "- 특징: ...내용...제7회 GAC"
  // "특징:" 뒤 내용이 끝나고 새 마켓명(**bold** 또는 숫자로 시작)이 오면 줄바꿈
  result = result.replace(/(- 특징:[^\n]*?)(\*\*[^*]+\*\*)/g, '$1\n\n$2');
  result = result.replace(/(- 특징:[^\n]*?[가-힣])(제?\d+)/g, '$1\n\n$2');
  
  // 1. "문자열- 키워드:" 패턴을 "문자열\n- 키워드:" 로 변환
  for (const kw of listKeywords) {
    const regex = new RegExp(`([^\\n])-\\s*(${kw}):`, 'g');
    result = result.replace(regex, '$1\n- $2:');
  }
  
  // 2. 줄 시작의 "-한글" 패턴을 "- 한글" 형태로 정리
  result = result.replace(/^-([가-힣])/gm, '- $1');
  
  // 3. 붙어있는 리스트 항목 수정
  result = result.replace(/^-([^\s-])/gm, '- $1');
  
  // 4. 여러 개의 연속 빈 줄을 하나로 통합
  result = result.replace(/\n{3,}/g, '\n\n');
  
  // 5. 리스트 항목 앞의 불필요한 공백 제거
  result = result.replace(/^\s{1,3}(-|\d+\.)/gm, '$1');
  
  // 6. 굵은 글씨 뒤에 바로 리스트가 오면 줄바꿈 추가
  result = result.replace(/\*\*([^*]+)\*\*\s*\n-/g, '**$1**\n\n-');
  
  // 7. "•", "·", "▪" 등의 리스트 마커 변환
  result = result.replace(/^[•·▪►▸]\s*/gm, '- ');
  
  // 8. 이모지 깨짐 수정
  result = result.replace(/[\uFFFD]/g, '');
  
  // 9. 제목 뒤 바로 리스트가 오면 줄바꿈 추가
  result = result.replace(/([가-힣]+(축제|마켓|페스타|박람회|전시회|야시장|투어))\s*-\s*(위치|운영|특징):/g, '$1\n\n- $3:');
  
  // 10. **bold** 제목 앞에 줄바꿈 - 더 정교한 규칙
  // "...내용**새제목**" → "...내용\n\n**새제목**"
  // 단, 문장 종결 후에만 (마침표, 느낌표, 물음표, 이모지, 또는 특정 종결 단어)
  result = result.replace(/([.!?😊🎉✨])\s*(\*\*)/g, '$1\n\n$2');
  result = result.replace(/(요|어요|에요|니다|해요|드려요|세요)\s*(\*\*)/g, '$1\n\n$2');
  
  // 11. 특정 종결 단어 뒤에 숫자/한글 마켓명이 바로 오면 줄바꿈
  result = result.replace(/(야시장더|마켓더|축제더|투어더)/g, (match) => match.slice(0, -1) + '\n\n더');
  result = result.replace(/(행사|투어|체험|입장)([가-힣]*)(제\d+|2\d{3})/g, '$1$2\n\n$3');
  
  // 12. 마지막 정리 - 연속된 줄바꿈 정리
  result = result.replace(/\n{4,}/g, '\n\n');
  
  return result.trim();
};

/**
 * HTML 특수문자 이스케이프
 */
const escapeHtml = (text) => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};

/**
 * 간단한 마크다운 파싱 - 모드별 색상 지원
 */
const parseMarkdown = (text, theme) => {
  if (!text) return '';

  // 먼저 텍스트 정제
  const sanitized = sanitizeMarkdown(text);
  const lines = sanitized.split('\n');
  const parsed = [];

  for (let line of lines) {
    // HTML 특수문자 이스케이프 (마크다운 처리 전)
    let safeLine = escapeHtml(line);
    
    // **bold**
    safeLine = safeLine.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-800">$1</strong>');
    // `code`
    safeLine = safeLine.replace(/`([^`]+)`/g, `<code class="px-1.5 py-0.5 ${theme.codeBg} rounded text-[13px] font-mono">$1</code>`);
    // [링크](url)
    safeLine = safeLine.replace(/\[([^\]]+)\]\(([^)]+)\)/g, `<a href="$2" target="_blank" class="${theme.link} underline underline-offset-2 transition-colors">$1</a>`);

    // 리스트 처리 (- 또는 숫자. 로 시작)
    const listMatch = safeLine.match(/^(\s*)([\d]+\.|-)\s+(.+)$/);
    if (listMatch) {
      const [, , marker, content] = listMatch;
      const isOrdered = /^\d+\./.test(marker);
      const bullet = isOrdered 
        ? `<span class="${theme.listNumber} font-medium">${marker}</span>` 
        : `<span class="${theme.listBullet}">•</span>`;
      parsed.push(`<div class="flex gap-2.5 py-0.5"><span class="shrink-0 w-4 text-right">${bullet}</span><span class="text-gray-600 leading-relaxed">${content}</span></div>`);
    } else if (safeLine.trim()) {
      parsed.push(`<p class="leading-relaxed text-gray-600">${safeLine}</p>`);
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
const StreamingCursor = ({ color = 'bg-rose-500' }) => (
  <span className={`inline-block w-0.5 h-4 ${color} animate-pulse ml-0.5 align-text-bottom`} />
);

/**
 * 메시지 말풍선
 * v14: showCursor prop 추가 - 스트리밍 중 커서 표시
 * v15: mode prop 추가 - 소비자/판매자 색상 테마 지원
 */
const MessageBubble = ({ message, showCursor = false, mode = 'consumer' }) => {
  const isBot = message.sender === 'BOT';
  const theme = THEME_COLORS[mode] || THEME_COLORS.consumer;
  const htmlContent = isBot ? parseMarkdown(message.text, theme) : null;

  return (
    <div className={clsx('flex gap-2.5', isBot ? 'justify-start' : 'justify-end')}>
      {/* 버디 아바타 - 그라데이션 배경 */}
      {isBot && (
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${theme.iconBg} shadow-sm ${theme.iconShadow}`}>
          <BuddyIcon accentColor={theme.accentColor} />
        </div>
      )}

      {/* 말풍선 */}
      <div
        className={clsx(
          'max-w-[80%] text-[14px] leading-[1.6]',
          isBot
            ? 'bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm ring-1 ring-gray-100'
            : `bg-gradient-to-br ${theme.userBg} text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-md ${theme.userShadow}`,
        )}
      >
        {isBot ? (
          <div className="space-y-1">
            <span dangerouslySetInnerHTML={{ __html: htmlContent }} />
            {showCursor && <StreamingCursor color={theme.cursor} />}
          </div>
        ) : (
          <div className="whitespace-pre-wrap font-medium">{message.text}</div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
