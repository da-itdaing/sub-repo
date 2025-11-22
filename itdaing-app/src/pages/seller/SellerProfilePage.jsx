import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/routes/paths';
import { User, Mail, Phone, Building, MapPin, Save } from 'lucide-react';

/**
 * SellerProfilePage
 * 판매자 프로필 관리 페이지
 */
const SellerProfilePage = () => {
  const { user } = useAuthStore();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '010-1234-5678',
    businessName: '어반스타일',
    businessNumber: '123-45-67890',
    address: '광주광역시 동구 충장로 1',
    description: '트렌디한 패션 팝업스토어를 운영하고 있습니다.',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: API 호출하여 프로필 업데이트
    alert('프로필이 업데이트되었습니다.');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to={ROUTES.seller.dashboard} className="text-sm text-gray-600 hover:text-gray-900 mb-2 inline-block">
            ← 대시보드로 돌아가기
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">내 정보</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 프로필 카드 */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mr-6">
                <User className="w-10 h-10 text-gray-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{formData.name}</h2>
                <p className="text-sm text-gray-600">{formData.email}</p>
                <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  판매자 계정
                </span>
              </div>
            </div>
          </div>

          {/* 프로필 폼 */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* 기본 정보 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">기본 정보</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    이름
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    이메일
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    연락처
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 사업자 정보 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">사업자 정보</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
                    상호명
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      id="businessName"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="businessNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    사업자 등록번호
                  </label>
                  <input
                    type="text"
                    id="businessNumber"
                    name="businessNumber"
                    value={formData.businessNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    사업장 주소
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 소개 */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                소개
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            {/* 저장 버튼 */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Link
                to={ROUTES.seller.dashboard}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                취소
              </Link>
              <button
                type="submit"
                className="inline-flex items-center px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Save className="w-5 h-5 mr-2" />
                저장하기
              </button>
            </div>
          </form>
        </div>

        {/* 계정 설정 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">계정 설정</h3>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              비밀번호 변경
            </button>
            <button className="w-full text-left px-4 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
              회원 탈퇴
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerProfilePage;

