import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { getSearchSuggestions } from '@/services/searchService';
import { ROUTES } from '@/routes/paths';

const SearchBar = ({ onSearch }) => {
  const [keyword, setKeyword] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!keyword.trim()) {
        setSuggestions([]);
        return;
      }
      const results = await getSearchSuggestions(keyword);
      setSuggestions(results);
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [keyword]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    setIsOpen(false);
    if (onSearch) {
      onSearch(keyword);
    } else {
      navigate(`${ROUTES.search}?keyword=${encodeURIComponent(keyword)}`);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    navigate(ROUTES.popupDetail(suggestion.id));
    setIsOpen(false);
    setKeyword('');
  };

  return (
    <div ref={wrapperRef} className="relative flex-1 max-w-[160px] md:max-w-[500px]">
      <form onSubmit={handleSubmit} className="relative w-full">
        <input
          type="text"
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="검색어를 입력하세요"
          className="w-full h-8 md:h-11 px-3 md:px-5 pr-9 md:pr-12 rounded-full border border-gray-300 focus:outline-none focus:border-primary transition-colors text-xs md:text-base"
        />
        {keyword && (
          <button
            type="button"
            onClick={() => {
              setKeyword('');
              setSuggestions([]);
            }}
            className="absolute right-8 md:right-12 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-3 h-3 md:w-4 md:h-4" />
          </button>
        )}
        <button
          type="submit"
          className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2"
          aria-label="검색"
        >
          <Search className="w-4 h-4 md:w-6 md:h-6 text-gray-400" />
        </button>
      </form>

      {/* Auto-complete Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden z-50 max-h-[300px] overflow-y-auto">
          <ul>
            {suggestions.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleSuggestionClick(item)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                >
                  <Search className="w-4 h-4 text-gray-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                    <p className="text-xs text-gray-500 truncate">{item.category}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchBar;

