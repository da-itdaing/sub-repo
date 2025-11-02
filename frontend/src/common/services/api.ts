import { events, popups, products, orders, reports, reviews as seedReviews, profiles as seedProfiles, calendar as seedCalendar } from '../data/dummy'
import { realApi } from './realApi'
import type { Popup, Review, Profile, CalendarItem } from '../../types'

// Simulate async APIs with small delays
const delay = (ms = 200) => new Promise((res) => setTimeout(res, ms))

// In-memory mutable stores derived from seeds
let reviewStore: Review[] = [...seedReviews]
let profileStore: Profile[] = [...seedProfiles]
// favorites persistence
const loadFav = (): Record<string, Set<string>> => {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('mock:favorites') : null
    if (!raw) return { u1: new Set(['p1']) }
    const obj = JSON.parse(raw) as Record<string, string[]>
    const map: Record<string, Set<string>> = {}
    Object.keys(obj).forEach(k => map[k] = new Set(obj[k]))
    return map
  } catch { return { u1: new Set(['p1']) } }
}
const saveFav = (store: Record<string, Set<string>>) => {
  try {
    const obj: Record<string, string[]> = {}
    Object.keys(store).forEach(k => obj[k] = Array.from(store[k]))
    if (typeof localStorage !== 'undefined') localStorage.setItem('mock:favorites', JSON.stringify(obj))
  } catch {}
}
let favoriteStore: Record<string, Set<string>> = loadFav()
// popup persistence
const POPUP_KEY = 'mock:popups'
const loadPopups = (): Popup[] => {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(POPUP_KEY) : null
    if (!raw) return [...popups]
    const arr = JSON.parse(raw) as Popup[]
    if (!Array.isArray(arr) || !arr.length) return [...popups]
    return arr
  } catch { return [...popups] }
}
const savePopups = (arr: Popup[]) => {
  try { if (typeof localStorage !== 'undefined') localStorage.setItem(POPUP_KEY, JSON.stringify(arr)) } catch {}
}
let popupStore: Popup[] = loadPopups()
let calendarStore: CalendarItem[] = [...seedCalendar]

const USE_REAL = ((import.meta as any)?.env?.VITE_USE_REAL_API || '').toString() === 'true'

