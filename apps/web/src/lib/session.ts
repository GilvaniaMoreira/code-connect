import { useSyncExternalStore } from 'react'
import { getToken } from './token'

const TOKEN_EVENT = 'code-connect:token-change'

export function notifyTokenChange(): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(TOKEN_EVENT))
}

function subscribe(callback: () => void): () => void {
  window.addEventListener(TOKEN_EVENT, callback)
  window.addEventListener('storage', callback)
  return () => {
    window.removeEventListener(TOKEN_EVENT, callback)
    window.removeEventListener('storage', callback)
  }
}

function getSnapshot(): boolean {
  return getToken() !== null
}

function getServerSnapshot(): boolean {
  return false
}

export function useIsAuthenticated(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
