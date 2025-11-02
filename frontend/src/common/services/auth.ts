export type Role = 'consumer' | 'seller' | 'manager'

export type User = {
  id: string
  username: string
  name: string
  email: string
  role: Role
}

// Simple in-memory users for demo
const users: User[] = [
  { id: 'u1', username: 'cons1', name: '홍길동', email: 'cons1@example.com', role: 'consumer' },
  { id: 'u2', username: 'sell1', name: '이상철', email: 'sell1@example.com', role: 'seller' },
  { id: 'u3', username: 'admin', name: '관리자', email: 'admin@example.com', role: 'manager' },
]

const passwords: Record<string, string> = {
  cons1: '1234',
  sell1: '1234',
  admin: 'admin',
}

let tempConsumerJoin: any = null

const USE_REAL = ((import.meta as any)?.env?.VITE_USE_REAL_API || '').toString() === 'true'

// Real backend adapters (token-based)
async function realLogin(role: Role | 'auto', username: string, password: string): Promise<User | null> {
  const portal = role === 'consumer' ? 'USER' : role === 'seller' ? 'VENDOR' : 'ADMIN'
  try {
    const res = await (await import('./rest')).http.post<{ user: any; accessToken: string; expiresIn: number; nextRoute?: string }>(
      '/api/public/auth/login',
      { username, password, portal }
    )
    const { setAuthToken } = await import('./rest')
    setAuthToken(res.accessToken)
    const mapped: User = {
      id: String(res.user?.id ?? ''),
      username: res.user?.username ?? username,
      name: res.user?.name ?? username,
      email: res.user?.email ?? '',
      role: (res.user?.role === 'VENDOR' ? 'seller' : res.user?.role === 'ADMIN' ? 'manager' : 'consumer') as Role,
    }
    return mapped
  } catch {
    return null
  }
}

async function realLogout(): Promise<void> {
  try {
    const { http, setAuthToken } = await import('./rest')
    await http.post<void>('/api/auth/logout')
    setAuthToken(null)
  } catch {
    // ignore
  }
}

async function realRegisterSeller(data: { name: string; username: string; nickname?: string; password: string; email: string }): Promise<User> {
  const { http } = await import('./rest')
  const r = await http.post<any>('/api/public/auth/register', { role: 'VENDOR', username: data.username, name: data.name, password: data.password, email: data.email })
  return { id: String(r?.id ?? ''), username: data.username, name: data.name, email: data.email, role: 'seller' }
}

async function realRegisterConsumer(base: { name: string; username: string; password: string; email: string }, categories: { interests: string[]; areas: string[]; styles: string[] }): Promise<User> {
  const { http } = await import('./rest')
  const r = await http.post<any>('/api/public/auth/register', { role: 'USER', username: base.username, name: base.name, password: base.password, email: base.email, favoriteCategories: categories.interests })
  return { id: String(r?.id ?? ''), username: base.username, name: base.name, email: base.email, role: 'consumer' }
}

export const authService = {
  async login(role: Role | 'auto', username: string, password: string): Promise<User | null> {
    if (USE_REAL) return realLogin(role, username, password)
    // 'auto' means role-agnostic (e.g., 관리자)
    const found = users.find(u => u.username === username && (role === 'auto' || u.role === role))
    if (found && passwords[username] === password) return found
    return null
  },
  async logout(): Promise<void> { if (USE_REAL) return realLogout() },
  async registerSeller(data: { name: string; username: string; nickname?: string; password: string; email: string }): Promise<User> {
    if (USE_REAL) return realRegisterSeller(data)
    const u: User = { id: 'u' + (users.length + 1), username: data.username, name: data.name, email: data.email, role: 'seller' }
    users.push(u)
    passwords[data.username] = data.password
    return u
  },
  async saveConsumerDraft(data: any) { tempConsumerJoin = { ...(tempConsumerJoin||{}), ...data } },
  async registerConsumer(categories: { interests: string[]; areas: string[]; styles: string[] }): Promise<User> {
    if (USE_REAL) {
      const base = tempConsumerJoin || { name: '사용자', username: 'user' + (users.length + 1), email: 'user@example.com', password: '1234' }
      const u = await realRegisterConsumer(base, categories)
      tempConsumerJoin = null
      return u
    }
    const base = tempConsumerJoin || { name: '사용자', username: 'user' + (users.length + 1), email: 'user@example.com', password: '1234' }
    const u: User = { id: 'u' + (users.length + 1), username: base.username, name: base.name, email: base.email, role: 'consumer' }
    users.push(u)
    passwords[base.username] = base.password
    tempConsumerJoin = null
    return u
  },
  async findId(name: string, email: string): Promise<string | null> {
    if (USE_REAL) {
      // Spec not finalized; placeholder to POST to a likely endpoint if available later.
      try { return null } catch { return null }
    }
    const u = users.find(v => v.name === name && v.email === email)
    return u?.username || null
  },
  async resetPassword(name: string, username: string): Promise<boolean> {
    if (USE_REAL) {
      // Spec not finalized; return false until defined
      return false
    }
    const u = users.find(v => v.name === name && v.username === username)
    if (!u) return false
    // simulate reset
    passwords[username] = '1234'
    return true
  }
}
