const TOKEN_KEY = 'code-connect.token'

function readFrom(storage: Storage): string | null {
  try {
    return storage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return readFrom(window.localStorage) ?? readFrom(window.sessionStorage)
}

export function setToken(token: string, remember: boolean): void {
  if (typeof window === 'undefined') return
  const target = remember ? window.localStorage : window.sessionStorage
  const other = remember ? window.sessionStorage : window.localStorage
  target.setItem(TOKEN_KEY, token)
  other.removeItem(TOKEN_KEY)
}

export function clearToken(): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(TOKEN_KEY)
  window.sessionStorage.removeItem(TOKEN_KEY)
}
