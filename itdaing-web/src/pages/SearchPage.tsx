import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Filter, X, Calendar, MapPin, Tag } from 'lucide-react';
import { popupService, PopupSearchParams } from '../services/popupService';
import { PopupSummary } from '../types/popup';
import { masterService } from '../services/masterService';
import { EmptyState } from '../components/common/EmptyState';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [selectedRegionId, setSelectedRegionId] = useState<number | undefined>(
    searchParams.get('regionId') ? parseInt(searchParams.get('regionId')!) : undefined
  );
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>(
    searchParams.get('categoryIds')?.split(',').map(Number).filter(Boolean) || []
  );
  const [startDate, setStartDate] = useState(searchParams.get('startDate') || '');
  const [endDate, setEndDate] = useState(searchParams.get('endDate') || '');
  const [showFilters, setShowFilters] = useState(false);
  
  const [popups, setPopups] = useState<PopupSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  
  const [categories, setCategories] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);

  useEffect(() => {
    // 마스터 데이터 로드
    masterService.getCategories().then(setCategories).catch(console.error);
    masterService.getRegions().then(setRegions).catch(console.error);
  }, []);

  const performSearch = async (pageNum: number = 0) => {
    setLoading(true);
    setError(null);
    
    try {
      const params: PopupSearchParams = {
        keyword: keyword || undefined,
        regionId: selectedRegionId,
        categoryIds: selectedCategoryIds.length > 0 ? selectedCategoryIds : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        approvalStatus: 'APPROVED', // 소비자는 승인된 팝업만 보기
        page: pageNum,
        size: 20,
      };
      
      const result = await popupService.searchPopups(params);
      setPopups(result.content);
      setPage(result.page);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
      
      // URL 업데이트
      const newParams = new URLSearchParams();
      if (keyword) newParams.set('keyword', keyword);
      if (selectedRegionId) newParams.set('regionId', selectedRegionId.toString());
      if (selectedCategoryIds.length > 0) newParams.set('categoryIds', selectedCategoryIds.join(','));
      if (startDate) newParams.set('startDate', startDate);
      if (endDate) newParams.set('endDate', endDate);
      if (pageNum > 0) newParams.set('page', pageNum.toString());
      setSearchParams(newParams);
    } catch (err) {
      setError(err instanceof Error ? err.message : '검색 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 초기 검색 실행
    const initialKeyword = searchParams.get('keyword');
    if (initialKeyword || selectedRegionId || selectedCategoryIds.length > 0 || startDate || endDate) {
      performSearch(0);
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    performSearch(0);
  };

  const handleCategoryToggle = (categoryId: number) => {
    setSelectedCategoryIds(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const clearFilters = () => {
    setKeyword('');
    setSelectedRegionId(undefined);
    setSelectedCategoryIds([]);
    setStartDate('');
    setEndDate('');
    setPage(0);
    setSearchParams({});
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 검색 바 */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="팝업명 또는 설명 검색..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                showFilters || selectedRegionId || selectedCategoryIds.length > 0 || startDate || endDate
                  ? 'bg-red-500 text-white border-red-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-5 h-5 inline mr-2" />
              필터
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              검색
            </button>
          </form>

          {/* 필터 패널 */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 지역 필터 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    지역
                  </label>
                  <select
                    value={selectedRegionId || ''}
                    onChange={(e) => setSelectedRegionId(e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">전체</option>
                    {regions.map(region => (
                      <option key={region.id} value={region.id}>{region.name}</option>
                    ))}
                  </select>
                </div>

                {/* 카테고리 필터 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Tag className="w-4 h-4 inline mr-1" />
                    카테고리
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(category => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => handleCategoryToggle(category.id)}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          selectedCategoryIds.includes(category.id)
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 시작일 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    시작일
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                {/* 종료일 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    종료일
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              {/* 필터 초기화 */}
              {(selectedRegionId || selectedCategoryIds.length > 0 || startDate || endDate) && (
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
                  >
                    <X className="w-4 h-4" />
                    필터 초기화
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 검색 결과 */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
            <p className="mt-4 text-gray-600">검색 중...</p>
          </div>
        ) : error ? (
          <EmptyState title="오류가 발생했습니다" description={error} />
        ) : popups.length === 0 ? (
          <EmptyState title="검색 결과가 없습니다." description="조건을 변경하거나 다른 키워드로 검색해보세요." />
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600">
              총 {totalElements}개의 팝업을 찾았습니다.
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {popups.map(popup => (
                <div
                  key={popup.id}
                  onClick={() => navigate(`/popup/${popup.id}`)}
                  className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="aspect-[4/3] bg-gray-200 relative overflow-hidden">
                    {popup.thumbnail ? (
                      <img
                        src={popup.thumbnail}
                        alt={popup.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        이미지 없음
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">{popup.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{popup.locationName}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{formatDate(popup.startDate)}</span>
                      <span>~</span>
                      <span>{formatDate(popup.endDate)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                <button
                  onClick={() => performSearch(page - 1)}
                  disabled={page === 0}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  이전
                </button>
                <span className="px-4 py-2">
                  {page + 1} / {totalPages}
                </span>
                <button
                  onClick={() => performSearch(page + 1)}
                  disabled={page >= totalPages - 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  다음
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

