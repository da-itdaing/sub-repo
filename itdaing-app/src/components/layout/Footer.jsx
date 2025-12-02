import { Instagram, Facebook, Youtube, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes/paths';

/**
 * SNS 원형 아이콘 버튼
 */
const IconButton = ({ icon, label }) => (
  <a
    href="#"
    aria-label={label}
    className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-primary transition-colors"
  >
    {icon}
  </a>
);

/**
 * Footer 컴포넌트
 * - 앱/웹 모두 동일한 내용 사용
 * - 모바일에서는 BottomNav에 가리지 않도록 하단 여백을 넉넉하게 확보
 */
const Footer = () => {
  return (
    <footer className="bg-[#2a2a2a] text-white mt-auto pb-10 md:pb-16 mb-4 md:mb-6">
      {/* Mobile: Compact footer */}
      <div className="md:hidden w-full max-w-[540px] mx-auto px-5 py-8 flex flex-col items-center text-center gap-4">
        <div>
          <h2
            className="text-2xl text-primary"
            style={{ fontFamily: "'Luckiest Guy', sans-serif" }}
          >
            DA-ITDAING
          </h2>
          <p className="text-sm font-semibold mt-1">사람과 공간, 그리고 마음을 잇다</p>
          <p className="text-xs text-gray-400 mt-1">광주 팝업 큐레이션 플랫폼</p>
        </div>
        <div className="flex gap-3">
          <IconButton icon={<Instagram className="w-4 h-4" />} label="Instagram" />
          <IconButton icon={<Facebook className="w-4 h-4" />} label="Facebook" />
          <IconButton icon={<Youtube className="w-4 h-4" />} label="Youtube" />
          <IconButton icon={<Mail className="w-4 h-4" />} label="Email" />
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <a href="#" className="hover:text-white font-medium">
            이용약관
          </a>
          <span className="text-gray-600">|</span>
          <a href="#" className="hover:text-white font-medium">
            개인정보처리방침
          </a>
        </div>
        <p className="text-[11px] text-gray-500">
          © 2025 Da-It daing · 인공지능 사관학교 6기
        </p>
      </div>

      {/* Desktop & tablet */}
      <div className="hidden md:block w-full max-w-[1200px] mx-auto px-8 py-14">
        {/* Main Footer Content */}
        <div className="grid grid-cols-4 gap-8 mb-10">
          {/* Logo and Description */}
          <div>
            <h2
              className="text-3xl text-primary mb-4"
              style={{ fontFamily: "'Luckiest Guy', sans-serif" }}
            >
              DA-ITDAING
            </h2>
            <p className="text-base text-white font-semibold leading-relaxed">
              사람과 공간, 그리고 마음을 잇다
            </p>
            <p className="text-sm text-gray-400 leading-relaxed mt-2">
              광주광역시의 특별한 팝업스토어를 한눈에 찾아보세요
            </p>
          </div>

          {/* Quick Links & Info */}
          <div className="grid grid-cols-2 gap-8">
            {/* Quick Links */}
            <div>
              <h3 className="font-bold text-base text-white mb-4">바로가기</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    to={ROUTES.home}
                    className="text-sm text-gray-300 hover:text-white transition-colors inline-block"
                  >
                    이벤트 둘러보기
                  </Link>
                </li>
                <li>
                  <Link
                    to={ROUTES.nearby}
                    className="text-sm text-gray-300 hover:text-white transition-colors inline-block"
                  >
                    주변 탐색
                  </Link>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-300 hover:text-white transition-colors inline-block"
                  >
                    판매자 등록
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-300 hover:text-white transition-colors inline-block"
                  >
                    고객센터
                  </a>
                </li>
              </ul>
            </div>

            {/* Info Links */}
            <div>
              <h3 className="font-bold text-base text-white mb-4">정보</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-300 hover:text-white transition-colors inline-block"
                  >
                    회사 소개
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-300 hover:text-white transition-colors inline-block"
                  >
                    이용약관
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-300 hover:text-white transition-colors inline-block"
                  >
                    개인정보처리방침
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-300 hover:text-white transition-colors inline-block"
                  >
                    제휴 문의
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Contact & Social */}
          <div>
            <h3 className="font-bold text-base text-white mb-4">문의하기</h3>
            <div className="space-y-2 mb-4">
              <p className="text-sm">
                <span className="block font-bold text-white mb-1.5">고객센터</span>
                <span className="block text-gray-300">이메일: info@daitdaing.com</span>
                <span className="block text-gray-300">전화: 1588-0000</span>
                <span className="block text-gray-400 text-xs mt-1">
                  평일 09:00 - 18:00
                </span>
              </p>
            </div>
            <div className="flex gap-3">
              <IconButton icon={<Instagram className="w-5 h-5" />} label="Instagram" />
              <IconButton icon={<Facebook className="w-5 h-5" />} label="Facebook" />
              <IconButton icon={<Youtube className="w-5 h-5" />} label="Youtube" />
              <IconButton icon={<Mail className="w-5 h-5" />} label="Email" />
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 pt-6 mt-10">
          <div className="flex flex-row justify-between items-center gap-4">
            <div className="flex flex-row items-center gap-4 text-sm text-gray-400">
              <p className="font-medium text-gray-300">
                © 2025 Da-It daing. All rights reserved.
              </p>
              <span className="text-gray-600">|</span>
              <p>인공지능 사관학교 6기</p>
            </div>
            <div className="flex gap-3 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors font-medium">
                이용약관
              </a>
              <span className="text-gray-600">|</span>
              <a href="#" className="hover:text-white transition-colors font-medium">
                개인정보처리방침
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


