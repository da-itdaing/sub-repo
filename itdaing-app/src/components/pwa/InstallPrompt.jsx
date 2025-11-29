import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

/**
 * PWA 설치 프롬프트 컴포넌트
 * - beforeinstallprompt 이벤트를 캐치하여 설치 버튼 표시
 * - 갤럭시/안드로이드 Chrome에서 동작
 */
const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 이미 설치된 경우 체크
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // 이미 닫기를 눌렀는지 확인 (24시간 동안 다시 안 보여줌)
    const dismissedAt = localStorage.getItem('pwa-prompt-dismissed');
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt, 10);
      const now = Date.now();
      const hoursPassed = (now - dismissedTime) / (1000 * 60 * 60);
      if (hoursPassed < 24) {
        return;
      }
    }

    // beforeinstallprompt 이벤트 리스너
    const handleBeforeInstallPrompt = (e) => {
      // 기본 브라우저 프롬프트 막기
      e.preventDefault();
      // 이벤트 저장
      setDeferredPrompt(e);
      // 커스텀 프롬프트 표시 (1초 후)
      setTimeout(() => setShowPrompt(true), 1000);
    };

    // 앱 설치 완료 이벤트
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // 설치 버튼 클릭
  const handleInstall = async () => {
    if (!deferredPrompt) return;

    // 설치 프롬프트 표시
    deferredPrompt.prompt();

    // 사용자 선택 대기
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('[PWA] 사용자가 설치를 수락함');
    } else {
      console.log('[PWA] 사용자가 설치를 거절함');
    }

    // 프롬프트는 한 번만 사용 가능
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  // 닫기 버튼 클릭
  const handleDismiss = () => {
    setShowPrompt(false);
    // 24시간 동안 다시 안 보여줌
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
  };

  // 표시 조건: 프롬프트가 있고, 설치 안 됐고, 표시 상태일 때
  if (!showPrompt || isInstalled || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-slide-up">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 mx-auto max-w-md">
        <div className="flex items-start gap-3">
          {/* 앱 아이콘 */}
          <div className="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center shadow-lg shadow-rose-200">
            <span className="text-white text-xl font-bold">다</span>
          </div>

          {/* 텍스트 */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-sm">
              다-잇다잉 앱 설치
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              홈 화면에 추가하고 더 빠르게 이용하세요!
            </p>
          </div>

          {/* 닫기 버튼 */}
          <button
            onClick={handleDismiss}
            className="shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 설치 버튼 */}
        <button
          onClick={handleInstall}
          className="mt-3 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-red-600 text-white font-semibold text-sm py-2.5 rounded-xl shadow-md shadow-rose-200 hover:shadow-lg transition-all active:scale-[0.98]"
        >
          <Download className="w-4 h-4" />
          앱 설치하기
        </button>
      </div>
    </div>
  );
};

export default InstallPrompt;

