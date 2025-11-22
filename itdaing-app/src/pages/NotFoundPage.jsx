import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes/paths';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">페이지를 찾을 수 없습니다</p>
        <Link
          to={ROUTES.home}
          className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;

