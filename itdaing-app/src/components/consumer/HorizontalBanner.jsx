import { useState } from 'react';
import { Download, Smartphone, Apple, Chrome, X, ChevronRight, ExternalLink } from 'lucide-react';

/**
 * 앱 설치 안내 모달
 */
const InstallGuideModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const installGuides = [
    {
      id: 'ios',
      name: 'iOS (iPhone/iPad)',
      icon: <Apple className="h-5 w-5" />,
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
      id: 'android',
      name: 'Android (Galaxy 등)',
      icon: <Smartphone className="h-5 w-5" />,
      color: 'bg-green-600',
      steps: [
        '1. Chrome 브라우저로 접속',
        '2. 우측 상단 메뉴(⋮) 탭',
        '3. "홈 화면에 추가" 또는 "앱 설치" 선택',
        '4. "설치" 버튼 탭',
      ],
      link: 'https://support.google.com/chrome/answer/9658361?hl=ko',
    },
    {
      id: 'samsung',
      name: 'Samsung Internet',
      icon: <Chrome className="h-5 w-5" />,
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
 * - 기존 이벤트 배너를 앱 설치 안내로 변경
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
        className="group relative w-full overflow-hidden rounded-[20px] shadow-md focus:outline-none"
      >
        {/* 배경 - 빨간색 그라데이션 */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#eb0000] to-[#c70000]" />
        
        {/* 장식용 패턴 */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/20" />
          <div className="absolute -left-4 -bottom-4 w-24 h-24 rounded-full bg-white/20" />
        </div>
        
        {/* 콘텐츠 */}
        <div className="relative flex items-center justify-between px-5 py-4 sm:py-5">
          <div className="flex items-center gap-3">
            {/* 아이콘 */}
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <Download className="h-5 w-5 text-white" />
            </div>
            
            {/* 텍스트 */}
            <div className="text-left">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                다잇다잉 앱 설치하기
              </h2>
              <p className="text-xs sm:text-sm text-white/80 mt-0.5">
                홈 화면에 추가하고 더 빠르게 이용하세요
              </p>
            </div>
          </div>
          
          {/* 화살표 */}
          <ChevronRight className="h-5 w-5 text-white/80 group-hover:translate-x-1 transition-transform" />
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
