/**
 * 챗봇 상황별 모션 그래픽 컴포넌트
 * - thinking: 기본 로딩
 * - searching: 플리마켓/존 검색 중
 * - analyzing: 상권 분석 중 (판매자용)
 * - recommending: 추천 생성 중
 * - error: 오류 발생
 * - greeting: 인사/환영
 * 
 * v16: mode별 색상 테마 지원 (consumer: 빨강, seller: 파랑)
 */

// 모드별 색상 테마
const THEME = {
  consumer: {
    primary: '#F43F5E',     // rose-500
    secondary: '#FB7185',   // rose-400
    gradient: 'from-rose-400 to-pink-500',
    gradientDark: 'from-rose-500 to-pink-600',
    text: 'text-rose-500',
    bg: 'bg-rose-400',
    bgLight: 'bg-rose-300',
    shadow: 'shadow-rose-200',
    particle: 'bg-rose-300',
  },
  seller: {
    primary: '#3B82F6',     // blue-500
    secondary: '#60A5FA',   // blue-400
    gradient: 'from-blue-400 to-indigo-500',
    gradientDark: 'from-blue-500 to-indigo-600',
    text: 'text-blue-500',
    bg: 'bg-blue-400',
    bgLight: 'bg-blue-300',
    shadow: 'shadow-blue-200',
    particle: 'bg-blue-300',
  },
};

/**
 * 친근한 버디 아이콘 (공통)
 */
export const BuddyIcon = ({ mode = 'consumer' }) => {
  const theme = THEME[mode] || THEME.consumer;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 얼굴 - 둥근 원 */}
      <circle cx="12" cy="12" r="9" fill="white" />
      {/* 볼터치 */}
      <circle cx="7" cy="13" r="1.5" fill={theme.primary} opacity="0.3" />
      <circle cx="17" cy="13" r="1.5" fill={theme.primary} opacity="0.3" />
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
};

// 하위 호환을 위한 BotIcon alias
export const BotIcon = BuddyIcon;

/**
 * 걷는 사람 아이콘 (플리마켓 분위기)
 */
const WalkingPerson = ({ delay = 0, direction = 'right', mode = 'consumer' }) => {
  const theme = THEME[mode] || THEME.consumer;
  return (
    <svg
      viewBox="0 0 32 48"
      className="absolute h-6 w-4"
      style={{
        animation: `${direction === 'right' ? 'walkRight' : 'walkLeft'} 4s linear infinite`,
        animationDelay: `${delay}s`,
        bottom: '4px',
      }}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="16" cy="6" r="5" fill="#374151" />
      <path d="M16 11 L16 26" stroke="#374151" strokeWidth="3" strokeLinecap="round" />
      <path
        d="M16 15 L10 22 M16 15 L22 20"
        stroke="#374151"
        strokeWidth="2.5"
        strokeLinecap="round"
        style={{ animation: 'armSwing 0.5s ease-in-out infinite alternate' }}
      />
      <path
        d="M16 26 L12 38 M16 26 L20 38"
        stroke="#374151"
        strokeWidth="2.5"
        strokeLinecap="round"
        style={{ animation: 'legWalk 0.5s ease-in-out infinite alternate' }}
      />
      <rect
        x="6"
        y="19"
        width="6"
        height="8"
        rx="1"
        fill={theme.primary}
        style={{ animation: 'bagSwing 0.5s ease-in-out infinite alternate' }}
      />
    </svg>
  );
};

/**
 * 1. ThinkingMotion - 기본 로딩
 */
export const ThinkingMotion = ({ message = '생각하고 있어요', mode = 'consumer' }) => {
  const theme = THEME[mode] || THEME.consumer;
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-5 px-4">
      <div className="relative w-14 h-14 mb-2">
        <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${theme.gradientDark} ${theme.shadow}/50 shadow-lg`} />
        <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${theme.gradientDark} animate-ping opacity-20`} />
        <svg
          viewBox="0 0 56 56"
          className="absolute inset-0 w-full h-full p-1"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="28" cy="14" r="6" fill="white" />
          <path
            d="M28 20 C28 20 22 28 24 38 C25 42 31 42 32 38 C34 28 28 20 28 20"
            fill="white"
          />
          <path
            d="M24 24 C20 20 16 18 14 20"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
            style={{ animation: 'armWave 1s ease-in-out infinite' }}
          />
          <path
            d="M32 24 C36 28 40 30 42 28"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
            style={{ animation: 'armWave 1s ease-in-out infinite 0.5s' }}
          />
          <path d="M26 38 L22 50" stroke="white" strokeWidth="4" strokeLinecap="round" />
          <path d="M30 38 L36 48" stroke="white" strokeWidth="4" strokeLinecap="round" />
        </svg>
      </div>
      <div className="relative w-32 h-8 overflow-hidden">
        <div className="absolute bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
        <WalkingPerson delay={0} direction="right" mode={mode} />
        <WalkingPerson delay={1.5} direction="left" mode={mode} />
        <WalkingPerson delay={3} direction="right" mode={mode} />
      </div>
      <p className="text-sm font-medium text-gray-600">{message}</p>
    </div>
  );
};

