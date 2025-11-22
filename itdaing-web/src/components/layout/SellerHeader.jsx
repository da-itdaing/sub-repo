// src/components/layout/SellerHeader.jsx
import { useNavigate } from "react-router-dom";

export default function SellerHeader() {
  const navigate = useNavigate();

  const handleMessagesClick = () => {
    navigate("/seller/messages");
  };

  const handleProfileClick = () => {
    navigate("/seller/info");
  };

  return (
    <header className="w-full h-[80px] border-b bg-white flex items-center justify-between px-8">
      {/* 로고 */}
      <h1
        className="text-[28px] font-extrabold tracking-tight text-[#e21f1f] cursor-pointer"
        onClick={() => navigate("/seller/dashboard")}
      >
        DA - IT DAING
      </h1>

      {/* 오른쪽: 메시지함 + 프로필 */}
      <div className="flex items-center gap-6">
        <button
          type="button"
          onClick={handleMessagesClick}
          className="text-gray-700 text-xl hover:text-black transition-colors"
          aria-label="메시지함"
        >
          📧
        </button>

        <button
          type="button"
          onClick={handleProfileClick}
          className="flex items-center gap-3"
        >
          <span className="hidden md:inline text-sm text-gray-800">
            다잇다잉 님
          </span>
          <div className="flex items-center justify-center w-10 h-10 font-bold text-white bg-black rounded-full">
            DA
          </div>
        </button>
      </div>
    </header>
  );
}
