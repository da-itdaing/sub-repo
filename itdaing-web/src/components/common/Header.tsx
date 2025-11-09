import { User, Search, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { popups } from "../../data/popups";
import { sellers } from "../../data/sellers";

interface HeaderProps {
  onLoginClick: () => void;
  isLoggedIn: boolean;
  onLogoDoubleClick?: () => void;
  onLogoutClick?: () => void;
  onLogoClick?: () => void;
  onMyPageClick?: () => void;
  onPopupClick?: (popupId: number) => void;
  onSellerClick?: (sellerId: number) => void;
}

interface SearchResult {
  id: number;
  type: "popup" | "seller";
  name: string;
  subtitle?: string;
}

export function Header({ 
  onLoginClick, 
  isLoggedIn, 
  onLogoDoubleClick, 
  onLogoutClick, 
  onLogoClick, 
  onMyPageClick,
  onPopupClick,
  onSellerClick
}: HeaderProps) {
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setSearchResults([]);
      setShowAutocomplete(false);
      return;
    }
    const query = searchQuery.toLowerCase().trim();
    const results: SearchResult[] = [];
    popups.forEach(popup => {
      if (popup.title.toLowerCase().includes(query)) {
        results.push({
          id: popup.id,
            type: "popup",
            name: popup.title,
            subtitle: popup.location
        });
      }
    });
    sellers.forEach(seller => {
      if (seller.name.toLowerCase().includes(query)) {
        results.push({
          id: seller.id,
          type: "seller",
          name: seller.name,
          subtitle: "판매자"
        });
      }
    });
    setSearchResults(results.slice(0, 8));
    setShowAutocomplete(results.length > 0);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowAutocomplete(false);
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(event.target as Node)) {
        setShowAutocomplete(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleResultClick = (result: SearchResult) => {
    if (result.type === "popup" && onPopupClick) onPopupClick(result.id);
    else if (result.type === "seller" && onSellerClick) onSellerClick(result.id);
    setSearchQuery("");
    setShowAutocomplete(false);
    setShowMobileSearch(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, searchResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && searchResults[selectedIndex]) {
        handleResultClick(searchResults[selectedIndex]);
      }
    } else if (e.key === "Escape") {
      setShowAutocomplete(false);
      setSelectedIndex(-1);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-gray-50 border-b border-gray-200 shadow-sm">
      <div className="max-w-[1089px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 h-12 xs:h-14 sm:h-16 md:h-16 lg:h-20">
        <div className="flex items-center justify-between h-full gap-2 sm:gap-4 md:gap-4">
          <div 
            className="flex items-center h-full flex-shrink-0 cursor-pointer pt-2 xs:pt-3 pl-1 xs:pl-2 md:pl-0 md:pt-1.5" 
            onClick={onLogoClick}
            onDoubleClick={onLogoDoubleClick}
            title="클릭하여 메인화면으로 이동 / 더블클릭하여 추천 팝업 리셋"
          >
            <span className="font-['Luckiest_Guy:Regular',sans-serif] text-[#eb0000] text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl whitespace-nowrap leading-none flex items-center">DA-ITDAING</span>
          </div>
          <div className="hidden md:flex flex-1 items-center justify-center max-w-[400px] mx-auto h-full">
            <div className="relative w-full" ref={searchRef}>
              <input
                type="text"
                placeholder="팝업명 또는 판매자명 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => { if (searchResults.length > 0) setShowAutocomplete(true); }}
                className="w-full h-8 sm:h-9 md:h-10 lg:h-12 px-3 sm:px-4 md:px-5 pr-8 sm:pr-9 md:pr-10 lg:pr-12 rounded-full border border-[#ccc6c6] focus:outline-none focus:border-[#eb0000] transition-colors text-xs sm:text-sm md:text-base"
              />
              <button className="absolute right-2 sm:right-2.5 md:right-3 top-1/2 -translate-y-1/2 p-0.5" aria-label="Search">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-[#CCC6C6]" />
              </button>
              {showAutocomplete && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden z-50 max-h-[400px] overflow-y-auto">
                  {searchResults.map((result, index) => (
                    <button
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleResultClick(result)}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${index === selectedIndex ? 'bg-gray-100' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${result.type === "popup" ? "bg-[#eb0000]" : "bg-[#3d3d3d]"}`}>
                          {result.type === "popup" ? (
                            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/></svg>
                          ) : (
                            <User className="w-5 h-5 text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-['Pretendard',sans-serif] font-semibold text-[14px] text-gray-800 truncate">{result.name}</div>
                          {result.subtitle && (<div className="font-['Pretendard',sans-serif] text-[12px] text-gray-500 truncate">{result.subtitle}</div>)}
                        </div>
                        <div className={`px-2 py-1 rounded-full text-[11px] font-['Pretendard',sans-serif] font-medium ${result.type === "popup" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}`}>{result.type === "popup" ? "팝업" : "판매자"}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center h-full gap-1 xs:gap-2 sm:gap-3 md:gap-3 lg:gap-4 flex-shrink-0">
            <button
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              className="md:hidden flex items-center justify-center min-w-[40px] min-h-[40px] xs:min-w-[44px] xs:min-h-[44px] hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Search"
            >
              <Search className="size-5 xs:size-6 sm:size-7 text-gray-700" />
            </button>
            {isLoggedIn ? (
              <>
                <button
                  onClick={onMyPageClick}
                  className="flex items-center justify-center size-10 sm:size-11 md:size-9 lg:size-10 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="My Page"
                >
                  <User className="size-5 sm:size-6 md:size-6 lg:size-7 text-gray-700" />
                </button>
                {onLogoutClick && (
                  <button
                    onClick={onLogoutClick}
                    className="px-3 py-1.5 sm:px-3.5 sm:py-2 md:px-3 md:py-1.5 lg:px-4 lg:py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-['Pretendard:SemiBold',sans-serif] text-xs sm:text-sm md:text-base whitespace-nowrap"
                    aria-label="Logout"
                  >
                    로그아웃
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={onLoginClick}
                className="px-3 py-1.5 sm:px-4 sm:py-2 md:px-4 md:py-2 lg:px-5 lg:py-2.5 bg-[#eb0000] text-white rounded-lg hover:bg-[#cc0000] transition-colors font-['Pretendard:SemiBold',sans-serif] text-xs sm:text-sm md:text-base whitespace-nowrap"
                aria-label="Login"
              >
                로그인
              </button>
            )}
          </div>
        </div>
      </div>
      {showMobileSearch && (
        <>
          <div 
            className="md:hidden fixed inset-0 bg-black/30 z-40"
            onClick={() => setShowMobileSearch(false)}
          />
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg animate-in slide-in-from-top duration-200 z-50">
            <div className="max-w-[1089px] mx-auto px-3 sm:px-4 py-4">
              <div className="relative w-full" ref={mobileSearchRef}>
                <input
                  type="text"
                  placeholder="팝업명 또는 판매자명 검색"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => { if (searchResults.length > 0) setShowAutocomplete(true); }}
                  autoFocus
                  className="w-full h-12 px-4 pr-20 rounded-full border-2 border-[#ccc6c6] focus:outline-none focus:border-[#eb0000] transition-colors text-base"
                />
                <button 
                  className="absolute right-12 top-1/2 -translate-y-1/2 p-2" 
                  aria-label="Search"
                  onClick={() => { if (selectedIndex >= 0 && searchResults[selectedIndex]) handleResultClick(searchResults[selectedIndex]); }}
                >
                  <Search className="w-6 h-6 text-[#eb0000]" />
                </button>
                <button 
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full transition-colors" 
                  aria-label="Close"
                  onClick={() => { setShowMobileSearch(false); setSearchQuery(""); setShowAutocomplete(false); }}
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
                {showAutocomplete && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden z-50 max-h-[60vh] overflow-y-auto">
                    {searchResults.map((result, index) => (
                      <button
                        key={`${result.type}-${result.id}`}
                        onClick={() => handleResultClick(result)}
                        className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${index === selectedIndex ? 'bg-gray-100' : ''}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${result.type === "popup" ? "bg-[#eb0000]" : "bg-[#3d3d3d]"}`}>
                            {result.type === "popup" ? (
                              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/></svg>
                            ) : (
                              <User className="w-6 h-6 text-white" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-['Pretendard',sans-serif] font-semibold text-[15px] text-gray-800 truncate">{result.name}</div>
                            {result.subtitle && (<div className="font-['Pretendard',sans-serif] text-[13px] text-gray-500 truncate">{result.subtitle}</div>)}
                          </div>
                          <div className={`px-2.5 py-1 rounded-full text-[12px] font-['Pretendard',sans-serif] font-medium ${result.type === "popup" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}`}>{result.type === "popup" ? "팝업" : "판매자"}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
