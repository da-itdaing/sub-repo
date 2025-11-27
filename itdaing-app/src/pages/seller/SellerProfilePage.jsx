import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/routes/paths';
import { User, Mail, Phone, Building, MapPin, Save } from 'lucide-react';

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

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    alert('프로필이 업데이트되었습니다.');
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section className="rounded-3xl border border-white/80 bg-white p-6 shadow-sm shadow-slate-200/60">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <User className="h-10 w-10" />
          </div>
          <div className="flex-1">
            <p className="text-xs uppercase tracking-wide text-gray-400">판매자 계정</p>
            <h2 className="text-2xl font-semibold text-gray-900">{formData.name || '판매자'}</h2>
            <p className="text-sm text-gray-500">{formData.email}</p>
          </div>
          {/* <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            기본 정보
          </span> */}
        </div>
      </section>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-3xl border border-white/80 bg-white p-6 shadow-sm shadow-slate-200/60"
      >
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400">기본 정보</h3>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-gray-500">이름</label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-10 py-2 text-sm focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500">이메일</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-10 py-2 text-sm focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500">연락처</label>
              <div className="relative mt-1">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-10 py-2 text-sm focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400">사업자 정보</h3>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-gray-500">상호명</label>
              <div className="relative mt-1">
                <Building className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-10 py-2 text-sm focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500">사업자 등록번호</label>
              <input
                type="text"
                name="businessNumber"
                value={formData.businessNumber}
                onChange={handleChange}
                className="mt-1 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-gray-500">사업장 주소</label>
              <div className="relative mt-1">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-10 py-2 text-sm focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400">소개</h3>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="mt-3 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="브랜드 소개를 입력해주세요."
          />
        </div>

        <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-4">
          <Link
            to={ROUTES.seller.dashboard}
            className="rounded-2xl border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            취소
          </Link>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/30 hover:bg-primary/90"
          >
            <Save className="h-4 w-4" />
            저장하기
          </button>
        </div>
      </form>

      <section className="rounded-3xl border border-white/80 bg-white p-6 shadow-sm shadow-slate-200/60">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400">계정 설정</h3>
        <div className="mt-4 space-y-3 text-sm">
          <button className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700 hover:bg-gray-50">
            비밀번호 변경
          </button>
          <button className="w-full rounded-2xl border border-rose-200 px-4 py-3 text-left font-semibold text-rose-600 hover:bg-rose-50">
            회원 탈퇴
          </button>
        </div>
      </section>
    </div>
  );
};

export default SellerProfilePage;

