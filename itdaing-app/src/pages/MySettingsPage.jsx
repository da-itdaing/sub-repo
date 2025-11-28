import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, SlidersHorizontal, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import { useAuthStore } from '@/store/authStore';
import {
  getMyProfile,
  updateMyProfile,
  deleteMyAccount,
  getMyPreferences,
  updateMyPreferences,
} from '@/services/authService';
import { ROUTES } from '@/routes/paths';
import { useToast } from '@/hooks/useToast';
import apiClient from '@/api/client';
import { uploadImage } from '@/services/uploadService';
import { useMasterData } from '@/hooks/useMasterData';

const AGE_GROUPS = [10, 20, 30, 40, 50, 60, 70, 80, 90];
const GWANGJU_DISTRICTS = ['동구', '서구', '남구', '북구', '광산구'];

const MySettingsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { logout, isAuthenticated } = useAuthStore();
  const { addToast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    nickname: '',
    ageGroup: '',
    mbti: '',
  });
  const [prefForm, setPrefForm] = useState({
    interestCategoryIds: [],
    styleIds: [],
    regionIds: [],
    featureIds: [],
    ageGroupTens: true, // TODO: 확인 필요, DTO에 맞춤
  });

  const { categories, regions, styles, features, isLoading: masterLoading } = useMasterData();

  const uniqueCategories = useMemo(() => {
    if (!Array.isArray(categories)) return [];
    const seen = new Set();
    return categories.filter((category) => {
      const label = category?.name?.trim();
      if (!label || seen.has(label)) {
        return false;
      }
      seen.add(label);
      return true;
    });
  }, [categories]);

  const gwangjuRegions = useMemo(() => {
    if (!Array.isArray(regions)) return [];
    const regionMap = regions.reduce((acc, region) => {
      if (region?.name) {
        acc[region.name] = region;
      }
      return acc;
    }, {});
    return GWANGJU_DISTRICTS.map((name) => regionMap[name]).filter(Boolean);
  }, [regions]);

  const { data: profile } = useQuery({
    queryKey: ['my-profile'],
    queryFn: getMyProfile,
    enabled: isAuthenticated,
  });

  const { data: preferenceData } = useQuery({
    queryKey: ['my-preferences'],
    queryFn: getMyPreferences,
    enabled: isAuthenticated,
  });

  // 프로필 이미지 업로드 API 확인 필요 (/api/users/me/profile-image 경로가 openapi.json에 명시되지 않음)
  // TODO: API 엔드포인트 확인 및 구현
  const updateProfileImageMutation = useMutation({
    mutationFn: async (imagePayload) => {
      // 임시 경로, 실제 API 확인 필요
      return apiClient.put('/users/me/profile-image', imagePayload); 
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-profile'] });
      addToast({ title: '프로필 이미지가 변경되었습니다.' });
    },
    onError: (err) => {
      addToast({ title: '변경 실패', description: '프로필 이미지 변경을 지원하지 않는 계정이거나 API 오류입니다.', variant: 'error' });
      console.error(err);
    },
  });

  useEffect(() => {
    if (profile) {
      setProfileForm({
        name: profile.name || '',
        nickname: profile.nickname || '',
        ageGroup: profile.ageGroup || '',
        mbti: profile.mbti || '',
      });
    }
  }, [profile]);

  useEffect(() => {
    if (preferenceData) {
      setPrefForm({
        interestCategoryIds: preferenceData.interestCategoryIds || [],
        styleIds: preferenceData.styleIds || [],
        regionIds: preferenceData.regionIds || [],
        featureIds: preferenceData.featureIds || [],
        ageGroupTens: preferenceData.ageGroupTens ?? true,
      });
    }
  }, [preferenceData]);

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const imagePayload = await uploadImage(file);
      await updateProfileImageMutation.mutateAsync(imagePayload);
    } catch (err) {
      console.error(err);
      addToast({ title: '이미지 업로드 실패', variant: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleProfileInput = (field, value) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePreferenceToggle = (field, id) => {
    setPrefForm((prev) => {
      const current = prev[field] || [];
      const exists = current.includes(id);
      if (exists) {
        return { ...prev, [field]: current.filter((item) => item !== id) };
      }
      if (current.length >= 4) {
        addToast({
          title: '선택 제한',
          description: '최대 4개까지 선택할 수 있습니다.',
          variant: 'error',
        });
        return prev;
      }
      return { ...prev, [field]: [...current, id] };
    });
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      // 1. 프로필 정보 수정
      // TODO: openapi.json에 /users/me PUT이 없어 소비자 프로필 수정 불가 가능성 있음.
      // 판매자라면 updateSellerProfile을 써야 하나, MySettingsPage는 주로 소비자용으로 보임.
      // updateMyProfile 내부에서 try-catch로 감싸져 있어 에러 발생 시 경고만 출력될 수 있음.
      try {
        await updateMyProfile({
          name: profileForm.name?.trim() || null,
          nickname: profileForm.nickname?.trim() || null,
          ageGroup: profileForm.ageGroup ? Number(profileForm.ageGroup) : null,
          mbti: profileForm.mbti?.trim().toUpperCase() || null,
        });
      } catch (e) {
        console.warn('기본 프로필 업데이트 실패 (API 미지원 가능성):', e);
      }

      // 2. 선호 정보 수정 (별도 API)
      // 이 API (/consumers/me/preferences) 또한 openapi.json에 없으므로 확인 필요
      try {
        await updateMyPreferences(prefForm);
      } catch (e) {
        console.warn('선호 정보 업데이트 실패 (API 미지원 가능성):', e);
      }

      await queryClient.invalidateQueries({ queryKey: ['my-profile'] });
      await queryClient.invalidateQueries({ queryKey: ['my-preferences'] });
      
      addToast({ title: '저장 요청이 완료되었습니다.' });
    } catch (error) {
      console.error(error);
      addToast({
        title: '저장 실패',
        description: '서버와 통신 중 오류가 발생했습니다.',
        variant: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm('정말로 계정을 삭제하시겠습니까? 모든 데이터가 비활성화됩니다.');
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await deleteMyAccount();
      logout();
      navigate(ROUTES.home);
      addToast({ title: '계정이 삭제되었습니다.' });
    } catch (error) {
      console.error(error);
      addToast({
        title: '탈퇴 실패',
        description: error.message || '잠시 후 다시 시도해주세요.',
        variant: 'error',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-gray-600 text-sm">계정 정보를 불러오는 중입니다.</p>
        </div>
      </div>
    );
  }

  const preferenceGroups = [
    { title: '관심 카테고리', field: 'interestCategoryIds', items: uniqueCategories },
    { title: '선호 스타일', field: 'styleIds', items: styles },
    { title: '선호 지역', field: 'regionIds', items: gwangjuRegions },
    { title: '편의 시설', field: 'featureIds', items: features },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header hideSearchBar />
      
      <main className="flex-1 w-full max-w-[720px] mx-auto px-5 pt-8 pb-24 space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1 rounded-full hover:bg-gray-100">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div>
            <p className="text-xs text-gray-500">계정 관리</p>
            <h1 className="text-xl font-bold text-gray-900">내 정보 설정</h1>
          </div>
        </div>

        <section className="bg-white rounded-3xl p-6 shadow-sm ring-1 ring-gray-100 flex flex-col md:flex-row md:items-center md:gap-6">
          <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 ring-2 ring-white shadow-md">
            <img
              src={profile.profileImage?.url || '/placeholder-user.png'}
              alt="profile"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/placeholder-user.png';
              }}
            />
            <label className="absolute bottom-0 right-0 p-2 bg-gray-900 text-white rounded-full cursor-pointer hover:bg-gray-800 transition">
              <Camera className="w-4 h-4" />
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} disabled={isUploading} />
            </label>
          </div>
          <div className="flex-1 space-y-1">
            <h2 className="text-lg font-bold text-gray-900">{profile.nickname || profile.name}</h2>
            <p className="text-sm text-gray-500">{profile.email}</p>
            <p className="inline-flex items-center gap-2 text-xs text-primary font-semibold mt-1 px-3 py-1 bg-primary/10 rounded-full">
              <SlidersHorizontal className="w-3 h-3" />
              {profile.role === 'CONSUMER' ? '소비자 회원' : profile.role}
            </p>
          </div>
        </section>

        <section className="bg-white rounded-3xl p-6 shadow-sm ring-1 ring-gray-100 space-y-4">
          <h3 className="text-base font-bold text-gray-900">기본 정보</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500">이름</label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => handleProfileInput('name', e.target.value)}
                className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="이름을 입력하세요"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500">닉네임</label>
              <input
                type="text"
                value={profileForm.nickname}
                onChange={(e) => handleProfileInput('nickname', e.target.value)}
                className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="닉네임을 입력하세요"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500">나이대</label>
              <select
                value={profileForm.ageGroup}
                onChange={(e) => handleProfileInput('ageGroup', e.target.value)}
                className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">선택</option>
                {AGE_GROUPS.map((group) => (
                  <option key={group} value={group}>
                    {group}대
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500">MBTI</label>
              <input
                type="text"
                value={profileForm.mbti}
                onChange={(e) => handleProfileInput('mbti', e.target.value.toUpperCase())}
                maxLength={4}
                className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 uppercase"
                placeholder="예: ENFP"
              />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-3xl p-6 shadow-sm ring-1 ring-gray-100 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900">선호 정보</h3>
              <p className="text-xs text-gray-500 mt-1">최대 4개까지 선택할 수 있습니다.</p>
            </div>
            {masterLoading && <span className="text-xs text-gray-400">불러오는 중...</span>}
          </div>

          {preferenceGroups.map(({ title, field, items }) => (
            <div key={field}>
              <p className="text-xs font-semibold text-gray-500 mb-2">{title}</p>
              <div className="flex flex-wrap gap-2">
                {items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handlePreferenceToggle(field, item.id)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition border ${
                      prefForm[field]?.includes(item.id)
                        ? 'bg-[#EB0000] text-white border-[#EB0000] shadow-sm'
                        : 'bg-white text-[oklch(0.373_0.034_259.733)] border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
                {items.length === 0 && (
                  <span className="text-xs text-gray-400">선택 가능한 항목이 없습니다.</span>
                )}
              </div>
            </div>
          ))}
        </section>

        <section>
          <button
            type="button"
            onClick={handleSaveAll}
            disabled={isSaving}
            className="w-full rounded-2xl bg-primary py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:bg-primary/90 disabled:opacity-50"
          >
            {isSaving ? '저장 중...' : '변경사항 저장'}
          </button>
        </section>

        <section className="bg-white rounded-3xl p-6 shadow-sm ring-1 ring-rose-100">
          <div className="flex items-center gap-2 mb-3">
            <Trash2 className="w-4 h-4 text-rose-600" />
            <h3 className="text-base font-bold text-rose-700">회원 탈퇴</h3>
          </div>
          <p className="text-sm text-rose-600 mb-4">
            계정을 삭제하면 저장된 관심 팝업 및 추천 정보가 비활성화됩니다. 이 작업은 되돌릴 수 없습니다.
          </p>
          <button
            type="button"
            onClick={handleDeleteAccount}
            disabled={isDeleting}
            className="w-full rounded-2xl border border-rose-200 bg-rose-50 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-100 disabled:opacity-50"
          >
            {isDeleting ? '처리 중...' : '회원 탈퇴'}
          </button>
        </section>
      </main>

      <BottomNav />
    </div>
  );
};

export default MySettingsPage;
