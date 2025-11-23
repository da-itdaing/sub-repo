import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/routes/paths';
import { Save, X, Upload, MapPin, Calendar, Clock } from 'lucide-react';

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

  const handleSubmit = (event) => {
    event.preventDefault();
    alert('팝업이 등록되었습니다. 관리자 승인 후 게시됩니다.');
    navigate(ROUTES.seller.dashboard);
  };

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
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400">기본 정보</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500">팝업명 *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="팝업스토어 이름을 입력하세요"
                className="mt-1 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500">카테고리 *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="mt-1 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
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
              <label className="text-xs font-semibold text-gray-500">설명 *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                required
                placeholder="팝업스토어에 대한 상세 설명을 입력하세요"
                className="mt-1 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400">운영 정보</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-gray-500">시작일 *</label>
              <div className="relative mt-1">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-10 py-2 text-sm focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500">종료일 *</label>
              <div className="relative mt-1">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-10 py-2 text-sm focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500">운영 시간 *</label>
              <div className="relative mt-1">
                <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="openingHours"
                  value={formData.openingHours}
                  onChange={handleChange}
                  required
                  placeholder="예: 10:00 - 22:00"
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-10 py-2 text-sm focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500">연락처 *</label>
              <input
                type="tel"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                required
                placeholder="010-1234-5678"
                className="mt-1 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400">위치 정보</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500">주소 *</label>
              <div className="relative mt-1">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  placeholder="주소를 입력하세요"
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-10 py-2 text-sm focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500">상세 주소</label>
              <input
                type="text"
                name="detailAddress"
                value={formData.detailAddress}
                onChange={handleChange}
                placeholder="상세 주소를 입력하세요"
                className="mt-1 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400">이미지</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500">썸네일 이미지 *</label>
              <div className="mt-1 rounded-3xl border-2 border-dashed border-gray-200 p-6 text-center">
                <Upload className="mx-auto h-8 w-8 text-gray-300" />
                <label className="mt-2 inline-flex cursor-pointer flex-col text-sm text-gray-500">
                  {formData.thumbnail ? formData.thumbnail.name : '클릭하여 이미지 업로드'}
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
              <div className="mt-1 rounded-3xl border-2 border-dashed border-gray-200 p-6 text-center">
                <Upload className="mx-auto h-8 w-8 text-gray-300" />
                <label className="mt-2 inline-flex cursor-pointer flex-col text-sm text-gray-500">
                  {formData.images.length > 0
                    ? `${formData.images.length}개 파일 선택됨`
                    : '클릭하여 이미지 업로드 (최대 5개)'}
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

        <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-4">
          <Link
            to={ROUTES.seller.dashboard}
            className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            <X className="h-4 w-4" />
            취소
          </Link>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/30 hover:bg-primary/90"
          >
            <Save className="h-4 w-4" />
            등록하기
          </button>
        </div>
      </form>
    </div>
  );
};

export default SellerPopupCreatePage;

