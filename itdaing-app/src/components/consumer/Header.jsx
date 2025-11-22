/**
 * Consumer App Header (소비자 앱 헤더)
 * 
 * 구성:
 * - 로고 (왼쪽): DA-ITDAING (빨간색)
 * - 검색바 (중앙): 플레이스홀더 "팝업명 또는 판매자명 검색"
 * - 로그인 버튼 (오른쪽): 빨간색 버튼
 */
import { Link, useNavigate } from 'react-router-dom';
import { Search, User } from 'lucide-react';
import useAuthStore from '@/stores/useAuthStore';

const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  /**
   * 검색 처리 (현재는 플레이스홀더)
   */
  const handleSearch = (e) => {
    e.preventDefault();
    const query = e.target.search.value;
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="mx-auto w-full max-w-[480px] px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="shrink-0">
          <h1 className="font-['Luckiest_Guy',sans-serif] text-[#eb0000] text-2xl tracking-wide">
            Da - It daing
          </h1>
        </Link>

        {/* Search Bar (Hidden on very small screens, or compact) */}
        <div className="flex-1 mx-3 max-w-[240px]">
          <form onSubmit={handleSearch} className="relative">
             <input
              type="text"
              name="search"
              placeholder="검색어를 입력하세요"
              className="w-full h-9 pl-4 pr-9 rounded-full border border-[#ccc6c6] bg-white text-xs focus:outline-none focus:border-[#eb0000] focus:ring-1 focus:ring-[#eb0000] transition-all placeholder:text-gray-400"
            />
            <button type="submit" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#eb0000]">
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Profile/Login */}
        <div className="shrink-0">
          {isAuthenticated ? (
             <button
              onClick={() => navigate('/mypage')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="마이페이지"
            >
              <User className="w-6 h-6 text-black" />
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="로그인"
            >
              <User className="w-6 h-6 text-black" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

