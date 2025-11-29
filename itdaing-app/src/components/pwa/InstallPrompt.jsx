import { useState, useEffect } from 'react';
import { Download, X, Share2 } from 'lucide-react';

/**
 * 브라우저/OS 감지
 */
const detectPlatform = () => {
  const ua = navigator.userAgent || '';
  const isIOS = /iPhone|iPad|iPod/.test(ua);
  const isAndroid = /Android/.test(ua);
  const isSamsung = /SamsungBrowser/.test(ua);
  const isChrome = /Chrome/.test(ua) && !/Edge|Edg|SamsungBrowser/.test(ua);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
    || window.navigator.standalone === true;
  
  return { isIOS, isAndroid, isSamsung, isChrome, isStandalone };
};

/**
 * PWA 설치 프롬프트 컴포넌트
 * - beforeinstallprompt 이벤트가 있으면 자동 설치 버튼
 * - 없으면 수동 설치 안내 표시
 */
const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [platform, setPlatform] = useState({});

  useEffect(() => {
    const detected = detectPlatform();
    setPlatform(detected);

    // 이미 설치된 경우 체크
    if (detected.isStandalone) {
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
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => setShowPrompt(true), 1500);
    };

    // 앱 설치 완료 이벤트
    const handleAppInstalled = () => {
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // beforeinstallprompt가 발생하지 않아도 삼성 인터넷/iOS면 안내 배너 표시
    // Chrome은 자체 설치 UI가 있으므로 제외
    const timer = setTimeout(() => {
      if (!deferredPrompt && (detected.isSamsung || detected.isIOS)) {
        setShowPrompt(true);
      }
    }, 3000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      clearTimeout(timer);
    };
  }, []);

  // 설치 버튼 클릭 (자동 설치)
  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('[PWA] 사용자가 설치를 수락함');
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  // 닫기 버튼 클릭
  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
  };

  // 표시 조건
  if (!showPrompt || platform.isStandalone) {
    return null;
  }

  // 수동 설치 안내 메시지
  const getInstallGuide = () => {
    if (platform.isIOS) {
      return {
        icon: <Share2 className="w-4 h-4" />,
        text: '공유 버튼 → "홈 화면에 추가"',
      };
    }
    if (platform.isSamsung) {
      return {
        icon: <Download className="w-4 h-4" />,
        text: '메뉴(≡) → "현재 페이지 추가" → "홈 화면"',
      };
    }
    // Chrome Android
    return {
      icon: <Download className="w-4 h-4" />,
      text: '메뉴(⋮) → "홈 화면에 추가" 또는 "앱 설치"',
    };
  };

  const guide = getInstallGuide();
  const canAutoInstall = !!deferredPrompt;

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

        {canAutoInstall ? (
          /* 자동 설치 버튼 */
          <button
            onClick={handleInstall}
            className="mt-3 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-red-600 text-white font-semibold text-sm py-2.5 rounded-xl shadow-md shadow-rose-200 hover:shadow-lg transition-all active:scale-[0.98]"
          >
            <Download className="w-4 h-4" />
            앱 설치하기
          </button>
        ) : (
          /* 수동 설치 안내 */
          <div className="mt-3 flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5">
            <div className="shrink-0 w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-500">
              {guide.icon}
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              {guide.text}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstallPrompt;

