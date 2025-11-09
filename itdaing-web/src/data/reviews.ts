// 플리마켓 이벤트 후기 데이터
export interface Review {
  id: number;
  popupId: number; // 어떤 플리마켓 이벤트에 대한 후기인지
  userName: string;
  userImage: string;
  date: string;
  rating: number; // 1-5
  content: string;
  images?: string[];
}

export const reviews: Review[] = [
  // 충장로 주말 플리마켓 후기
  {
    id: 1,
    popupId: 1,
    userName: "수공예러버",
    userImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    date: "2025.11.03",
    rating: 5,
    content: "충장로 플리마켓 분위기가 정말 좋았어요! 달빛공방의 가죽 제품들이 너무 예쁘고 퀄리티도 좋았습니다. 작가님과 직접 대화하면서 구매할 수 있어서 더 의미있었어요.",
    images: ["https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=600&h=400&fit=crop"],
  },
  {
    id: 2,
    popupId: 1,
    userName: "광주토박이",
    userImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    date: "2025.10.27",
    rating: 4,
    content: "주말마다 열려서 좋아요. 다양한 수제 작품들을 구경하는 재미가 있습니다. 다만 주차가 조금 불편했어요.",
    images: [],
  },
  {
    id: 3,
    popupId: 1,
    userName: "핸드메이드마니아",
    userImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    date: "2025.10.20",
    rating: 5,
    content: "작가님들이 정말 친절하시고, 작품 하나하나에 정성이 느껴져요. 카드지갑 하나 샀는데 너무 마음에 듭니다!",
    images: ["https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&h=400&fit=crop"],
  },

  // 남구 플리마켓 페스타 후기
  {
    id: 4,
    popupId: 2,
    userName: "베이커리킹",
    userImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    date: "2025.11.02",
    rating: 5,
    content: "숲속베이커리 빵이 정말 맛있어요! 유기농 재료로 만든 건강한 빵, 3일 연속 가서 다 사먹었네요 ㅎㅎ",
    images: ["https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=400&fit=crop"],
  },
  {
    id: 5,
    popupId: 2,
    userName: "양림동주민",
    userImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop",
    date: "2025.10.30",
    rating: 5,
    content: "버스킹 공연도 있고 먹거리도 많고 정말 축제 분위기였어요! 가족들과 함께 즐거운 시간 보냈습니다.",
    images: [],
  },

  // 핸드메이드 크래프트 페어 후기
  {
    id: 6,
    popupId: 3,
    userName: "자수쟁이",
    userImage: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop",
    date: "2025.10.25",
    rating: 5,
    content: "실과바늘의 자수 작품들 너무 예뻐요! 원데이 클래스도 참여했는데 정말 유익했습니다. 꼭 다시 가고 싶어요.",
    images: ["https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=600&h=400&fit=crop"],
  },
  {
    id: 7,
    popupId: 3,
    userName: "공예매니아",
    userImage: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&h=100&fit=crop",
    date: "2025.10.23",
    rating: 4,
    content: "규모가 크고 다양한 작가님들이 계셔서 구경하는 재미가 쏠쏠했어요. 입장료 무료라 부담없이 갈 수 있어요!",
    images: [],
  },

  // 동명동 아트마켓 후기
  {
    id: 8,
    popupId: 4,
    userName: "도자기러버",
    userImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    date: "2025.10.28",
    rating: 5,
    content: "도담도담도예의 그릇들 정말 예술이에요. 커피 한잔 하면서 아트마켓 구경하기 딱 좋습니다!",
    images: ["https://images.unsplash.com/photo-1567696153798-96568e1a7a39?w=600&h=400&fit=crop"],
  },

  // 빈티지 & 레트로 마켓 후기
  {
    id: 9,
    popupId: 5,
    userName: "레트로퀸",
    userImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
    date: "2025.10.22",
    rating: 5,
    content: "빈티지메리에서 90년대 청재킷 득템했어요! DJ 음악도 분위기 있고 추억 여행 제대로 했습니다.",
    images: ["https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&h=400&fit=crop"],
  },
  {
    id: 10,
    popupId: 5,
    userName: "빈티지수집가",
    userImage: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop",
    date: "2025.10.21",
    rating: 4,
    content: "빈티지 물건들 상태가 좋고 가격도 합리적이었어요. 레코드 컬렉션이 특히 인상적이었습니다!",
    images: [],
  },

  // 반려식물 분양 마켓 후기
  {
    id: 11,
    popupId: 6,
    userName: "식물집사",
    userImage: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop",
    date: "2025.10.18",
    rating: 5,
    content: "작은정원에서 다육이 3개 분양받았어요! 식물 관리법도 자세히 알려주셔서 초보자도 키우기 쉬울 것 같아요.",
    images: ["https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=600&h=400&fit=crop"],
  },

  // 실버 액세서리 페어 후기
  {
    id: 12,
    popupId: 7,
    userName: "액세서리덕후",
    userImage: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop",
    date: "2025.10.26",
    rating: 5,
    content: "은빛공방의 실버 반지 주문제작 했는데 정말 섬세하고 예뻐요! 각인 서비스도 해주셔서 선물로 딱입니다.",
    images: ["https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=400&fit=crop"],
  },

  // 우드 크래프트 마켓 후기
  {
    id: 13,
    popupId: 8,
    userName: "원목러버",
    userImage: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop",
    date: "2025.10.19",
    rating: 5,
    content: "목향공예 도마 샀는데 나무향이 정말 좋아요. 목공 체험도 재미있었고, 직접 만든 수저 세트 매일 쓰고 있어요!",
    images: ["https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?w=600&h=400&fit=crop"],
  },

  // 향기로운 힐링 마켓 후기
  {
    id: 14,
    popupId: 9,
    userName: "힐링러버",
    userImage: "https://images.unsplash.com/photo-1546961329-78bef0414d7c?w=100&h=100&fit=crop",
    date: "2025.10.24",
    rating: 5,
    content: "솜사탕캔들의 라벤더 향 캔들 너무 좋아요. 원데이 클래스 참여해서 제가 직접 만든 캔들도 집에서 사용 중입니다!",
    images: ["https://images.unsplash.com/photo-1602874801006-95ad1fc04df4?w=600&h=400&fit=crop"],
  },

  // 감성 문구 페어 후기
  {
    id: 15,
    popupId: 10,
    userName: "다이어리덕후",
    userImage: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=100&h=100&fit=crop",
    date: "2025.10.29",
    rating: 5,
    content: "페이퍼스토리 다이어리 디자인이 너무 감성적이에요! 스티커도 다양하고 매일 다이어리 쓰는 재미가 생겼어요.",
    images: ["https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&h=400&fit=crop"],
  },

  // 프리저브드 플라워 마켓 후기
  {
    id: 16,
    popupId: 11,
    userName: "꽃사랑",
    userImage: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=100&h=100&fit=crop",
    date: "2025.10.17",
    rating: 5,
    content: "꽃길만걷자에서 프리저브드 플라워 부케 샀는데 1년이 지나도 그대로예요! 선물용으로도 정말 좋습니다.",
    images: ["https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=600&h=400&fit=crop"],
  },

  // 디저트 장터 후기
  {
    id: 17,
    popupId: 12,
    userName: "마카롱러버",
    userImage: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=100&h=100&fit=crop",
    date: "2025.10.15",
    rating: 5,
    content: "달콤팩토리 마카롱이 정말 맛있어요! 주문 제작도 가능해서 생일 케이크 주문했는데 대만족입니다!",
    images: ["https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=600&h=400&fit=crop"],
  },

  // 유리공예 전시 판매회 후기
  {
    id: 18,
    popupId: 13,
    userName: "유리공예팬",
    userImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    date: "2025.10.20",
    rating: 5,
    content: "유리알공방의 스테인드글라스 선캐쳐 정말 예뻐요! 햇빛 받으면 반짝반짝 빛나서 매일 보는 재미가 있어요.",
    images: ["https://images.unsplash.com/photo-1523475562039-0385f0b82467?w=600&h=400&fit=crop"],
  },

  // 키즈 토이 마켓 후기
  {
    id: 19,
    popupId: 14,
    userName: "육아맘",
    userImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    date: "2025.10.16",
    rating: 5,
    content: "토이박스 원목 장난감 안전하고 좋아요! 아이가 너무 좋아해서 체험 프로그램도 함께 참여했습니다.",
    images: ["https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&h=400&fit=crop"],
  },

  // 아로마 웰니스 페어 후기
  {
    id: 20,
    popupId: 15,
    userName: "아로마테라피스트",
    userImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop",
    date: "2025.10.21",
    rating: 5,
    content: "아로마테라피 블렌딩 오일 만들기 클래스 정말 유익했어요! 제 피부타입에 맞는 오일을 만들 수 있었습니다.",
    images: ["https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&h=400&fit=crop"],
  },

  // 가을 플리마켓 축제 후기
  {
    id: 21,
    popupId: 16,
    userName: "축제매니아",
    userImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    date: "2025.10.19",
    rating: 5,
    content: "50개 부스나 되는 대규모 축제라 볼거리가 정말 많았어요! 체험 부스도 다양하고 공연도 즐거웠습니다.",
    images: ["https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop"],
  },

  // 로컬 크리에이터 마켓 후기
  {
    id: 22,
    popupId: 17,
    userName: "디자인러버",
    userImage: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop",
    date: "2025.10.27",
    rating: 4,
    content: "광주 지역 크리에이터들의 작품을 한자리에서 볼 수 있어서 좋았어요. 아티스트와 직접 대화할 수 있는 시간도 유익했습니다.",
    images: [],
  },

  // 동구 골목길 마켓 후기
  {
    id: 23,
    popupId: 18,
    userName: "골목투어러",
    userImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    date: "2025.10.25",
    rating: 4,
    content: "동구 예술거리 분위기가 참 좋아요. 매주 열려서 자주 들를 수 있고, 소소한 쇼핑 재미가 있습니다!",
    images: [],
  },

  // 업사이클링 마켓 후기
  {
    id: 24,
    popupId: 19,
    userName: "친환경러버",
    userImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    date: "2025.10.23",
    rating: 5,
    content: "폐현수막으로 만든 파우치 정말 튼튼하고 예뻐요! 업사이클링 워크샵도 참여했는데 의미있는 시간이었습니다.",
    images: ["https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?w=600&h=400&fit=crop"],
  },

  // 크리스마스 마켓 미리보기 후기
  {
    id: 25,
    popupId: 20,
    userName: "크리스마스러버",
    userImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
    date: "2025.10.30",
    rating: 5,
    content: "크리스마스 리스 만들기 체험 너무 재미있었어요! 야간에 조명 켜지면 분위기 정말 낭만적입니다.",
    images: ["https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=600&h=400&fit=crop"],
  },
];

// 특정 팝업의 후기 가져오기
export function getReviewsByPopupId(popupId: number): Review[] {
  return reviews.filter(review => review.popupId === popupId);
}

// 후기의 평균 평점 계산
export function getAverageRating(popupId: number): number {
  const popupReviews = getReviewsByPopupId(popupId);
  if (popupReviews.length === 0) return 0;
  
  const sum = popupReviews.reduce((acc, review) => acc + review.rating, 0);
  return Math.round((sum / popupReviews.length) * 10) / 10; // 소수점 첫째자리까지
}
