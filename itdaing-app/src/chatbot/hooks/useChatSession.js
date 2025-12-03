import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { streamChatMessage } from '@/chatbot/api/chatbotClient';

// 봇 초기 인사말 (모드별)
const BOT_GREETINGS = {
  consumer:
    '안녕하세요! 다잇다잉 소비자용 챗봇입니다. 플리마켓이나 팝업 방문 관련해서 무엇이든 물어보세요.',
  seller:
    '안녕하세요! 다잇다잉 판매자용 챗봇입니다. 존 추천, 운영 팁, 승인 절차 등 궁금한 점을 물어보세요.',
};

// 서버에서 내려오는 디버그/내부 메시지 필터링 패턴
const DEBUG_PATTERNS = [
  /호출 준비/,
  /structured_plan_result/i,
  /"type":\s*"(consumer|seller)_retrieve/i,
];

// ========== 테스트용 Mock 데이터 (실제 서버 연결 시 제거) ==========
const USE_MOCK = false; // true로 변경하면 Mock 데이터 사용

// Mock 시나리오 선택: 'full' | 'partial' | 'single' | 'no_coords' | 'empty' | 'long'
const MOCK_SCENARIO = 'full';

// 시나리오별 Mock 데이터
const MOCK_DATA = {
  // 3개 이상 추천 (지도 자동 표시)
  full: {
    recommendations: [
      {
        market_id: 'M001',
        name: '양림동 플리마켓',
        category: '플리마켓',
        address: '광주 남구 양림동 201-5',
        lat: 35.1391,
        lon: 126.9156,
        rating: 4.5,
        distance_km: 1.2,
      },
      {
        market_id: 'M002',
        name: '1913 송정역시장',
        category: '전통시장',
        address: '광주 광산구 송정로 8',
        lat: 35.1396,
        lon: 126.7932,
        rating: 4.7,
        distance_km: 3.5,
      },
      {
        market_id: 'M003',
        name: '국립아시아문화전당 마켓',
        category: '팝업스토어',
        address: '광주 동구 문화전당로 38',
        lat: 35.1465,
        lon: 126.9205,
        rating: 4.3,
        distance_km: 0.8,
      },
    ],
    response: `이번 주말에 가기 좋은 광주 플리마켓을 추천해드릴게요! 😊

**1. 양림동 플리마켓**
- 위치: 광주 남구 양림동
- 특징: 핸드메이드 소품과 빈티지 아이템이 가득해요

**2. 1913 송정역시장**
- 위치: 광주 광산구 송정로
- 특징: 전통시장의 정취와 함께 다양한 먹거리

**3. 국립아시아문화전당 마켓**
- 위치: 광주 동구 문화전당로
- 특징: 예술과 디자인 관련 상품이 많아요

지도에서 위치를 확인해보세요! 🗺️`,
  },

  // 2개 추천 (지도 토글 버튼)
  partial: {
    recommendations: [
      {
        market_id: 'M001',
        name: '양림동 플리마켓',
        category: '플리마켓',
        address: '광주 남구 양림동 201-5',
        lat: 35.1391,
        lon: 126.9156,
        rating: 4.5,
        distance_km: 1.2,
      },
      {
        market_id: 'M002',
        name: '1913 송정역시장',
        category: '전통시장',
        address: '광주 광산구 송정로 8',
        lat: 35.1396,
        lon: 126.7932,
        rating: 4.7,
        distance_km: 3.5,
      },
    ],
    response: `조건에 맞는 플리마켓 2곳을 찾았어요!

**1. 양림동 플리마켓**
- 핸드메이드 소품 전문 플리마켓이에요

**2. 1913 송정역시장**
- 전통시장과 플리마켓이 함께 있어요

더 구체적인 조건을 알려주시면 더 많은 추천을 드릴 수 있어요!`,
  },

  // 1개 추천
  single: {
    recommendations: [
      {
        market_id: 'M001',
        name: '양림동 플리마켓',
        category: '플리마켓',
        address: '광주 남구 양림동 201-5',
        lat: 35.1391,
        lon: 126.9156,
        rating: 4.5,
        distance_km: 1.2,
      },
    ],
    response: `조건에 딱 맞는 플리마켓을 찾았어요!

**양림동 플리마켓**
- 위치: 광주 남구 양림동
- 핸드메이드 소품과 빈티지 아이템이 가득해요
- 카페존도 있어서 여유롭게 구경할 수 있어요

다른 조건도 알려주시면 더 찾아볼게요!`,
  },

  // 좌표 없는 추천 포함
  no_coords: {
    recommendations: [
      {
        market_id: 'M001',
        name: '양림동 플리마켓',
        category: '플리마켓',
        address: '광주 남구 양림동 201-5',
        lat: 35.1391,
        lon: 126.9156,
        rating: 4.5,
      },
      {
        market_id: 'M004',
        name: '신규 오픈 예정 마켓',
        category: '팝업스토어',
        address: '광주 서구 (상세 위치 미정)',
        // 좌표 없음
        rating: null,
      },
    ],
    response: `추천 결과입니다!

**1. 양림동 플리마켓**
- 위치: 광주 남구 양림동
- 지도에서 위치 확인 가능해요

**2. 신규 오픈 예정 마켓**
- 위치: 광주 서구 (상세 위치 미정)
- 아직 정확한 위치가 공개되지 않았어요`,
  },

  // 추천 없음
  empty: {
    recommendations: [],
    response: `죄송해요, 말씀하신 조건에 맞는 플리마켓을 찾지 못했어요. 😢

다음과 같이 질문해보시면 어떨까요?
- "이번 주말 플리마켓 추천해줘"
- "가족과 가기 좋은 팝업 있어?"
- "핸드메이드 소품 살 수 있는 곳"`,
  },

  // 긴 응답 테스트
  long: {
    recommendations: [
      {
        market_id: 'M001',
        name: '양림동 플리마켓',
        category: '플리마켓',
        address: '광주 남구 양림동 201-5',
        lat: 35.1391,
        lon: 126.9156,
        rating: 4.5,
        distance_km: 1.2,
      },
    ],
    response: `광주에서 가족과 함께 방문하기 좋은 플리마켓을 상세히 안내해드릴게요! 😊

**양림동 플리마켓 완벽 가이드**

**📍 기본 정보**
- 위치: 광주 남구 양림동 201-5
- 운영시간: 매주 토요일 10:00 ~ 18:00
- 입장료: 무료
- 주차: 인근 공영주차장 이용 (1시간 1,000원)

**🎪 주요 특징**
양림동 플리마켓은 광주에서 가장 역사 깊은 플리마켓 중 하나로, 매주 토요일마다 다양한 핸드메이드 작가들과 빈티지 셀러들이 모여 특별한 장터를 열어요.

**✨ 추천 포인트**
1. **핸드메이드 소품**: 도자기, 가죽공예, 캔들, 악세서리 등 다양한 수공예품
2. **빈티지 아이템**: 레트로 의류, 앤티크 소품, LP판 등
3. **푸드존**: 수제 베이커리, 유기농 식품, 커피 트럭
4. **체험 프로그램**: 가죽공예, 캔들 만들기 등 원데이 클래스

**👨‍👩‍👧 가족 방문 팁**
- 유모차 이동이 편리한 평지 구조
- 아이들을 위한 페이스페인팅 부스
- 근처 양림동 역사문화마을과 연계 관광 추천
- 점심시간(12-14시)에는 혼잡하니 오전에 방문 권장

**🚗 교통편**
- 대중교통: 지하철 남광주역 2번 출구에서 도보 15분
- 자가용: 네비게이션 "양림동 플리마켓" 검색

**📞 문의**
- 전화: 062-123-4567
- 인스타그램: @yangnim_market

더 궁금한 점이 있으시면 언제든 물어보세요! 🙌`,
  },
};

