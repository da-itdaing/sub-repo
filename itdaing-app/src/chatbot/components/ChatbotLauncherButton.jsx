import ChatbotButton from '@/components/common/ChatbotButton';
import useChatLauncher from '@/chatbot/hooks/useChatLauncher';

/**
 * 소비자/판매자 레이아웃에서 공통으로 사용하는 챗봇 런처 버튼
 * - 내부에서 기존 공용 ChatbotButton UI를 재사용하고,
 *   클릭 시에는 useChatLauncher를 통해 챗봇 페이지로 이동하도록 래핑한다.
 *
 * props:
 * - mode: 'floating' | 'header' 등, 기존 공용 버튼 모드 그대로 전달
 * - target: 'consumer' | 'seller' (기본값: consumer)
 */
const ChatbotLauncherButton = ({ mode = 'floating', target = 'consumer' }) => {
  const { openChatbot } = useChatLauncher({ target });

  return (
    <ChatbotButton
      mode={mode}
      // 기존 버튼이 내부에서 모달/알림을 열고 있지만,
      // onClick을 오버라이드해서 우선적으로 페이지 이동을 수행하도록 한다.
      onClickOverride={openChatbot}
    />
  );
};

export default ChatbotLauncherButton;


