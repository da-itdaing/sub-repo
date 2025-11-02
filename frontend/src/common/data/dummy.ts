import type { Event, Popup, Product, Order, Report, Review, Profile, CalendarItem } from '../../types'

export const events: Event[] = [
  { id: 'e1', title: '광주 빈티지 플리마켓', dateRange: '2025.11.08', location: '국립아시아문화전당 야외', image: 'https://images.unsplash.com/photo-1513519245088-0e12902e45a0?q=80&w=1200&auto=format&fit=crop' },
  { id: 'e2', title: '충장로 주말 마켓', dateRange: '2025.11.07 - 11.09', location: '동구 충장로 스트리트', image: 'https://images.unsplash.com/photo-1503342217505-b0a15cf70489?q=80&w=1200&auto=format&fit=crop' },
  { id: 'e3', title: '수공예 작가 플리', dateRange: '2025.11.15 - 11.23', location: '광주 송정역 시장', image: 'https://images.unsplash.com/photo-1529101091764-c3526daf38fe?q=80&w=1200&auto=format&fit=crop' },
  { id: 'e4', title: '경양방앗간 앞 야시장', dateRange: '2025.11.20 - 11.22', location: '서구 상무지구', image: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=1200&auto=format&fit=crop' }
]

export const popups: Popup[] = [
  { id: 'p1', title: '충장로 주말 플리마켓', district: '동구', dateRange: '2025.11.01 - 11.30', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop', address: '광주 동구 충장로', lat: 35.149, lng: 126.916, categories: ['플리마켓','수공예','빈티지'], views: 1256, likes: 132 },
  { id: 'p2', title: '송정역 빈티지 마켓', district: '광산구', dateRange: '2025.11.05 - 11.24', image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=1200&auto=format&fit=crop', address: '광주 광산구 송정역 시장', lat: 35.139, lng: 126.793, categories: ['빈티지','플리마켓'], views: 980, likes: 88 },
  { id: 'p3', title: 'ACC 수공예 작가전 플리', district: '동구', dateRange: '2025.11.10 - 11.22', image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop', address: '국립아시아문화전당 야외광장', lat: 35.146, lng: 126.92, categories: ['수공예','플리마켓','로컬'], views: 1430, likes: 165 },
  { id: 'p4', title: '상무지구 야시장 플리', district: '서구', dateRange: '2025.11.12 - 11.20', image: 'https://images.unsplash.com/photo-1508007226635-397fdb4f2714?q=80&w=1200&auto=format&fit=crop', address: '광주 서구 상무지구 광장', lat: 35.154, lng: 126.853, categories: ['야시장','먹거리','플리마켓'], views: 755, likes: 62 },
  { id: 'p5', title: '광주천 프리마켓', district: '북구', dateRange: '2025.11.03 - 11.17', image: 'https://images.unsplash.com/photo-1527698266440-12104e498b76?q=80&w=1200&auto=format&fit=crop', address: '광주 북구 광주천 일대', lat: 35.18, lng: 126.91, categories: ['로컬','플리마켓'], views: 520, likes: 41 },
  { id: 'p6', title: '양림동 골목 플리', district: '남구', dateRange: '2025.11.09 - 11.16', image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=1200&auto=format&fit=crop', address: '광주 남구 양림동', lat: 35.137, lng: 126.913, categories: ['골목상권','수공예','플리마켓'], views: 612, likes: 55 },
  { id: 'p7', title: '북구청 앞 주말 플리', district: '북구', dateRange: '2025.11.02 - 11.30', image: 'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?q=80&w=1200&auto=format&fit=crop', address: '광주 북구청 광장', lat: 35.174, lng: 126.912, categories: ['플리마켓','로컬푸드'], views: 402, likes: 37 },
  { id: 'p8', title: '금남로 책거리 마켓', district: '동구', dateRange: '2025.11.06 - 11.14', image: 'https://images.unsplash.com/photo-1463320898484-cdee8141c787?q=80&w=1200&auto=format&fit=crop', address: '광주 동구 금남로', lat: 35.146, lng: 126.922, categories: ['중고서적','플리마켓'], views: 310, likes: 29 }
]

export const products: Product[] = [
  { id: 'pr1', name: '에코백', price: 19000, image: 'https://images.unsplash.com/photo-1545987796-200677ee1011?q=80&w=1200&auto=format&fit=crop', stock: 42 },
  { id: 'pr2', name: '머그컵', price: 12000, image: 'https://images.unsplash.com/photo-1551053541-41a0ad0a4b2d?q=80&w=1200&auto=format&fit=crop', stock: 18 },
  { id: 'pr3', name: '포스터', price: 8000, image: 'https://images.unsplash.com/photo-1499041893263-22a59a50b395?q=80&w=1200&auto=format&fit=crop', stock: 77 }
]

export const orders: Order[] = [
  { id: 'o1', productId: 'pr1', qty: 2, status: 'paid' },
  { id: 'o2', productId: 'pr2', qty: 1, status: 'preparing' },
  { id: 'o3', productId: 'pr3', qty: 5, status: 'shipped' }
]

export const reports: Report[] = [
  { id: 'r1', title: '일간 방문자', metric: 'visitors', value: 1240 },
  { id: 'r2', title: '주간 주문', metric: 'orders', value: 86 },
  { id: 'r3', title: '환불 요청', metric: 'refunds', value: 3 }
]

// Reviews for popups (mock)
export const reviews: Review[] = [
  { id: 'rv1', popupId: 'p1', userName: '홍길동', rating: 5, date: '2025-11-02', text: '수공예품 퀄리티가 최고! 분위기도 좋아요.', images: [] },
  { id: 'rv2', popupId: 'p1', userName: '김유민', rating: 4, date: '2025-11-03', text: '푸드트럭 라인이 맛있어요. 사람 많아도 재밌었어요.', images: [] },
  { id: 'rv3', popupId: 'p2', userName: '이서준', rating: 4, date: '2025-11-05', text: '빈티지 의류 득템! 상인분들 친절합니다.', images: [] },
  { id: 'rv4', popupId: 'p3', userName: '박서연', rating: 5, date: '2025-11-10', text: '작가님 작품 설명이 인상적이었어요.', images: [] },
  { id: 'rv5', popupId: 'p4', userName: '최민수', rating: 3, date: '2025-11-12', text: '야시장 특성상 조금 붐빕니다. 그래도 구경할 것 많아요.', images: [] },
]

// Default profile and calendar items (mock)
export const profiles: Profile[] = [
  { userId: 'u1', interests: ['플리마켓','수공예','빈티지'], areas: ['동구','서구'], conveniences: ['주차','유모차'] }
]

export const calendar: CalendarItem[] = [
  { id: 'c1', popupId: 'p1', title: '충장로 플리 개장', date: '2025-11-01', type: 'start' },
  { id: 'c2', popupId: 'p1', title: '충장로 플리 종료', date: '2025-11-30', type: 'end' },
  { id: 'c3', popupId: 'p3', title: 'ACC 수공예 플리 시작', date: '2025-11-10', type: 'start' },
  { id: 'c4', popupId: 'p4', title: '상무지구 야시장', date: '2025-11-12', type: 'ongoing' }
]
