import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/routes/paths';
import { Save, X, Upload, MapPin, Calendar, Clock } from 'lucide-react';

/**
 * SellerPopupCreatePage
 * 새 팝업 등록 페이지
 */
const SellerPopupCreatePage = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    startDate: '',
    endDate: '',
    address: '',
    detailAddress: '',
    openingHours: '',
    contact: '',
    thumbnail: null,
    images: [],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === 'thumbnail' && files.length > 0) {
      setFormData((prev) => ({
        ...prev,
        thumbnail: files[0],
      }));
    } else if (name === 'images') {
      setFormData((prev) => ({
        ...prev,
        images: Array.from(files),
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: API 호출하여 팝업 등록
    alert('팝업이 등록되었습니다. 관리자 승인 후 게시됩니다.');
    navigate(ROUTES.seller.dashboard);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to={ROUTES.seller.dashboard} className="text-sm text-gray-600 hover:text-gray-900 mb-2 inline-block">
            ← 대시보드로 돌아가기
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">새 팝업 등록</h1>
          <p className="text-sm text-gray-600 mt-1">팝업스토어 정보를 입력해주세요</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow">
          <div className="p-6 space-y-6">
            {/* 기본 정보 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">기본 정보</h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    팝업명 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="팝업스토어 이름을 입력하세요"
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    카테고리 <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">카테고리를 선택하세요</option>
                    <option value="fashion">패션</option>
                    <option value="beauty">뷰티</option>
                    <option value="food">푸드</option>
                    <option value="entertainment">엔터테인먼트</option>
                    <option value="art">아트</option>
                    <option value="tech">테크</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    설명 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    placeholder="팝업스토어에 대한 상세 설명을 입력하세요"
                  />
                </div>
              </div>
            </div>

            {/* 운영 정보 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">운영 정보</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                    시작일 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      id="startDate"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                    종료일 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      id="endDate"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="openingHours" className="block text-sm font-medium text-gray-700 mb-2">
                    운영 시간 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      id="openingHours"
                      name="openingHours"
                      value={formData.openingHours}
                      onChange={handleChange}
                      required
                      placeholder="예: 10:00 - 22:00"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-2">
                    연락처 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="contact"
                    name="contact"
                    value={formData.contact}
                    onChange={handleChange}
                    required
                    placeholder="010-1234-5678"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            {/* 위치 정보 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">위치 정보</h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    주소 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      placeholder="주소를 입력하세요"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="detailAddress" className="block text-sm font-medium text-gray-700 mb-2">
                    상세 주소
                  </label>
                  <input
                    type="text"
                    id="detailAddress"
                    name="detailAddress"
                    value={formData.detailAddress}
                    onChange={handleChange}
                    placeholder="상세 주소를 입력하세요"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            {/* 이미지 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">이미지</h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700 mb-2">
                    썸네일 이미지 <span className="text-red-500">*</span>
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <label htmlFor="thumbnail" className="cursor-pointer">
                      <span className="text-sm text-gray-600">
                        {formData.thumbnail ? formData.thumbnail.name : '클릭하여 이미지 업로드'}
                      </span>
                      <input
                        type="file"
                        id="thumbnail"
                        name="thumbnail"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-2">
                    추가 이미지
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <label htmlFor="images" className="cursor-pointer">
                      <span className="text-sm text-gray-600">
                        {formData.images.length > 0 
                          ? `${formData.images.length}개 파일 선택됨` 
                          : '클릭하여 이미지 업로드 (최대 5개)'}
                      </span>
                      <input
                        type="file"
                        id="images"
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
          </div>

          {/* 버튼 */}
          <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
            <Link
              to={ROUTES.seller.dashboard}
              className="inline-flex items-center px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-colors"
            >
              <X className="w-5 h-5 mr-2" />
              취소
            </Link>
            <button
              type="submit"
              className="inline-flex items-center px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Save className="w-5 h-5 mr-2" />
              등록하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellerPopupCreatePage;

