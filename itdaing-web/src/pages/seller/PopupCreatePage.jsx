import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SellerHeader from "../../components/seller/SellerHeader.jsx";

export default function PopupCreatePage() {
  const navigate = useNavigate();

  // 입력 상태값
  const [title, setTitle] = useState("");
  const [district, setDistrict] = useState("");
  const [location, setLocation] = useState("");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [category, setCategory] = useState([]);
  const [consumerCategory, setConsumerCategory] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [hashtag, setHashtag] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState(null);

  // ----------------------------
  // 위치 선택 후 페이지 복귀 시 자동 반영
  // ----------------------------
  useEffect(() => {
    const savedLocation = sessionStorage.getItem("selectedLocation");
    if (savedLocation) {
      setLocation(savedLocation);
    }
  }, []);

  // ----------------------------
  // 팝업 카테고리 (최대 2개 제한)
  // ----------------------------
  const toggleCategory = item => {
    setCategory(prev => {
      if (prev.includes(item)) return prev.filter(i => i !== item);
      if (prev.length >= 2) return prev; // ❗ 알림 없이 선택 불가
      return [...prev, item];
    });
  };

  // ----------------------------
  // 일반 토글 (제한 없음)
  // ----------------------------
  const toggle = (list, setter, item) => {
    setter(prev => (prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]));
  };

  // 샘플 목록
  const popupCategoryList = [
    "음식",
    "액세서리",
    "패션",
    "공연/전시",
    "건강",
    "뷰티",
    "반려동물",
    "키즈",
    "스포츠",
  ];
  const consumerCategoryList = [
    "혼자여도 좋은",
    "친구와 함께",
    "가족과 함께",
    "연인과 함께",
    "반려동물 동반 가능",
    "독특함",
    "로맨틱한",
    "즐거운",
    "차분한",
    "분위기 좋은",
    "아기자기한",
  ];
  const amenityList = [
    "무료주차",
    "유료입장",
    "특별할인",
    "사전예약",
    "포토존",
    "굿즈판매",
    "체험가능",
  ];

  // 제출
  const handleSubmit = event => {
    event.preventDefault();
    const data = {
      title,
      district,
      location,
      periodStart,
      periodEnd,
      category,
      consumerCategory,
      amenities,
      hashtag,
      description,
      thumbnail,
    };
    console.log("📌 제출 데이터:", data);
    alert("등록 완료 (API 연결 예정)");
  };

  return (
    <div className="space-y-6">
      <div className="hidden lg:block">
        <SellerHeader />
      </div>

      <div className="max-w-[1800px] mx-auto bg-white shadow-md rounded-xl p-10">
        <h2 className="mb-10 text-2xl font-bold">팝업 등록</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-10">
          {/* ===== 팝업명 ===== */}
          <div className="flex items-center gap-6">
            <label className="w-32 font-bold">팝업명</label>
            <input
              type="text"
              placeholder="팝업의 제목을 입력해주세요."
              value={title}
              onChange={event => setTitle(event.target.value)}
              className="flex-1 p-3 border-b outline-none"
            />
          </div>

          {/* ===== 장소 ===== */}
          <div className="flex items-center gap-6">
            <label className="w-32 font-bold">장소</label>

            <div className="flex items-center flex-1 gap-4">
              <select
                value={district}
                onChange={event => setDistrict(event.target.value)}
                className="px-4 py-3 border rounded-lg"
              >
                <option value="">구 선택</option>
                <option value="동구">동구</option>
                <option value="서구">서구</option>
                <option value="남구">남구</option>
                <option value="북구">북구</option>
                <option value="광산구">광산구</option>
              </select>

              <input
                value={location}
                readOnly
                placeholder="오른쪽 버튼을 눌러 위치를 선택해주세요."
                className="flex-1 p-3 bg-transparent border-b outline-none"
              />

              <button
                type="button"
                onClick={() => navigate("/seller/location")}
                className="px-4 py-3 text-white bg-red-500 rounded-lg hover:bg-red-600"
              >
                위치 선택하기
              </button>

              <button
                type="button"
                onClick={() => navigate("/seller/popup/location")}
                className="p-3 text-white bg-red-500 rounded-full"
              >
                <MapPin size={20} />
              </button>
            </div>
          </div>

          {/* ===== 운영 기간 ===== */}
          <div className="flex items-center gap-6">
            <label className="w-32 font-bold">운영 기간</label>
            <div className="flex items-center gap-4">
              <input
                type="date"
                value={periodStart}
                onChange={event => setPeriodStart(event.target.value)}
                className="p-3 border rounded-lg"
              />
              <span>~</span>
              <input
                type="date"
                value={periodEnd}
                onChange={event => setPeriodEnd(event.target.value)}
                className="p-3 border rounded-lg"
              />
            </div>
          </div>

          {/* ===== 팝업 카테고리 (최대 2개) ===== */}
          <div className="flex items-start gap-6">
            <label className="w-32 font-bold">팝업 카테고리</label>
            <div className="flex flex-wrap flex-1 gap-2">
              {popupCategoryList.map(item => (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleCategory(item)}
                  disabled={!category.includes(item) && category.length >= 2}
                  className={`px-4 py-2 rounded-full border text-sm transition ${
                    category.includes(item) ? "bg-red-500 text-white" : "bg-gray-100"
                  } ${
                    !category.includes(item) && category.length >= 2
                      ? "opacity-40 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* ===== 소비자 카테고리 ===== */}
          <div className="flex items-start gap-6">
            <label className="w-32 font-bold">소비자 카테고리</label>
            <div className="flex flex-wrap flex-1 gap-2">
              {consumerCategoryList.map(item => (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggle(consumerCategory, setConsumerCategory, item)}
                  className={`px-4 py-2 rounded-full border text-sm ${
                    consumerCategory.includes(item) ? "bg-red-500 text-white" : "bg-gray-100"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* ===== 편의사항 ===== */}
          <div className="flex items-start gap-6">
            <label className="w-32 font-bold">편의사항</label>
            <div className="flex flex-wrap flex-1 gap-2">
              {amenityList.map(item => (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggle(amenities, setAmenities, item)}
                  className={`px-4 py-2 rounded-full border text-sm ${
                    amenities.includes(item) ? "bg-red-500 text-white" : "bg-gray-100"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* ===== 해시태그 ===== */}
          <div className="flex items-center gap-6">
            <label className="w-32 font-bold">해시태그</label>
            <input
              type="text"
              placeholder="해시태그를 작성해 주세요."
              value={hashtag}
              onChange={event => setHashtag(event.target.value)}
              className="flex-1 p-3 border-b outline-none"
            />
          </div>

          {/* ===== 팝업 소개 ===== */}
          <div className="flex items-start gap-6">
            <label className="w-32 font-bold">팝업 소개</label>
            <textarea
              value={description}
              onChange={event => setDescription(event.target.value)}
              className="flex-1 h-40 p-4 border rounded-lg resize-none"
              placeholder="팝업에 대한 설명을 작성해주세요."
            />
          </div>

          {/* ===== 첨부파일 ===== */}
          <div className="flex items-center gap-6">
            <label className="w-32 font-bold">첨부파일</label>
            <input type="file" onChange={event => setThumbnail(event.target.files?.[0] ?? null)} />
          </div>

          {/* ===== 버튼 ===== */}
          <button type="submit" className="w-full py-4 text-lg font-semibold text-white bg-red-500 rounded-lg">
            작성
          </button>
        </form>
      </div>
    </div>
  );
}
