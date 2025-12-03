import Header from '@/components/layout/Header';
import ChatLayout from '@/chatbot/components/ChatLayout';

/**
 * 소비자용 챗봇 페이지
 * - 모바일 앱 비율 (540px) 최적화
 * - 화면 전체를 챗봇이 차지하도록 구성
 * - Header 높이(h-14/md:h-20)를 고려하여 레이아웃 설정
 * - dvh 사용으로 모바일 브라우저 주소창 높이 변화에 대응
 * 
 * @param {boolean} hideHeader - Header 숨김 여부 (통합 페이지에서 사용)
 * @param {string} guestId - 게스트 ID (비로그인 체험 모드)
 */
const ConsumerChatbotPage = ({ hideHeader = false, guestId = null }) => {
  return (
    <div className={`flex ${hideHeader ? 'h-full' : 'h-dvh'} flex-col bg-white overflow-hidden`}>
      {/* 헤더 (hideHeader가 false일 때만 표시) */}
      {!hideHeader && <Header hideSearchBar showRoleBanner={false} />}

      {/* 챗봇 영역 - Header 아래부터 남은 공간 전체 사용 */}
      <main className="flex-1 flex flex-col w-full max-w-[540px] mx-auto overflow-hidden">
        <ChatLayout mode="consumer" guestId={guestId} />
      </main>
    </div>
  );
};

export default ConsumerChatbotPage;
