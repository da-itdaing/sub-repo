import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Upload } from 'lucide-react';
import { ROUTES } from '@/routes/paths';

const SellerNoticeCreatePage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // 수정 모드일 경우 id 존재
  const location = useLocation();
  const passedNotice = location.state?.notice;
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    isImportant: false,
    title: '',
    popupId: '',
    content: '',
    files: [],
  });

  // Mock Popup List
  const myPopups = [
    { id: 1, title: '여울원 팝업 IN 광주' },
    { id: 2, title: '충장 라온 페스타' },
    { id: 3, title: '[중장년 남성] 집밥에 진심인 남자들 : 제철 남도밥상' },
  ];

  const selectedPopupName =
    passedNotice?.popupName ||
    myPopups.find((popup) => String(popup.id) === String(formData.popupId))?.title ||
    '';

  // 수정 모드일 때 초기 데이터 로드 (Mock)
  useEffect(() => {
    if (isEditMode) {
      // TODO: 실제로는 API로 상세 데이터 조회
      const source = passedNotice || {
        id,
        isImportant: true,
        title: '고객 문의사항 창구',
        popupId: 2,
        content:
          '안녕하세요, 충장 라온 페스타 운영사무국입니다.\n\n공지사항 내용을 반드시 숙지하고 방문해주시길 바랍니다.\n\n1. 운영 시간 안내: 10:00 ~ 22:00\n2. 주차 안내: 인근 공영주차장 이용 권장\n3. 우천 시 행사 진행 여부는 당일 오전 9시 인스타그램을 통해 공지됩니다.\n\n감사합니다.',
      };

      setFormData({
        isImportant: Boolean(source.isImportant),
        title: source.title || '',
        popupId: source.popupId || '',
        content: (source.content || '').trim(),
        files: [],
      });
    }
  }, [isEditMode, id, passedNotice]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFormData((prev) => ({
        ...prev,
        files: Array.from(e.target.files),
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.popupId || !formData.content) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }
    
    // TODO: API 연동
  console.log(isEditMode ? 'Updating Notice:' : 'Creating Notice:', formData);
  alert(isEditMode ? '공지사항이 수정되었습니다.' : '공지사항이 등록되었습니다.');

  // 중요 체크 여부를 리스트 테이블에 반영하기 위해 수정 모드일 경우 상태 전달
  if (isEditMode) {
    navigate(ROUTES.seller.notices, {
      state: {
        updatedNotice: {
          id,
          isImportant: formData.isImportant,
        },
      },
    });
  } else {
    navigate(ROUTES.seller.notices);
  }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/80 bg-white p-8 shadow-sm shadow-slate-200/60">
        <h2 className="mb-8 text-xl font-bold text-[#EB0000]">공지사항</h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 제목 & 중요 체크박스 */}
          <div className="flex items-center gap-6 border-b border-gray-200 pb-6">
            <label className="w-16 text-sm font-bold text-gray-900">제목</label>
            <div className="flex flex-1 items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isImportant"
                  checked={formData.isImportant}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-[#EB0000] focus:ring-[#EB0000]"
                />
                <span className="text-sm text-gray-600">중요</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="제목을 입력해주세요."
                className="flex-1 border-none bg-transparent p-0 text-sm placeholder:text-gray-400 focus:ring-0"
              />
            </div>
          </div>

          {/* 팝업명 선택 / 표시 */}
          <div className="flex items-center gap-6 border-b border-gray-200 pb-6">
            <label className="w-16 text-sm font-bold text-gray-900">팝업명</label>
            <div className="flex-1">
              {isEditMode ? (
                <div className="inline-flex min-w-[260px] items-center rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-800">
                  {selectedPopupName || '선택된 팝업'}
                </div>
              ) : (
                <select
                  name="popupId"
                  value={formData.popupId}
                  onChange={handleChange}
                  className="w-64 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-[#EB0000] focus:outline-none focus:ring-1 focus:ring-[#EB0000]"
                >
                  <option value="">팝업 선택</option>
                  {myPopups.map((popup) => (
                    <option key={popup.id} value={popup.id}>
                      {popup.title}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* 내용 입력 */}
          <div className="flex gap-6 border-b border-gray-200 pb-6">
            <label className="w-16 pt-2 text-sm font-bold text-gray-900">내용</label>
            <div className="flex-1">
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="공지사항 본문 내용을 작성해주세요."
                rows={15}
                className="w-full resize-none rounded-xl border border-gray-300 p-4 text-sm placeholder:text-gray-400 focus:border-[#EB0000] focus:outline-none focus:ring-1 focus:ring-[#EB0000]"
              />
            </div>
          </div>

          {/* 첨부파일 */}
          <div className="flex items-center gap-6">
            <label className="w-16 text-sm font-bold text-gray-900">첨부파일</label>
            <div className="flex flex-1 items-center gap-3">
              <div className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-500">
                {formData.files.length > 0
                  ? formData.files.map(f => f.name).join(', ')
                  : ''}
              </div>
              <label className="cursor-pointer rounded-lg bg-gray-500 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600">
                <span className="flex items-center gap-1">
                  <div className="rounded-full border border-white p-0.5">
                    <Upload className="h-3 w-3" />
                  </div>
                  첨부
                </span>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* 작성 버튼 */}
          <div className="flex justify-center pt-8">
            <button
              type="submit"
              className="min-w-[120px] rounded-lg bg-[#EB0000] px-8 py-3 text-base font-bold text-white shadow-md hover:bg-[#c90000] transition-colors"
            >
              {isEditMode ? '수정하기' : '작성'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default SellerNoticeCreatePage;

