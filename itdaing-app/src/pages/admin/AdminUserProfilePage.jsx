import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Mail, MapPin, Calendar, User, Store, ShieldCheck, ShieldX, RefreshCw } from 'lucide-react';
import { ROUTES } from '@/routes/paths';
import { useToast } from '@/hooks/useToast';
import { updateUserStatus } from '@/services/adminService';

const FALLBACK_SELLER_AVATAR =
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80';
const FALLBACK_CONSUMER_AVATAR =
  'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=600&q=80';

const getStatusLabel = (status) => {
  if (status === 'ACTIVE') return '활성화';
  if (status === 'SUSPENDED') return '정지';
  if (status === 'WITHDRAWN') return '탈퇴';
  return status || '-';
};

const getStatusChipClass = (status) => {
  if (status === 'ACTIVE') return 'bg-emerald-50 text-emerald-700';
  if (status === 'SUSPENDED') return 'bg-red-50 text-red-700';
  if (status === 'WITHDRAWN') return 'bg-gray-100 text-gray-500';
  return 'bg-gray-50 text-gray-500';
};

const getRoleLabel = (role) => {
  if (role === 'SELLER') return '판매자';
  if (role === 'CONSUMER') return '소비자';
  if (role === 'ADMIN') return '관리자';
  return role || '-';
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const AdminUserProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  // location.state에서 전달된 사용자 정보 사용
  const user = location.state?.user;

  // 상태 변경 Mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ userId, status }) => updateUserStatus(userId, status),
    onSuccess: (data) => {
      addToast({ title: '사용자 상태가 변경되었습니다.' });
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      // 상태 업데이트 반영
      if (data) {
        navigate(location.pathname, { 
          state: { user: { ...user, status: data.status } },
          replace: true 
        });
      }
    },
    onError: (error) => {
      addToast({ title: '상태 변경 실패', description: error.message, variant: 'error' });
    },
  });

  const handleChangeStatus = (newStatus) => {
    if (!user?.id) return;
    const statusLabel = newStatus === 'ACTIVE' ? '활성화' : '정지';
    if (window.confirm(`이 사용자를 ${statusLabel} 상태로 변경하시겠습니까?`)) {
      updateStatusMutation.mutate({ userId: user.id, status: newStatus });
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-4">사용자 정보를 찾을 수 없습니다.</p>
          <button
            onClick={() => navigate(ROUTES.admin.users)}
            className="text-sm text-[#eb0000] hover:underline"
          >
            사용자 목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const isSeller = user.role === 'SELLER';
  const isConsumer = user.role === 'CONSUMER';
  
  const avatarUrl =
    user.profileImageUrl ||
    (isSeller ? FALLBACK_SELLER_AVATAR : FALLBACK_CONSUMER_AVATAR);

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(ROUTES.admin.users)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">사용자 상세</h1>
          <p className="text-sm text-gray-500">사용자 정보를 확인하고 관리합니다.</p>
        </div>
      </div>

      {/* 프로필 카드 */}
      <div className="rounded-3xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        {/* 상단 배경 */}
        <div className="h-32 bg-gradient-to-r from-[#eb0000] to-[#ff6b6b]" />
        
        {/* 프로필 정보 */}
        <div className="px-8 pb-8">
          {/* 아바타 */}
          <div className="-mt-16 mb-6">
            <div className="h-32 w-32 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden">
              <img
                src={avatarUrl}
                alt={user.name || user.nickname || '사용자'}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.target.src = isConsumer ? FALLBACK_CONSUMER_AVATAR : FALLBACK_SELLER_AVATAR;
                }}
              />
            </div>
          </div>

          {/* 기본 정보 */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl font-bold text-gray-900">
                  {user.name || user.nickname || '이름 없음'}
                </h2>
                <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${
                  isSeller ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'
                }`}>
                  {isSeller ? <Store className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  {getRoleLabel(user.role)}
                </span>
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getStatusChipClass(user.status)}`}>
                  {getStatusLabel(user.status)}
                </span>
              </div>
              <p className="text-gray-500">@{user.loginId || '-'}</p>
            </div>

            {/* 액션 버튼 */}
            <div className="flex items-center gap-3">
              {user.status === 'ACTIVE' ? (
                <button
                  onClick={() => handleChangeStatus('SUSPENDED')}
                  disabled={updateStatusMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  <ShieldX className="h-4 w-4" />
                  정지
                </button>
              ) : user.status === 'SUSPENDED' ? (
                <button
                  onClick={() => handleChangeStatus('ACTIVE')}
                  disabled={updateStatusMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-emerald-300 text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-50"
                >
                  <ShieldCheck className="h-4 w-4" />
                  활성화
                </button>
              ) : null}
            </div>
          </div>

          {/* 상세 정보 그리드 */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 이메일 */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50">
              <div className="p-2 rounded-lg bg-white shadow-sm">
                <Mail className="h-5 w-5 text-[#eb0000]" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">이메일</p>
                <p className="text-sm font-semibold text-gray-900">{user.email || '-'}</p>
              </div>
            </div>

            {/* 연령대 */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50">
              <div className="p-2 rounded-lg bg-white shadow-sm">
                <User className="h-5 w-5 text-[#eb0000]" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">연령대</p>
                <p className="text-sm font-semibold text-gray-900">
                  {user.ageGroup ? `${user.ageGroup}대` : '-'}
                </p>
              </div>
            </div>

            {/* 활동 지역 */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50">
              <div className="p-2 rounded-lg bg-white shadow-sm">
                <MapPin className="h-5 w-5 text-[#eb0000]" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">활동 지역</p>
                <p className="text-sm font-semibold text-gray-900">
                  {user.activityRegion || user.mainRegion || '-'}
                </p>
              </div>
            </div>

            {/* 가입일 */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50">
              <div className="p-2 rounded-lg bg-white shadow-sm">
                <Calendar className="h-5 w-5 text-[#eb0000]" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">가입일</p>
                <p className="text-sm font-semibold text-gray-900">
                  {formatDate(user.createdAt)}
                </p>
              </div>
            </div>

            {/* 판매자 전용: 소개 */}
            {isSeller && user.introduction && (
              <div className="md:col-span-2 flex items-start gap-3 p-4 rounded-xl bg-gray-50">
                <div className="p-2 rounded-lg bg-white shadow-sm">
                  <Store className="h-5 w-5 text-[#eb0000]" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 mb-1">소개</p>
                  <p className="text-sm text-gray-900">{user.introduction}</p>
                </div>
              </div>
            )}
          </div>

          {/* 판매자 추가 정보 */}
          {isSeller && (
            <div className="mt-8 pt-8 border-t border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">판매자 정보</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {user.snsUrl && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">SNS</p>
                    <a 
                      href={user.snsUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-[#eb0000] hover:underline"
                    >
                      {user.snsUrl}
                    </a>
                  </div>
                )}
                {user.businessNumber && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">사업자등록번호</p>
                    <p className="text-sm text-gray-900">{user.businessNumber}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="flex justify-end">
        <button
          onClick={() => navigate(ROUTES.admin.users)}
          className="px-6 py-2.5 rounded-xl bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors"
        >
          목록으로
        </button>
      </div>
    </div>
  );
};

export default AdminUserProfilePage;
