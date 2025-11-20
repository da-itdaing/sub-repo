import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-semibold text-gray-800">페이지를 찾을 수 없습니다</h1>
      <p className="text-gray-600">요청하신 주소가 잘못되었거나, 이동되었을 수 있어요.</p>
      <Link
        to="/"
        className="px-4 py-2 rounded-lg bg-[#eb0000] text-white hover:bg-[#cc0000] transition-colors"
      >
        홈으로 가기
      </Link>
    </div>
  );
}


