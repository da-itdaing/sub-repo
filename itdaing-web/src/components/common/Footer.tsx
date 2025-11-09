import { Instagram, Facebook, Youtube, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#2a2a2a] text-white mt-auto pb-16 sm:pb-20 md:pb-24">
      <div className="max-w-[1089px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 mb-6 md:mb-8">
          <div className="col-span-2 lg:col-span-1 text-center">
            <div className="mb-3 md:mb-4">
              <span className="font-['Luckiest_Guy:Regular',sans-serif] text-[#eb0000] text-lg md:text-xl">DA-IT DAING</span>
            </div>
            <p className="font-['Pretendard:Regular',sans-serif] text-xs sm:text-sm md:text-[14px] text-gray-300 leading-relaxed">
              사람과 공간, 그리고 마음을 잇다
            </p>
          </div>
          <div className="text-center">
            <h3 className="font-['Pretendard:Bold',sans-serif] text-sm sm:text-base md:text-[16px] mb-2 sm:mb-3 md:mb-4">바로가기</h3>
            <ul className="space-y-1">
              {['이벤트 둘러보기','주변 탐색','판매자 등록','고객센터'].map(link => (
                <li key={link}><a href="#" className="font-['Pretendard:Regular',sans-serif] text-[11px] sm:text-sm md:text-[14px] text-gray-300 hover:text-[#eb0000] transition-colors">{link}</a></li>
              ))}
            </ul>
          </div>
          <div className="text-center">
            <h3 className="font-['Pretendard:Bold',sans-serif] text-sm sm:text-base md:text-[16px] mb-2 sm:mb-3 md:mb-4">정보</h3>
            <ul className="space-y-1">
              {['회사 소개','이용약관','개인정보처리방침','제휴 문의'].map(link => (
                <li key={link}><a href="#" className="font-['Pretendard:Regular',sans-serif] text-[11px] sm:text-sm md:text-[14px] text-gray-300 hover:text-[#eb0000] transition-colors">{link}</a></li>
              ))}
            </ul>
          </div>
          <div className="col-span-2 lg:col-span-1 text-center">
            <h3 className="font-['Pretendard:Bold',sans-serif] text-sm sm:text-base md:text-[16px] mb-2 sm:mb-3 md:mb-4">문의하기</h3>
            <div className="space-y-1 sm:space-y-2 mb-3 sm:mb-4">
              <p className="font-['Pretendard:Regular',sans-serif] text-[11px] sm:text-sm md:text-[14px] text-gray-300">
                <span className="block">이메일: info@daitdaing.com</span>
                <span className="block">전화: 1588-0000</span>
              </p>
            </div>
            <div className="flex gap-2 sm:gap-3 justify-center">
              {[Instagram, Facebook, Youtube, Mail].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gray-700 flex items-center justify-center hover:bg-[#eb0000] transition-colors">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-4 md:pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-2 md:gap-4">
            <p className="font-['Pretendard:Regular',sans-serif] text-[10px] sm:text-xs md:text-[12px] text-gray-400 text-center md:text-left">© 2025 다 잇다잉. All rights reserved.</p>
            <p className="font-['Pretendard:Regular',sans-serif] text-[10px] sm:text-xs md:text-[12px] text-gray-400 text-center md:text-right">사업자등록번호: 123-45-67890 | 대표: 홍길동</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
