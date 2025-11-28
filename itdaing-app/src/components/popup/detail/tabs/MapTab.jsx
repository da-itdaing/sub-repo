import { MapPin, Copy } from 'lucide-react';
import KakaoMap from '@/components/map/KakaoMap';
import { useToast } from '@/hooks/useToast';

const MapTab = ({ popup }) => {
  const { addToast } = useToast();

  const handleCopyAddress = () => {
    if (!popup.address) return;
    navigator.clipboard.writeText(popup.address);
    addToast({ title: '주소가 복사되었습니다.' });
  };

  return (
    <div className="pt-6 pb-10 space-y-4">
      {popup.latitude && popup.longitude ? (
        <>
          {/* Address Bar */}
          {popup.address && (
            <div className="flex items-start gap-2 px-1">
              <MapPin className="w-5 h-5 text-black mt-0.5 shrink-0 fill-black" />
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-gray-900 break-keep leading-snug">
                  {popup.address}
                </span>
                <button
                  type="button"
                  onClick={handleCopyAddress}
                  className="p-1 -m-1 text-gray-500 hover:text-gray-800 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Map Container */}
          <div className="w-full h-[400px] rounded-lg overflow-hidden border border-gray-100 shadow-sm mt-2">
            <KakaoMap
              center={{ lat: popup.latitude, lng: popup.longitude }}
              markers={[
                {
                  id: popup.id,
                  lat: popup.latitude,
                  lng: popup.longitude,
                  label: popup.title,
                },
              ]}
              height="100%"
              level={3}
            />
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-xl">
          <MapPin className="w-10 h-10 text-gray-300 mb-3" />
          <p className="text-sm text-gray-500">위치 정보가 제공되지 않는 팝업입니다.</p>
        </div>
      )}
    </div>
  );
};

export default MapTab;
