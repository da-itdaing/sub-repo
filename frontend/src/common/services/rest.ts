// Lightweight fetch wrapper for calling real backend APIs per spec
// - Reads base URL from VITE_API_BASE_URL
// - Automatically attaches Authorization header from localStorage key 'auth:token'
// - Parses JSON and throws typed errors when { success: false, error } shape is returned

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE'

export type ApiError = {
  status: number
  code?: string
  message?: string
  details?: any
  traceId?: string
}

const BASE_URL = (import.meta as any)?.env?.VITE_API_BASE_URL || ''

function authHeader() {
  try {
    const token = localStorage.getItem('auth:token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  } catch {
    return {}
  }
}

async function request<T>(method: HttpMethod, path: string, body?: any, init?: RequestInit): Promise<T> {
  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const auth = authHeader()
  if ((auth as any).Authorization) headers['Authorization'] = (auth as any).Authorization
  if (init?.headers) Object.assign(headers, init.headers as Record<string, string>)

  const res = await fetch(url, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: (import.meta as any)?.env?.VITE_API_WITH_CREDENTIALS ? 'include' : 'same-origin',
    ...init,
  })

  const contentType = res.headers.get('content-type') || ''
  let data: any = undefined
  if (contentType.includes('application/json')) {
    try { data = await res.json() } catch { data = undefined }
  } else if (contentType.includes('text/')) {
    try { data = await res.text() } catch { data = undefined }
  }

  // Normalize success/error formats
  if (!res.ok) {
    const err: ApiError = {
      status: res.status,
      code: data?.error?.code || data?.error || undefined,
      message: data?.error?.message || data?.message || res.statusText,
      details: data?.error?.details,
      traceId: data?.traceId,
    }
    throw err
  }

  // If API wraps in { success, data }
  if (data && typeof data === 'object' && 'success' in data) {
    if (data.success === false) {
      const err: ApiError = {
        status: res.status,
        code: data?.error?.code,
        message: data?.error?.message,
        details: data?.error?.details,
        traceId: data?.traceId,
      }
      throw err
    }
    return data.data as T
  }

  return data as T
}

export const http = {
  get: <T = any>(path: string, init?: RequestInit) => request<T>('GET', path, undefined, init),
  post: <T = any>(path: string, body?: any, init?: RequestInit) => request<T>('POST', path, body, init),
  patch: <T = any>(path: string, body?: any, init?: RequestInit) => request<T>('PATCH', path, body, init),
  delete: <T = any>(path: string, init?: RequestInit) => request<T>('DELETE', path, undefined, init),
}

export function setAuthToken(token: string | null) {
  if (token) localStorage.setItem('auth:token', token)
  else localStorage.removeItem('auth:token')
}
