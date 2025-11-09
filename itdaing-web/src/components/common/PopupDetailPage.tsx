import { useState } from "react";
import { ChevronLeft, Eye, MapPin, Star, Share2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { ReviewWritePage } from "../consumer/ReviewWritePage";
import { SellerInfoPage } from "../seller/SellerInfoPage";
import { LoginConfirmDialog } from "../auth/LoginConfirmDialog";
import { getPopupById } from "../../data/popups";
import { getSellerById } from "../../data/sellers";
import { getReviewsByPopupId, getAverageRating } from "../../data/reviews";

interface PopupDetailPageProps {
  onClose: () => void;
  popupId: number;
  onMyPageClick?: () => void;
  onNearbyExploreClick?: () => void;
  isLoggedIn?: boolean;
  onLoginClick?: () => void;
  onPopupClick?: (id: number) => void;
  showReviewWriteOnMount?: boolean;
}

export function PopupDetailPage({ onClose, popupId, onMyPageClick, onNearbyExploreClick, isLoggedIn, onLoginClick, onPopupClick, showReviewWriteOnMount = false }: PopupDetailPageProps) {
  const [activeTab, setActiveTab] = useState<"설명" | "지도" | "후기">("설명");
  const [isLiked, setIsLiked] = useState(false);
  // Initialize likes from data to reflect actual business data
  const [likesCount, setLikesCount] = useState(() => getPopupById(popupId)?.likes ?? 0);
  const [sortOrder, setSortOrder] = useState("최신순");
  const [showReviewWrite, setShowReviewWrite] = useState(showReviewWriteOnMount);
  const [showSellerInfo, setShowSellerInfo] = useState(false);
  const [showLoginConfirm, setShowLoginConfirm] = useState(false);
  const [showReviewLoginConfirm, setShowReviewLoginConfirm] = useState(false);
  const handleShare = async () => {
    try {
      const shareData = {
        title: popup?.title ?? '팝업스토어',
        text: popup?.description ?? '흥미로운 팝업스토어를 확인해보세요',
        url: window.location.href,
      };
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        alert('링크가 복사되었습니다.');
      }
    } catch (e) {
      // ignore cancel errors
    }
  };

  // 하트 클릭 핸들러
  const handleLikeClick = () => {
    if (!isLoggedIn) {
      setShowLoginConfirm(true);
      return;
    }
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
  };

  // 후기 데이터
  const reviews = getReviewsByPopupId(popupId);
  const averageRating = getAverageRating(popupId);
  const totalReviews = reviews.length;

  // 평점 분포 (5~1점)
  const ratingDistribution = [5, 4, 3, 2, 1].map((score) => {
    const count = reviews.filter((r) => r.rating === score).length;
    const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
    return { label: `${score}점`, percentage };
  });

  // Robust date parsing for format YYYY.MM.DD
  const parseDotDate = (s: string): number => {
    const m = s.match(/^(\d{4})\.(\d{2})\.(\d{2})$/);
    if (!m) return new Date(s).getTime() || 0;
    const [, y, mo, d] = m;
    return new Date(Number(y), Number(mo) - 1, Number(d)).getTime();
  };

  // 정렬된 후기
  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortOrder === "최신순") {
      return parseDotDate(b.date) - parseDotDate(a.date);
    } else {
      // 평점순
      return b.rating - a.rating;
    }
  });

  // Mock data - 실제로는 popupId에 따라 다른 데이터를 가져와야 함
  const popup = getPopupById(popupId);
  
  if (!popup) {
    return <div className="flex items-center justify-center min-h-screen">팝업을 찾을 수 없습니다.</div>;
  }
  
  const seller = getSellerById(popup.sellerId);

  if (!seller) {
    return <div className="flex items-center justify-center min-h-screen">판매자 정보를 찾을 수 없습니다.</div>;
  }

  const popupData = {
    id: popup.id,
    title: popup.title,
    date: popup.date,
    location: popup.address,
    hours: popup.hours,
    tags: popup.tags.map(tag => `# ${tag}`),
    likes: popup.likes,
    views: popup.views,
    imageUrl: popup.images[0] || "https://images.unsplash.com/photo-1555099962-4199c345e5dd?w=800&h=600&fit=crop",
    sellerName: seller.name,
    sellerImage: seller.profileImage,
    content: {
      title: popup.category,
      description: popup.description,
    },
  };

  // 후기 작성 페이지 표시
  if (showReviewWrite) {
    return <ReviewWritePage onBack={() => setShowReviewWrite(false)} onMyPageClick={onMyPageClick} onNearbyExploreClick={onNearbyExploreClick} onClose={onClose} />;
  }

  // 판매자 정보 페이지 표시
  if (showSellerInfo && seller) {
    return (
      <SellerInfoPage 
        sellerId={seller.id}
        onClose={() => setShowSellerInfo(false)}
        onMyPageClick={onMyPageClick}
        onPopupClick={(id: number) => {
          setShowSellerInfo(false);
          onPopupClick?.(id);
        }}
      />
    );
  }

  return (
    <div className="bg-white relative min-h-screen pb-24 lg:pb-[104px] pt-16 sm:pt-20 md:pt-24">

      {/* 메인보드 */}
      <div className="max-w-[1344px] mx-auto overflow-clip px-3 sm:px-4 lg:px-0">
        {/* 메인의 메인보드 */}
        <div className="max-w-[930px] mx-auto">
          {/* 썸네일 */}
          <div className="relative mb-3 sm:mb-4 lg:mb-[18px]">
            <div className="h-56 sm:h-80 lg:h-[469px] rounded-[10px] lg:rounded-[5px] overflow-hidden mx-auto max-w-full lg:max-w-[515px] shadow-sm">
              <img
                alt={popupData.title}
                className="w-full h-full object-cover"
                src={popupData.imageUrl}
              />
            </div>
          </div>

          {/* 좋아요/조회수 + 뒤로가기 */}
          <div className="h-10 lg:h-[43px] relative mb-6 sm:mb-8 lg:mb-[60px] flex items-center justify-between px-1">
            {/* 뒤로가기 버튼 */}
            <button 
              onClick={onClose}
              className="p-1.5 lg:p-2 hover:bg-gray-100 rounded-lg transition-colors active:scale-95"
            >
              <ChevronLeft className="size-6 sm:size-7 lg:size-[34px]" />
            </button>

            {/* 좋아요 & 조회수 - 오른쪽 정렬 */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* 좋아요 */}
              <button 
                onClick={handleLikeClick}
                className="flex items-center gap-1.5 lg:gap-2 hover:opacity-80 transition-opacity active:scale-95 p-1"
              >
                <svg 
                  className="size-5 sm:size-6 lg:size-[22px]" 
                  viewBox="0 0 24 24" 
                  fill={isLiked ? "#FF0000" : "none"}
                  stroke={isLiked ? "#FF0000" : "black"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
                <span className="font-['Pretendard:Medium',sans-serif] text-sm sm:text-base text-black">
                  {likesCount}
                </span>
              </button>

              {/* 조회수 */}
              <div className="flex items-center gap-1.5 lg:gap-2">
                <Eye className="size-5 sm:size-6" />
                <span className="font-['Pretendard:Medium',sans-serif] text-sm sm:text-base text-black">
                  {popupData.views}
                </span>
              </div>

              {/* 공유하기 */}
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 lg:gap-2 hover:opacity-80 transition-opacity active:scale-95 p-1"
                aria-label="공유하기"
              >
                <Share2 className="size-5 sm:size-6" />
                <span className="font-['Pretendard:Medium',sans-serif] text-sm sm:text-base text-black">공유</span>
              </button>
            </div>
          </div>

          {/* 상세페이지 메뉴 */}
          <div className="h-14 lg:h-[75px] flex mb-8 lg:mb-[60px]">
            <button
              onClick={() => setActiveTab("설명")}
              className={`flex-1 h-14 lg:h-[76px] border-b ${
                activeTab === "설명"
                  ? "border-[#eb0000]"
                  : "border-[#9a9a9a]"
              }`}
            >
              <div
                className={`flex flex-col font-['Pretendard:Regular',sans-serif] justify-center leading-[0] not-italic text-base lg:text-xl text-center ${
                  activeTab === "설명" ? "text-[#eb0000]" : "text-[#9a9a9a]"
                }`}
              >
                <p className="leading-[normal]">설명</p>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("지도")}
              className={`flex-1 h-14 lg:h-[76px] border-b ${
                activeTab === "지도"
                  ? "border-[#eb0000]"
                  : "border-[#9a9a9a]"
              }`}
            >
              <div
                className={`flex flex-col font-['Pretendard:Regular',sans-serif] justify-center leading-[0] not-italic text-base lg:text-xl text-center ${
                  activeTab === "지도" ? "text-[#eb0000]" : "text-[#9a9a9a]"
                }`}
              >
                <p className="leading-[normal]">지도</p>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("후기")}
              className={`flex-1 h-14 lg:h-[76px] border-b ${
                activeTab === "후기"
                  ? "border-[#eb0000]"
                  : "border-[#9a9a9a]"
              }`}
            >
              <div
                className={`flex flex-col font-['Pretendard:Regular',sans-serif] justify-center leading-[0] not-italic text-base lg:text-xl text-center ${
                  activeTab === "후기" ? "text-[#eb0000]" : "text-[#9a9a9a]"
                }`}
              >
                <p className="leading-[normal]">후기</p>
              </div>
            </button>
          </div>

          {/* 탭별 콘텐츠 */}
          {activeTab === "설명" && (
            <>
              {/* 간단설명 */}
              <div className="mb-8 lg:mb-[40px] flex flex-col lg:flex-row justify-between items-start gap-6 lg:gap-8">
                {/* 왼쪽: 팝업 정보 */}
                <div className="flex-1 w-full">
                  <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] not-italic text-2xl lg:text-3xl text-black mb-3 lg:mb-[14px]">
                    <p className="leading-[normal]">{popupData.title}</p>
                  </div>
                  <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] not-italic text-base lg:text-lg text-black mb-2 lg:mb-[10px]">
                    <p className="leading-[30px]">{popupData.date}</p>
                  </div>
                  <div className="flex items-start gap-2 mb-2 lg:mb-[10px]">
                    <MapPin className="size-5 lg:size-[22px] flex-shrink-0 mt-1" />
                    <div className="flex flex-col font-['Pretendard:Regular',sans-serif] justify-center leading-[0] not-italic text-sm lg:text-base text-black">
                      <p className="leading-[30px]">{popupData.location}</p>
                    </div>
                  </div>
                  <div className="flex flex-col font-['Pretendard:Regular',sans-serif] justify-center leading-[0] not-italic text-sm lg:text-base text-black mb-2 lg:mb-[10px]">
                    <p className="leading-[30px]">{popupData.hours}</p>
                  </div>
                </div>

                {/* 오른쪽: 판매자 정보 */}
                <button
                  onClick={() => setShowSellerInfo(true)}
                  className="flex flex-col items-center flex-shrink-0 hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <div className="size-20 lg:size-[100px] mb-2">
                    <img
                      alt={popupData.sellerName}
                      className="w-full h-full rounded-full object-cover"
                      src={popupData.sellerImage}
                    />
                  </div>
                  <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] not-italic text-xs text-black text-center">
                    <p className="leading-[normal]">{popupData.sellerName}</p>
                  </div>
                </button>
              </div>

              {/* 태그 */}
              <div className="flex flex-wrap gap-2 lg:gap-[13px] mb-8 lg:mb-[40px]">
                {popupData.tags.map((tag, index) => (
                  <div key={index} className="relative">
                    <div className="bg-white h-7 rounded-[10px] px-3 lg:px-4 border border-[#eb0000] flex items-center justify-center">
                      <div className="flex flex-col font-['Pretendard:Regular',sans-serif] justify-center leading-[0] not-italic text-xs lg:text-[13px] text-black text-center">
                        <p className="leading-[normal]">{tag}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 특이사항 영역 */}
              <div className="border-t-[0.7px] border-b-[0.7px] border-[#9a9a9a] mb-8 lg:mb-[60px] py-6 lg:py-0">
                <div className="grid grid-cols-3 gap-4 lg:gap-0 lg:flex lg:h-[87px]">
                  {/* 주차 무료 */}
                  <div className="flex flex-col items-center justify-center px-4 lg:px-8">
                    <svg className="size-8 lg:size-[40px] mb-2 lg:mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <rect x="3" y="6" width="18" height="14" rx="2" strokeWidth="2" />
                      <path d="M12 10h2a2 2 0 0 1 0 4h-2" strokeWidth="2" />
                      <path d="M12 10v6" strokeWidth="2" />
                    </svg>
                    <div className="flex flex-col font-['Pretendard:Regular',sans-serif] justify-center leading-[0] not-italic text-xs text-black text-center">
                      <p className="leading-[normal]">주차 무료</p>
                    </div>
                  </div>

                  {/* 유료 입장 */}
                  <div className="flex flex-col items-center justify-center px-4 lg:px-8">
                    <svg className="size-7 lg:size-[30px] mb-2 lg:mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
                      <path d="M7 20v-2c0-1.1.9-2 2-2h6c1.1 0 2 .9 2 2v2" />
                      <path d="M12 9V3" />
                      <path d="M9 6h6" />
                    </svg>
                    <div className="flex flex-col font-['Pretendard:Regular',sans-serif] justify-center leading-[0] not-italic text-xs text-black text-center">
                      <p className="leading-[normal]">유료 입장</p>
                    </div>
                  </div>

                  {/* 특별 할인 */}
                  <div className="flex flex-col items-center justify-center px-4 lg:px-8">
                    <svg className="size-7 lg:size-8 mb-2 lg:mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="m15 9-6 6" />
                      <path d="M9 9h.01" />
                      <path d="M15 15h.01" />
                    </svg>
                    <div className="flex flex-col font-['Pretendard:Regular',sans-serif] justify-center leading-[0] not-italic text-xs text-black text-center">
                      <p className="leading-[normal]">특별 할인</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 팝업스토어 소개 영역 */}
              <div className="mb-8 lg:mb-[60px]">
                <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] not-italic text-lg lg:text-[19px] text-black mb-4 lg:mb-6">
                  <p className="leading-[normal]">상세 소개</p>
                </div>
                <div className="bg-[#fbfbfb] p-4 lg:p-6 rounded-[5px]">
                  <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center text-sm lg:text-base text-black text-center mb-3 lg:mb-4">
                    <p className="leading-[normal]">{popupData.content.title}</p>
                  </div>
                  <div className="flex flex-col font-['Pretendard:Regular',sans-serif] leading-[20px] text-xs lg:text-sm text-black whitespace-pre-line">
                    {popupData.content.description}
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "지도" && (
            <>
              {/* 위치 */}
              <div className="mb-3 lg:mb-[14px] flex items-start lg:items-center gap-2">
                <MapPin className="size-5 lg:size-[23px] flex-shrink-0 mt-1 lg:mt-0" />
                <div className="flex flex-col font-['Pretendard:Regular',sans-serif] justify-center leading-[0] not-italic text-sm lg:text-xl text-black">
                  <p className="leading-[30px]">{popupData.location}</p>
                </div>
                <MapPin className="size-5 lg:size-[22px] flex-shrink-0 mt-1 lg:mt-0 hidden sm:block" />
              </div>

              {/* 지도 이미지 */}
              <div className="h-64 sm:h-80 lg:h-[455px] w-full lg:w-[911px] mx-auto mb-8 lg:mb-[60px] bg-gradient-to-br from-green-50 to-blue-50 rounded-lg relative overflow-hidden">
                <div className="absolute inset-0 w-full h-full">
                  <svg className="w-full h-full opacity-30" viewBox="0 0 911 455">
                    <defs>
                      <pattern id="grid2" width="50" height="50" patternUnits="userSpaceOnUse">
                        <path d="M 50 0 L 0 0 0 50" fill="none" stroke="gray" strokeWidth="0.5"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid2)" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-16 h-16 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "후기" && (
            <>
              {/* 평점 */}
              <div className="bg-white w-full lg:w-[820px] mx-auto mb-8 lg:mb-[60px] border-b border-[darkgrey] pb-8">
                <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-0 pt-6 lg:pt-10">
                  {/* 별점 표시 */}
                  <div className="w-full lg:w-1/2 flex flex-col items-center justify-center gap-2">
                    <div className="h-10 lg:h-[50px] w-full max-w-[200px] lg:max-w-[250px] flex items-center justify-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className="w-[18%] h-full"
                          fill={star <= Math.round(averageRating) ? "#EB0000" : "none"}
                          stroke="#EB0000"
                        />
                      ))}
                    </div>
                    <div className="font-['Pretendard:Medium',sans-serif] text-sm lg:text-base text-[#4d4d4d]">
                      {totalReviews > 0 ? (
                        <span>
                          평균 <span className="text-black">{averageRating.toFixed(1)}</span>점 · 후기 {totalReviews}개
                        </span>
                      ) : (
                        <span>아직 후기가 없습니다.</span>
                      )}
                    </div>
                  </div>

                  {/* 평점 바 그래프 */}
                  <div className="w-full lg:w-1/2 space-y-2 lg:space-y-3">
                    {ratingDistribution.map((item, index) => (
                      <div key={index} className="flex flex-row items-center gap-2 lg:gap-4">
                        <span className="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] text-sm lg:text-xl text-black w-10 lg:w-[50px] flex-shrink-0">
                          {item.label}
                        </span>
                        <div className="bg-[#d9d9d9] h-5 lg:h-[26px] rounded-[10px] w-full max-w-[250px] lg:max-w-[336px] relative">
                          <div
                            className="bg-[#eb0000] h-5 lg:h-[26px] rounded-[10px] absolute left-0 top-0"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                        <span className="font-['Pretendard:Regular',sans-serif] text-xs lg:text-sm text-[#4d4d4d] w-10 text-right">
                          {item.percentage}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 후기 작성하기 버튼 & 정렬 */}
              <div className="w-full lg:w-[820px] mx-auto mb-8 lg:mb-[60px] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <button
                  onClick={() => isLoggedIn ? setShowReviewWrite(true) : setShowReviewLoginConfirm(true)}
                  className="bg-[#eb0000] h-10 lg:h-[39px] rounded-[10px] w-full sm:w-[138px] hover:bg-[#cc0000] transition-colors"
                >
                  <div className="flex flex-col font-['NanumGothic:Bold',sans-serif] justify-center leading-[0] not-italic text-base lg:text-[17px] text-center text-white">
                    <p className="leading-[20px]">후기 작성하기</p>
                  </div>
                </button>

                <Select value={sortOrder} onValueChange={setSortOrder}>
                  <SelectTrigger className="bg-white h-10 lg:h-[27px] rounded-[10px] w-full sm:w-[100px] border border-[#9a9a9a] font-['NanumGothic:Regular',sans-serif] text-xs lg:text-[13px] text-black">
                    <SelectValue placeholder="최신순" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="최신순">최신순</SelectItem>
                    <SelectItem value="평점순">평점순</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 후기 목록 */}
              {sortedReviews.map((review, index) => (
                <div
                  key={review.id}
                  className={`w-full lg:w-[820px] mx-auto ${
                    index === sortedReviews.length - 1 ? "mb-8 lg:mb-[60px]" : "mb-6 lg:mb-8"
                  } border-b border-[darkgrey] pb-6`}
                >
                  <div className="flex gap-3 lg:gap-4 mb-4">
                    <img
                      alt=""
                      className="size-16 lg:size-[120px] rounded-full object-cover flex-shrink-0"
                      src={review.userImage}
                    />
                    <div>
                      <p className="font-['JejuGothic:Regular',sans-serif] text-base lg:text-lg text-black mb-1 lg:mb-2">
                        {review.userName}
                      </p>
                      <p className="font-['JejuGothic:Regular',sans-serif] text-xs lg:text-sm text-[#4d4d4d] mb-2">
                        {review.date}
                      </p>
                      <div className="h-5 lg:h-[30px] w-20 lg:w-[134px] flex items-center justify-start gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            className="w-[18%] h-full" 
                            fill={star <= review.rating ? "#EB0000" : "none"} 
                            stroke="#EB0000" 
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="font-['NanumGothic:Regular',sans-serif] leading-[20px] text-sm lg:text-[15px] text-black mb-4">
                    {review.content.split("\n").map((line, i) => (
                      <p key={i} className={i === 0 ? "mb-0" : ""}>
                        {line}
                      </p>
                    ))}
                  </div>
                  {review.images && review.images.length > 0 && (
                    <div className="w-full max-w-[260px]">
                      <img
                        alt=""
                        className="w-full h-auto object-cover rounded-lg"
                        src={review.images[0]}
                      />
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* 위로가기 버튼 */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-16 sm:bottom-20 md:bottom-24 right-4 md:right-8 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-[#eb0000] rounded-full shadow-xl hover:bg-[#cc0000] hover:scale-110 transition-all duration-300 flex items-center justify-center z-30 border-2 border-white"
        aria-label="위로가기"
      >
        <svg
          className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={3}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 15.75l7.5-7.5 7.5 7.5"
          />
        </svg>
      </button>

      {/* 로그인 확인 다이얼로그 */}
      <LoginConfirmDialog
        isOpen={showLoginConfirm}
        onClose={() => setShowLoginConfirm(false)}
        onConfirm={() => {
          setShowLoginConfirm(false);
          onLoginClick?.();
        }}
        type="favorite"
      />
      <LoginConfirmDialog
        isOpen={showReviewLoginConfirm}
        onClose={() => setShowReviewLoginConfirm(false)}
        onConfirm={() => {
          setShowReviewLoginConfirm(false);
          onLoginClick?.();
        }}
        type="review"
      />
    </div>
  );
}