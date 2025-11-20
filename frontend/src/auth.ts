export type SessionUser = { id: string; name?: string; email?: string; role?: string; phone?: string }

const STORAGE_KEY = 'ssh_current_user'

export function saveSessionUser(user: any) {
  if (typeof window === 'undefined') return
  if (!user || !user.id) return
  const payload: SessionUser = {
    id: String(user.id),
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // ignore storage errors in demo
  }
}

export function getSessionUser(): SessionUser | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as SessionUser
  } catch {
    return null
  }
}

export function getSessionUserId(): string | null {
  const user = getSessionUser()
  return user?.id || null
}

export function clearSessionUser() {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