// 현재 시나리오의 Mock 데이터
const MOCK_RECOMMENDATIONS = MOCK_DATA[MOCK_SCENARIO]?.recommendations || [];
const MOCK_BOT_RESPONSE = MOCK_DATA[MOCK_SCENARIO]?.response || '';

// ========== Mock 데이터 끝 ==========

/**
 * 서버 delta에서 디버그 메시지를 제거하고 정리된 텍스트 반환
 * 
 * 주의: 공백을 제거하면 안 됨!
 * - LLM 토큰은 " 주말에", " 추천할" 처럼 공백으로 시작할 수 있음
 * - 시작/끝 공백 제거 시 띄어쓰기가 모두 사라지는 버그 발생
 */
const sanitizeDelta = (delta) => {
  if (!delta) return '';

  // 디버그 패턴 검사만 수행, 공백은 그대로 유지
  const lines = delta.split('\n');
  const filtered = lines.filter((line) => {
    const trimmed = line.trim();
    // 빈 줄은 유지 (줄바꿈 보존)
    if (!trimmed) return true;
    // 디버그 패턴만 필터링
    return !DEBUG_PATTERNS.some((pattern) => pattern.test(trimmed));
  });

  // 공백 제거 없이 그대로 반환
  return filtered.join('\n');
};

