import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ROUTES } from '@/routes/paths';

const FALLBACK_SELLER_AVATAR =
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80';
const FALLBACK_CONSUMER_AVATAR =
  'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=600&q=80';

// 간단한 mock - 실제로는 API 호출 필요
const MOCK_USER_MAP = {
  1: {
    id: 1,
    loginId: 'testuser',
    name: '홍길동',
    ageGroup: '20대',
    email: 'user@gmail.com',
    role: 'consumer',
    status: 'active',
    profileImageUrl: FALLBACK_CONSUMER_AVATAR,
    intro: '안녕하세요. 홍길동입니다.',
    mainRegion: '동구',
  },
};

const AdminUserProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const passedUser = location.state?.user;
  const user = passedUser || MOCK_USER_MAP[id];

  if (!user) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-3xl border border-white/80 bg-white p-8 shadow-sm shadow-slate-200/60">
        <div className="text-center text-sm text-gray-500">
          사용자를 찾을 수 없습니다.
        </div>
      </div>
    );
  }

  const isSeller = user.role === 'seller';

  const avatarUrl =
    user.profileImageUrl ||
    (isSeller ? FALLBACK_SELLER_AVATAR : FALLBACK_CONSUMER_AVATAR);

  if (isSeller) {
    // 판매자 프로필
    return (
      <div className="rounded-3xl border border-white/80 bg-white p-10 shadow-sm shadow-slate-200/60">
        <div className="flex flex-col items-center gap-10 md:flex-row">
          <div className="flex-shrink-0">
            <div className="h-48 w-48 rounded-full bg-gray-900 text-[64px] font-black text-red-600 flex items-center justify-center overflow-hidden">
              {/* 프로필 이미지가 있다면 표시, 없으면 DA 로고 스타일 */}
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>DA</span>
              )}
            </div>
          </div>

          <div className="flex-1 space-y-6">
            <div>
              <div className="flex items-baseline gap-4">
                <h1 className="text-5xl font-extrabold text-[#EB0000]">
                  {user.name} 님
                </h1>
                <span className="text-xl font-semibold text-gray-400">
                  판매자
                </span>
              </div>
              <p className="mt-4 text-xl text-gray-800">
                {user.intro || '안녕하세요. 다잇다잉입니다.'}
              </p>
            </div>

            <div className="grid gap-10 pt-4 md:grid-cols-2">
              <div className="space-y-6">
                <div>
                  <p className="text-lg font-semibold text-[#EB0000]">아이디</p>
                  <p className="mt-2 text-xl text-gray-900">{user.loginId}</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-[#EB0000]">이름</p>
                  <p className="mt-2 text-xl text-gray-900">{user.name}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-lg font-semibold text-[#EB0000]">
                    E-mail
                  </p>
                  <p className="mt-2 text-xl text-gray-900">{user.email}</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-[#EB0000]">
                    주 활동지역
                  </p>
                  <p className="mt-2 text-xl text-gray-900">
                    {user.mainRegion || '동구'}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={() => navigate(ROUTES.admin.users)}
                className="rounded-xl bg-gray-900 px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-gray-800"
              >
                목록
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 소비자 프로필
  return (
    <div className="rounded-3xl border border-white/80 bg-white p-10 shadow-sm shadow-slate-200/60">
      <div className="flex flex-col items-center gap-10 md:flex-row">
        <div className="flex-shrink-0">
          <div className="h-48 w-48 overflow-hidden rounded-full border border-gray-200 bg-gray-100">
            <img
              src={avatarUrl}
              alt={user.name}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        <div className="flex-1 space-y-8">
          <div>
            <div className="flex items-baseline gap-4">
              <h1 className="text-5xl font-extrabold text-[#EB0000]">
                {user.name} 님
              </h1>
              <span className="text-xl font-semibold text-gray-400">
                소비자
              </span>
            </div>
          </div>

          <div className="grid gap-10 md:grid-cols-2">
            <div className="space-y-6">
              <div>
                <p className="text-lg font-semibold text-[#EB0000]">아이디</p>
                <p className="mt-2 text-xl text-gray-900">{user.loginId}</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-[#EB0000]">
                  E-mail
                </p>
                <p className="mt-2 text-xl text-gray-900">{user.email}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-lg font-semibold text-[#EB0000]">연령대</p>
                <p className="mt-2 text-xl text-gray-900">
                  {user.ageGroup || '-'}
                </p>
              </div>
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={() => navigate(ROUTES.admin.users)}
              className="rounded-xl bg-gray-900 px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-gray-800"
            >
              목록
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUserProfilePage;