const mockApi = {
  async listEvents() {
    await delay();
    return events
  },
  async getEvent(id: string) {
    await delay();
    return events.find(e => e.id === id) || null
  },
  async listPopups() {
    await delay();
    return popupStore
  },
  async listPopupsByDistrict(district: string) {
    await delay();
    return popupStore.filter(p => p.district === district)
  },
  async getPopup(id: string) {
    await delay();
    return popupStore.find(p => p.id === id) || null
  },
  async createPopup(input: Omit<Popup, 'id'|'image'> & { image?: string }): Promise<Popup> {
    await delay();
    const id = 'p' + (popupStore.length + 1)
    // choose primary image: input.image or first from images
    const primary = input.image || (input.images && input.images[0]) || ''
    const item: Popup = { id, image: primary, views: 0, likes: 0, ...input }
    popupStore.unshift(item)
    savePopups(popupStore)
    return item
  },
  async updatePopup(id: string, patch: Partial<Popup>): Promise<Popup | null> {
    await delay();
    const idx = popupStore.findIndex(p => p.id === id)
    if (idx < 0) return null
    const next = { ...popupStore[idx], ...patch } as Popup
    // keep primary image in sync with images[0] if provided
    if (patch.images && patch.images.length > 0) {
      next.image = patch.images[0]
    }
    popupStore[idx] = next
    savePopups(popupStore)
    return next
  },
  async listProducts() {
    await delay();
    return products
  },
  async listOrders() {
    await delay();
    return orders
  },
  async listReports() {
    await delay();
    return reports
  },
  // Favorites
  async listFavorites(userId: string) {
    await delay();
    const favs = Array.from(favoriteStore[userId] || new Set())
    return popupStore.filter(p => favs.includes(p.id))
  },
  async toggleFavorite(userId: string, popupId: string) {
    await delay();
    if (!favoriteStore[userId]) favoriteStore[userId] = new Set()
    const set = favoriteStore[userId]
    if (set.has(popupId)) set.delete(popupId)
    else set.add(popupId)
    saveFav(favoriteStore)
    return set.has(popupId)
  },
  async isFavorite(userId: string, popupId: string) {
    await delay();
    return favoriteStore[userId]?.has(popupId) ?? false
  },
  // Reviews
  async listReviews(popupId: string) {
    await delay();
    return reviewStore.filter(r => r.popupId === popupId)
  },
  async addReview(popupId: string, userName: string, rating: number, text: string, images: string[] = []) {
    await delay();
    const rv: Review = { id: 'rv' + (reviewStore.length + 1), popupId, userName, rating, date: new Date().toISOString().slice(0,10), text, images }
    reviewStore.unshift(rv)
    return rv
  },
  async deleteReview(reviewId: string) {
    await delay();
    reviewStore = reviewStore.filter(r => r.id !== reviewId)
    return true
  },
  async averageRating(popupId: string) {
    const list = reviewStore.filter(r => r.popupId === popupId)
    if (!list.length) return 0
    return +(list.reduce((a,b)=>a+b.rating,0)/list.length).toFixed(1)
  },
  async listMyReviews(userName: string) {
    await delay();
    return reviewStore.filter(r => r.userName === userName)
  },
  // Profile
  async getProfile(userId: string) {
    await delay();
    let p = profileStore.find(p => p.userId === userId)
    if (!p) { p = { userId, interests: [], areas: [], conveniences: [] }; profileStore.push(p) }
    return p
  },
  async updateProfile(userId: string, data: Partial<Profile>) {
    await delay();
    const idx = profileStore.findIndex(p => p.userId === userId)
    if (idx === -1) profileStore.push({ userId, interests: [], areas: [], conveniences: [], ...data } as Profile)
    else profileStore[idx] = { ...profileStore[idx], ...data }
    try { if (typeof localStorage !== 'undefined') localStorage.setItem('mock:profiles', JSON.stringify(profileStore)) } catch {}
    return profileStore.find(p => p.userId === userId)!
  },
  // Calendar
  async listCalendar(userId: string) {
    await delay();
    return calendarStore
  }
}

