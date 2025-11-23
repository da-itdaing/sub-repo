import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BottomNav from '@/components/layout/BottomNav';
import EventCard from '@/components/popup/EventCard';
import { useSearchPopups } from '@/hooks/usePopups';
import { ROUTES } from '@/routes/paths';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const keyword = searchParams.get('keyword') ?? '';
  const trimmedKeyword = keyword.trim();
  const hasKeyword = trimmedKeyword.length > 0;

  const { data: searchResult, isLoading } = useSearchPopups(
    hasKeyword ? { keyword: trimmedKeyword, size: 24 } : {}
  );

  const popups = useMemo(() => {
    if (!hasKeyword) return [];
    if (!searchResult) return [];
    
    const now = new Date();
    const list = Array.isArray(searchResult.content) ? searchResult.content : Array.isArray(searchResult) ? searchResult : [];
    
    return list.filter((popup) => {
      const endDate = popup.endDate ? new Date(popup.endDate) : null;
      if (endDate && now > endDate) return false;
      return true;
    });
  }, [hasKeyword, searchResult]);

  const handleKeywordChange = (event) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('keyword', event.target.value);
      return next;
    });
  };

  const handleCardClick = (popupId) => {
    navigate(ROUTES.popupDetail(popupId));
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 w-full max-w-[540px] md:max-w-[1200px] mx-auto px-5 md:px-8 py-8 space-y-8">
        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-100 md:p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Search</p>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">어떤 팝업을 찾고 계신가요?</h1>
          <p className="text-sm text-gray-500">키워드를 입력하면 제목·설명·지역을 기준으로 검색합니다.</p>
          <div className="mt-5">
            <input
              type="search"
              value={keyword}
              onChange={handleKeywordChange}
              placeholder="예: 남구 팝업, 푸드트럭"
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:border-primary focus:outline-none"
            />
          </div>
        </section>

        {!hasKeyword ? (
          <div className="rounded-3xl bg-white p-10 text-center text-sm text-gray-500 shadow-sm">
            검색어를 입력하면 결과가 표시됩니다.
          </div>
        ) : isLoading ? (
          <div className="rounded-3xl bg-white p-10 text-center text-sm text-gray-500 shadow-sm">
            검색 중입니다...
          </div>
        ) : popups.length === 0 ? (
          <div className="rounded-3xl bg-white p-10 text-center text-sm text-gray-500 shadow-sm">
            '{trimmedKeyword}'에 해당하는 팝업을 찾지 못했습니다.
          </div>
        ) : (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">검색 결과</h2>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-[0.2em]">
                {popups.length} result
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {popups.map((popup) => (
                <div key={popup.id} className="h-full">
                  <EventCard popup={popup} onCardClick={handleCardClick} />
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
};

export default SearchPage;

