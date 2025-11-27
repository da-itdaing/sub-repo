import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/routes/paths';

/**
 * 챗봇 런처(버튼)에서 공통으로 사용할 이동/열기 로직
 * - 모바일/데스크톱 분기에 따라 모달 또는 페이지 이동으로 확장 가능
 * - 현재는 요구사항에 맞춰 "챗봇 페이지로 이동"만 담당한다.
 */
const useChatLauncher = ({ target = 'consumer' } = {}) => {
  const navigate = useNavigate();

  // TODO: 필요 시 판매자 전용 챗봇 페이지(route)를 분리해서 사용
  const handleOpen = useCallback(() => {
    if (target === 'seller') {
      // 추후 /seller/chatbot 같은 라우트가 생기면 여기에서 분기
      navigate(ROUTES.chatbot);
      return;
    }

    navigate(ROUTES.chatbot);
  }, [navigate, target]);

  return {
    openChatbot: handleOpen,
  };
};

export default useChatLauncher;


