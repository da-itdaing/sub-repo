import { useState, useEffect } from 'react';

/**
 * PWA 스플래시 스크린 - 앱 로딩 시 표시
 * - 빨간색 테마
 * - 로고 + 서비스 문구
 * - 모션 그래픽 애니메이션
 */
const SplashScreen = ({ onComplete, duration = 2500 }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [phase, setPhase] = useState('logo'); // logo -> text -> fade

  useEffect(() => {
    // 애니메이션 시퀀스
    const timer1 = setTimeout(() => setPhase('text'), 800);
    const timer2 = setTimeout(() => setPhase('fade'), duration - 500);
    const timer3 = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, duration);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [duration, onComplete]);

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-[#eb0000] to-[#c70000] transition-opacity duration-500 ${
        phase === 'fade' ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* 배경 파티클 효과 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/10 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* 로고 영역 */}
      <div 
        className={`relative transition-all duration-700 ${
          phase === 'logo' ? 'scale-100 opacity-100' : 'scale-90 opacity-100'
        }`}
      >
        {/* 로고 배경 원 */}
        <div className="relative w-28 h-28 mb-6">
          <div className="absolute inset-0 rounded-2xl bg-white/10 animate-pulse" />
          <div 
            className="absolute inset-2 rounded-xl bg-white shadow-2xl flex flex-col items-center justify-center"
            style={{ animation: 'logoEnter 0.8s ease-out' }}
          >
            <span 
              className="text-[#eb0000] font-bold text-lg tracking-tight"
              style={{ fontFamily: "'Luckiest Guy', sans-serif" }}
            >
              DA
            </span>
            <span 
              className="text-[#eb0000] font-bold text-sm tracking-tight -mt-1"
              style={{ fontFamily: "'Luckiest Guy', sans-serif" }}
            >
              ITDAING
            </span>
          </div>
        </div>
      </div>

      {/* 서비스 문구 */}
      <div 
        className={`text-center transition-all duration-700 ${
          phase !== 'logo' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <h1 
          className="text-white text-2xl font-bold mb-2"
          style={{ fontFamily: "'Luckiest Guy', sans-serif" }}
        >
          다잇다잉
        </h1>
        <p className="text-white/90 text-sm font-medium">
          흩어진 플리마켓 정보를 하나로
        </p>
        <p className="text-white/70 text-xs mt-1">
          취향 맞춤 연결 플랫폼
        </p>
      </div>

      {/* 로딩 인디케이터 */}
      <div className="absolute bottom-16 flex items-center gap-2">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-white/60 rounded-full"
              style={{
                animation: 'bounce 1s ease-in-out infinite',
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* 하단 문구 */}
      <p className="absolute bottom-6 text-white/50 text-[10px]">
        광주광역시 플리마켓 추천 서비스
      </p>

      {/* 커스텀 애니메이션 스타일 */}
      <style>{`
        @keyframes logoEnter {
          0% { transform: scale(0.5) rotate(-10deg); opacity: 0; }
          50% { transform: scale(1.1) rotate(5deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
          50% { transform: translateY(-20px) scale(1.2); opacity: 0.6; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;

