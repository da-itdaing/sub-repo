import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { MoveLeft } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BottomNav from '@/components/layout/BottomNav';
import EventCard from '@/components/popup/EventCard';
import { usePopups } from '@/hooks/usePopups';
import { useToast } from '@/hooks/useToast';

const TAB_OPTIONS = [
  { key: 'ongoing', label: '진행 팝업' },
  { key: 'upcoming', label: '오픈 예정' },
  { key: 'ended', label: '종료 팝업' },
];

const FALLBACK_PROFILE = '/placeholder-user.png';

const normalizeIdentifier = (value) => {
  if (value === undefined || value === null) return '';
  return String(value).trim().toLowerCase();
};

const matchSeller = (popup, sellerIdentifier, sellerName) => {
  if (!popup) return false;
  const popupName = (popup.sellerName || '').trim();
  const identifier = popup.sellerId || popup.sellerSlug || popupName || popup.sellerEmail;

  const normalizedIdentifier = normalizeIdentifier(identifier);
  const normalizedTarget = normalizeIdentifier(sellerIdentifier);

  if (normalizedIdentifier && normalizedTarget) {
    return normalizedIdentifier === normalizedTarget;
  }

  const normalizedPopupName = normalizeIdentifier(popupName);
  const normalizedSellerName = normalizeIdentifier(sellerName);

  if (normalizedPopupName && normalizedSellerName) {
    return normalizedPopupName === normalizedSellerName;
  }

  return false;
};

const SellerInfoPage = () => {
  const { sellerId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const decodedId = decodeURIComponent(sellerId || '');
  const initialSeller = location.state?.seller;

  const { data: popups = [], isLoading } = usePopups({ includeEnded: true });

  const [activeTab, setActiveTab] = useState('ongoing');

  const sellerPopups = useMemo(
    () =>
      (popups || []).filter((popup) =>
        matchSeller(
          popup,
          initialSeller?.id || decodedId,
          initialSeller?.name || decodedId
        )
      ),
    [popups, decodedId, initialSeller?.id, initialSeller?.name]
  );

  const sellerInfo = useMemo(() => {
    const fallbackPopup = sellerPopups[0] || {};
    const name =
      initialSeller?.name ||
      fallbackPopup.sellerName ||
      decodedId ||
      '판매자';

    return {
      id:
        initialSeller?.id ||
        fallbackPopup.sellerId ||
        decodedId ||
        name,
      profileImage:
        initialSeller?.profileImage ||
        fallbackPopup.sellerProfileImage ||
        FALLBACK_PROFILE,
      tagline:
        initialSeller?.tagline ||
        initialSeller?.bio ||
        fallbackPopup.sellerTagline ||
        fallbackPopup.sellerBio ||
        '소개 정보가 없습니다.',
      region:
        initialSeller?.region ||
        fallbackPopup.sellerRegion ||
        fallbackPopup.primaryRegion ||
        '정보 없음',
      sns: initialSeller?.sns || fallbackPopup.sellerSNS || '',
      email: initialSeller?.email || fallbackPopup.sellerEmail || '',
      name,
    };
  }, [initialSeller, sellerPopups, decodedId]);

  const categorizedPopups = useMemo(() => {
    const result = {
      ongoing: [],
      upcoming: [],
      ended: [],
    };

    sellerPopups.forEach((popup) => {
      const status = popup.runtimeStatus;

      if (status === 'upcoming') {
        result.upcoming.push(popup);
      } else if (status === 'ended') {
        result.ended.push(popup);
      } else {
        result.ongoing.push(popup);
      }
    });

    return result;
  }, [sellerPopups]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      addToast({ title: '링크가 복사되었습니다.' });
    } catch (error) {
      addToast({
        title: '복사 실패',
        description: error.message,
        variant: 'error',
      });
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const currentList = categorizedPopups[activeTab] || [];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 w-full max-w-[960px] mx-auto px-4 md:px-8 pt-16 md:pt-24 pb-16 space-y-10">

        {/* 판매자 프로필 섹션 */}
        <section className="relative rounded-3xl bg-white shadow-sm p-6 md:p-10 space-y-6">
          <div className="absolute top-6 right-6 flex items-center gap-2">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center justify-center rounded-full border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              aria-label="뒤로가기"
            >
              <MoveLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center justify-center rounded-full px-3 py-2 bg-amber-100 text-amber-700 shadow-sm hover:bg-amber-200"
              aria-label="공유하기"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4"
              >
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <path d="M8.59 13.51l6.83 3.98" />
                <path d="M15.41 6.51l-6.82 3.98" />
              </svg>
            </button>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="w-28 h-28 md:w-32 md:h-32 rounded-full border border-gray-200 overflow-hidden bg-gray-100 shadow-sm">
                  <img
                    src={sellerInfo.profileImage}
                    alt={sellerInfo.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK_PROFILE;
                    }}
                  />
                </div>

                <div className="flex flex-col gap-4 pr-24 md:pr-0">
                  <div className="space-y-3">
                    <p className="text-xs uppercase text-gray-400 font-semibold tracking-widest">
                      판매자 정보
                    </p>
                    <h1 className="text-3xl font-bold text-gray-900">
                      {sellerInfo.name}
                    </h1>
                    <p className="text-base text-gray-600 whitespace-pre-line">
                      {sellerInfo.tagline}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div className="rounded-2xl border border-gray-100 p-3 bg-gray-50">
                      <p className="text-xs text-gray-400 font-semibold mb-1">주 활동지역</p>
                      <p className="text-gray-900 font-semibold">{sellerInfo.region}</p>
                    </div>
                    <div className="rounded-2xl border border-gray-100 p-3 bg-gray-50">
                      <p className="text-xs text-gray-400 font-semibold mb-1">SNS</p>
                      <p className="text-gray-900 font-semibold">
                        {sellerInfo.sns ? (
                          <a
                            href={sellerInfo.sns}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary"
                          >
                            {sellerInfo.sns}
                          </a>
                        ) : (
                          '정보 없음'
                        )}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-gray-100 p-3 bg-gray-50">
                      <p className="text-xs text-gray-400 font-semibold mb-1">E-mail</p>
                      <p className="text-gray-900 font-semibold">
                        {sellerInfo.email || '정보 없음'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 판매자 팝업 목록 */}
        <section className="rounded-3xl bg-white shadow-sm p-6 md:p-8">
          <nav className="flex gap-2 bg-gray-50 rounded-2xl p-1 mb-6">
            {TAB_OPTIONS.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 rounded-2xl px-4 py-2 text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-gray-500'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {isLoading ? (
            <div className="py-16 text-center text-gray-500">
              판매자 팝업 정보를 불러오는 중...
            </div>
          ) : currentList.length === 0 ? (
            <div className="py-16 text-center text-gray-500">
              표시할 팝업이 없습니다.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {currentList.map((popup) => (
                <EventCard key={popup.id} popup={popup} />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default SellerInfoPage;
