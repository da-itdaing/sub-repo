import { Instagram, Facebook, Youtube, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes/paths';

/**
 * Footer 컴포넌트
 * 회사 정보, 링크, SNS
 */
const Footer = () => {
  return (
    <footer className="bg-[#2a2a2a] text-white mt-auto pb-16 md:pb-24">
      <div className="w-full max-w-[540px] md:max-w-[1200px] mx-auto px-5 md:px-8 py-8 md:py-12">
        {/* Main Footer Content */}
        <div className="space-y-8 md:space-y-0 md:grid md:grid-cols-4 md:gap-8 mb-8 md:mb-10">
          {/* Logo and Description (모바일: 중앙 정렬) */}
          <div className="text-center md:text-left">
            <h2 className="text-2xl md:text-3xl text-primary mb-3 md:mb-4" style={{ fontFamily: "'Luckiest Guy', sans-serif" }}>
              DA-ITDAING
            </h2>
            <p className="text-sm md:text-base text-white font-semibold leading-relaxed mb-2">
              사람과 공간, 그리고 마음을 잇다
            </p>
            <p className="text-xs md:text-sm text-gray-400 leading-relaxed">
              광주광역시의 특별한 팝업스토어를<br />
              한눈에 찾아보세요
            </p>
          </div>

          {/* Quick Links & Info (모바일: 1행 2열 중앙 정렬) */}
          <div className="grid grid-cols-2 md:contents gap-6 md:gap-0 max-w-sm md:max-w-none mx-auto md:mx-0">
            {/* Quick Links */}
            <div className="text-center md:text-left">
              <h3 className="font-bold text-sm md:text-base text-white mb-3 md:mb-4">
                바로가기
              </h3>
              <ul className="space-y-2.5">
                <li>
                  <Link to={ROUTES.home} className="text-xs md:text-sm text-gray-300 hover:text-white transition-colors inline-block">
                    <span className="hidden md:inline mr-1.5">→</span>이벤트 둘러보기
                  </Link>
                </li>
                <li>
                  <Link to={ROUTES.nearby} className="text-xs md:text-sm text-gray-300 hover:text-white transition-colors inline-block">
                    <span className="hidden md:inline mr-1.5">→</span>주변 탐색
                  </Link>
                </li>
                <li>
                  <a href="#" className="text-xs md:text-sm text-gray-300 hover:text-white transition-colors inline-block">
                    <span className="hidden md:inline mr-1.5">→</span>판매자 등록
                  </a>
                </li>
                <li>
                  <a href="#" className="text-xs md:text-sm text-gray-300 hover:text-white transition-colors inline-block">
                    <span className="hidden md:inline mr-1.5">→</span>고객센터
                  </a>
                </li>
              </ul>
            </div>

            {/* Info Links */}
            <div className="text-center md:text-left">
              <h3 className="font-bold text-sm md:text-base text-white mb-3 md:mb-4">
                정보
              </h3>
              <ul className="space-y-2.5">
                <li>
                  <a href="#" className="text-xs md:text-sm text-gray-300 hover:text-white transition-colors inline-block">
                    <span className="hidden md:inline mr-1.5">→</span>회사 소개
                  </a>
                </li>
                <li>
                  <a href="#" className="text-xs md:text-sm text-gray-300 hover:text-white transition-colors inline-block">
                    <span className="hidden md:inline mr-1.5">→</span>이용약관
                  </a>
                </li>
                <li>
                  <a href="#" className="text-xs md:text-sm text-gray-300 hover:text-white transition-colors inline-block">
                    <span className="hidden md:inline mr-1.5">→</span>개인정보처리방침
                  </a>
                </li>
                <li>
                  <a href="#" className="text-xs md:text-sm text-gray-300 hover:text-white transition-colors inline-block">
                    <span className="hidden md:inline mr-1.5">→</span>제휴 문의
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Contact & Social (모바일: 중앙 정렬) */}
          <div className="text-center md:text-left">
            <h3 className="font-bold text-sm md:text-base text-white mb-3 md:mb-4">
              문의하기
            </h3>
            <div className="space-y-2 md:space-y-3 mb-4">
              <p className="text-xs md:text-sm">
                <span className="block font-bold text-white mb-2">고객센터</span>
                <span className="block text-gray-300">이메일: info@daitdaing.com</span>
                <span className="block text-gray-300">전화: 1588-0000</span>
                <span className="block text-gray-400 mt-1.5">평일 09:00 - 18:00</span>
              </p>
            </div>
            <div className="flex gap-2 md:gap-3 justify-center md:justify-start">
              <a href="#" className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-primary transition-colors" aria-label="Instagram">
                <Instagram className="w-4 h-4 md:w-5 md:h-5" />
              </a>
              <a href="#" className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-primary transition-colors" aria-label="Facebook">
                <Facebook className="w-4 h-4 md:w-5 md:h-5" />
              </a>
              <a href="#" className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-primary transition-colors" aria-label="Youtube">
                <Youtube className="w-4 h-4 md:w-5 md:h-5" />
              </a>
              <a href="#" className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-primary transition-colors" aria-label="Email">
                <Mail className="w-4 h-4 md:w-5 md:h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 pt-5 md:pt-6 mt-8 md:mt-10">
          {/* Copyright & Business Info */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-4">
            {/* 모바일: 중앙 정렬 세로 배치 */}
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-400 text-center md:text-left">
              <p className="font-medium text-gray-300">
                © 2025 Da-It daing. All rights reserved.
              </p>
              <span className="hidden md:inline text-gray-600">|</span>
              <p>
                대표: 홍길동
              </p>
              <span className="hidden md:inline text-gray-600">|</span>
              <p>
                사업자등록번호: 123-45-67890
              </p>
            </div>
            <div className="flex gap-3 text-xs md:text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors font-medium">이용약관</a>
              <span className="text-gray-600">|</span>
              <a href="#" className="hover:text-white transition-colors font-medium">개인정보처리방침</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