/**
 * 2. SearchingMotion - 플리마켓/존 검색 중
 */
export const SearchingMotion = ({ message = '플리마켓을 찾고 있어요', mode = 'consumer' }) => {
  const theme = THEME[mode] || THEME.consumer;
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-5 px-4">
      <div className="relative w-16 h-16">
        {/* 돋보기 */}
        <svg
          viewBox="0 0 64 64"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ animation: 'searchBounce 1.5s ease-in-out infinite' }}
        >
          <circle
            cx="26"
            cy="26"
            r="14"
            stroke={theme.primary}
            strokeWidth="4"
            fill="white"
          />
          <path
            d="M36 36 L48 48"
            stroke={theme.primary}
            strokeWidth="5"
            strokeLinecap="round"
          />
          {/* 돋보기 안에 부스/존 아이콘 */}
          <g style={{ animation: 'fadeInOut 1s ease-in-out infinite' }}>
            {mode === 'consumer' ? (
              // 소비자: 텐트 아이콘
              <path
                d="M26 18 L18 30 H34 L26 18Z M22 30 V34 M30 30 V34"
                stroke="#374151"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            ) : (
              // 판매자: 핀/위치 아이콘
              <path
                d="M26 18 C22 18 19 21 19 25 C19 30 26 36 26 36 C26 36 33 30 33 25 C33 21 30 18 26 18Z"
                stroke="#374151"
                strokeWidth="2"
                fill="none"
              />
            )}
          </g>
        </svg>
        {/* 파티클 효과 */}
        <span className={`absolute top-0 left-0 w-2 h-2 ${theme.particle} rounded-full animate-ping opacity-60`} style={{ animationDelay: '0s' }} />
        <span className={`absolute top-2 right-1 w-1.5 h-1.5 ${theme.bg} rounded-full animate-ping opacity-60`} style={{ animationDelay: '0.3s' }} />
        <span className={`absolute bottom-4 left-1 w-1.5 h-1.5 ${theme.particle} rounded-full animate-ping opacity-60`} style={{ animationDelay: '0.6s' }} />
      </div>
      <div className="text-center space-y-0.5">
        <p className="text-sm font-medium text-gray-700">{message}</p>
        <p className="text-[11px] text-gray-400">잠시만 기다려주세요 ✨</p>
      </div>
    </div>
  );
};

/**
 * 3. AnalyzingMotion - 상권 분석 중 (판매자 전용)
 */
export const AnalyzingMotion = ({ message = '상권 데이터를 분석하고 있어요', mode = 'seller' }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-5 px-4">
    <div className="relative w-20 h-16">
      {/* 차트 바 애니메이션 */}
      <div className="flex items-end justify-center gap-1.5 h-full">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="w-3 bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t"
            style={{
              animation: 'chartBar 1s ease-in-out infinite',
              animationDelay: `${i * 0.15}s`,
              height: '20px',
            }}
          />
        ))}
      </div>
      {/* 분석 선 */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 80 64"
        fill="none"
      >
        <path
          d="M5 50 Q20 30 40 35 Q60 40 75 20"
          stroke="#3b82f6"
          strokeWidth="2"
          strokeDasharray="4 2"
          style={{ animation: 'drawLine 2s linear infinite' }}
        />
      </svg>
    </div>
    <div className="text-center space-y-0.5">
      <p className="text-sm font-medium text-gray-700">{message}</p>
      <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          유동인구
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
          상권등급
        </span>
      </div>
    </div>
  </div>
);

/**
 * 4. RecommendingMotion - 추천 생성 중
 */
export const RecommendingMotion = ({ message = '맞춤 추천을 준비하고 있어요', mode = 'consumer' }) => {
  const theme = THEME[mode] || THEME.consumer;
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-5 px-4">
      <div className="relative w-16 h-16">
        {/* 중앙 하트/별 */}
        <div 
          className={`absolute inset-0 flex items-center justify-center text-3xl ${theme.text}`}
          style={{ animation: 'heartbeat 1s ease-in-out infinite' }}
        >
          {mode === 'consumer' ? '❤️' : '⭐'}
        </div>
        {/* 주변 파티클 */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className={`absolute w-2 h-2 rounded-full ${theme.particle}`}
            style={{
              animation: 'sparkle 1.5s ease-out infinite',
              animationDelay: `${i * 0.25}s`,
              top: '50%',
              left: '50%',
              transform: `rotate(${i * 60}deg) translateY(-24px)`,
            }}
          />
        ))}
      </div>
      <div className="text-center space-y-0.5">
        <p className="text-sm font-medium text-gray-700">{message}</p>
        <p className="text-[11px] text-gray-400">
          {mode === 'consumer' ? '취향에 맞는 팝업을 찾고 있어요' : '최적의 존을 선별하고 있어요'}
        </p>
      </div>
    </div>
  );
};