/**
 * 로그인 사용자의 세션 데이터 저장 키 생성
 */
const getSessionStorageKey = (mode, userId) => {
  if (!userId || userId.startsWith('guest-')) return null;
  return `chatbot_session_${mode}_${userId}`;
};

/**
 * 로그인 사용자의 세션 데이터 로드
 */
const loadSavedSession = (mode, userId) => {
  const key = getSessionStorageKey(mode, userId);
  if (!key) return null;
  
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      // 24시간 이내 세션만 복원
      if (parsed.timestamp && Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
        return parsed;
      }
      // 오래된 세션 삭제
      localStorage.removeItem(key);
    }
  } catch (e) {
    console.warn('[useChatSession] Failed to load saved session:', e);
  }
  return null;
};

/**
 * 로그인 사용자의 세션 데이터 저장
 */
const saveSession = (mode, userId, sessionId, threadId) => {
  const key = getSessionStorageKey(mode, userId);
  if (!key || !threadId) return;
  
  try {
    localStorage.setItem(key, JSON.stringify({
      sessionId,
      threadId,
      timestamp: Date.now(),
    }));
  } catch (e) {
    console.warn('[useChatSession] Failed to save session:', e);
  }
};

/**
 * 로그인 사용자의 세션 데이터 삭제
 */
const clearSavedSession = (mode, userId) => {
  const key = getSessionStorageKey(mode, userId);
  if (key) {
    localStorage.removeItem(key);
  }
};

/**
 * 챗봇 세션 관리 훅
 * - 메시지 상태, 스트리밍, 추천 결과 등을 통합 관리
 * - mode: 'consumer' | 'seller'
 * - userId: 로그인 사용자 ID 또는 게스트 ID
 * - 로그인 사용자: threadId를 localStorage에 저장하여 세션 유지 (24시간)
 */