// Facade: prefer real API when enabled, fall back to mock for parts not yet specified
export const api = USE_REAL ? {
  // Events/home feed not fully specified yet → keep mock
  listEvents: mockApi.listEvents,
  getEvent: mockApi.getEvent,
  // Popups
  listPopups: async () => {
    // Try home feed trending as a lightweight replacement; fallback mock on failure
    try {
      const data: any = await realApi.homeFeed(6)
      const items = data?.trending?.items || []
      // Map to Popup type (best-effort)
      const mapped: Popup[] = items.map((it: any) => ({
        id: String(it.id),
        title: it.title,
        district: it.district || '',
        dateRange: `${it.startDate} - ${it.endDate}`,
        image: it.thumbnailUrl || '',
        address: it.addressShort,
      }))
      return mapped
    } catch { return mockApi.listPopups() }
  },
  listPopupsByDistrict: async (district: string) => {
    try {
      const data: any = await realApi.listPopupsByDistrict(district)
      const mapped: Popup[] = (data.items || []).map((it: any) => ({
        id: String(it.id),
        title: it.title,
        district: data.district || district,
        dateRange: `${it.startDate} - ${it.endDate}`,
        image: it.thumbnailUrl || '',
      }))
      return mapped
    } catch { return mockApi.listPopupsByDistrict(district) }
  },
  getPopup: async (id: string) => {
    try {
      const d: any = await realApi.getPopup(id)
      // Map to our simplified Popup type for existing UI
      const pr: Popup = {
        id: String(d.id),
        title: d.title,
        district: d.location?.district || '',
        dateRange: d.period ? `${d.period.startDate} - ${d.period.endDate}` : '',
        image: d.thumbnailUrl || '',
        images: d.images,
        address: d.location?.address,
        lat: d.location?.lat,
        lng: d.location?.lng,
        categories: d.tags,
        description: d.description,
      }
      return pr
    } catch { return mockApi.getPopup(id) }
  },
  createPopup: mockApi.createPopup,
  updatePopup: mockApi.updatePopup,
  listProducts: mockApi.listProducts,
  listOrders: mockApi.listOrders,
  listReports: mockApi.listReports,
  // Favorites: use real endpoints (token-based); ignore userId param
  listFavorites: async (_userId: string) => {
    try {
      const r = await realApi.listFavorites()
      const mapped: Popup[] = (r.items || []).map((it: any) => ({
        id: String(it.id),
        title: it.title,
        district: it.district || '',
        dateRange: `${it.startDate} - ${it.endDate}`,
        image: it.thumbnailUrl || '',
        address: it.addressShort,
        views: it.viewCount,
      }))
      return mapped
    } catch { return mockApi.listFavorites(_userId) }
  },
  toggleFavorite: async (_userId: string, popupId: string) => {
    try {
      // Optimistically toggle based on current state would require a read; here we just POST and read result
      const now = await realApi.toggleFavorite(popupId, true).catch(async (e) => {
        // If already favorited, try delete
        return realApi.toggleFavorite(popupId, false)
      })
      return now
    } catch { return mockApi.toggleFavorite(_userId, popupId) }
  },
  isFavorite: async (_userId: string, popupId: string) => {
    try {
      // Not directly specified; approximate by fetching favorites first page and checking
      const r = await realApi.listFavorites({ limit: 100 })
      return (r.items || []).some((it: any) => String(it.id) === String(popupId))
    } catch { return mockApi.isFavorite(_userId, popupId) }
  },
  // Reviews
  listReviews: async (popupId: string) => {
    try {
      const r = await realApi.listReviews(popupId, { limit: 50 })
      const items = r.items || []
      // Map server item to our Review type for display
      const mapped: Review[] = items.map((it: any) => ({
        id: String(it.id),
        popupId: String(popupId),
        userName: it.user?.nickname || `user:${it.user?.id ?? ''}`,
        rating: it.rating,
        date: (it.createdAt || '').slice(0, 10),
        text: it.content,
        images: it.photosUrl || [],
      }))
      return mapped
    } catch { return mockApi.listReviews(popupId) }
  },
  addReview: async (popupId: string, userName: string, rating: number, text: string, images: string[] = []) => {
    try {
      const r = await realApi.addReview(popupId, { rating, content: text, tags: [], photos: images })
      // After creating, fetch list and return the first matching; fallback to mock shape
      return { id: String(r as any), popupId, userName, rating, date: new Date().toISOString().slice(0,10), text, images }
    } catch { return mockApi.addReview(popupId, userName, rating, text, images) }
  },
  deleteReview: async (reviewId: string) => {
    try { await realApi.deleteMyReview(reviewId); return true } catch { return mockApi.deleteReview(reviewId) }
  },
  averageRating: mockApi.averageRating, // compute client-side for now
  listMyReviews: async (_userName: string) => {
    try {
      const r = await realApi.listMyReviews({ limit: 100 })
      const mapped: Review[] = (r.items || []).map((it: any) => ({
        id: String(it.id), popupId: String(it.popup?.id ?? ''), userName: it.user?.nickname || '', rating: it.rating,
        date: (it.updatedAt || it.createdAt || '').slice(0,10), text: it.content, images: it.photosUrl || [],
      }))
      return mapped
    } catch { return mockApi.listMyReviews(_userName) }
  },
  // Profile (token-based)
  getProfile: async (_userId: string) => {
    try { return await realApi.getProfile() as unknown as Profile } catch { return mockApi.getProfile(_userId) }
  },
  updateProfile: async (_userId: string, data: Partial<Profile>) => {
    try { await realApi.updateProfile(data); return await realApi.getProfile() as unknown as Profile } catch { return mockApi.updateProfile(_userId, data) }
  },
  // Calendar
  listCalendar: async (_userId: string) => {
    try {
      const r = await realApi.listCalendarFavorites()
      // Map to CalendarItem[] best-effort
      const mapped: CalendarItem[] = (r.events || []).map((e: any, i: number) => ({ id: `c${i}`, popupId: String(e.popupId), title: e.title, date: e.startDate, type: 'start' }))
      return mapped
    } catch { return mockApi.listCalendar(_userId) }
  },
} : mockApi