/**
 * 5. ErrorMotion - 오류 발생
 */
export const ErrorMotion = ({ message = '문제가 발생했어요', onRetry, mode = 'consumer' }) => {
  const theme = THEME[mode] || THEME.consumer;
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-5 px-4">
      <div className="relative w-14 h-14">
        {/* 배경 원 */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-100 to-rose-100" />
        {/* 느낌표 아이콘 */}
        <svg
          viewBox="0 0 56 56"
          className="absolute inset-0 w-full h-full p-3"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ animation: 'shake 0.5s ease-in-out' }}
        >
          <circle cx="28" cy="28" r="20" stroke="#ef4444" strokeWidth="3" fill="none" />
          <path
            d="M28 18 V32"
            stroke="#ef4444"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="28" cy="38" r="2" fill="#ef4444" />
        </svg>
      </div>
      <div className="text-center space-y-2">
        <p className="text-sm font-medium text-gray-700">{message}</p>
        <p className="text-[11px] text-gray-400">잠시 후 다시 시도해주세요</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className={`mt-2 px-4 py-1.5 text-xs font-medium text-white rounded-full transition-colors ${
              mode === 'consumer' 
                ? 'bg-rose-500 hover:bg-rose-600' 
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            다시 시도
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * 6. GreetingMotion - 인사/환영
 */
export const GreetingMotion = ({ message = '안녕하세요!', mode = 'consumer' }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-5 px-4">
    <div className="relative w-16 h-16">
      {/* 손 흔드는 이모지 */}
      <span 
        className="text-4xl block"
        style={{ animation: 'wave 1s ease-in-out infinite' }}
      >
        👋
      </span>
      {/* 반짝이는 효과 */}
      <span 
        className="absolute -top-1 -right-1 text-lg"
        style={{ animation: 'twinkle 1.5s ease-in-out infinite' }}
      >
        ✨
      </span>
    </div>
    <div className="text-center space-y-0.5">
      <p className="text-sm font-medium text-gray-700">{message}</p>
      <p className="text-[11px] text-gray-400">
        {mode === 'consumer' 
          ? '광주 플리마켓 정보를 알려드릴게요' 
          : '존 추천과 운영 팁을 도와드릴게요'
        }
      </p>
    </div>
  </div>
);

/**
 * 타이핑 인디케이터 - 간단한 점 애니메이션 (초기 대기)
 */
export const TypingIndicator = ({ mode = 'consumer' }) => {
  const theme = THEME[mode] || THEME.consumer;
  return (
    <div className="flex gap-2.5 justify-start" role="status" aria-label="응답 작성 중">
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${theme.gradient} shadow-sm ${theme.shadow}`}>
        <BuddyIcon mode={mode} />
      </div>
      <div className="flex items-center gap-1 bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm ring-1 ring-gray-100">
        <span className={`h-1.5 w-1.5 rounded-full ${theme.bg} animate-pulse`} />
        <span className={`h-1.5 w-1.5 rounded-full ${theme.bg} animate-pulse`} style={{ animationDelay: '150ms' }} />
        <span className={`h-1.5 w-1.5 rounded-full ${theme.bg} animate-pulse`} style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
};

/**
 * 모션 타입에 따라 적절한 컴포넌트 반환
 */
export const ChatMotion = ({ 
  type = 'thinking', 
  message, 
  mode = 'consumer',
  onRetry 
}) => {
  const motionProps = { message, mode, onRetry };
  
  switch (type) {
    case 'searching':
      return <SearchingMotion {...motionProps} message={message || (mode === 'consumer' ? '플리마켓을 찾고 있어요' : '존 정보를 검색하고 있어요')} />;
    case 'analyzing':
      return <AnalyzingMotion {...motionProps} message={message || '상권 데이터를 분석하고 있어요'} />;
    case 'recommending':
      return <RecommendingMotion {...motionProps} message={message || '맞춤 추천을 준비하고 있어요'} />;
    case 'error':
      return <ErrorMotion {...motionProps} message={message || '문제가 발생했어요'} />;
    case 'greeting':
      return <GreetingMotion {...motionProps} message={message || '안녕하세요!'} />;
    case 'thinking':
    default:
      return <ThinkingMotion {...motionProps} message={message || '생각하고 있어요'} />;
  }
};

export default ChatMotion;
