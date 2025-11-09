import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { useUser } from "../../context/UserContext";

interface LoginPageProps {
  onClose: () => void;
  onSignupClick: () => void;
  onLoginSuccess: (userType: "consumer" | "seller", sellerId?: number) => void;
}

export function LoginPage({ onClose, onSignupClick, onLoginSuccess }: LoginPageProps) {
  const [userType, setUserType] = useState<"consumer" | "seller">("consumer");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { setProfile, loadPresetFor } = useUser();

  const handleLogin = () => {
    // Check hardcoded credentials
    // 소비자 계정: consumer1/11
    // 판매자 계정: seller1/11, seller2/22, seller3/33, ..., seller15/1515
    const sellerAccounts = [
      { username: "seller1", password: "11" },
      { username: "seller2", password: "22" },
      { username: "seller3", password: "33" },
      { username: "seller4", password: "44" },
      { username: "seller5", password: "55" },
      { username: "seller6", password: "66" },
      { username: "seller7", password: "77" },
      { username: "seller8", password: "88" },
      { username: "seller9", password: "99" },
      { username: "seller10", password: "1010" },
      { username: "seller11", password: "1111" },
      { username: "seller12", password: "1212" },
      { username: "seller13", password: "1313" },
      { username: "seller14", password: "1414" },
      { username: "seller15", password: "1515" },
    ];

    const isValidSeller = userType === "seller" && 
      sellerAccounts.some(acc => acc.username === username && acc.password === password);

    if (
      (username === "consumer1" && password === "11" && userType === "consumer") ||
      isValidSeller
    ) {
      setError("");
      // seller 로그인 시 sellerId도 함께 전달
      if (userType === "seller") {
        const sellerNum = parseInt(username.replace("seller", ""));
        onLoginSuccess(userType, sellerNum);
      } else {
        // Load preset for known demo user and populate profile
        loadPresetFor(username);
        if(username !== "consumer1"){
          setProfile({
            userType: "consumer",
            username,
            name: username,
            nickname: username,
            email: `${username}@example.com`,
            ageGroup: "20대",
            interests: ["패션"],
            moods: ["포토존"],
            regions: ["남구"],
            conveniences: ["무료입장"],
          });
        }
        onLoginSuccess(userType);
      }
    } else {
      setError("아이디 또는 비밀번호가 올바르지 않습니다.");
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center overflow-y-auto">
      <div className="relative w-full max-w-[420px] mx-auto py-12 px-6">
        {/* Logo - 클릭하면 메인홈으로 이동 */}
        <div className="flex justify-center mb-16">
          <button 
            onClick={onClose}
            className="hover:opacity-80 transition-opacity"
            aria-label="Go to home"
          >
            <h1 className="font-['Luckiest_Guy:Regular',sans-serif] text-[32px] sm:text-[40px] md:text-[56px] text-[#eb0000] leading-normal w-[280px] sm:w-auto text-center">
              Da - It daing
            </h1>
          </button>
        </div>

        {/* User Type Selection */}
        <div className="flex justify-center mb-6">
          <div className="relative bg-[#e5e5e5] rounded-[30px] h-[48px] flex items-center px-1.5 w-[280px]">
            {/* Sliding white background */}
            <div
              className="absolute h-[38px] bg-white rounded-[30px] shadow-sm transition-all duration-300 ease-in-out"
              style={{
                width: "calc(50% - 3px)",
                left: userType === "consumer" ? "6px" : "calc(50% + 3px)",
              }}
            />
            
            {/* Buttons */}
            <button
              onClick={() => setUserType("consumer")}
              className={`relative z-10 flex-1 h-[38px] rounded-[30px] transition-colors duration-300 font-['Pretendard:Regular',sans-serif] flex items-center justify-center ${
                userType === "consumer"
                  ? "text-black"
                  : "text-gray-500"
              }`}
            >
              소비자
            </button>
            <button
              onClick={() => setUserType("seller")}
              className={`relative z-10 flex-1 h-[38px] rounded-[30px] transition-colors duration-300 font-['Pretendard:Regular',sans-serif] flex items-center justify-center ${
                userType === "seller"
                  ? "text-black"
                  : "text-gray-500"
              }`}
            >
              판매자
            </button>
          </div>
        </div>

        {/* ID/Password Inputs */}
        <div className="space-y-4 mb-6">
          <input
            type="text"
            placeholder="아이디를 입력해주세요"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="w-full h-[52px] rounded-[30px] bg-[#f5f5f5] border-[0.7px] border-gray-300 px-6 font-['Pretendard:Regular',sans-serif] placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#eb0000]/20"
          />
          <input
            type="password"
            placeholder="비밀번호를 입력해주세요"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="w-full h-[52px] rounded-[30px] bg-[#f5f5f5] border-[0.7px] border-gray-300 px-6 font-['Pretendard:Regular',sans-serif] placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#eb0000]/20"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 text-center">
            <p className="font-['Pretendard:Regular',sans-serif] text-[12px] text-[#eb0000]">
              {error}
            </p>
          </div>
        )}

        {/* Login Button */}
        <div className="flex flex-col items-center mb-6">
          <button
            onClick={handleLogin}
            className="w-full max-w-[450px] h-[52px] bg-[#eb0000] rounded-[30px] font-['Pretendard:Regular',sans-serif] text-white hover:bg-[#cc0000] transition-colors flex items-center justify-center"
          >
            로그인
          </button>
        </div>

        {/* Sign Up Link */}
        <div className="text-center mb-6">
          <button 
            onClick={onSignupClick}
            className="font-['Pretendard:Regular',sans-serif] text-gray-600 hover:underline"
          >
            회원가입
          </button>
        </div>

        {/* Divider with "간편로그인" */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-4 font-['Pretendard:Regular',sans-serif] text-gray-500">
              간편로그인
            </span>
          </div>
        </div>

        {/* Kakao Login */}
        <div className="flex justify-center mb-8">
          <button className="w-full max-w-[450px] flex items-center justify-center gap-2 h-[52px] bg-[#fee500] rounded-[30px] hover:bg-[#fdd800] transition-colors">
            <MessageCircle className="w-[20px] h-[20px] text-black" aria-hidden="true" />
            <span className="font-['Pretendard:Regular',sans-serif] text-black">
              카카오톡 로그인
            </span>
          </button>
        </div>

        {/* Back Button */}
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="flex items-center justify-center w-12 h-12 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Back"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
