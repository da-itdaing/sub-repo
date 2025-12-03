import { useCallback, useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { RotateCcw, Zap, ChevronRight, Store, Users, DollarSign, TrendingUp, Percent, MapPin, X, ChevronDown, ChevronUp } from 'lucide-react';
import MessageList from '@/chatbot/components/MessageList';
import ChatInput from '@/chatbot/components/ChatInput';
import useChatSession from '@/chatbot/hooks/useChatSession';
import ZonePolygonMap from '@/components/map/ZonePolygonMap';

// 판매자용 빠른 질문
const QUICK_QUESTIONS = [
  '초보 셀러에게 좋은 존 추천해줘',
  '임대료가 저렴한 존은?',
  '동구에서 유동인구 많은 존',
  '빈 셀이 많은 존 알려줘',
];

// 팁 메시지
const SELLER_TIPS = [
  { emoji: '📊', text: '"초보 셀러에게 좋은 존" 을 추천받아보세요' },
  { emoji: '💰', text: '"임대료가 저렴한 존" 을 물어보세요' },
  { emoji: '📍', text: '"동구에서 추천" 처럼 지역을 지정해보세요' },
  { emoji: '🎯', text: '"빈 셀이 많은 존" 을 찾아드려요' },
  { emoji: '📈', text: '"유동인구 많은 존" 을 추천해드려요' },
];

/**
 * 팁 메시지 (로테이션)
 */
const TipBanner = ({ isLoading }) => {
  const [tipIndex, setTipIndex] = useState(() => Math.floor(Math.random() * SELLER_TIPS.length));
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setTipIndex((prev) => (prev + 1) % SELLER_TIPS.length);
        setIsVisible(true);
      }, 200);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const tip = SELLER_TIPS[tipIndex];
  if (isLoading) return null;

  return (
    <div className="px-4 pb-2">
      <div 
        className={`flex items-center justify-center gap-2 py-2 px-3 bg-gradient-to-r from-blue-50/80 to-cyan-50/80 rounded-xl border border-blue-100/30 transition-all duration-200 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'
        }`}
      >
        <span className="text-xs font-medium text-blue-400">💡</span>
        <span className="text-[11px] text-gray-500">
          <span className="text-base mr-1">{tip.emoji}</span>
          {tip.text}
        </span>
      </div>
    </div>
  );
};

/**
 * 숫자 변환 헬퍼
 */
const toNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

/**
 * 존 ID 추출
 */
const resolveZoneId = (item = {}) =>
  item.zone_id || item.id || item.name || 'unknown';

/**
 * 존 카드 컴포넌트 (지도 위 오버레이)
 */