const useChatSession = ({ mode = 'consumer', userId = null } = {}) => {
  // 로그인 사용자인지 확인
  const isLoggedIn = userId && !userId.startsWith('guest-');
  
  // 저장된 세션 로드 (로그인 사용자만)
  const savedSession = useMemo(() => {
    if (isLoggedIn) {
      return loadSavedSession(mode, userId);
    }
    return null;
  }, [mode, userId, isLoggedIn]);
  
  // 초기 봇 메시지
  const initialMessage = useMemo(
    () => ({
      id: `bot-init-${mode}`,
      sender: 'BOT',
      text: savedSession 
        ? '이전 대화를 이어갑니다. 무엇이든 물어보세요!'
        : (BOT_GREETINGS[mode] ?? BOT_GREETINGS.consumer),
      createdAt: new Date().toISOString(),
    }),
    [mode, savedSession],
  );

  // 세션/스레드 상태 (저장된 세션이 있으면 복원)
  const [sessionId, setSessionId] = useState(savedSession?.sessionId || null);
  const [threadId, setThreadId] = useState(savedSession?.threadId || null);
  const threadIdRef = useRef(savedSession?.threadId || null);

  // 메시지 및 추천 상태
  const [messages, setMessages] = useState([initialMessage]);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSlow, setIsSlow] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false); // v14: 첫 토큰 도착 후 스트리밍 중 상태

  // 타이머 및 요청 취소용 ref
  const slowTimerRef = useRef(null);
  const abortControllerRef = useRef(null);

  // threadId 동기화 및 저장 (로그인 사용자만)
  useEffect(() => {
    threadIdRef.current = threadId;
    
    // 로그인 사용자의 경우 세션 저장
    if (isLoggedIn && threadId) {
      saveSession(mode, userId, sessionId, threadId);
    }
  }, [threadId, sessionId, mode, userId, isLoggedIn]);

  // 모드 변경 시 세션 리셋
  useEffect(() => {
    setMessages([initialMessage]);
    setSessionId(null);
    setThreadId(null);
    setIsSlow(false);
    setRecommendations([]);
  }, [initialMessage]);

  // 느린 응답 타이머 정리
  const clearSlowTimer = useCallback(() => {
    if (slowTimerRef.current) {
      clearTimeout(slowTimerRef.current);
      slowTimerRef.current = null;
    }
    setIsSlow(false);
  }, []);

  // 느린 응답 타이머 시작 (3초 후 isSlow = true)
  // v14: 실제 토큰 스트리밍으로 TTFT가 개선되어 3초로 조정
  // - 간단한 질문(인사): TTFT ~0.76초 → slowTimer 미발동
  // - RAG 질문: TTFT ~5초 → 3초 후 "찾고 있어요" 메시지 표시
  const startSlowTimer = useCallback(() => {
    clearSlowTimer();
    slowTimerRef.current = setTimeout(() => {
      setIsSlow(true);
    }, 3000);
  }, [clearSlowTimer]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      clearSlowTimer();
      abortControllerRef.current?.abort();
    };
  }, [clearSlowTimer]);

  // 세션 초기화 (초기화 버튼 클릭 시)
  const resetSession = useCallback(() => {
    // 진행 중인 요청 취소
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;

    clearSlowTimer();
    setSessionId(null);
    setThreadId(null);
    setMessages([{
      id: `bot-init-${mode}`,
      sender: 'BOT',
      text: BOT_GREETINGS[mode] ?? BOT_GREETINGS.consumer,
      createdAt: new Date().toISOString(),
    }]);
    setRecommendations([]);
    setIsLoading(false);
    setIsStreaming(false); // v14: 스트리밍 상태 초기화
    
    // 저장된 세션 삭제 (로그인 사용자)
    if (isLoggedIn) {
      clearSavedSession(mode, userId);
    }
  }, [clearSlowTimer, mode, isLoggedIn, userId]);

  // 메시지 전송
  const sendMessage = useCallback(
    async (text) => {
      if (!text?.trim()) return;

      // 이전 요청이 있으면 취소
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      // 유저 메시지 추가
      const userMessage = {
        id: `user-${Date.now()}`,
        sender: 'USER',
        text,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // 세션 ID 생성/유지
      const effectiveSessionId = sessionId ?? `session-${Date.now()}`;
      if (!sessionId) {
        setSessionId(effectiveSessionId);
      }

      setIsLoading(true);
      setIsStreaming(false); // v14: 스트리밍 시작 전 초기화
      startSlowTimer();
      setRecommendations([]);

      // ========== Mock 모드 ==========
      if (USE_MOCK) {
        // 타이핑 효과를 위한 딜레이
        await new Promise((resolve) => setTimeout(resolve, 1500));
        
        clearSlowTimer();
        setIsLoading(false);

        // 봇 응답 추가
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'BOT',
            text: MOCK_BOT_RESPONSE,
            createdAt: new Date().toISOString(),
          },
        ]);

        // 추천 결과 설정
        setRecommendations(MOCK_RECOMMENDATIONS);
        return;
      }
      // ========== Mock 모드 끝 ==========

      try {
        const botMessageId = `bot-${Date.now()}`;
        let hasFirstDelta = false;
        const trimmedQuestion = text.trim();
        const normalizedQuestion = trimmedQuestion.toLowerCase();

        await streamChatMessage({
          mode,
          message: text,
          sessionId: effectiveSessionId,
          threadId: threadIdRef.current,
          userId: userId || 'web-guest',
          signal: controller.signal,
          onDelta: ({ delta, thread_id, recommendations: incomingRecs }) => {
            // 스레드 ID 업데이트
            if (thread_id && thread_id !== threadIdRef.current) {
              threadIdRef.current = thread_id;
              setThreadId(thread_id);
            }

            // 추천 결과 처리: 새 추천이 오면 업데이트, 없으면 이전 추천 유지
            // (서버에서 빈 배열을 보내면 추천 없음으로 처리)
            if (Array.isArray(incomingRecs)) {
              setRecommendations(incomingRecs);
            }

            if (!delta) return;

            let cleanDelta = sanitizeDelta(delta);
            if (!cleanDelta.trim()) return;

            // 첫 번째 delta에서 질문 에코 제거 (서버가 질문을 그대로 반복하는 경우)
            if (!hasFirstDelta) {
              const lower = cleanDelta.toLowerCase();

              if (normalizedQuestion && lower.startsWith(normalizedQuestion)) {
                const nextChar = lower[normalizedQuestion.length];
                // 단어 경계인 경우에만 에코로 판단 (예: "안녕" 뒤에 공백/구두점)
                const isWordBoundary = !nextChar || /[\s"""'?!.,)/]/.test(nextChar);

                if (isWordBoundary) {
                  const remaining = cleanDelta.slice(normalizedQuestion.length).trimStart();
                  if (remaining.length > 0) {
                    cleanDelta = remaining;
                  } else {
                    // 질문만 있고 답변이 없으면 스킵
                    hasFirstDelta = true;
                    return;
                  }
                }
              }
              hasFirstDelta = true;
            }

            if (!cleanDelta.trim()) return;
            clearSlowTimer();
            
            // v14: 첫 토큰 도착 시 스트리밍 상태로 전환
            if (!isStreaming) {
              setIsStreaming(true);
            }

            // 봇 메시지 업데이트 (스트리밍 누적)
            setMessages((prev) => {
              const next = [...prev];
              const existingIndex = next.findIndex((msg) => msg.id === botMessageId);

              if (existingIndex === -1) {
                // 새 봇 메시지 생성
                next.push({
                  id: botMessageId,
                  sender: 'BOT',
                  text: cleanDelta,
                  createdAt: new Date().toISOString(),
                });
                return next;
              }

              // 기존 메시지에 delta 추가
              const current = next[existingIndex];
              next[existingIndex] = {
                ...current,
                text: `${current.text}${cleanDelta}`,
              };
              return next;
            });
          },
        });
      } catch (error) {
        // AbortError는 의도적 취소이므로 무시
        if (error.name === 'AbortError') return;

        console.error('[useChatSession] Stream error:', error);
        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            sender: 'BOT',
            text: '죄송합니다. 연결이 원활하지 않습니다. 잠시 후 다시 시도해주세요.',
            createdAt: new Date().toISOString(),
          },
        ]);
      } finally {
        setIsLoading(false);
        setIsStreaming(false); // v14: 스트리밍 완료
        clearSlowTimer();
      }
    },
    [sessionId, mode, clearSlowTimer, startSlowTimer, isStreaming],
  );

  return {
    sessionId,
    threadId,
    messages,
    isLoading,
    isSlow,
    isStreaming, // v14: 첫 토큰 도착 후 스트리밍 중 여부
    recommendations,
    sendMessage,
    resetSession,
  };
};

export default useChatSession;
