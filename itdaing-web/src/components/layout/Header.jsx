import { User, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { usePopups, useSellers } from "../../hooks/usePopups.js";

export function Header({
  onLoginClick,
  isLoggedIn,
  onLogoDoubleClick,
  onLogoutClick,
  onLogoClick,
  onMyPageClick,
  onPopupClick,
  onSellerClick,
}) {
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const { data: popupData } = usePopups();
  const { data: sellerData } = useSellers();
  const searchPanelRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setSearchResults([]);
      setShowAutocomplete(false);
      return;
    }
    const query = searchQuery.toLowerCase().trim();
    const results = [];
    (popupData ?? []).forEach((popup) => {
      if (popup.title.toLowerCase().includes(query)) {
        results.push({
          id: popup.id,
          type: "popup",
          name: popup.title,
          subtitle: popup.locationName ?? "",
        });
      }
    });
    (sellerData ?? []).forEach((seller) => {
      if (seller.name.toLowerCase().includes(query)) {
        results.push({
          id: seller.id,
          type: "seller",
          name: seller.name,
          subtitle: seller.category ?? "판매자",
        });
      }
    });
    setSearchResults(results.slice(0, 8));
    setShowAutocomplete(results.length > 0);
  }, [searchQuery, popupData, sellerData]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchPanelRef.current && !searchPanelRef.current.contains(event.target)) {
        setShowAutocomplete(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const openSearch = () => setShowSearchPanel(true);
    window.addEventListener("header:openSearch", openSearch);
    return () => window.removeEventListener("header:openSearch", openSearch);
  }, []);

  useEffect(() => {
    if (showSearchPanel && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showSearchPanel]);

  const handleResultClick = (result) => {
    if (result.type === "popup" && onPopupClick) onPopupClick(result.id);
    else if (result.type === "seller" && onSellerClick) onSellerClick(result.id);
    setSearchQuery("");
    setShowAutocomplete(false);
    setShowSearchPanel(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, searchResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && searchResults[selectedIndex]) {
        handleResultClick(searchResults[selectedIndex]);
      }
    } else if (e.key === "Escape") {
      setShowAutocomplete(false);
      setSelectedIndex(-1);
      if (showSearchPanel) {
        setShowSearchPanel(false);
      }
    }
  };

  return (
    <header className="w-full border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-[1089px] items-center justify-between px-4 sm:h-18 sm:px-6 lg:h-20 lg:px-8">
        <div
          className="flex h-full cursor-pointer items-center pt-2 xs:pt-3"
          onClick={onLogoClick}
          onDoubleClick={onLogoDoubleClick}
          title="클릭하여 메인화면으로 이동 / 더블클릭하여 추천 팝업 리셋"
        >
          <span className="flex items-center whitespace-nowrap font-['Luckiest_Guy:Regular',sans-serif] text-[#eb0000] text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl leading-none">
            DA-ITDAING
          </span>
        </div>
        <div className="flex items-center gap-1 xs:gap-2 sm:gap-3 md:gap-4">
          <button
            onClick={() => setShowSearchPanel(true)}
            className="flex size-10 items-center justify-center rounded-full border border-gray-200 text-gray-700 transition hover:border-[#eb0000] hover:text-[#eb0000] sm:size-11 md:size-12"
            aria-label="검색 열기"
          >
            <Search className="size-5 sm:size-6" />
          </button>
          {isLoggedIn ? (
            <>
              <button
                onClick={onMyPageClick}
                className="flex size-10 items-center justify-center rounded-full text-gray-700 transition hover:bg-gray-100 sm:size-11 md:size-10"
                aria-label="My Page"
              >
                <User className="size-5 sm:size-6" />
              </button>
              {onLogoutClick && (
                <button
                  onClick={onLogoutClick}
                  className="rounded-lg bg-gray-200 px-3 py-1.5 text-xs font-['Pretendard:SemiBold',sans-serif] text-gray-700 transition hover:bg-gray-300 sm:px-3.5 sm:text-sm md:text-base"
                  aria-label="Logout"
                >
                  로그아웃
                </button>
              )}
            </>
          ) : (
            <button
              onClick={onLoginClick}
              className="rounded-lg bg-[#eb0000] px-3 py-1.5 text-xs font-['Pretendard:SemiBold',sans-serif] text-white transition hover:bg-[#cc0000] sm:px-4 sm:text-sm md:text-base"
              aria-label="Login"
            >
              로그인
            </button>
          )}
        </div>
      </div>

      {showSearchPanel && (
        <>
          <div
            className="fixed inset-0 z-10000 bg-black/30"
            onClick={() => {
              setShowSearchPanel(false);
              setShowAutocomplete(false);
            }}
          />
          <div className="fixed left-1/2 top-6 z-10010 w-full max-w-2xl -translate-x-1/2 px-4 sm:top-10">
            <div ref={searchPanelRef} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl">
              <div className="relative w-full">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="팝업명 또는 판매자명 검색"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => {
                    if (searchResults.length > 0) setShowAutocomplete(true);
                  }}
                  className="h-12 w-full rounded-full border border-[#ccc6c6] px-4 pr-24 text-base focus:border-[#eb0000] focus:outline-none"
                />
                <button
                  className="absolute right-12 top-1/2 -translate-y-1/2 rounded-full p-2 text-[#eb0000] transition hover:bg-red-50"
                  aria-label="Search"
                  onClick={() => {
                    if (selectedIndex >= 0 && searchResults[selectedIndex]) {
                      handleResultClick(searchResults[selectedIndex]);
                    }
                  }}
                >
                  <Search className="h-5 w-5" />
                </button>
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-gray-600 transition hover:bg-gray-100"
                  aria-label="Close"
                  onClick={() => {
                    setShowSearchPanel(false);
                    setSearchQuery("");
                    setShowAutocomplete(false);
                  }}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {showAutocomplete && searchResults.length > 0 && (
                <div className="mt-3 max-h-[60vh] overflow-y-auto rounded-2xl border border-gray-200" role="listbox">
                  {searchResults.map((result, index) => (
                    <button
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleResultClick(result)}
                      className={`w-full border-b border-gray-100 px-4 py-3 text-left transition hover:bg-gray-50 last:border-b-0 ${
                        index === selectedIndex ? "bg-gray-100" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex size-10 shrink-0 items-center justify-center rounded-full ${
                            result.type === "popup" ? "bg-[#eb0000]" : "bg-[#3d3d3d]"
                          }`}
                        >
                          {result.type === "popup" ? (
                            <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
                            </svg>
                          ) : (
                            <User className="h-6 w-6 text-white" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-['Pretendard',sans-serif] text-[15px] font-semibold text-gray-800 truncate">
                            {result.name}
                          </div>
                          {result.subtitle && (
                            <div className="font-['Pretendard',sans-serif] text-[13px] text-gray-500 truncate">
                              {result.subtitle}
                            </div>
                          )}
                        </div>
                        <div
                          className={`rounded-full px-3 py-1 text-[12px] font-['Pretendard',sans-serif] font-medium ${
                            result.type === "popup" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {result.type === "popup" ? "팝업" : "판매자"}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
}
