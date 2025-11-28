import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/routes/paths';
import { MapPin, Calendar, Clock } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPopup } from '@/services/sellerService';
import { uploadImage } from '@/services/uploadService';
import { useToast } from '@/hooks/useToast';
import { useMasterData } from '@/hooks/useMasterData';

// TODO: 마스터 데이터 API 연동 후 대체 가능
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
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const { categories, features, styles } = useMasterData();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    address: '', // activityRegion
    addressDetail: '', // 상세 주소
    startDate: '',
    endDate: '',
    openingHours: '',
    contact: '',
    categoryId: '', // 단일 선택
    styleIds: [], // 다중 선택
    featureIds: [], // 편의시설 등
    hashtags: '',
    description: '',
    thumbnail: null,
    images: [],
    homepageUrl: '',
    snsUrl: '',
  });

  const createPopupMutation = useMutation({
    mutationFn: createPopup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myPopups'] });
      queryClient.invalidateQueries({ queryKey: ['sellerDashboard'] });
      addToast({ title: '팝업이 성공적으로 등록되었습니다.', description: '관리자 승인 후 게시됩니다.' });
      navigate(ROUTES.seller.popups);
    },
    onError: (error) => {
      console.error(error);
      addToast({ title: '등록 실패', description: error.message, variant: 'error' });
      setIsSubmitting(false);
    },
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

  const toggleCategory = (id) => {
    setFormData((prev) => ({
      ...prev,
      categoryId: prev.categoryId === id ? '' : id,
    }));
  };

  const toggleArrayItem = (field, id) => {
    setFormData((prev) => {
      const current = prev[field] || [];
      return {
        ...prev,
        [field]: current.includes(id)
          ? current.filter((item) => item !== id)
          : [...current, id],
      };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // 1. 이미지 업로드
      let thumbnailUrl = '';
      if (formData.thumbnail) {
        const uploadRes = await uploadImage(formData.thumbnail);
        thumbnailUrl = uploadRes.url;
      }

      const imageUrls = [];
      if (formData.images.length > 0) {
        for (const file of formData.images) {
          const uploadRes = await uploadImage(file);
          imageUrls.push(uploadRes.url);
        }
      }

      // 2. 해시태그 처리
      const tags = formData.hashtags
        .split(/[\s,]+/)
        .filter((tag) => tag.startsWith('#'))
        .map((tag) => tag.slice(1)); // # 제거

      // 3. API 요청 데이터 구성 (PopupCreateRequest)
      const requestData = {
        title: formData.title,
        introduction: formData.description,
        startDate: formData.startDate, // "YYYY-MM-DD"
        endDate: formData.endDate,     // "YYYY-MM-DD"
        openingTime: formData.openingHours, // "10:00~22:00" 등 자유 형식
        location: formData.address,
        addressDetail: formData.addressDetail,
        latitude: 0, // TODO: 주소 -> 좌표 변환 로직 필요 (현재 0)
        longitude: 0, // TODO: 주소 -> 좌표 변환 로직 필요 (현재 0)
        thumbnail: thumbnailUrl,
        images: imageUrls,
        homepageUrl: formData.homepageUrl,
        snsUrl: formData.snsUrl,
        categoryId: formData.categoryId ? Number(formData.categoryId) : null,
        styleIds: formData.styleIds,
        featureIds: formData.featureIds,
        tags: tags,
      };

      createPopupMutation.mutate(requestData);

    } catch (error) {
      console.error('Upload failed:', error);
      addToast({ title: '이미지 업로드 실패', description: '다시 시도해주세요.', variant: 'error' });
      setIsSubmitting(false);
    }
  };

  // 공통 버튼 스타일
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
                placeholder="주소를 입력해주세요. (예: 광주광역시 동구 ...)"
                className="w-full border-b border-gray-300 py-2 pl-6 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <input
              type="text"
              name="addressDetail"
              value={formData.addressDetail}
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
                placeholder="연락처 (선택)"
                className="w-full border-b border-gray-300 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 4. 팝업 카테고리 (단일) */}
        <div>
          <label className="mb-3 block text-xs font-semibold text-gray-500">카테고리 (필수)</label>
          <div className="flex flex-wrap gap-2">
            {categories?.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleCategory(cat.id)}
                className={getButtonStyle(formData.categoryId === cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* 5. 스타일 (다중) */}
        <div>
          <label className="mb-3 block text-xs font-semibold text-gray-500">분위기/스타일 (다중 선택)</label>
          <div className="flex flex-wrap gap-2">
            {styles?.map((style) => (
              <button
                key={style.id}
                type="button"
                onClick={() => toggleArrayItem('styleIds', style.id)}
                className={getButtonStyle(formData.styleIds.includes(style.id))}
              >
                {style.name}
              </button>
            ))}
          </div>
        </div>

        {/* 6. 편의/특징 (다중) */}
        <div>
          <label className="mb-3 block text-xs font-semibold text-gray-500">편의/특징</label>
          <div className="flex flex-wrap gap-2">
            {features?.map((feat) => (
              <button
                key={feat.id}
                type="button"
                onClick={() => toggleArrayItem('featureIds', feat.id)}
                className={getButtonStyle(formData.featureIds.includes(feat.id))}
              >
                {feat.name}
              </button>
            ))}
          </div>
        </div>

        {/* 7. 해시태그 & 링크 */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-gray-500">해시태그</label>
            <input
              type="text"
              name="hashtags"
              value={formData.hashtags}
              onChange={handleChange}
              placeholder="#데이트 #핫플 (공백으로 구분)"
              className="mt-1 w-full border-b border-gray-300 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <div>
             <label className="text-xs font-semibold text-gray-500">홈페이지 URL</label>
             <input
               type="text"
               name="homepageUrl"
               value={formData.homepageUrl}
               onChange={handleChange}
               placeholder="https://"
               className="mt-1 w-full border-b border-gray-300 py-2 text-sm focus:border-primary focus:outline-none"
             />
          </div>
          <div>
             <label className="text-xs font-semibold text-gray-500">SNS URL</label>
             <input
               type="text"
               name="snsUrl"
               value={formData.snsUrl}
               onChange={handleChange}
               placeholder="https://instagram.com/..."
               className="mt-1 w-full border-b border-gray-300 py-2 text-sm focus:border-primary focus:outline-none"
             />
          </div>
        </div>

        {/* 8. 팝업 소개 */}
        <div>
          <label className="text-xs font-semibold text-gray-500">팝업소개 *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={6}
            required
            placeholder="팝업에 대한 설명을 상세하게 작성해 주세요."
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
                <div className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-500 truncate">
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
                <div className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-500 truncate">
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
            disabled={isSubmitting}
            className="w-full rounded-lg bg-[#EB0000] py-3 text-base font-bold text-white shadow-md hover:bg-[#c90000] md:w-auto md:px-12 disabled:opacity-70"
          >
            {isSubmitting ? '등록 중...' : '작성'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SellerPopupCreatePage;
