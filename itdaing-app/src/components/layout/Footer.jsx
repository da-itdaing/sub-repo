import { Instagram, Facebook, Youtube, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes/paths';

const IconButton = ({ icon, label, href = '#', className = '' }) => (
  <a
    href={href}
    aria-label={label}
    target={href === '#' ? undefined : '_blank'}
    rel={href === '#' ? undefined : 'noreferrer'}
    className={`w-9 h-9 md:w-10 md:h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-primary transition duration-200 hover:scale-110 shadow-sm hover:shadow-lg ${className}`}
  >
    {icon}
  </a>
);

const Footer = () => {
  return (
    <footer className="bg-[#2a2a2a] text-white mt-auto pb-10 md:pb-16">
      {/* Mobile */}
      <div className="md:hidden w-full max-w-[540px] mx-auto px-5 py-8 flex flex-col items-center text-center gap-4">
        <div>
          <h2
            className="text-2xl text-primary"
            style={{ fontFamily: "'Luckiest Guy', sans-serif" }}
          >
            DA ITDAING
          </h2>
          <p className="text-sm font-semibold mt-1">사람과 공간, 그리고 마음을 잇다</p>
          <p className="text-xs text-gray-400 mt-1">광주 팝업 큐레이션 플랫폼</p>
        </div>
        <div className="flex gap-3">
          <IconButton icon={<Instagram className="w-4 h-4" />} label="Instagram" />
          <IconButton icon={<Facebook className="w-4 h-4" />} label="Facebook" />
          <IconButton icon={<Youtube className="w-4 h-4" />} label="Youtube" />
          <IconButton icon={<Mail className="w-4 h-4" />} label="Email" />
          <IconButton
            icon={<span className="text-[11px] font-bold tracking-tight text-white">LT</span>}
            label="Linktree"
            href="https://linktr.ee/daitdaing"
            className="bg-linear-to-br from-[#00C853] to-[#00E676] hover:from-[#00E676] hover:to-[#00C853]"
          />
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
        <p className="text-[11px] text-gray-500">© 2025 Da-It daing · 인공지능 사관학교 6기</p>
      </div>

      {/* Desktop */}
      <div className="hidden md:block w-full max-w-[1200px] mx-auto px-8 py-14">
        <div className="grid grid-cols-4 gap-16 mb-14">
          <div>
            <h2
              className="text-3xl text-primary mb-4"
              style={{ fontFamily: "'Luckiest Guy', sans-serif" }}
            >
              DA ITDAING
            </h2>
            <p className="text-base text-white font-semibold leading-relaxed">
              사람과 공간, 그리고 마음을 잇다
            </p>
            <p className="text-sm text-gray-400 leading-relaxed mt-2">
              광주광역시의 특별한 팝업스토어를 한눈에 찾아보세요
            </p>
          </div>

          <div>
            <h3 className="font-bold text-base text-white mb-4">바로가기</h3>
            <ul className="space-y-2">
              <li>
                <Link to={ROUTES.home} className="text-sm text-gray-300 hover:text-white">
                  이벤트 둘러보기
                </Link>
              </li>
              <li>
                <Link to={ROUTES.nearby} className="text-sm text-gray-300 hover:text-white">
                  주변 탐색
                </Link>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-300 hover:text-white">
                  판매자 등록
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-300 hover:text-white">
                  고객센터
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-base text-white mb-4">정보</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-gray-300 hover:text-white">
                  회사 소개
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-300 hover:text-white">
                  이용약관
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-300 hover:text-white">
                  개인정보처리방침
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-300 hover:text-white">
                  제휴 문의
                </a>
              </li>
            </ul>
          </div>

          <div className="flex flex-col items-start justify-between">
            <div>
              <h3 className="font-bold text-base text-white mb-4">문의하기</h3>
              <p className="text-sm">
                <span className="block font-bold text-white mb-1.5">고객센터</span>
                <span className="block text-gray-300">이메일: info@daitdaing.com</span>
                <span className="block text-gray-300">전화: 1588-0000</span>
                <span className="block text-gray-400 text-xs mt-1">평일 09:00 - 18:00</span>
              </p>
            </div>
            <div className="flex gap-3 mt-4">
              <IconButton icon={<Instagram className="w-5 h-5" />} label="Instagram" />
              <IconButton icon={<Facebook className="w-5 h-5" />} label="Facebook" />
              <IconButton icon={<Youtube className="w-5 h-5" />} label="Youtube" />
              <IconButton icon={<Mail className="w-5 h-5" />} label="Email" />
              <IconButton
                icon={<span className="text-[11px] font-bold tracking-tight text-white">LT</span>}
                label="Linktree"
                href="https://linktr.ee/daitdaing"
                className="bg-linear-to-br from-[#00C853] to-[#00E676] hover:from-[#00E676] hover:to-[#00C853]"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-6 mt-12">
          <div className="flex flex-row justify-between items-center gap-6">
            <div className="flex flex-row items-center gap-4 text-sm text-gray-400 flex-wrap">
              <p className="font-medium text-gray-300">© 2025 Da-It daing. All rights reserved.</p>
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
