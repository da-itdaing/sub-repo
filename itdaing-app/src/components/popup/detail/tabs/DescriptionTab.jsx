import { Copy, Car, Ticket, Tag, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/useToast';
import { ROUTES } from '@/routes/paths';

// 편의사항 아이콘 매핑 (임시)
// 실제 featureId와 매핑 필요. 여기서는 예시로 1~3번을 가정하거나,
// featureIds가 문자열 배열로 오는지 확인이 필요하지만, 일단 아이콘만 준비.
const FEATURE_ICONS = {
  PARKING: { icon: Car, label: '주차 무료' },
  PAID_ENTRY: { icon: Ticket, label: '유료 입장' },
  DISCOUNT: { icon: Tag, label: '특별 할인' },
  // 필요한 만큼 추가
};

const FALLBACK_PROFILE = '/placeholder-user.png';

// Feature ID를 라벨/아이콘으로 변환하는 헬퍼 (임시 구현)
// 백엔드에서 feature 정보를 어떻게 주는지(ID List vs Object List)에 따라 수정 필요
const getFeatureInfo = (id) => {
  // 예: id가 1이면 주차, 2면 유료입장 등...
  // 지금은 데모용으로 랜덤 매핑하거나, 고정된 리스트를 보여줄 수도 있습니다.
  // 스크린샷에는 '주차 무료', '유료 입장', '특별 할인'이 있으므로 이를 하드코딩 예시로 보여드립니다.
  // 실제로는 featureIds.map(...)을 사용해야 합니다.
  
  // TODO: 실제 featureId 매핑 로직 구현 필요
  return null; 
};

const DescriptionTab = ({ popup }) => {
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleCopyAddress = () => {
    if (!popup.address) return;
    navigator.clipboard.writeText(popup.address);
    addToast({ title: '주소가 복사되었습니다.' });
  };

  // 임시: 디자인 시안에 있는 편의시설 목록 (실제 데이터 연동 시 featureIds 사용)
  const features = [
    { id: 'parking', icon: Car, label: '주차 무료' },
    { id: 'ticket', icon: Ticket, label: '유료 입장' },
    { id: 'sale', icon: Tag, label: '특별 할인' },
  ];

  return (
    <div className="pt-6 pb-10 space-y-8">
      {/* Header Section: Title, Info, Seller Profile */}
      <section className="relative">
        <div className="flex justify-between items-start">
          <div className="space-y-2 max-w-[70%]">
            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">
              {popup.title}
            </h1>
            
            {/* Date */}
            <div className="font-bold text-gray-900 text-[15px]">
              {popup.startDate} - {popup.endDate}
            </div>

            {/* Address */}
            <div className="flex items-center gap-1.5 text-[13px] text-gray-600">
              <span className="truncate">{popup.address}</span>
              <button 
                onClick={handleCopyAddress}
                className="p-1 -m-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Operating Hours */}
            <div className="text-[13px] text-gray-500">
              {popup.hours || '월-목 : 10:30 - 20:00 / 금-일 : 10:30 - 20:30'}
            </div>
          </div>

          {/* Seller Profile (Right Top) */}
          <button
            type="button"
            onClick={() => {
              const sellerIdentifier = encodeURIComponent(
                popup.sellerId || popup.sellerSlug || popup.sellerName || popup.sellerEmail || 'unknown'
              );
              const sellerPayload = {
                id: popup.sellerId || popup.sellerSlug || popup.sellerName || popup.sellerEmail || 'unknown',
                name: popup.sellerName || '우리 존재 화이팅',
                profileImage: popup.sellerProfileImage || FALLBACK_PROFILE,
                tagline: popup.sellerTagline || popup.sellerBio || '',
                region: popup.sellerRegion || popup.primaryRegion || '',
                sns: popup.sellerSNS || '',
                email: popup.sellerEmail || '',
              };
              navigate(ROUTES.sellerInfo(sellerIdentifier), { state: { seller: sellerPayload } });
            }}
            className="flex flex-col items-center gap-2 shrink-0 focus:outline-none"
          >
            <div className="w-20 h-20 rounded-full bg-gray-100 border border-gray-200 overflow-hidden relative">
              {/* 실제 판매자 프로필 이미지가 있다면 img 태그 사용 */}
               {popup.sellerProfileImage ? (
                  <img src={popup.sellerProfileImage} alt="seller" className="w-full h-full object-cover"/>
               ) : (
                   <div className="w-full h-full flex items-center justify-center bg-gray-50">
                       <User className="w-6 h-6 text-gray-300"/>
                   </div>
               )}
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {popup.sellerName || '우리 존재 화이팅'}
            </span>
          </button>
        </div>

        {/* Tags */}
        {Array.isArray(popup.styleTags) && popup.styleTags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {popup.styleTags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full border border-primary text-xs font-medium text-gray-800 bg-white"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Features (Divider Top & Bottom) */}
      <section className="border-y border-gray-100 py-6">
        <div className="flex justify-around items-center">
          {/* 실제 데이터 연동 시 popup.featureIds.map(...) 사용 */}
          {features.map((feature) => (
            <div key={feature.id} className="flex flex-col items-center gap-2">
              <feature.icon className="w-6 h-6 text-gray-900 stroke-[1.5]" />
              <span className="text-[11px] font-medium text-gray-600">{feature.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Description */}
      <section>
        <h2 className="text-base font-bold text-gray-900 mb-4">팝업스토어 소개</h2>
        <div className="bg-gray-50 rounded-xl p-5">
            <div className="space-y-4">
                <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-2">콘텐츠</h3>
                    <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">
                        {popup.description || 
                        `[모이나 초대회]\n파리에서 온 장인의 손끝\n현장의 장인이 완성하는 작품\n절제된 아름다움을 담은 모이나 컬렉션을 경험해보세요`}
                    </p>
                </div>
                {/* 추가 설명 텍스트가 있다면 여기에 */}
                <p className="text-xs text-gray-600 leading-relaxed">
                    모이나는 현존하는 가장 오래된 트렁크 메이커 프랑스 브랜드로 LVMH사 아르노 회장이 직접 디자이너 선정 및 제품 디자인에 참여했습니다. 셀럽 백으로는 리사 라부부백/ 이부진 가브리엘백/ 손연재 캔버스백이 베스트셀러입니다.
                </p>
            </div>
        </div>
      </section>
    </div>
  );
};

export default DescriptionTab;
