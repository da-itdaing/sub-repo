import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";

export default function LocationSelectPage() {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const [address, setAddress] = useState("");

  useEffect(() => {
    const { kakao } = window;

    const container = mapRef.current;
    const options = {
      center: new kakao.maps.LatLng(35.1595454, 126.8526012),
      level: 3,
    };

    const map = new kakao.maps.Map(container, options);

    const geocoder = new kakao.maps.services.Geocoder();
    const marker = new kakao.maps.Marker({ position: map.getCenter() });
    marker.setMap(map);

    kakao.maps.event.addListener(map, "click", function (mouseEvent) {
      const latlng = mouseEvent.latLng;
      marker.setPosition(latlng);

      geocoder.coord2Address(
        latlng.getLng(),
        latlng.getLat(),
        function (result, status) {
          if (status === kakao.maps.services.Status.OK) {
            setAddress(result[0].address.address_name);
          }
        }
      );
    });
  }, []);

  const handleComplete = () => {
    if (!address) return;
    sessionStorage.setItem("selectedLocation", address);
    navigate("/seller/popup/create");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-[700px] rounded-xl shadow-xl overflow-hidden">

        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">지도</h2>
          <button
            className="p-2 rounded-full hover:bg-gray-100"
            onClick={() => navigate("/seller/popup/create")}
          >
            <X size={20} />
          </button>
        </div>

        <div className="w-full h-[380px]">
          <div ref={mapRef} className="w-full h-full" />
        </div>

        <div className="p-5">
          <input
            type="text"
            readOnly
            value={address}
            placeholder="지도를 클릭하여 위치를 선택하세요."
            className="w-full p-3 text-center border rounded-md bg-gray-50"
          />

          <button
            onClick={handleComplete}
            disabled={!address}
            className={`w-full mt-5 py-3 rounded-md text-white font-semibold
              ${address ? "bg-red-500 hover:bg-red-600" : "bg-gray-400 cursor-not-allowed"}
            `}
          >
            완료
          </button>
        </div>
      </div>
    </div>
  );
}
