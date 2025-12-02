import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/routes/paths';
import { User, Mail, Phone, Building, MapPin, Save, Camera, ShieldAlert } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSellerProfile, updateSellerProfile } from '@/services/sellerService';
import { changePassword, deleteMyAccount } from '@/services/authService';
import { useToast } from '@/hooks/useToast';
import { uploadImage } from '@/services/uploadService';

const SellerProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    businessName: '', // 백엔드 미지원
    businessNumber: '', // 백엔드 미지원
    address: '', // activityRegion으로 매핑
    description: '', // introduction으로 매핑
    snsUrl: '',
    profileImageUrl: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Fetch Profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ['sellerProfile'],
    queryFn: getSellerProfile,
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: user?.name || '', // 이름은 user store나 profile에서 가져옴
        email: profile.email || user?.email || '',
        phone: profile.phone || '', // 백엔드에 phone 필드 확인 필요 (SellerSummaryResponse에는 있음)
        businessName: '', // 현재 API에 없음
        businessNumber: '', // 현재 API에 없음
        address: profile.activityRegion || '',
        description: profile.introduction || '',
        snsUrl: profile.snsUrl || '',
        profileImageUrl: profile.profileImageUrl || '',
      });
    }
  }, [profile, user]);

  const updateProfileMutation = useMutation({
    mutationFn: updateSellerProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellerProfile'] });
      addToast({ title: '프로필이 성공적으로 업데이트되었습니다.' });
    },
    onError: (error) => {
      addToast({ 
        title: '프로필 수정 실패', 
        description: error.message, 
        variant: 'error' 
      });
    },
  });

  const passwordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      addToast({ title: '비밀번호가 변경되었습니다.' });
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setIsPasswordOpen(false);
    },
    onError: (error) => {
      addToast({
        title: '비밀번호 변경 실패',
        description: error.message || '잠시 후 다시 시도해주세요.',
        variant: 'error',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMyAccount,
    onSuccess: () => {
      addToast({ title: '계정이 삭제되었습니다.' });
      logout();
      navigate(ROUTES.home);
    },
    onError: (error) => {
      addToast({
        title: '탈퇴 실패',
        description: error.message || '잠시 후 다시 시도해주세요.',
        variant: 'error',
      });
    },
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const uploadedImage = await uploadImage(file);
      // 이미지 업로드 후 바로 폼 데이터 업데이트
      setFormData(prev => ({ ...prev, profileImageUrl: uploadedImage.url }));
    } catch (err) {
      console.error(err);
      addToast({ title: '이미지 업로드 실패', variant: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  const handlePasswordInput = (field, value) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePasswordSubmit = (event) => {
    event.preventDefault();

    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (!currentPassword || !newPassword || !confirmPassword) {
      addToast({ title: '모든 필드를 입력해주세요.', variant: 'error' });
      return;
    }

    if (newPassword.length < 8) {
      addToast({ title: '새 비밀번호는 8자 이상이어야 합니다.', variant: 'error' });
      return;
    }

    if (newPassword !== confirmPassword) {
      addToast({ title: '새 비밀번호와 확인 비밀번호가 일치하지 않습니다.', variant: 'error' });
      return;
    }

    passwordMutation.mutate({
      currentPassword,
      newPassword,
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    
    // API 요청 데이터 매핑
    const requestData = {
      profileImageUrl: formData.profileImageUrl,
      introduction: formData.description,
      activityRegion: formData.address,
      snsUrl: formData.snsUrl,
    };

    updateProfileMutation.mutate(requestData);
  };

  if (isLoading) {
    return <div className="p-12 text-center text-gray-500">프로필 정보를 불러오는 중...</div>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section className="rounded-3xl border border-white/80 bg-white p-6 shadow-sm shadow-slate-200/60">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative h-20 w-20 rounded-2xl bg-gray-100 overflow-hidden ring-2 ring-white shadow-md group">
            {formData.profileImageUrl ? (
              <img 
                src={formData.profileImageUrl} 
                alt="Profile" 
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
                <User className="h-10 w-10" />
              </div>
            )}
            <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Camera className="h-6 w-6 text-white" />
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageChange}
                disabled={isUploading}
              />
            </label>
          </div>
          
          <div className="flex-1">
            <p className="text-xs uppercase tracking-wide text-gray-400">판매자 계정</p>
            <h2 className="text-2xl font-semibold text-gray-900">{formData.name || '판매자'}</h2>
            <p className="text-sm text-gray-500">{formData.email}</p>
          </div>
        </div>
      </section>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-3xl border border-white/80 bg-white p-6 shadow-sm shadow-slate-200/60"
      >
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400">기본 정보</h3>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* 이름/이메일은 수정 불가 (읽기 전용) */}
            <div>
              <label className="text-xs font-semibold text-gray-500">이름</label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={formData.name}
                  disabled
                  className="w-full rounded-2xl border border-gray-200 bg-gray-100 px-10 py-2 text-sm text-gray-500 focus:outline-none cursor-not-allowed"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500">이메일</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full rounded-2xl border border-gray-200 bg-gray-100 px-10 py-2 text-sm text-gray-500 focus:outline-none cursor-not-allowed"
                />
              </div>
            </div>
            
            {/* 연락처 (현재 API 미지원 가능성 있음, UI만 유지) */}
            <div>
              <label className="text-xs font-semibold text-gray-500">연락처</label>
              <div className="relative mt-1">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="010-0000-0000"
                  className="w-full rounded-2xl border border-gray-200 bg-white px-10 py-2 text-sm focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400">판매자 정보</h3>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* 활동 지역 (API: activityRegion) */}
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-gray-500">활동 지역</label>
              <div className="relative mt-1">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="주 활동 지역을 입력하세요 (예: 광주 남구)"
                  className="w-full rounded-2xl border border-gray-200 bg-white px-10 py-2 text-sm focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* SNS URL */}
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-gray-500">SNS URL</label>
              <div className="relative mt-1">
                <Building className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="snsUrl"
                  value={formData.snsUrl}
                  onChange={handleChange}
                  placeholder="https://instagram.com/..."
                  className="w-full rounded-2xl border border-gray-200 bg-white px-10 py-2 text-sm focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
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
            className="mt-3 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
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
            disabled={updateProfileMutation.isPending}
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/30 hover:bg-primary/90 disabled:opacity-70"
          >
            {/* <Save className="h-4 w-4" /> */}
            {updateProfileMutation.isPending ? '저장 중...' : '저장하기'}
          </button>
        </div>
      </form>

      <section className="rounded-3xl border border-white/80 bg-white p-6 shadow-sm shadow-slate-200/60">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400">계정 설정</h3>
        <div className="mt-4 space-y-3 text-sm">
          <button
            type="button"
            onClick={() => setIsPasswordOpen((prev) => !prev)}
            className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700 hover:bg-gray-50 flex items-center justify-between"
          >
            비밀번호 변경
            <span className="text-xs text-gray-400">{isPasswordOpen ? '닫기' : '설정'}</span>
          </button>
          {isPasswordOpen && (
            <form onSubmit={handlePasswordSubmit} className="space-y-3 rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm">
              <div>
                <label className="text-xs font-semibold text-gray-500">현재 비밀번호</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => handlePasswordInput('currentPassword', e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="현재 비밀번호"
                  autoComplete="current-password"
                />
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-gray-500">새 비밀번호</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => handlePasswordInput('newPassword', e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="8자 이상 영문+숫자 조합"
                    autoComplete="new-password"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500">새 비밀번호 확인</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => handlePasswordInput('confirmPassword', e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="새 비밀번호 재입력"
                    autoComplete="new-password"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={passwordMutation.isPending}
                className="w-full rounded-2xl bg-primary py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-60"
              >
                {passwordMutation.isPending ? '변경 중...' : '비밀번호 변경'}
              </button>
            </form>
          )}
          <button
            type="button"
            onClick={() => setIsDeleteOpen(true)}
            className="w-full rounded-2xl border border-rose-200 px-4 py-3 text-left font-semibold text-rose-600 hover:bg-rose-50"
          >
            회원 탈퇴
          </button>
        </div>
      </section>
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center gap-3 text-rose-600">
              <ShieldAlert className="h-6 w-6" />
              <h4 className="text-lg font-bold">계정 삭제 확인</h4>
            </div>
            <p className="text-sm text-gray-600">
              계정을 삭제하면 판매자 정보, 팝업 데이터 및 맞춤 설정이 모두 삭제되며 복구할 수 없습니다.
              정말로 탈퇴하시겠습니까?
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={() => setIsDeleteOpen(false)}
                className="flex-1 rounded-2xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 sm:flex-none"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                className="flex-1 rounded-2xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-rose-300 hover:bg-rose-700 disabled:opacity-60 sm:flex-none"
              >
                {deleteMutation.isPending ? '탈퇴 중...' : '탈퇴하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerProfilePage;
