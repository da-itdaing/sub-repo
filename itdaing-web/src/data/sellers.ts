// 플리마켓 소상공인(판매자) 데이터
export interface Seller {
  id: number;
  name: string;
  description: string;
  profileImage: string;
  mainArea: string;
  sns: string;
  email: string;
  category: string; // 판매 카테고리
}

export const sellers: Seller[] = [
  {
    id: 1,
    name: "달빛공방",
    description: "천연 가죽으로 만드는 수제 지갑, 카드지갑, 키홀더를 제작합니다. 하나하나 손으로 재단하고 바느질하여 세상에 하나뿐인 작품을 만듭니다.",
    profileImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
    mainArea: "동구",
    sns: "moonlight_leather",
    email: "moonlight@craft.com",
    category: "가죽공예",
  },
  {
    id: 2,
    name: "숲속베이커리",
    description: "유기농 재료로 만드는 건강한 베이커리입니다. 매주 주말 플리마켓에서 갓 구운 빵과 쿠키를 판매합니다.",
    profileImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
    mainArea: "남구",
    sns: "forest_bakery_gwangju",
    email: "forestbakery@gmail.com",
    category: "베이커리",
  },
  {
    id: 3,
    name: "실과바늘",
    description: "손뜨개와 자수로 만드는 감성 소품 전문점입니다. 가방, 파우치, 인형 등 따뜻한 감성의 제품을 선보입니다.",
    profileImage: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop",
    mainArea: "서구",
    sns: "thread_and_needle",
    email: "threadneedle@handmade.kr",
    category: "패브릭/자수",
  },
  {
    id: 4,
    name: "도담도담도예",
    description: "일상에서 사용하는 그릇과 컵, 접시를 직접 빚습니다. 실용적이면서도 아름다운 도자기를 만듭니다.",
    profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    mainArea: "동구",
    sns: "dodam_pottery",
    email: "dodam@ceramic.kr",
    category: "도자기",
  },
  {
    id: 5,
    name: "빈티지메리",
    description: "70-90년대 빈티지 의류와 액세서리를 큐레이팅합니다. 레트로 감성의 유니크한 아이템들을 만나보세요.",
    profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    mainArea: "동구",
    sns: "vintage_mary_gwangju",
    email: "vintagemary@retro.com",
    category: "빈티지/의류",
  },
  {
    id: 6,
    name: "작은정원",
    description: "다육식물과 공기정화 식물을 키우고 판매합니다. 귀여운 화분과 함께 반려식물을 분양해드립니다.",
    profileImage: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop",
    mainArea: "남구",
    sns: "little_garden_gwangju",
    email: "littlegarden@plant.kr",
    category: "식물",
  },
  {
    id: 7,
    name: "은빛공방",
    description: "925 순은으로 제작하는 수제 실버 액세서리입니다. 반지, 목걸이, 귀걸이를 직접 디자인하고 만듭니다.",
    profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    mainArea: "동구",
    sns: "silver_light_craft",
    email: "silverlight@jewelry.kr",
    category: "액세서리",
  },
  {
    id: 8,
    name: "목향공예",
    description: "원목으로 만드는 생활 소품과 가구를 제작합니다. 도마, 트레이, 선반 등 따뜻한 나무의 감성을 담습니다.",
    profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
    mainArea: "서구",
    sns: "wood_scent_craft",
    email: "woodscent@woodwork.kr",
    category: "목공예",
  },
  {
    id: 9,
    name: "솜사탕캔들",
    description: "천연 소이왁스로 만드는 디퓨저와 캔들을 제작합니다. 계절마다 다른 향으로 일상에 힐링을 선물합니다.",
    profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop",
    mainArea: "동구",
    sns: "cottoncandy_candle",
    email: "cottoncandy@candle.kr",
    category: "캔들/디퓨저",
  },
  {
    id: 10,
    name: "페이퍼스토리",
    description: "수제 다이어리, 노트, 스티커를 디자인하고 제작합니다. 감성 문구와 일러스트로 특별한 기록을 도와드립니다.",
    profileImage: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
    mainArea: "남구",
    sns: "paper_story_gwangju",
    email: "paperstory@stationery.kr",
    category: "문구/디자인",
  },
  {
    id: 11,
    name: "꽃길만걷자",
    description: "프리저브드 플라워와 드라이플라워로 만드는 꽃다발과 화환을 판매합니다. 오래도록 간직할 수 있는 꽃을 선물하세요.",
    profileImage: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&h=400&fit=crop",
    mainArea: "동구",
    sns: "flower_road_gwangju",
    email: "flowerroad@preserved.kr",
    category: "플라워",
  },
  {
    id: 12,
    name: "달콤팩토리",
    description: "수제 마카롱, 쿠키, 케이크를 제작합니다. 주문 제작도 가능하며 플리마켓에서 신선한 디저트를 만나보세요.",
    profileImage: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=400&fit=crop",
    mainArea: "서구",
    sns: "sweet_factory_gwangju",
    email: "sweetfactory@dessert.kr",
    category: "디저트",
  },
  {
    id: 13,
    name: "유리알공방",
    description: "스테인드글라스와 유리공예품을 제작합니다. 선캐쳐, 램프, 액세서리 등 빛나는 작품들을 만듭니다.",
    profileImage: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop",
    mainArea: "동구",
    sns: "glass_bead_craft",
    email: "glassbead@glass.kr",
    category: "유리공예",
  },
  {
    id: 14,
    name: "토이박스",
    description: "원목 장난감과 교구를 제작합니다. 아이들의 상상력과 창의력을 키워주는 안전한 장난감을 만듭니다.",
    profileImage: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop",
    mainArea: "남구",
    sns: "toybox_gwangju",
    email: "toybox@wooden.kr",
    category: "원목장난감",
  },
  {
    id: 15,
    name: "아로마테라피",
    description: "천연 에센셜 오일로 만드는 아로마 제품을 판매합니다. 롤온, 스프레이, 밤 등 다양한 제품이 있습니다.",
    profileImage: "https://images.unsplash.com/photo-1546961329-78bef0414d7c?w=400&h=400&fit=crop",
    mainArea: "동구",
    sns: "aroma_therapy_gwangju",
    email: "aroma@essential.kr",
    category: "아로마",
  },
];

export function getSellerById(id: number): Seller | undefined {
  return sellers.find(seller => seller.id === id);
}