const ZoneCard = ({ item, index, isActive, onSelect }) => {
  const registerLink = item.popup_register_url || `/seller/popups/create?zoneId=${item.zone_id}`;

  return (
    <div
      className={`p-3 rounded-xl cursor-pointer transition-all ${
        isActive 
          ? 'bg-blue-50 ring-2 ring-blue-400 shadow-md' 
          : 'bg-white/95 hover:bg-gray-50 shadow-sm'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start gap-2 mb-2">
        <span className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
          index === 0 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-200 text-gray-600'
        }`}>
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">
            {item.name || '존 이름 미정'}
          </p>
          <p className="text-xs text-gray-500">{item.district}</p>
        </div>
      </div>

      <div className="text-xs text-gray-600 space-y-1 mb-3">
        {item.rent_per_day && (
          <p className="flex items-center gap-1.5">
            <DollarSign className="h-3 w-3 text-gray-400" /> 
            임대료: {item.rent_per_day.toLocaleString()}원/일
          </p>
        )}
        {item.traffic_score && (
          <p className="flex items-center gap-1.5">
            <Users className="h-3 w-3 text-gray-400" /> 
            유동인구: {item.traffic_score}점
          </p>
        )}
        {item.commercial_grade && (
          <p className="flex items-center gap-1.5">
            <Store className="h-3 w-3 text-gray-400" /> 
            상권: {item.commercial_grade}
          </p>
        )}
        {item.available_cells !== undefined && item.total_cells !== undefined && (
          <p className="flex items-center gap-1.5">
            <Percent className="h-3 w-3 text-gray-400" /> 
            <span className={item.available_cells > 0 ? 'text-green-600 font-medium' : 'text-gray-500'}>
              빈 셀: {item.available_cells}/{item.total_cells}개
            </span>
          </p>
        )}
      </div>

      {item.available_cells > 0 && (
        <Link
          to={registerLink}
          className="flex items-center justify-center gap-1 w-full py-2 text-xs font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          셀 선택 후 팝업 등록
          <ChevronRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  );
};

/**
 * 오른쪽 패널: 지도 + 존 목록
 */
const MapPanel = ({ recommendations, highlightId, setHighlightId }) => {
  const [isListExpanded, setIsListExpanded] = useState(true);

  const markers = useMemo(
    () =>
      recommendations
        .map((item, index) => {
          const lat = toNumber(item.lat);
          const lng = toNumber(item.lng);
          if (lat == null || lng == null) return null;
          return {
            id: resolveZoneId(item),
            lat,
            lng,
            label: item.name,
            content: `${index + 1}. ${item.name}`,
            polygon: item.polygon,
            onClick: () => setHighlightId(resolveZoneId(item)),
          };
        })
        .filter(Boolean),
    [recommendations, setHighlightId],
  );

  const center = useMemo(() => {
    const activeMarker = markers.find((m) => m.id === highlightId);
    if (activeMarker) return { lat: activeMarker.lat, lng: activeMarker.lng };
    if (markers.length > 0) return { lat: markers[0].lat, lng: markers[0].lng };
    return { lat: 35.14667451156048, lng: 126.92227158987355 }; // 광주 중심
  }, [markers, highlightId]);

  if (recommendations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-50 text-gray-400">
        <MapPin className="h-12 w-12 mb-3 opacity-40" />
        <p className="text-sm font-medium">추천된 존이 없습니다</p>
        <p className="text-xs mt-1">질문을 입력하면 존을 추천해드려요</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* 지도 영역 */}
      <div className={`transition-all duration-300 ${isListExpanded ? 'flex-1' : 'h-full'}`}>
        <ZonePolygonMap
          center={center}
          markers={markers}
          height="100%"
          level={recommendations.length === 1 ? 4 : 6}
          highlightId={highlightId}
        />
      </div>

      {/* 존 목록 토글 버튼 */}
      <button
        type="button"
        onClick={() => setIsListExpanded(!isListExpanded)}
        className="flex items-center justify-center gap-1 py-2 bg-white border-t border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
      >
        📍 추천 존 {recommendations.length}곳
        {isListExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
      </button>

      {/* 존 목록 */}
      {isListExpanded && (
        <div className="h-[200px] overflow-y-auto bg-gray-100 p-3 space-y-2">
          {recommendations.map((item, index) => (
            <ZoneCard
              key={resolveZoneId(item)}
              item={item}
              index={index}
              isActive={resolveZoneId(item) === highlightId}
              onSelect={() => setHighlightId(resolveZoneId(item))}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * 판매자용 챗봇 페이지 (Split View)
 */
const SellerChatbotPage = () => {
  const {
    messages,
    isLoading,
    isSlow,
    isStreaming,
    recommendations,
    sendMessage,
    resetSession,
  } = useChatSession({ mode: 'seller' });

  const [showQuickQuestions, setShowQuickQuestions] = useState(true);
  const [highlightId, setHighlightId] = useState(null);

  // 추천 결과가 바뀌면 첫 번째 존 하이라이트
  useEffect(() => {
    if (recommendations.length > 0) {
      setHighlightId(resolveZoneId(recommendations[0]));
    } else {
      setHighlightId(null);
    }
  }, [recommendations]);

  const handleReset = useCallback(() => {
    resetSession();
    setShowQuickQuestions(true);
    setHighlightId(null);
  }, [resetSession]);

  const handleQuickQuestion = useCallback(
    (question) => {
      setShowQuickQuestions(false);
      sendMessage(question);
    },
    [sendMessage],
  );

  const handleSendMessage = useCallback(
    (text) => {
      setShowQuickQuestions(false);
      sendMessage(text);
    },
    [sendMessage],
  );

  const isInitialState = messages.length <= 1 && showQuickQuestions;

  return (
    <div className="flex flex-col h-full">
      {/* 페이지 헤더 */}
      <div className="shrink-0 px-4 py-3 bg-white border-b border-gray-200">
        <h1 className="text-lg font-semibold text-gray-900">AI 셀러 어시스턴트</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          존 추천, 운영 팁, 승인 절차 등 궁금한 점을 물어보세요
        </p>
      </div>

      {/* 메인 콘텐츠 (Split View) */}
      <div className="flex-1 flex min-h-0">
        {/* 왼쪽: 대화 영역 */}
        <div className="w-1/2 flex flex-col border-r border-gray-200 bg-gradient-to-b from-blue-50/30 to-white">
          {/* 챗봇 헤더 */}
          <header className="shrink-0 bg-white/80 backdrop-blur-sm border-b border-blue-100/50 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 shadow-sm">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900 tracking-tight">
                    셀러 AI
                  </h2>
                  <p className="text-[10px] text-gray-400">
                    존 추천·운영 가이드
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-blue-500 transition-colors"
                aria-label="대화 초기화"
              >
                <RotateCcw className="h-3 w-3" />
                초기화
              </button>
            </div>
          </header>

          {/* 메시지 영역 */}
          <main className="flex-1 overflow-hidden min-h-0">
            <MessageList
              messages={messages}
              isTyping={isLoading && !isStreaming}
              isSlow={isSlow}
              isStreaming={isStreaming}
              mode="seller"
            />
          </main>

          {/* 빠른 질문 */}
          {isInitialState && !isLoading && (
            <div className="shrink-0 px-4 py-4">
              <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-4">
                <p className="text-[11px] font-medium text-gray-400 mb-3 tracking-wide uppercase">
                  추천 질문
                </p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_QUESTIONS.map((q, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleQuickQuestion(q)}
                      className="rounded-full bg-blue-50 px-3.5 py-2 text-[12px] font-medium text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-all active:scale-95"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 팁 배너 */}
          <TipBanner isLoading={isLoading} />

          {/* 입력 영역 */}
          <footer className="shrink-0">
            <ChatInput onSend={handleSendMessage} disabled={isLoading} mode="seller" />
          </footer>
        </div>

        {/* 오른쪽: 지도 + 존 목록 */}
        <div className="w-1/2 bg-gray-50">
          <MapPanel
            recommendations={recommendations}
            highlightId={highlightId}
            setHighlightId={setHighlightId}
          />
        </div>
      </div>

      {/* 안내 */}
      <p className="shrink-0 py-2 text-xs text-gray-400 text-center bg-white border-t border-gray-200">
        AI 답변은 참고용이며, 실제 정책과 다를 수 있습니다.
      </p>
    </div>
  );
};

export default SellerChatbotPage;
