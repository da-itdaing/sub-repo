import { http } from './rest'
import type { Popup, Review, Profile, CalendarItem } from '../../types'

// Adapter that maps our existing frontend api surface to real backend endpoints
// Only functions that have clear mapping in the API spec are implemented.
// Others may throw or return empty data until backend is ready.

type PopupDetail = any // When backend stabilizes, add a concrete type

export const realApi = {
  // Popups
  async getPopup(id: string, opts?: { include?: Array<'reviews'|'schedules'>; reviewsLimit?: number; reviewsCursor?: string; scheduleFrom?: string; scheduleTo?: string; }) {
    const params = new URLSearchParams()
    if (opts?.include?.length) params.set('include', opts.include.join(','))
    if (opts?.reviewsLimit) params.set('reviewsLimit', String(opts.reviewsLimit))
    if (opts?.reviewsCursor) params.set('reviewsCursor', opts.reviewsCursor)
    if (opts?.scheduleFrom) params.set('scheduleFrom', opts.scheduleFrom)
    if (opts?.scheduleTo) params.set('scheduleTo', opts.scheduleTo)
    const query = params.toString() ? `?${params.toString()}` : ''
    return http.get<PopupDetail>(`/api/v1/popups/${id}${query}`)
  },
  async listPopupsByDistrict(district: string, opts?: { date?: string; limit?: number; cursor?: string }) {
    const params = new URLSearchParams()
    if (opts?.date) params.set('date', opts.date)
    if (opts?.limit) params.set('limit', String(opts.limit))
    if (opts?.cursor) params.set('cursor', opts.cursor)
    const q = params.toString() ? `?${params.toString()}` : ''
    return http.get<{ district: string; items: any[]; paging?: any }>(`/api/v1/popups/districts/${district}/active${q}`)
  },
  async toggleFavorite(popupId: string, on: boolean) {
    if (on) {
      const r = await http.post<{ isFavorited: boolean }>(`/api/v1/popups/${popupId}/favorite`)
      return r.isFavorited
    } else {
      const r = await http.delete<{ isFavorited: boolean }>(`/api/v1/popups/${popupId}/favorite`)
      return r.isFavorited
    }
  },
  async listFavorites(opts?: { limit?: number; cursor?: string }) {
    const params = new URLSearchParams()
    if (opts?.limit) params.set('limit', String(opts.limit))
    if (opts?.cursor) params.set('cursor', opts.cursor)
    const q = params.toString() ? `?${params.toString()}` : ''
    return http.get<{ items: any[]; paging?: any }>(`/api/v1/me/favorites${q}`)
  },
  // Reviews
  async listReviews(popupId: string, opts?: { limit?: number; cursor?: string; sort?: 'recent'|'rating_desc' }) {
    const params = new URLSearchParams()
    if (opts?.limit) params.set('limit', String(opts.limit))
    if (opts?.cursor) params.set('cursor', opts.cursor)
    if (opts?.sort) params.set('sort', opts.sort)
    const q = params.toString() ? `?${params.toString()}` : ''
    return http.get<{ summary?: any; items: any[]; paging?: any }>(`/api/v1/popups/${popupId}/reviews${q}`)
  },
  async addReview(popupId: string, payload: { title?: string; rating: number; tags?: string[]; content: string; photos?: File[] | string[] }) {
    // Note: Spec shows body at popup detail; using JSON for now. Adjust to multipart if backend requires photos upload.
    return http.post<{ id: number }>(`/api/v1/popups/${popupId}/reviews`, payload)
  },
  async deleteMyReview(reviewId: string) {
    return http.delete<{ deleted: boolean }>(`/api/v1/me/reviews/${reviewId}`)
  },
  async listMyReviews(opts?: { limit?: number; cursor?: string }) {
    const params = new URLSearchParams()
    if (opts?.limit) params.set('limit', String(opts.limit))
    if (opts?.cursor) params.set('cursor', opts.cursor)
    const q = params.toString() ? `?${params.toString()}` : ''
    return http.get<{ items: any[]; paging?: any }>(`/api/v1/me/reviews${q}`)
  },
  async updateMyReview(id: string, patch: { title?: string; rating?: number; tags?: string[]; content?: string }) {
    return http.patch<{ updated: boolean }>(`/api/v1/me/reviews/${id}`, patch)
  },
  // Profile
  async getProfile() {
    return http.get<Profile>(`/api/v1/me`)
  },
  async updateProfile(patch: Partial<Profile>) {
    return http.patch<{ updated: boolean }>(`/api/v1/me`, patch)
  },
  async changePassword(currentPassword: string, newPassword: string) {
    return http.post<{ changed: boolean }>(`/api/v1/me/password`, { currentPassword, newPassword })
  },
  async addInterest(category: string) {
    return http.post<{ interestCategories: string[] }>(`/api/v1/me/interests/${encodeURIComponent(category)}`)
  },
  async removeInterest(category: string) {
    return http.delete<{ interestCategories: string[] }>(`/api/v1/me/interests/${encodeURIComponent(category)}`)
  },
  // Calendar
  async listCalendarFavorites(month?: string) {
    const q = month ? `?month=${encodeURIComponent(month)}` : ''
    return http.get<{ month: string; events: { popupId: number; title: string; startDate: string; endDate: string }[] }>(`/api/v1/me/calendar/favorites${q}`)
  },
  // Home feed (optional)
  async homeFeed(limit?: number) {
    const q = limit ? `?limit=${limit}` : ''
    return http.get<any>(`/api/v1/app/home${q}`)
  },
}
