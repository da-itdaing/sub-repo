import { useState } from 'react';
import { Download, X, ChevronRight, ExternalLink } from 'lucide-react';

/**
 * 커스텀 아이콘 컴포넌트들
 */
const AppleIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
  </svg>
);

const ChromeIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
    <circle cx="12" cy="12" r="4"/>
    <path d="M12 2v4c2.21 0 4 1.79 4 4h4c0-4.41-3.59-8-8-8z" fill="currentColor" opacity="0.8"/>
    <path d="M4.93 7.5l2 3.46C7.36 9.77 8.56 9 10 9h.5l2-3.46C10.77 4.86 8.78 5.5 7.27 6.77L4.93 7.5z" fill="currentColor" opacity="0.6"/>
  </svg>
);

const SamsungIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c3.86 0 7 3.14 7 7s-3.14 7-7 7-7-3.14-7-7 3.14-7 7-7z"/>
    <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 8c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/>
  </svg>
);

const AndroidIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v7c0 .83.67 1.5 1.5 1.5S5 17.33 5 16.5v-7C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zm-4.97-5.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48C13.85 1.23 12.95 1 12 1c-.96 0-1.86.23-2.66.63L7.85.15c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.31 1.31C6.97 3.26 6 5.01 6 7h12c0-1.99-.97-3.75-2.47-4.84zM10 5H9V4h1v1zm5 0h-1V4h1v1z"/>
  </svg>
);

/**
 * 앱 설치 안내 모달
 */
const InstallGuideModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const installGuides = [
    {
      id: 'ios',
      name: 'iOS (iPhone/iPad)',
      icon: <AppleIcon className="h-5 w-5" />,
      color: 'bg-gray-800',
      steps: [
        '1. Safari 브라우저로 접속',
        '2. 하단 공유 버튼(↑) 탭',
        '3. "홈 화면에 추가" 선택',
        '4. "추가" 버튼 탭',
      ],
      link: 'https://support.apple.com/ko-kr/HT207122',
    },
    {
      id: 'chrome',
      name: 'Chrome (Android/PC)',
      icon: <ChromeIcon className="h-5 w-5" />,
      color: 'bg-gradient-to-br from-red-500 via-yellow-500 to-green-500',
      steps: [
        '1. Chrome 브라우저로 접속',
        '2. 우측 상단 메뉴(⋮) 또는 주소창 설치 아이콘 클릭',
        '3. "앱 설치" 또는 "홈 화면에 추가" 선택',
        '4. "설치" 버튼 클릭',
      ],
      link: 'https://support.google.com/chrome/answer/9658361?hl=ko',
    },
    {
      id: 'android',
      name: 'Android 기본 브라우저',
      icon: <AndroidIcon className="h-5 w-5" />,
      color: 'bg-green-600',
      steps: [
        '1. 기본 브라우저로 접속',
        '2. 메뉴(⋮ 또는 ≡) 탭',
        '3. "홈 화면에 추가" 선택',
        '4. "추가" 버튼 탭',
      ],
      link: 'https://developer.android.com/guide/webapps/webview',
    },
    {
      id: 'samsung',
      name: 'Samsung Internet',
      icon: <SamsungIcon className="h-5 w-5" />,
      color: 'bg-purple-600',
      steps: [
        '1. Samsung Internet으로 접속',
        '2. 하단 메뉴(≡) 탭',
        '3. "현재 페이지 추가" → "홈 화면" 선택',
        '4. "추가" 버튼 탭',
      ],
      link: 'https://www.samsung.com/sec/support/mobile-devices/how-do-i-add-shortcuts-to-my-galaxy-smartphone-home-screen/',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* 배경 오버레이 */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* 모달 컨텐츠 */}
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[85vh] overflow-hidden animate-slide-up">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-red-600 shadow-lg shadow-rose-200">
              <Download className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">앱 설치 가이드</h3>
              <p className="text-xs text-gray-500">기기별 설치 방법을 확인하세요</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* 안내 문구 */}
        <div className="px-5 py-3 bg-rose-50 border-b border-rose-100">
          <p className="text-sm text-rose-700">
            <span className="font-medium">다잇다잉</span>은 PWA(Progressive Web App)로, 
            앱스토어 없이 바로 설치할 수 있어요!
          </p>
        </div>

        {/* 설치 가이드 목록 */}
        <div className="overflow-y-auto max-h-[50vh] p-4 space-y-3">
          {installGuides.map((guide) => (
            <details key={guide.id} className="group bg-gray-50 rounded-xl overflow-hidden">
              <summary className="flex items-center gap-3 p-4 cursor-pointer list-none hover:bg-gray-100 transition-colors">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${guide.color} text-white`}>
                  {guide.icon}
                </div>
                <span className="flex-1 font-medium text-gray-800">{guide.name}</span>
                <ChevronRight className="h-5 w-5 text-gray-400 group-open:rotate-90 transition-transform" />
              </summary>
              <div className="px-4 pb-4">
                <ol className="space-y-2 mb-3">
                  {guide.steps.map((step, idx) => (
                    <li key={idx} className="text-sm text-gray-600 pl-2">
                      {step}
                    </li>
                  ))}
                </ol>
                <a
                  href={guide.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-rose-500 hover:text-rose-600 font-medium"
                >
                  공식 가이드 보기
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </details>
          ))}
        </div>

        {/* 하단 정보 */}
        <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              오프라인 사용 가능
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-blue-500 rounded-full" />
              푸시 알림 지원
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-purple-500 rounded-full" />
              빠른 실행
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * 앱 다운로드 안내 배너
 * - 차분한 스타일 (브라운/웜 그레이 계열)
 */
const HorizontalBanner = ({ onClick }) => {
  const [showModal, setShowModal] = useState(false);

  const handleClick = () => {
    setShowModal(true);
    onClick?.();
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="group relative w-full overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-r from-gray-50 to-white shadow-sm hover:shadow-md transition-all focus:outline-none"
      >
        {/* 콘텐츠 */}
        <div className="relative flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            {/* 아이콘 - 차분한 빨간색 */}
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 border border-rose-100">
              <Download className="h-5 w-5 text-rose-500" />
            </div>
            
            {/* 텍스트 */}
            <div className="text-left">
              <h2 className="text-sm font-semibold text-gray-800">
                다잇다잉 앱 설치하기
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                홈 화면에 추가하고 더 빠르게 이용하세요
              </p>
            </div>
          </div>
          
          {/* 화살표 */}
          <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-rose-500 group-hover:translate-x-0.5 transition-all" />
        </div>
      </button>

      {/* 설치 가이드 모달 */}
      <InstallGuideModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
      />
    </>
  );
};

export default HorizontalBanner;
