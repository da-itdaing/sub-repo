import { Instagram, Facebook, Youtube, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="static z-0 w-full bg-[#2a2a2a] text-white pb-20 md:pb-8">
      {/* 모바일: BottomNav를 위한 하단 패딩, 웹: 일반 하단 패딩 */}
      {/* Footer는 스크롤해서 최종단에만 보이면 됨 (고정 불필요) */}
      {/* static z-0으로 설정하여 BottomNav(fixed z-[100]) 아래에 확실히 위치하도록 보장 */}
      <div className="w-full max-w-[1089px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-10 lg:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 lg:gap-10 mb-6 sm:mb-8 md:mb-10">
          {/* 브랜드 섹션 */}
          <div className="col-span-2 md:col-span-1 text-center md:text-left mb-4 md:mb-0">
            <div className="mb-3 md:mb-4">
              <span className="font-['Luckiest_Guy:Regular',sans-serif] text-[#eb0000] text-lg sm:text-xl md:text-2xl lg:text-3xl">DA-ITDAING</span>
            </div>
            <p className="font-['Pretendard:Regular',sans-serif] text-xs sm:text-sm md:text-[14px] lg:text-[15px] text-gray-300 leading-relaxed">
              사람과 공간, 그리고 마음을 잇다
            </p>
          </div>
          
          {/* 바로가기 섹션 */}
          <div className="col-span-1 text-center md:text-left">
            <h3 className="font-['Pretendard:Bold',sans-serif] text-sm sm:text-base md:text-lg mb-2 sm:mb-3 md:mb-4 text-white">바로가기</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              {["이벤트 둘러보기","주변 탐색","판매자 등록","고객센터"].map(link => (
                <li key={link}>
                  <a 
                    href="#" 
                    className="font-['Pretendard:Regular',sans-serif] text-[11px] sm:text-xs md:text-sm text-gray-300 hover:text-[#eb0000] transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* 정보 섹션 */}
          <div className="col-span-1 text-center md:text-left">
            <h3 className="font-['Pretendard:Bold',sans-serif] text-sm sm:text-base md:text-lg mb-2 sm:mb-3 md:mb-4 text-white">정보</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              {["회사 소개","이용약관","개인정보처리방침","제휴 문의"].map(link => (
                <li key={link}>
                  <a 
                    href="#" 
                    className="font-['Pretendard:Regular',sans-serif] text-[11px] sm:text-xs md:text-sm text-gray-300 hover:text-[#eb0000] transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* 문의하기 섹션 */}
          <div className="col-span-2 md:col-span-1 text-center md:text-left">
            <h3 className="font-['Pretendard:Bold',sans-serif] text-sm sm:text-base md:text-lg mb-2 sm:mb-3 md:mb-4 text-white">문의하기</h3>
            <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4 md:mb-5">
              <p className="font-['Pretendard:Regular',sans-serif] text-[11px] sm:text-xs md:text-sm text-gray-300">
                <span className="block">이메일: info@daitdaing.com</span>
                <span className="block">전화: 1588-0000</span>
              </p>
            </div>
            <div className="flex gap-2 sm:gap-2.5 justify-center md:justify-start">
              {[Instagram, Facebook, Youtube, Mail].map((Icon, i) => (
                <a 
                  key={i} 
                  href="#" 
                  className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-gray-700 hover:bg-[#eb0000] transition-colors flex items-center justify-center"
                  aria-label={`Social media link ${i + 1}`}
                >
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" />
                </a>
              ))}
            </div>
          </div>
        </div>
        
        {/* 하단 저작권 정보 */}
        <div className="border-t border-gray-700 pt-4 sm:pt-5 md:pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-2 sm:gap-3 md:gap-4">
            <p className="font-['Pretendard:Regular',sans-serif] text-[10px] sm:text-[11px] md:text-xs text-gray-400 text-center md:text-left">
              © 2025 다 잇다잉. All rights reserved.
            </p>
            <p className="font-['Pretendard:Regular',sans-serif] text-[10px] sm:text-[11px] md:text-xs text-gray-400 text-center md:text-right">
              사업자등록번호: 123-45-67890 | 대표: 홍길동
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
