import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/routes/paths';
import { Save, X, Upload, MapPin, Calendar, Clock } from 'lucide-react';

const POPUP_CATEGORIES = [
  '음식',
  '악세사리',
  '패션',
  '공연/전시',
  '건강',
  '뷰티',
  '반려동물',
  '키즈',
  '스포츠',
];

const CONSUMER_CATEGORIES = [
  '혼자여도 좋은',
  '친구와 함께',
  '가족과 함께',
  '연인과 함께',
  '반려동물 동반 가능',
  '독특한',
  '로맨틱한',
  '즐거운',
  '차분한',
  '분위기 좋은',
  '아기자기한',
];

const AMENITIES = [
  '무료주차',
  '무료입장',
  '특별할인',
  '사전예약',
  '포토존',
  '굿즈판매',
  '체험가능',
];

const SellerPopupCreatePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    address: '',
    detailAddress: '',
    startDate: '',
    endDate: '',
    openingHours: '',
    contact: '',
    category: '',
    consumerCategories: [],
    amenities: [],
    hashtags: '',
    description: '',
    thumbnail: null,
    images: [],
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (event) => {
    const { name, files } = event.target;
    if (name === 'thumbnail' && files.length > 0) {
      setFormData((prev) => ({ ...prev, thumbnail: files[0] }));
    }
    if (name === 'images') {
      setFormData((prev) => ({ ...prev, images: Array.from(files) }));
    }
  };

  const toggleCategory = (value) => {
    setFormData((prev) => ({
      ...prev,
      category: prev.category === value ? '' : value,
    }));
  };

  const toggleArrayItem = (field, value) => {
    setFormData((prev) => {
      const current = prev[field] || [];
      return {
        ...prev,
        [field]: current.includes(value)
          ? current.filter((item) => item !== value)
          : [...current, value],
      };
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // TODO: 실제 API 연동 시 formData 변환 필요 (hashtags 등)
    alert('팝업이 등록되었습니다. 관리자 승인 후 게시됩니다.');
    navigate(ROUTES.seller.dashboard);
  };

  // 공통 버튼 스타일 (on/off)
  const getButtonStyle = (isSelected) =>
    `rounded-full px-4 py-2 text-sm font-medium transition-colors border ${
      isSelected
        ? 'bg-[#EB0000] text-white border-[#EB0000]'
        : 'bg-white text-[oklch(0.373_0.034_259.733)] border-[oklch(0.373_0.034_259.733)]'
    }`;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section className="rounded-3xl border border-white/80 bg-white p-6 shadow-sm shadow-slate-200/60">
        <p className="text-xs uppercase tracking-wide text-gray-400">새 팝업 등록</p>
        <h2 className="mt-2 text-2xl font-semibold text-gray-900">팝업 정보를 입력해주세요</h2>
        <p className="text-sm text-gray-500">승인까지 평균 2일이 소요됩니다.</p>
      </section>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-3xl border border-white/80 bg-white p-6 shadow-sm shadow-slate-200/60"
      >
        {/* 1. 팝업명 */}
        <div>
          <label className="text-xs font-semibold text-gray-500">팝업명 *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="팝업의 제목을 입력해주세요."
            className="mt-1 w-full border-b border-gray-300 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </div>

        {/* 2. 장소 (주소) */}
        <div>
          <label className="text-xs font-semibold text-gray-500">장소 *</label>
          <div className="mt-1 space-y-2">
            <div className="relative">
              <MapPin className="absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                placeholder="주소를 입력해주세요."
                className="w-full border-b border-gray-300 py-2 pl-6 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <input
              type="text"
              name="detailAddress"
              value={formData.detailAddress}
              onChange={handleChange}
              placeholder="상세 주소를 입력해주세요."
              className="w-full border-b border-gray-300 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        {/* 3. 팝업 기간 & 운영 시간 */}
        <div>
          <label className="text-xs font-semibold text-gray-500">팝업기간 *</label>
          <div className="mt-1 flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[140px]">
              <Calendar className="absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                className="w-full border-b border-gray-300 py-2 pl-6 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <span className="text-gray-400">~</span>
            <div className="relative flex-1 min-w-[140px]">
              <Calendar className="absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
                className="w-full border-b border-gray-300 py-2 pl-6 text-sm focus:border-primary focus:outline-none"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="text-xs font-semibold text-gray-500">운영 시간 & 연락처</label>
            <div className="mt-1 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="relative">
                <Clock className="absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="openingHours"
                  value={formData.openingHours}
                  onChange={handleChange}
                  required
                  placeholder="예: 10:00 - 22:00"
                  className="w-full border-b border-gray-300 py-2 pl-6 text-sm focus:border-primary focus:outline-none"
                />
              </div>
              <input
                type="tel"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                required
                placeholder="연락처 (010-1234-5678)"
                className="w-full border-b border-gray-300 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 4. 팝업 카테고리 */}
        <div>
          <label className="mb-3 block text-xs font-semibold text-gray-500">팝업 카테고리</label>
          <div className="flex flex-wrap gap-2">
            {POPUP_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategory(cat)}
                className={getButtonStyle(formData.category === cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 5. 소비자 카테고리 */}
        <div>
          <label className="mb-3 block text-xs font-semibold text-gray-500">소비자 카테고리</label>
          <div className="flex flex-wrap gap-2">
            {CONSUMER_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => toggleArrayItem('consumerCategories', cat)}
                className={getButtonStyle(formData.consumerCategories.includes(cat))}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 6. 편의사항 */}
        <div>
          <label className="mb-3 block text-xs font-semibold text-gray-500">편의사항</label>
          <div className="flex flex-wrap gap-2">
            {AMENITIES.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => toggleArrayItem('amenities', item)}
                className={getButtonStyle(formData.amenities.includes(item))}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* 7. 해시태그 */}
        <div>
          <label className="text-xs font-semibold text-gray-500">해시태그</label>
          <input
            type="text"
            name="hashtags"
            value={formData.hashtags}
            onChange={handleChange}
            placeholder="해시태그를 작성해 주세요. (예: #데이트 #핫플)"
            className="mt-1 w-full border-b border-gray-300 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </div>

        {/* 8. 팝업 소개 */}
        <div>
          <label className="text-xs font-semibold text-gray-500">팝업소개</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={6}
            required
            placeholder="팝업에 대한 설명을 작성해 주세요."
            className="mt-2 w-full rounded-2xl border border-gray-200 bg-white p-4 text-sm focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* 9. 첨부파일 */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400">첨부파일</h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-gray-500">썸네일 이미지 *</label>
              <div className="mt-2 flex items-center gap-3">
                <div className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-500">
                  {formData.thumbnail ? formData.thumbnail.name : '파일을 선택하세요'}
                </div>
                <label className="cursor-pointer rounded-lg bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600">
                  첨부
                  <input
                    type="file"
                    name="thumbnail"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    required
                  />
                </label>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500">추가 이미지</label>
              <div className="mt-2 flex items-center gap-3">
                <div className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-500">
                  {formData.images.length > 0
                    ? `${formData.images.length}개 파일 선택됨`
                    : '파일을 선택하세요'}
                </div>
                <label className="cursor-pointer rounded-lg bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600">
                  첨부
                  <input
                    type="file"
                    name="images"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-6">
          <button
            type="submit"
            className="w-full rounded-lg bg-[#EB0000] py-3 text-base font-bold text-white shadow-md hover:bg-[#c90000] md:w-auto md:px-12"
          >
            작성
          </button>
        </div>
      </form>
    </div>
  );
};

export default SellerPopupCreatePage;


